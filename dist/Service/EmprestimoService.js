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
    // MODIFICADO: Agora passa um objeto com 'evento', 'data' e 'usuarioId'
    notificarObservers(evento, data, usuarioId) {
        this.observers.forEach(observer => observer.update({ evento, data, usuarioId }));
    }
    // Função auxiliar para converter o modelo em DTO, tratando corretamente a data nula
    emprestimoParaDto(emprestimo) {
        let statusTexto;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
        // Zera a hora da data prevista para comparação
        const dataPrevistaSemHora = new Date(emprestimo.dataDevolucaoPrevista);
        dataPrevistaSemHora.setHours(0, 0, 0, 0);
        if (emprestimo.dataDevolucao !== null) {
            statusTexto = 'Devolvido';
        }
        else if (dataPrevistaSemHora < hoje) {
            statusTexto = 'Atrasado'; // Empréstimo ativo e data prevista já passou
        }
        else {
            statusTexto = 'Ativo'; // Empréstimo ativo e dentro do prazo
        }
        return {
            id: emprestimo.id,
            livroId: emprestimo.livroId,
            usuarioId: emprestimo.usuarioId,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataDevolucao: emprestimo.dataDevolucao,
            dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
            statusTexto: statusTexto // NOVO: Atribui o status calculado
        };
    }
    /**
     * Realiza um novo empréstimo, aplicando todas as regras de negócio.
     * Notifica os observadores sobre a criação do empréstimo.
     */
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
            novoEmprestimo.dataEmprestimo = dataEmprestimo; // Garante que a data do modelo seja a mesma
            novoEmprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista; // Garante que a data do modelo seja a mesma
            const emprestimoSalvo = yield this.emprestimoRepositorio.inserirEmprestimo(novoEmprestimo);
            // NOVO: Notificar o observador de que um empréstimo foi criado
            this.notificarObservers('emprestimo:criado', this.emprestimoParaDto(emprestimoSalvo), usuarioId);
            return this.emprestimoParaDto(emprestimoSalvo);
        });
    }
    /**
     * Registra a devolução de um livro.
     * Notifica os observadores sobre a devolução.
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
            const valorMulta = estrategiaDeMulta.calcular(emprestimo);
            emprestimo.dataDevolucao = new Date();
            const emprestimoAtualizado = yield this.emprestimoRepositorio.atualizarEmprestimo(emprestimo);
            // NOVO: Notificar o observador de que um empréstimo foi devolvido
            // Passe o emprestimoAtualizado e a multa. O observer vai inferir o usuarioId.
            this.notificarObservers('emprestimo:devolvido', { emprestimo: this.emprestimoParaDto(emprestimoAtualizado), multa: valorMulta }, emprestimo.usuarioId);
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
     * Notifica os observadores sobre a exclusão.
     * Cuidado: Geralmente não se deleta um histórico de empréstimo.
     * Este método é para fins de manutenção ou para o comando 'desfazer'.
     */
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimoExistente = yield this.emprestimoRepositorio.filtrarEmprestimoPorId(id);
            if (!emprestimoExistente) {
                throw new Error("Empréstimo não encontrado para ser deletado.");
            }
            yield this.emprestimoRepositorio.deletarEmprestimo(id);
            // NOVO: Notificar o observador de que um empréstimo foi deletado
            this.notificarObservers('emprestimo:deletado', { id: id, usuarioId: emprestimoExistente.usuarioId, livroId: emprestimoExistente.livroId }, emprestimoExistente.usuarioId);
        });
    }
    /**
     * Método para buscar empréstimos atrasados.
     */
    buscarEmprestimosAtrasados() {
        return __awaiter(this, void 0, void 0, function* () {
            const todosEmprestimos = yield this.emprestimoRepositorio.filtrarTodosEmprestimos();
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
            const emprestimosAtrasados = todosEmprestimos.filter(emprestimo => {
                // Verifica se o empréstimo ainda não foi devolvido
                if (emprestimo.dataDevolucao === null) {
                    // Converte a data prevista de devolução para objeto Date e zera a hora
                    const dataPrevista = new Date(emprestimo.dataDevolucaoPrevista);
                    dataPrevista.setHours(0, 0, 0, 0);
                    // CORRIGIDO: Se a data prevista de devolução for anterior OU IGUAL a hoje, está atrasado
                    return dataPrevista <= hoje; // AQUI ESTÁ A CORREÇÃO!
                }
                return false; // Não está atrasado se já foi devolvido
            });
            return emprestimosAtrasados;
        });
    }
}
exports.EmprestimoService = EmprestimoService;
