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
const UsuarioActivityService_1 = require("../Service/UsuarioActivityService");
const UsuarioActivityObserver_1 = require("../patterns/Observer/UsuarioActivityObserver");
const LogObserver_1 = require("../patterns/Observer/LogObserver");
class LivroService {
    constructor(repositoryFactory) {
        this.repositoryFactory = repositoryFactory;
        this.observers = [];
        this.LivroRepository = this.repositoryFactory.criarLivroRepositorio();
        this.emprestimoRepository = this.repositoryFactory.criarEmprestimoRepositorio();
        this.userActivityService = new UsuarioActivityService_1.UsuarioActivityService(this.repositoryFactory);
        this.registrarObserver(new UsuarioActivityObserver_1.UsuarioActivityObserver(this.userActivityService));
        this.registrarObserver(new LogObserver_1.LogObserver());
    }
    registrarObserver(observer) {
        this.observers.push(observer);
    }
    removerObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    notificarObservers(evento, data, usuarioId) {
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }
    livroParaDto(livro, activeBookIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                id: livro.id,
                titulo: livro.titulo,
                autor: livro.autor,
                categoria: livro.categoria,
                isAvailable: !activeBookIds.has(livro.id)
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
            this.notificarObservers('livro:criado', this.livroParaDto(livroSalvo, new Set()));
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
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
            return Promise.all(livrosDtoPromises);
        });
    }
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
    atualizar(livroId, dadosAtualizacao) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorId(livroId);
            if (!livroExistente) {
                throw new Error('Livro para atualizar não encontrado.');
            }
            const oldLivroData = Object.assign({}, livroExistente);
            if (dadosAtualizacao.titulo !== undefined) {
                livroExistente.titulo = dadosAtualizacao.titulo;
            }
            if (dadosAtualizacao.autor !== undefined) {
                livroExistente.autor = dadosAtualizacao.autor;
            }
            if (dadosAtualizacao.categoria !== undefined) {
                livroExistente.categoria = dadosAtualizacao.categoria;
            }
            const livroAtualizado = yield this.LivroRepository.atualizarLivro(livroExistente);
            this.notificarObservers('livro:atualizado', {
                id: livroAtualizado.id,
                old: { titulo: oldLivroData.titulo, autor: oldLivroData.autor, categoria: oldLivroData.categoria },
                new: { titulo: livroAtualizado.titulo, autor: livroAtualizado.autor, categoria: livroAtualizado.categoria }
            });
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            return this.livroParaDto(livroAtualizado, activeBookIds);
        });
    }
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorId(id);
            if (!livroExistente) {
                throw new Error('Livro não encontrado para ser deletado.');
            }
            yield this.LivroRepository.deletarLivro(id);
            this.notificarObservers('livro:deletado', { id: id, titulo: livroExistente.titulo });
        });
    }
}
exports.LivroService = LivroService;
