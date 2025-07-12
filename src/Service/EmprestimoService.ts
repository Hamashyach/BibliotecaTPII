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
        this.userActivityService = new UsuarioActivityService(this.repositoryFactory);
        this.registrarObserver(new UsuarioActivityObserver(this.userActivityService));
        this.registrarObserver(new LogObserver()); 
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

    
    private notificarObservers(evento: string, data: any, usuarioId?: number): void {
        this.observers.forEach(observer => observer.update({ evento, data, usuarioId }));
    }

    public emprestimoParaDto(emprestimo: Emprestimo): EmprestimoDto {
        let statusTexto: string;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 

        const dataPrevistaSemHora = new Date(emprestimo.dataDevolucaoPrevista);
        dataPrevistaSemHora.setHours(0, 0, 0, 0);

        if (emprestimo.dataDevolucao !== null) {
            statusTexto = 'Devolvido';
        } else if (dataPrevistaSemHora < hoje) { 
            statusTexto = 'Atrasado'; 
        } else {
            statusTexto = 'Ativo'; 
        }

        return {
            id: emprestimo.id!,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao,
            dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
            statusTexto: statusTexto, 
            valorMulta: emprestimo.valorMulta
        };
    }

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
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + );

        const novoEmprestimo = new Emprestimo(livroId, usuarioId);
        novoEmprestimo.dataEmprestimo = dataEmprestimo; 
        novoEmprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista; 

        const emprestimoSalvo = await this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);

        this.notificarObservers('emprestimo:criado', this.emprestimoParaDto(emprestimoSalvo), usuarioId);

        return this.emprestimoParaDto(emprestimoSalvo);
    }

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

        this.notificarObservers('emprestimo:devolvido', { emprestimo: this.emprestimoParaDto(emprestimoAtualizado), multa: valorMulta }, emprestimo.usuarioId);

        return {
            emprestimo: this.emprestimoParaDto(emprestimoAtualizado),
            valorMulta: valorMulta
        };
    }

    async buscarPorId(id: number): Promise<EmprestimoDto | null> {
        const emprestimo = await this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
        return emprestimo ? this.emprestimoParaDto(emprestimo) : null;
    }

    async buscarTodos(): Promise<EmprestimoDto[]> {
        const emprestimos = await this.emprestimoRepositorio.filtrarTodosEmprestimos();
        return emprestimos.map(this.emprestimoParaDto);
    }

    async buscarPorNomeUsuario(nome: string): Promise<EmprestimoDto[]> {
        const emprestimos = await this.emprestimoRepositorio.filtrarEmprestimosPorNomeUsuario(nome);
        return emprestimos.map(this.emprestimoParaDto);
    }

    async deletar(id: number): Promise<void> {
        const emprestimoExistente = await this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
        if (!emprestimoExistente) {
            throw new Error("Empréstimo não encontrado para ser deletado.");
        }
        await this.emprestimoRepositorio.deletarEmprestimo(id);
        
        this.notificarObservers('emprestimo:deletado', { id: id, usuarioId: emprestimoExistente.usuarioId, livroId: emprestimoExistente.livroId }, emprestimoExistente.usuarioId);
    }

     async buscarEmprestimosAtrasados(): Promise<Emprestimo[]> {
        const todosEmprestimos = await this.emprestimoRepositorio.filtrarTodosEmprestimos();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 

        const emprestimosAtrasados = todosEmprestimos.filter(emprestimo => {
           
            if (emprestimo.dataDevolucao === null) {
    
                const dataPrevista = new Date(emprestimo.dataDevolucaoPrevista);
                dataPrevista.setHours(0, 0, 0, 0);
                return dataPrevista < hoje; 
            }
            return false; 
        });

        return emprestimosAtrasados;
    }
}