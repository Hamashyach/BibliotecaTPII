// src/Service/LivroService.ts
// ARQUIVO ATUALIZADO

import { Livro } from '../Models/Entity/Livro';
import { LivroDto } from '../Models/dto/LivroDto';
import { LivroRequestDto } from '../Models/dto/LivroRequestDto';
import { LivroRepository } from '../Repository/implementacoes/LivroRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { Observer } from '../patterns/Observer/Observer';
import { EmprestimoRepository } from '../Repository/implementacoes/EmprestimoRepository'; // NOVO: Importar EmprestimoRepository

export class LivroService {
    private LivroRepository: LivroRepository;
    private emprestimoRepository: EmprestimoRepository; // NOVO: Adicionar EmprestimoRepository
    private observers: Observer[] = [];

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
        this.emprestimoRepository = this.repositoryFactory.criarEmprestimoRepositorio(); // NOVO: Instanciar
    }

    public registrarObserver(observer: Observer): void {
        this.observers.push(observer);
    }
    private notificarObservers(data: any): void {
        this.observers.forEach(observer => observer.update(data));
    }
    
    // Método auxiliar para mapear Livro para LivroDto, incluindo disponibilidade
    private async livroParaDto(livro: Livro, activeBookIds: Set<number>): Promise<LivroDto> {
        return {
            id: livro.id!,
            titulo: livro.titulo,
            autor: livro.autor,
            categoria: livro.categoria,
            isAvailable: !activeBookIds.has(livro.id!) // Verifica se o livro está no set de ativos
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

        // Ao criar, o livro é sempre disponível. Não precisamos de activeBookIds aqui, mas o DTO espera.
        // Poderíamos buscar os ativos aqui, mas para um único livro, o false é garantido.
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
        // Cria um Set de IDs de livros que estão atualmente emprestados (dataDevolucao é null)
        const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));

        // Mapeia os livros para DTOs, passando o Set de IDs ativos para determinar a disponibilidade
        const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
        return Promise.all(livrosDtoPromises); // Espera todas as promises serem resolvidas
    }

    // NOVO MÉTODO: Busca livros com filtro por termo
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
}