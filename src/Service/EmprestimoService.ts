import { Emprestimo } from '../Models/Entity/Emprestimo';
import { EmprestimoDto } from '../Models/dto/EmprestimoDto';
import { EmprestimoRequestDto } from '../Models/dto/EmprestimoRequestdto';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { EmprestimoRepository } from '../Repository/implementacoes/EmprestimoRepository';
import { LivroRepository } from '../Repository/implementacoes/LivroRepository';
import { UsuarioRepository } from '../Repository/implementacoes/UsuarioRepository';
import { Observer } from '../patterns/Observer/Observer';
import { DevolucaoDto } from '../Models/dto/DevolucaoDto';
import { ICalculoMultaStrategy } from '../patterns/Strategy/ICalculoMultaStrategy';

export class EmprestimoService {
    private emprestimoRepositorio: EmprestimoRepository;
    private livroRepositorio: LivroRepository;
    private usuarioRepositorio: UsuarioRepository;
    private observers: Observer[] = [];
    private readonly LIMITE_EMPRESTIMOS_POR_USUARIO = 3; // Regra de negócio: limite de empréstimos

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        // A factory fornece todas as dependências de repositório
        this.emprestimoRepositorio = this.repositoryFactory.criarEmprestimoRepositorio();
        this.livroRepositorio = this.repositoryFactory.criarLivroRepositorio();
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
    }

    public registrarObserver(observer: Observer): void {
        this.observers.push(observer);
    }
    private notificarObservers(evento: string, data: any): void {
        this.observers.forEach(observer => observer.update({ evento, data }));
    }

    // Função auxiliar para converter o modelo em DTO, tratando corretamente a data nula
    public emprestimoParaDto(emprestimo: Emprestimo): EmprestimoDto {
        return {
            id: emprestimo.id!,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao,
            dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista
        };
    }

    /**
     * Realiza um novo empréstimo, aplicando todas as regras de negócio.
     */
    async criar(dto: EmprestimoRequestDto): Promise<EmprestimoDto> {
        const { usuarioId, livroId } = dto;

        // Validação 1: O usuário existe?
        const usuario = await this.usuarioRepositorio.filtrarUsuarioPorId(usuarioId);
        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        // Validação 2: O livro existe?
        const livro = await this.livroRepositorio.filtrarLivroPorId(livroId);
        if (!livro) {
            throw new Error("Livro não encontrado.");
        }

        // Validação 3: O livro está disponível?
        const emprestimoAtivo = await this.emprestimoRepositorio.buscarAtivoPorLivroId(livroId);
        if (emprestimoAtivo) {
            throw new Error("Este livro já está emprestado e não está disponível.");
        }

        // Validação 4: O usuário atingiu o limite de empréstimos?
        const totalEmprestimosUsuario = await this.emprestimoRepositorio.contarEmprestimosPorUsuarioId(usuarioId);
        if (totalEmprestimosUsuario >= this.LIMITE_EMPRESTIMOS_POR_USUARIO) {
            throw new Error(`Usuário atingiu o limite de ${this.LIMITE_EMPRESTIMOS_POR_USUARIO} empréstimos ativos.`);
        }

        const dataEmprestimo = new Date();
        const dataDevolucaoPrevista = new Date(dataEmprestimo);
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7);
        
        const novoEmprestimo = new Emprestimo(livroId, usuarioId);
        const emprestimoSalvo = await this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);

        this.notificarObservers('emprestimo:criado', emprestimoSalvo);

        return this.emprestimoParaDto(emprestimoSalvo);
    }

    /**
     * Registra a devolução de um livro.
     */
    async devolver(emprestimoId: number, estrategiaDeMulta: ICalculoMultaStrategy): Promise<DevolucaoDto> {
        const emprestimo = await this.emprestimoRepositorio.filtrarEmprestimoPorId(emprestimoId);
        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado.");
        }
        if (emprestimo.dataDevolucao) {
            throw new Error("Este livro já foi devolvido.");
        }

        // Delega o cálculo da multa para o objeto de estratégia!
        const valorMulta = estrategiaDeMulta.calcular(emprestimo);

        emprestimo.dataDevolucao = new Date();
        const emprestimoAtualizado = await this.emprestimoRepositorio.atualizarEmprestimo(emprestimo);

        this.notificarObservers('emprestimo:devolvido', { emprestimo: emprestimoAtualizado, multa: valorMulta });

        // Retorna um DTO com os dados do empréstimo e o valor da multa.
        return {
            emprestimo: this.emprestimoParaDto(emprestimoAtualizado),
            valorMulta: valorMulta
        };
    }

    /**
     * Busca um empréstimo específico pelo seu ID.
     */
    async buscarPorId(id: number): Promise<EmprestimoDto | null> {
        const emprestimo = await this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
        return emprestimo ? this.emprestimoParaDto(emprestimo) : null;
    }

    /**
     * Lista todos os empréstimos registrados no sistema.
     */
    async buscarTodos(): Promise<EmprestimoDto[]> {
        const emprestimos = await this.emprestimoRepositorio.filtrarTodosEmprestimos();
        return emprestimos.map(this.emprestimoParaDto);
    }

    /**
     * Encontra todos os empréstimos feitos por usuários com um determinado nome.
     */
    async buscarPorNomeUsuario(nome: string): Promise<EmprestimoDto[]> {
        const emprestimos = await this.emprestimoRepositorio.filtrarEmprestimosPorNomeUsuario(nome);
        return emprestimos.map(this.emprestimoParaDto);
    }

    /**
     * Deleta um registro de empréstimo.
     * Cuidado: Geralmente não se deleta um histórico de empréstimo.
     * A devolução é o processo correto. Este método é para fins de manutenção.
     */
    async deletar(id: number): Promise<void> {
        const emprestimoExistente = await this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
        if (!emprestimoExistente) {
            throw new Error("Empréstimo não encontrado para ser deletado.");
        }
        await this.emprestimoRepositorio.deletarEmprestimo(id);
        this.notificarObservers('emprestimo:deletado', { id });
    }

     // Método para buscar empréstimos atrasados
    async buscarEmprestimosAtrasados(): Promise<Emprestimo[]> {
        // Você precisaria de um método no seu EmprestimoRepository
        // que busca todos os empréstimos ou filtros por dataDevolucao nula.
        // Por exemplo, assumindo que EmprestimoRepository tem filtrarTodosEmprestimos()
        const todosEmprestimos = await this.emprestimoRepositorio.filtrarTodosEmprestimos(); // Você precisaria de um EmprestimoRepository similar ao UsuarioRepository

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        // Filtra os empréstimos que estão atrasados
        const emprestimosAtrasados = todosEmprestimos.filter(emprestimo => {
            // Verifica se o empréstimo ainda não foi devolvido
            if (emprestimo.dataDevolucao === null) {
                // Converte a data prevista de devolução para objeto Date e zera a hora
                const dataPrevista = new Date(emprestimo.dataDevolucaoPrevista);
                dataPrevista.setHours(0, 0, 0, 0);

                // Se a data prevista de devolução for anterior a hoje, está atrasado
                return dataPrevista < hoje;
            }
            return false; // Não está atrasado se já foi devolvido
        });

        return emprestimosAtrasados;
    }
}