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
class EmprestimoService {
    constructor(repositoryFactory) {
        this.repositoryFactory = repositoryFactory;
        this.observers = [];
        this.LIMITE_EMPRESTIMOS_POR_USUARIO = 3; // Regra de negócio: limite de empréstimos
        // A factory fornece todas as dependências de repositório
        this.emprestimoRepositorio = this.repositoryFactory.criarEmprestimoRepositorio();
        this.livroRepositorio = this.repositoryFactory.criarLivroRepositorio();
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
    }
    registrarObserver(observer) {
        this.observers.push(observer);
    }
    notificarObservers(evento, data) {
        this.observers.forEach(observer => observer.update({ evento, data }));
    }
    // Função auxiliar para converter o modelo em DTO, tratando corretamente a data nula
    emprestimoParaDto(emprestimo) {
        return {
            id: emprestimo.id,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao // Já é Date | null no modelo
        };
    }
    /**
     * Realiza um novo empréstimo, aplicando todas as regras de negócio.
     */
    criar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuarioId, livroId } = dto;
            // Validação 1: O usuário existe?
            const usuario = yield this.usuarioRepositorio.filtrarUsuarioPorId(usuarioId);
            if (!usuario) {
                throw new Error("Usuário não encontrado.");
            }
            // Validação 2: O livro existe?
            const livro = yield this.livroRepositorio.filtrarLivroPorId(livroId);
            if (!livro) {
                throw new Error("Livro não encontrado.");
            }
            // Validação 3: O livro está disponível?
            const emprestimoAtivo = yield this.emprestimoRepositorio.buscarAtivoPorLivroId(livroId);
            if (emprestimoAtivo) {
                throw new Error("Este livro já está emprestado e não está disponível.");
            }
            // Validação 4: O usuário atingiu o limite de empréstimos?
            const totalEmprestimosUsuario = yield this.emprestimoRepositorio.contarEmprestimosPorUsuarioId(usuarioId);
            if (totalEmprestimosUsuario >= this.LIMITE_EMPRESTIMOS_POR_USUARIO) {
                throw new Error(`Usuário atingiu o limite de ${this.LIMITE_EMPRESTIMOS_POR_USUARIO} empréstimos ativos.`);
            }
            const novoEmprestimo = new Emprestimo_1.Emprestimo(livroId, usuarioId);
            const emprestimoSalvo = yield this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);
            this.notificarObservers('emprestimo:criado', emprestimoSalvo);
            return this.emprestimoParaDto(emprestimoSalvo);
        });
    }
    /**
     * Registra a devolução de um livro.
     */
    devolver(emprestimoId, estrategiaDeMulta) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimo = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(emprestimoId);
            if (!emprestimo) {
                throw new Error("Empréstimo não encontrado.");
            }
            if (emprestimo.dataDevolucao) {
                throw new Error("Este livro já foi devolvido.");
            }
            // Delega o cálculo da multa para o objeto de estratégia!
            const valorMulta = estrategiaDeMulta.calcular(emprestimo);
            emprestimo.dataDevolucao = new Date();
            const emprestimoAtualizado = yield this.emprestimoRepositorio.atualizarEmprestimo(emprestimo);
            this.notificarObservers('emprestimo:devolvido', { emprestimo: emprestimoAtualizado, multa: valorMulta });
            // Retorna um DTO com os dados do empréstimo e o valor da multa.
            return {
                emprestimo: this.emprestimoParaDto(emprestimoAtualizado),
                valorMulta: valorMulta
            };
        });
    }
    /**
     * Busca um empréstimo específico pelo seu ID.
     */
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimo = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
            return emprestimo ? this.emprestimoParaDto(emprestimo) : null;
        });
    }
    /**
     * Lista todos os empréstimos registrados no sistema.
     */
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimos = yield this.emprestimoRepositorio.filtrarTodosEmprestimos();
            return emprestimos.map(this.emprestimoParaDto);
        });
    }
    /**
     * Encontra todos os empréstimos feitos por usuários com um determinado nome.
     */
    buscarPorNomeUsuario(nome) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimos = yield this.emprestimoRepositorio.filtrarEmprestimosPorNomeUsuario(nome);
            return emprestimos.map(this.emprestimoParaDto);
        });
    }
    /**
     * Deleta um registro de empréstimo.
     * Cuidado: Geralmente não se deleta um histórico de empréstimo.
     * A devolução é o processo correto. Este método é para fins de manutenção.
     */
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimoExistente = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
            if (!emprestimoExistente) {
                throw new Error("Empréstimo não encontrado para ser deletado.");
            }
            yield this.emprestimoRepositorio.deletarEmprestimo(id);
            this.notificarObservers('emprestimo:deletado', { id });
        });
    }
}
exports.EmprestimoService = EmprestimoService;
