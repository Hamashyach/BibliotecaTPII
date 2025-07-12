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
exports.EmprestimoService = void 0;
const Emprestimo_1 = require("../Models/Entity/Emprestimo");
const UsuarioActivityService_1 = require("../Service/UsuarioActivityService");
const UsuarioActivityObserver_1 = require("../patterns/Observer/UsuarioActivityObserver");
const LogObserver_1 = require("../patterns/Observer/LogObserver");
class EmprestimoService {
    constructor(repositoryFactory) {
        this.repositoryFactory = repositoryFactory;
        this.observers = [];
        this.LIMITE_EMPRESTIMOS_POR_USUARIO = 3;
        // A factory fornece todas as dependências de repositório
        this.emprestimoRepositorio = this.repositoryFactory.criarEmprestimoRepositorio();
        this.livroRepositorio = this.repositoryFactory.criarLivroRepositorio();
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
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
        this.observers.forEach(observer => observer.update({ evento, data, usuarioId }));
    }
    emprestimoParaDto(emprestimo) {
        let statusTexto;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataPrevistaSemHora = new Date(emprestimo.dataDevolucaoPrevista);
        dataPrevistaSemHora.setHours(0, 0, 0, 0);
        if (emprestimo.dataDevolucao !== null) {
            statusTexto = 'Devolvido';
        }
        else if (dataPrevistaSemHora < hoje) {
            statusTexto = 'Atrasado';
        }
        else {
            statusTexto = 'Ativo';
        }
        return {
            id: emprestimo.id,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao,
            dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
            statusTexto: statusTexto,
            valorMulta: emprestimo.valorMulta
        };
    }
    criar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuarioId, livroId } = dto;
            const usuario = yield this.usuarioRepositorio.filtrarUsuarioPorId(usuarioId);
            if (!usuario) {
                throw new Error("Usuário não encontrado.");
            }
            const livro = yield this.livroRepositorio.filtrarLivroPorId(livroId);
            if (!livro) {
                throw new Error("Livro não encontrado.");
            }
            const emprestimoAtivo = yield this.emprestimoRepositorio.buscarAtivoPorLivroId(livroId);
            if (emprestimoAtivo) {
                throw new Error("Este livro já está emprestado e não está disponível.");
            }
            const totalEmprestimosUsuario = yield this.emprestimoRepositorio.contarEmprestimosPorUsuarioId(usuarioId);
            if (totalEmprestimosUsuario >= this.LIMITE_EMPRESTIMOS_POR_USUARIO) {
                throw new Error(`Usuário atingiu o limite de ${this.LIMITE_EMPRESTIMOS_POR_USUARIO} empréstimos ativos.`);
            }
            const dataEmprestimo = new Date();
            const dataDevolucaoPrevista = new Date(dataEmprestimo);
            dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7);
            const novoEmprestimo = new Emprestimo_1.Emprestimo(livroId, usuarioId);
            novoEmprestimo.dataEmprestimo = dataEmprestimo;
            novoEmprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista;
            const emprestimoSalvo = yield this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);
            this.notificarObservers('emprestimo:criado', this.emprestimoParaDto(emprestimoSalvo), usuarioId);
            return this.emprestimoParaDto(emprestimoSalvo);
        });
    }
    devolver(emprestimoId, estrategiaDeMulta) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimo = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(emprestimoId);
            if (!emprestimo) {
                throw new Error("Empréstimo não encontrado.");
            }
            if (emprestimo.dataDevolucao) {
                throw new Error("Este livro já foi devolvido.");
            }
            const valorMulta = estrategiaDeMulta.calcular(emprestimo);
            emprestimo.dataDevolucao = new Date();
            const emprestimoAtualizado = yield this.emprestimoRepositorio.atualizarEmprestimo(emprestimo);
            this.notificarObservers('emprestimo:devolvido', { emprestimo: this.emprestimoParaDto(emprestimoAtualizado), multa: valorMulta }, emprestimo.usuarioId);
            return {
                emprestimo: this.emprestimoParaDto(emprestimoAtualizado),
                valorMulta: valorMulta
            };
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimo = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
            return emprestimo ? this.emprestimoParaDto(emprestimo) : null;
        });
    }
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimos = yield this.emprestimoRepositorio.filtrarTodosEmprestimos();
            return emprestimos.map(this.emprestimoParaDto);
        });
    }
    buscarPorNomeUsuario(nome) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimos = yield this.emprestimoRepositorio.filtrarEmprestimosPorNomeUsuario(nome);
            return emprestimos.map(this.emprestimoParaDto);
        });
    }
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimoExistente = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
            if (!emprestimoExistente) {
                throw new Error("Empréstimo não encontrado para ser deletado.");
            }
            yield this.emprestimoRepositorio.deletarEmprestimo(id);
            this.notificarObservers('emprestimo:deletado', { id: id, usuarioId: emprestimoExistente.usuarioId, livroId: emprestimoExistente.livroId }, emprestimoExistente.usuarioId);
        });
    }
    buscarEmprestimosAtrasados() {
        return __awaiter(this, void 0, void 0, function* () {
            const todosEmprestimos = yield this.emprestimoRepositorio.filtrarTodosEmprestimos();
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
        });
    }
}
exports.EmprestimoService = EmprestimoService;
