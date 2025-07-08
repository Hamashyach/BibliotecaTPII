"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.EmprestimoController = void 0;
const tsoa_1 = require("tsoa");
const EmprestimoService_1 = require("../Service/EmprestimoService");
const RepositoryFactory_1 = require("../patterns/Factory/RepositoryFactory");
const CommandManager_1 = require("../patterns/Command/CommandManager");
const MultaAtrasoSimplesStrategy_1 = require("../patterns/Strategy/implementacoes/MultaAtrasoSimplesStrategy");
let EmprestimoController = class EmprestimoController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.emprestimoService = new EmprestimoService_1.EmprestimoService(new RepositoryFactory_1.RepositoryFactory());
        this.commandManager = new CommandManager_1.CommandManager();
    }
    cadastrarEmprestimo(dto, resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const novoEmprestimo = yield this.emprestimoService.criar(dto);
                this.setStatus(201);
                return novoEmprestimo;
            }
            catch (error) {
                if (error.message.includes("não encontrado")) {
                    resError(404, { mensagem: error.message });
                }
                else if (error.message.includes("já está emprestado") || error.message.includes("atingiu o limite")) {
                    resError(409, { mensagem: error.message });
                }
                else {
                }
                return undefined;
            }
        });
    }
    /**
     * Registra a devolução de um livro a partir do ID do empréstimo.
     */
    devolverEmprestimo(id, resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estrategia = new MultaAtrasoSimplesStrategy_1.MultaAtrasoSimplesStrategy();
                const resultadoDevolucao = yield this.emprestimoService.devolver(id, estrategia);
                return resultadoDevolucao;
            }
            catch (error) {
                if (error.message.includes("não encontrado")) {
                    resError(404, { mensagem: error.message });
                }
                else if (error.message.includes("já foi devolvido")) {
                    resError(409, { mensagem: error.message });
                }
                else {
                    throw error;
                }
                return undefined;
            }
        });
    }
    desfazerUltimaAcao(resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.commandManager.desfazer();
                return { mensagem: "Última ação desfeita com sucesso." };
            }
            catch (error) {
                return resError(400, { mensagem: error.message });
            }
        });
    }
    /**
     * Lista todos os empréstimos registrados no sistema.
     */
    listarTodosEmprestimos() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emprestimoService.buscarTodos();
        });
    }
    /**
     * Busca um empréstimo específico pelo seu ID.
     */
    filtrarEmprestimoPorId(id, resNaoEncontrado) {
        return __awaiter(this, void 0, void 0, function* () {
            const emprestimo = yield this.emprestimoService.buscarPorId(id);
            if (!emprestimo) {
                return resNaoEncontrado(404, { mensagem: "Empréstimo não encontrado." });
            }
            return emprestimo;
        });
    }
    /**
     * Busca empréstimos pelo nome do usuário.
     * @param nome O nome (ou parte do nome) do usuário para buscar.
     */
    listarEmprestimosPorNomeUsuario(nome) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emprestimoService.buscarPorNomeUsuario(nome);
        });
    }
};
exports.EmprestimoController = EmprestimoController;
__decorate([
    (0, tsoa_1.Post)(),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "cadastrarEmprestimo", null);
__decorate([
    (0, tsoa_1.Put)("{id}/devolver"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "devolverEmprestimo", null);
__decorate([
    (0, tsoa_1.Post)("desfazer"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "desfazerUltimaAcao", null);
__decorate([
    (0, tsoa_1.Get)() // Rota: GET /emprestimos
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "listarTodosEmprestimos", null);
__decorate([
    (0, tsoa_1.Get)("{id}") // Rota: GET /emprestimos/1
    ,
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "filtrarEmprestimoPorId", null);
__decorate([
    (0, tsoa_1.Get)("buscar-por-usuario") // Rota: GET /emprestimos/buscar-por-usuario?nome=Joao
    ,
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmprestimoController.prototype, "listarEmprestimosPorNomeUsuario", null);
exports.EmprestimoController = EmprestimoController = __decorate([
    (0, tsoa_1.Route)("emprestimos"),
    (0, tsoa_1.Tags)("Emprestimo")
], EmprestimoController);
