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
    private userActivityService: UsuarioActivityService; 

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
        this.emprestimoRepository = this.repositoryFactory.criarEmprestimoRepositorio();
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
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }

    private async livroParaDto(livro: Livro, activeBookIds: Set<number>): Promise<LivroDto> {
        return {
            id: livro.id!,
            titulo: livro.titulo,
            autor: livro.autor,
            categoria: livro.categoria,
            isAvailable: !activeBookIds.has(livro.id!)
        };
    }

    async criar(dto: LivroRequestDto): Promise<LivroDto> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorTituloEAutor(dto.titulo, dto.autor);
        if (livroExistente) {
            throw new Error("Um livro com este título e autor já existe.");
        }

        const novoLivro = new Livro(dto.titulo, dto.autor, dto.categoria);
        const livroSalvo = await this.LivroRepository.inserirLivro(novoLivro);
        this.notificarObservers('livro:criado', this.livroParaDto(livroSalvo, new Set()));

        return { ...this.livroParaDto(livroSalvo, new Set()), isAvailable: true };
    }

    async buscarPorId(id: number): Promise<LivroDto | null> {
        const livro = await this.LivroRepository.filtrarLivroPorId(id);
        if (!livro) return null;

        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        return this.livroParaDto(livro, activeBookIds);
    }

    async buscarTodos(): Promise<LivroDto[]> {
        const livros = await this.LivroRepository.filtrarTodosLivros();
        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
        return Promise.all(livrosDtoPromises);
    }

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

    async atualizar(livroId: number, dadosAtualizacao: Partial<Omit<LivroDto, 'id'>>): Promise<LivroDto> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorId(livroId);
        if (!livroExistente) {
            throw new Error('Livro para atualizar não encontrado.');
        }

        const oldLivroData = { ...livroExistente }; 
       
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

        this.notificarObservers('livro:atualizado', {
            id: livroAtualizado.id,
            old: { titulo: oldLivroData.titulo, autor: oldLivroData.autor, categoria: oldLivroData.categoria },
            new: { titulo: livroAtualizado.titulo, autor: livroAtualizado.autor, categoria: livroAtualizado.categoria }
        });

        const activeLoans = await this.emprestimoRepository.filtrarTodosEmprestimos();
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        return this.livroParaDto(livroAtualizado, activeBookIds);
    }

    async deletar(id: number): Promise<void> {
        const livroExistente = await this.LivroRepository.filtrarLivroPorId(id);
        if (!livroExistente) {
            throw new Error('Livro não encontrado para ser deletado.');
        }
        await this.LivroRepository.deletarLivro(id);
        this.notificarObservers('livro:deletado', { id: id, titulo: livroExistente.titulo });
    }
}