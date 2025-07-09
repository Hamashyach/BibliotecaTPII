"use strict";
// src/Service/LivroService.ts
// ARQUIVO ATUALIZADO
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroService = void 0;
const Livro_1 = require("../Models/Entity/Livro");
class LivroService {
    constructor(repositoryFactory) {
        this.repositoryFactory = repositoryFactory;
        this.observers = [];
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
        this.emprestimoRepository = this.repositoryFactory.criarEmprestimoRepositorio(); // NOVO: Instanciar
    }
    registrarObserver(observer) {
        this.observers.push(observer);
    }
    notificarObservers(data) {
        this.observers.forEach(observer => observer.update(data));
    }
    // Método auxiliar para mapear Livro para LivroDto, incluindo disponibilidade
    livroParaDto(livro, activeBookIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                id: livro.id,
                titulo: livro.titulo,
                autor: livro.autor,
                categoria: livro.categoria,
                isAvailable: !activeBookIds.has(livro.id) // Verifica se o livro está no set de ativos
            };
        });
    }
    criar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorTituloEAutor(dto.titulo, dto.autor);
            if (livroExistente) {
                throw new Error("Um livro com este título e autor já existe.");
            }
            const novoLivro = new Livro_1.Livro(dto.titulo, dto.autor, dto.categoria);
            const livroSalvo = yield this.LivroRepository.inserirLivro(novoLivro);
            this.notificarObservers(livroSalvo);
            // Ao criar, o livro é sempre disponível. Não precisamos de activeBookIds aqui, mas o DTO espera.
            // Poderíamos buscar os ativos aqui, mas para um único livro, o false é garantido.
            return Object.assign(Object.assign({}, this.livroParaDto(livroSalvo, new Set())), { isAvailable: true });
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const livro = yield this.LivroRepository.filtrarLivroPorId(id);
            if (!livro)
                return null;
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            return this.livroParaDto(livro, activeBookIds);
        });
    }
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const livros = yield this.LivroRepository.filtrarTodosLivros();
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            // Cria um Set de IDs de livros que estão atualmente emprestados (dataDevolucao é null)
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            // Mapeia os livros para DTOs, passando o Set de IDs ativos para determinar a disponibilidade
            const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
            return Promise.all(livrosDtoPromises); // Espera todas as promises serem resolvidas
        });
    }
    // NOVO MÉTODO: Busca livros com filtro por termo
    buscarLivrosComFiltro(termo) {
        return __awaiter(this, void 0, void 0, function* () {
            let livros;
            if (termo) {
                livros = yield this.LivroRepository.buscarLivrosPorTermo(termo);
            }
            else {
                livros = yield this.LivroRepository.filtrarTodosLivros();
            }
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
            return Promise.all(livrosDtoPromises);
        });
    }
}
exports.LivroService = LivroService;
