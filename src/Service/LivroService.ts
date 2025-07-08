
import { Livro } from '../Models/Entity/Livro';
import { LivroDto } from '../Models/dto/LivroDto';
import { LivroRequestDto } from '../Models/dto/LivroRequestDto';
import { LivroRepository } from '../Repository/implementacoes/LivroRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { Observer } from '../patterns/Observer/Observer';

export class LivroService {
    private LivroRepository: LivroRepository;
    private observers: Observer[] = [];

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        // Assume que a sua factory tem um método para criar o LivroRepository
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio(); 
    }

    public registrarObserver(observer: Observer): void {
        this.observers.push(observer);
    }
    private notificarObservers(data: any): void {
        this.observers.forEach(observer => observer.update(data));
    }
    
    private livroParaDto(livro: Livro): LivroDto {
        return {
            id: livro.id!,
            titulo: livro.titulo,
            autor: livro.autor,
            categoria: livro.categoria
        };
    }

    async criar(dto: LivroRequestDto): Promise<LivroDto> {
        
        const livroExistente = await this.LivroRepository.filtrarLivroPorTituloEAutor(dto.titulo, dto.autor);
        if (livroExistente) {
            throw new Error("Um livro com este título e autor já existe.");
        }

        const novoLivro = new Livro(dto.titulo, dto.autor, dto.categoria);
        const livroSalvo = await this.LivroRepository.inserirLivro(novoLivro);

        this.notificarObservers(livroSalvo);

        return this.livroParaDto(livroSalvo);
    }

    async buscarPorId(id: number): Promise<LivroDto | null> {
        const livro = await this.LivroRepository.filtrarLivroPorId(id);
        return livro ? this.livroParaDto(livro) : null;
    }

    async buscarTodos(): Promise<LivroDto[]> {
        const livros = await this.LivroRepository.filtrarTodosLivros();
        return livros.map(this.livroParaDto);
    }
}