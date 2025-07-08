"use strict";
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
        // Assume que a sua factory tem um método para criar o LivroRepository
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
    }
    registrarObserver(observer) {
        this.observers.push(observer);
    }
    notificarObservers(data) {
        this.observers.forEach(observer => observer.update(data));
    }
    livroParaDto(livro) {
        return {
            id: livro.id,
            titulo: livro.titulo,
            autor: livro.autor,
            categoria: livro.categoria
        };
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
            return this.livroParaDto(livroSalvo);
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const livro = yield this.LivroRepository.filtrarLivroPorId(id);
            return livro ? this.livroParaDto(livro) : null;
        });
    }
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const livros = yield this.LivroRepository.filtrarTodosLivros();
            return livros.map(this.livroParaDto);
        });
    }
}
exports.LivroService = LivroService;
