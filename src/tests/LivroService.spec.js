const { LivroService } = require('../Service/LivroService');
const { Livro } = require('../Models/Entity/Livro');

// 1. MOCK (SIMULAÇÃO) DAS DEPENDÊNCIAS
// Simulamos o Repository para que o teste não dependa do banco de dados real.
const mockLivroRepository = {
    filtrarLivroPorTituloEAutor: jest.fn(),
    inserirLivro: jest.fn(),
    filtrarLivroPorId: jest.fn(),
    filtrarTodosLivros: jest.fn(),
};

// Simulamos a Factory para que ela retorne nosso repositório mockado.
const mockRepositoryFactory = {
    criarLivroRepositorio: () => mockLivroRepository,
};

// Simulamos um Observer para testar as notificações.
const mockObserver = {
    update: jest.fn(),
};


// 2. SUÍTE DE TESTES PARA O LivroService
describe('LivroService', () => {
    let livroService;

    // A função beforeEach é executada antes de CADA teste ("it").
    beforeEach(() => {
        // Limpa todos os mocks para garantir que um teste não interfira no outro.
        jest.clearAllMocks();
        // Cria uma nova instância do serviço com nossas dependências mockadas.
        livroService = new LivroService(mockRepositoryFactory);
    });

    // --- Testes para o método criar() ---
    describe('criar', () => {
        it('deve criar e retornar um novo livro DTO com sucesso', async () => {
            // ARRANGE (Arranjar)
            const livroRequestDto = { titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', categoria: 'Fantasia' };
            const livroSalvo = new Livro('O Hobbit', 'J.R.R. Tolkien', 'Fantasia');
            livroSalvo.id = 1;

            // Configuramos os mocks:
            // 1. Simula que não encontrou livro com mesmo título/autor.
            mockLivroRepository.filtrarLivroPorTituloEAutor.mockResolvedValue(null);
            // 2. Simula que o repositório salvou o livro e retornou o objeto completo.
            mockLivroRepository.inserirLivro.mockResolvedValue(livroSalvo);

            // ACT (Agir)
            const result = await livroService.criar(livroRequestDto);

            // ASSERT (Afirmar)
            expect(result).toEqual({
                id: 1,
                titulo: 'O Hobbit',
                autor: 'J.R.R. Tolkien',
                categoria: 'Fantasia'
            });
            // Verifica se o método do repositório foi chamado com os dados corretos.
            expect(mockLivroRepository.inserirLivro).toHaveBeenCalledWith(expect.any(Livro));
            expect(mockLivroRepository.inserirLivro).toHaveBeenCalledWith(
                expect.objectContaining({ titulo: 'O Hobbit', autor: 'J.R.R. Tolkien' })
            );
        });

        it('deve lançar um erro se um livro com o mesmo título e autor já existir', async () => {
            // ARRANGE
            const livroRequestDto = { titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', categoria: 'Fantasia' };
            const livroExistente = new Livro('O Hobbit', 'J.R.R. Tolkien', 'Fantasia');
            
            // Simula que o livro JÁ FOI encontrado no banco.
            mockLivroRepository.filtrarLivroPorTituloEAutor.mockResolvedValue(livroExistente);

            // ACT & ASSERT
            // Verificamos se a chamada da função rejeita a promise com o erro esperado.
            await expect(livroService.criar(livroRequestDto)).rejects.toThrow('Um livro com este título e autor já existe.');

            // Garante que, em caso de erro, o método de inserir NUNCA foi chamado.
            expect(mockLivroRepository.inserirLivro).not.toHaveBeenCalled();
        });
    });

    // --- Testes para o método buscarPorId() ---
    describe('buscarPorId', () => {
        it('deve retornar um livro DTO quando o ID for encontrado', async () => {
            // ARRANGE
            const livroEncontrado = new Livro('A Sociedade do Anel', 'J.R.R. Tolkien', 'Fantasia');
            livroEncontrado.id = 2;
            mockLivroRepository.filtrarLivroPorId.mockResolvedValue(livroEncontrado);

            // ACT
            const result = await livroService.buscarPorId(2);

            // ASSERT
            expect(result).toEqual({ id: 2, titulo: 'A Sociedade do Anel', autor: 'J.R.R. Tolkien', categoria: 'Fantasia' });
            expect(mockLivroRepository.filtrarLivroPorId).toHaveBeenCalledWith(2);
        });

        it('deve retornar null se o livro não for encontrado', async () => {
            // ARRANGE
            mockLivroRepository.filtrarLivroPorId.mockResolvedValue(null);

            // ACT
            const result = await livroService.buscarPorId(99);

            // ASSERT
            expect(result).toBeNull();
            expect(mockLivroRepository.filtrarLivroPorId).toHaveBeenCalledWith(99);
        });
    });

    // --- Testes para o método buscarTodos() ---
    describe('buscarTodos', () => {
        it('deve retornar uma lista de livros DTO', async () => {
            // ARRANGE
            const listaDeLivros = [
                Object.assign(new Livro('Livro A', 'Autor A', 'Cat A'), { id: 1 }),
                Object.assign(new Livro('Livro B', 'Autor B', 'Cat B'), { id: 2 }),
            ];
            mockLivroRepository.filtrarTodosLivros.mockResolvedValue(listaDeLivros);

            // ACT
            const result = await livroService.buscarTodos();

            // ASSERT
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ id: 1, titulo: 'Livro A', autor: 'Autor A', categoria: 'Cat A' });
            expect(mockLivroRepository.filtrarTodosLivros).toHaveBeenCalledTimes(1);
        });
    });

    // --- Teste para o padrão Observer ---
    describe('Observer', () => {
        it('deve notificar os observers quando um novo livro for criado', async () => {
            // ARRANGE
            const livroRequestDto = { titulo: 'Livro Novo', autor: 'Autor Novo', categoria: 'Novidades' };
            const livroSalvo = Object.assign(new Livro('Livro Novo', 'Autor Novo', 'Novidades'), { id: 3 });

            mockLivroRepository.filtrarLivroPorTituloEAutor.mockResolvedValue(null);
            mockLivroRepository.inserirLivro.mockResolvedValue(livroSalvo);
            
            // Registra nosso observer mockado no serviço.
            livroService.registrarObserver(mockObserver);
            
            // ACT
            await livroService.criar(livroRequestDto);

            // ASSERT
            // Verifica se o método 'update' do observer foi chamado.
            expect(mockObserver.update).toHaveBeenCalledTimes(1);
            // Verifica se foi chamado com os dados do livro que foi salvo.
            expect(mockObserver.update).toHaveBeenCalledWith(livroSalvo);
        });
    });
});