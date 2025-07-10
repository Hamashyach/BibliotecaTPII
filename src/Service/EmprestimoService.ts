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
import { UsuarioActivityService } from '../Service/UsuarioActivityService';
import { UsuarioActivityObserver } from '../patterns/Observer/UsuarioActivityObserver';
import { LogObserver } from '../patterns/Observer/LogObserver';

export class EmprestimoService {
    private emprestimoRepositorio: EmprestimoRepository;
    private livroRepositorio: LivroRepository;
    private usuarioRepositorio: UsuarioRepository;
    private observers: Observer[] = [];
    private readonly LIMITE_EMPRESTIMOS_POR_USUARIO = 3; 
    private userActivityService: UsuarioActivityService; 

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        // A factory fornece todas as dependências de repositório
        this.emprestimoRepositorio = this.repositoryFactory.criarEmprestimoRepositorio();
        this.livroRepositorio = this.repositoryFactory.criarLivroRepositorio();
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();

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

    // MODIFICADO: Agora passa um objeto com 'evento', 'data' e 'usuarioId'
    private notificarObservers(evento: string, data: any, usuarioId?: number): void {
        this.observers.forEach(observer => observer.update({ evento, data, usuarioId }));
    }

    // Função auxiliar para converter o modelo em DTO, tratando corretamente a data nula
    public emprestimoParaDto(emprestimo: Emprestimo): EmprestimoDto {
        let statusTexto: string;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        const dataPrevistaSemHora = new Date(emprestimo.dataDevolucaoPrevista);
        dataPrevistaSemHora.setHours(0, 0, 0, 0);

        if (emprestimo.dataDevolucao !== null) {
            statusTexto = 'Devolvido';
        } else if (dataPrevistaSemHora <= hoje) { // AQUI ESTÁ A CORREÇÃO: MUDANÇA DE < PARA <=
            statusTexto = 'Atrasado'; // Empréstimo ativo e data prevista já passou ou é hoje
        } else {
            statusTexto = 'Ativo'; // Empréstimo ativo e dentro do prazo
        }

        return {
            id: emprestimo.id!,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao,
            dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
            statusTexto: statusTexto, // Atribui o status calculado
            valorMulta: emprestimo.valorMulta
        };
    }

    /**
     * Realiza um novo empréstimo, aplicando todas as regras de negócio.
     * Notifica os observadores sobre a criação do empréstimo.
     */
    async criar(dto: EmprestimoRequestDto): Promise<EmprestimoDto> {
        const { usuarioId, livroId } = dto;

        const usuario = await this.usuarioRepositorio.filtrarUsuarioPorId(usuarioId);
        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        const livro = await this.livroRepositorio.filtrarLivroPorId(livroId);
        if (!livro) {
            throw new Error("Livro não encontrado.");
        }

        const emprestimoAtivo = await this.emprestimoRepositorio.buscarAtivoPorLivroId(livroId);
        if (emprestimoAtivo) {
            throw new Error("Este livro já está emprestado e não está disponível.");
        }

        const totalEmprestimosUsuario = await this.emprestimoRepositorio.contarEmprestimosPorUsuarioId(usuarioId);
        if (totalEmprestimosUsuario >= this.LIMITE_EMPRESTIMOS_POR_USUARIO) {
            throw new Error(`Usuário atingiu o limite de ${this.LIMITE_EMPRESTIMOS_POR_USUARIO} empréstimos ativos.`);
        }

        const dataEmprestimo = new Date();
        const dataDevolucaoPrevista = new Date(dataEmprestimo);
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7);

        const novoEmprestimo = new Emprestimo(livroId, usuarioId);
        novoEmprestimo.dataEmprestimo = dataEmprestimo; // Garante que a data do modelo seja a mesma
        novoEmprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista; // Garante que a data do modelo seja a mesma

        const emprestimoSalvo = await this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);

        // NOVO: Notificar o observador de que um empréstimo foi criado
        this.notificarObservers('emprestimo:criado', this.emprestimoParaDto(emprestimoSalvo), usuarioId);

        return this.emprestimoParaDto(emprestimoSalvo);
    }

    /**
     * Registra a devolução de um livro.
     * Notifica os observadores sobre a devolução.
     */
    async devolver(emprestimoId: number, estrategiaDeMulta: ICalculoMultaStrategy): Promise<DevolucaoDto> {
        const emprestimo = await this.emprestimoRepositorio.filtrarEmprestimoPorId(emprestimoId);
        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado.");
        }
        if (emprestimo.dataDevolucao) {
            throw new Error("Este livro já foi devolvido.");
        }

        const valorMulta = estrategiaDeMulta.calcular(emprestimo);

        emprestimo.dataDevolucao = new Date();
        const emprestimoAtualizado = await this.emprestimoRepositorio.atualizarEmprestimo(emprestimo);

        // NOVO: Notificar o observador de que um empréstimo foi devolvido
        // Passe o emprestimoAtualizado e a multa. O observer vai inferir o usuarioId.
        this.notificarObservers('emprestimo:devolvido', { emprestimo: this.emprestimoParaDto(emprestimoAtualizado), multa: valorMulta }, emprestimo.usuarioId);

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
     * Notifica os observadores sobre a exclusão.
     * Cuidado: Geralmente não se deleta um histórico de empréstimo.
     * Este método é para fins de manutenção ou para o comando 'desfazer'.
     */
    async deletar(id: number): Promise<void> {
        const emprestimoExistente = await this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
        if (!emprestimoExistente) {
            throw new Error("Empréstimo não encontrado para ser deletado.");
        }
        await this.emprestimoRepositorio.deletarEmprestimo(id);
        // NOVO: Notificar o observador de que um empréstimo foi deletado
        this.notificarObservers('emprestimo:deletado', { id: id, usuarioId: emprestimoExistente.usuarioId, livroId: emprestimoExistente.livroId }, emprestimoExistente.usuarioId);
    }

     /**
      * Método para buscar empréstimos atrasados.
      */
     async buscarEmprestimosAtrasados(): Promise<Emprestimo[]> {
        const todosEmprestimos = await this.emprestimoRepositorio.filtrarTodosEmprestimos();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        const emprestimosAtrasados = todosEmprestimos.filter(emprestimo => {
            // Verifica se o empréstimo ainda não foi devolvido
            if (emprestimo.dataDevolucao === null) {
                // Converte a data prevista de devolução para objeto Date e zera a hora
                const dataPrevista = new Date(emprestimo.dataDevolucaoPrevista);
                dataPrevista.setHours(0, 0, 0, 0);

                // CORRIGIDO: Se a data prevista de devolução for anterior OU IGUAL a hoje, está atrasado
                return dataPrevista <= hoje; // AQUI ESTÁ A CORREÇÃO!
            }
            return false; // Não está atrasado se já foi devolvido
        });

        return emprestimosAtrasados;
    }
}