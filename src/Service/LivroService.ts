import { Livro } from '../Models/Entity/Livro';
import { LivroDto } from '../Models/dto/LivroDto';
import { LivroRequestDto } from '../Models/dto/LivroRequestDto';
import { LivroRepository } from '../Repository/implementacoes/LivroRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { Observer } from '../patterns/Observer/Observer';
import { EmprestimoRepository } from '../Repository/implementacoes/EmprestimoRepository'; 
import { UsuarioActivityService } from '../Service/UsuarioActivityService';
import { UsuarioActivityObserver } from '../patterns/Observer/UsuarioActivityObserver';
import { LogObserver } from '../patterns/Observer/LogObserver';



export class LivroService {
    private LivroRepository: LivroRepository;
    private emprestimoRepository: EmprestimoRepository;
    private observers: Observer[] = [];
    private userActivityService: UsuarioActivityService; // NOVO: Adicionar instância do serviço de atividades

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
        this.emprestimoRepository = this.repositoryFactory.criarEmprestimoRepositorio();
        // NOVO: Instanciar o UserActivityService aqui
        this.userActivityService = new UsuarioActivityService(this.repositoryFactory);

        // NOVO: Registrar o UserActivityObserver com este serviço
        this.registrarObserver(new UsuarioActivityObserver(this.userActivityService));
        // Se você ainda tiver o LogObserver e quiser que ele receba notificações, registre-o também.
        this.registrarObserver(new LogObserver()); // Exemplo: Se você mantiver o LogObserver
    }

    public registrarObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    public removerObserver(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    // MODIFICADO: Agora passa um objeto com 'evento', 'data' e 'usuarioId' para os observadores
    // LivroService pode não ter um 'usuarioId' direto para todas as operações,
    // então ele será opcional e inferido pelo UserActivityObserver quando possível.
    private notificarObservers(evento: string, data: any, usuarioId?: number): void {
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }

    // Método auxiliar para mapear Livro para LivroDto, incluindo disponibilidade
    private async livroParaDto(livro: Livro, activeBookIds: Set<number>): Promise<LivroDto> {
        return {
            id: livro.id!,
            titulo: livro.titulo,
            autor: livro.autor,
            categoria: livro.categoria,
            isAvailable: !activeBookIds.has(livro.id!)
        };
    }

    /**
     * Cria um novo livro.
     * Notifica os observadores sobre a criação do livro.
     */
    async criar(dto: LivroRequestDto): Promise<LivroDto> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorTituloEAutor(dto.titulo, dto.autor);
        if (livroExistente) {
            throw new Error("Um livro com este título e autor já existe.");
        }

        const novoLivro = new Livro(dto.titulo, dto.autor, dto.categoria);
        const livroSalvo = await this.LivroRepository.inserirLivro(novoLivro);

        // NOVO: Notificar o observador de que um livro foi criado
        // O UsuarioId aqui seria null/undefined, a menos que você saiba qual usuário fez a operação.
        // O UserActivityObserver pode lidar com isso.
        this.notificarObservers('livro:criado', this.livroParaDto(livroSalvo, new Set()));

        // Ao criar, o livro é sempre disponível.
        return { ...this.livroParaDto(livroSalvo, new Set()), isAvailable: true };
    }

    /**
     * Busca um livro pelo ID, incluindo sua disponibilidade.
     */
    async buscarPorId(id: number): Promise<LivroDto | null> {
        const livro = await this.LivroRepository.filtrarLivroPorId(id);
        if (!livro) return null;

        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        return this.livroParaDto(livro, activeBookIds);
    }

    /**
     * Lista todos os livros, incluindo sua disponibilidade.
     */
    async buscarTodos(): Promise<LivroDto[]> {
        const livros = await this.LivroRepository.filtrarTodosLivros();
        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
        return Promise.all(livrosDtoPromises);
    }

    /**
     * Busca livros com filtro por termo (título, autor, categoria, ou ID), incluindo disponibilidade.
     */
    async buscarLivrosComFiltro(termo?: string): Promise<LivroDto[]> {
        let livros: Livro[];
        if (termo) {
            livros = await this.LivroRepository.buscarLivrosPorTermo(termo);
        } else {
            livros = await this.LivroRepository.filtrarTodosLivros();
        }

        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
        return Promise.all(livrosDtoPromises);
    }

    /**
     * Atualiza os dados de um livro existente.
     * Notifica os observadores sobre a atualização.
     */
    async atualizar(livroId: number, dadosAtualizacao: Partial<Omit<LivroDto, 'id'>>): Promise<LivroDto> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorId(livroId);
        if (!livroExistente) {
            throw new Error('Livro para atualizar não encontrado.');
        }

        const oldLivroData = { ...livroExistente }; // Capturar dados antigos

        // Aplicar as atualizações
        if (dadosAtualizacao.titulo !== undefined) {
            livroExistente.titulo = dadosAtualizacao.titulo;
        }
        if (dadosAtualizacao.autor !== undefined) {
            livroExistente.autor = dadosAtualizacao.autor;
        }
        if (dadosAtualizacao.categoria !== undefined) {
            livroExistente.categoria = dadosAtualizacao.categoria;
        }

        const livroAtualizado = await this.LivroRepository.atualizarLivro(livroExistente);

        // NOVO: Notificar o observador de que um livro foi atualizado
        this.notificarObservers('livro:atualizado', {
            id: livroAtualizado.id,
            old: { titulo: oldLivroData.titulo, autor: oldLivroData.autor, categoria: oldLivroData.categoria },
            new: { titulo: livroAtualizado.titulo, autor: livroAtualizado.autor, categoria: livroAtualizado.categoria }
        }); // Sem usuarioId aqui, pois a operação pode vir de um admin genérico

        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        return this.livroParaDto(livroAtualizado, activeBookIds);
    }

    /**
     * Deleta um livro.
     * Notifica os observadores sobre a exclusão.
     */
    async deletar(id: number): Promise<void> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorId(id);
        if (!livroExistente) {
            throw new Error('Livro não encontrado para ser deletado.');
        }
        await this.LivroRepository.deletarLivro(id);
        // NOVO: Notificar o observador de que um livro foi deletado
        this.notificarObservers('livro:deletado', { id: id, titulo: livroExistente.titulo });
    }
}