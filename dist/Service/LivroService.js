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
        // NOVO: Instanciar o UserActivityService aqui
        this.userActivityService = new UsuarioActivityService_1.UsuarioActivityService(this.repositoryFactory);
        // NOVO: Registrar o UserActivityObserver com este serviço
        this.registrarObserver(new UsuarioActivityObserver_1.UsuarioActivityObserver(this.userActivityService));
        // Se você ainda tiver o LogObserver e quiser que ele receba notificações, registre-o também.
        this.registrarObserver(new LogObserver_1.LogObserver()); // Exemplo: Se você mantiver o LogObserver
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
    // MODIFICADO: Agora passa um objeto com 'evento', 'data' e 'usuarioId' para os observadores
    // LivroService pode não ter um 'usuarioId' direto para todas as operações,
    // então ele será opcional e inferido pelo UserActivityObserver quando possível.
    notificarObservers(evento, data, usuarioId) {
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }
    // Método auxiliar para mapear Livro para LivroDto, incluindo disponibilidade
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
    /**
     * Cria um novo livro.
     * Notifica os observadores sobre a criação do livro.
     */
    criar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorTituloEAutor(dto.titulo, dto.autor);
            if (livroExistente) {
                throw new Error("Um livro com este título e autor já existe.");
            }
            const novoLivro = new Livro_1.Livro(dto.titulo, dto.autor, dto.categoria);
            const livroSalvo = yield this.LivroRepository.inserirLivro(novoLivro);
            // NOVO: Notificar o observador de que um livro foi criado
            // O UsuarioId aqui seria null/undefined, a menos que você saiba qual usuário fez a operação.
            // O UserActivityObserver pode lidar com isso.
            this.notificarObservers('livro:criado', this.livroParaDto(livroSalvo, new Set()));
            // Ao criar, o livro é sempre disponível.
            return Object.assign(Object.assign({}, this.livroParaDto(livroSalvo, new Set())), { isAvailable: true });
        });
    }
    /**
     * Busca um livro pelo ID, incluindo sua disponibilidade.
     */
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
    /**
     * Lista todos os livros, incluindo sua disponibilidade.
     */
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const livros = yield this.LivroRepository.filtrarTodosLivros();
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            const livrosDtoPromises = livros.map(livro => this.livroParaDto(livro, activeBookIds));
            return Promise.all(livrosDtoPromises);
        });
    }
    /**
     * Busca livros com filtro por termo (título, autor, categoria, ou ID), incluindo disponibilidade.
     */
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
    /**
     * Atualiza os dados de um livro existente.
     * Notifica os observadores sobre a atualização.
     */
    atualizar(livroId, dadosAtualizacao) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorId(livroId);
            if (!livroExistente) {
                throw new Error('Livro para atualizar não encontrado.');
            }
            const oldLivroData = Object.assign({}, livroExistente); // Capturar dados antigos
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
            const livroAtualizado = yield this.LivroRepository.atualizarLivro(livroExistente);
            // NOVO: Notificar o observador de que um livro foi atualizado
            this.notificarObservers('livro:atualizado', {
                id: livroAtualizado.id,
                old: { titulo: oldLivroData.titulo, autor: oldLivroData.autor, categoria: oldLivroData.categoria },
                new: { titulo: livroAtualizado.titulo, autor: livroAtualizado.autor, categoria: livroAtualizado.categoria }
            }); // Sem usuarioId aqui, pois a operação pode vir de um admin genérico
            const activeLoans = yield this.emprestimoRepository.filtrarTodosEmprestimos();
            const activeBookIds = new Set(activeLoans.filter(loan => loan.dataDevolucao === null).map(loan => loan.livroId));
            return this.livroParaDto(livroAtualizado, activeBookIds);
        });
    }
    /**
     * Deleta um livro.
     * Notifica os observadores sobre a exclusão.
     */
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const livroExistente = yield this.LivroRepository.filtrarLivroPorId(id);
            if (!livroExistente) {
                throw new Error('Livro não encontrado para ser deletado.');
            }
            yield this.LivroRepository.deletarLivro(id);
            // NOVO: Notificar o observador de que um livro foi deletado
            this.notificarObservers('livro:deletado', { id: id, titulo: livroExistente.titulo });
        });
    }
}
exports.LivroService = LivroService;
