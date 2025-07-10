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
exports.LivroController = void 0;
const tsoa_1 = require("tsoa");
const LivroService_1 = require("../Service/LivroService");
const RepositoryFactory_1 = require("../patterns/Factory/RepositoryFactory");
let LivroController = class LivroController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.livroService = new LivroService_1.LivroService(new RepositoryFactory_1.RepositoryFactory());
    }
    cadastrarLivro(dto, resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const novoLivro = yield this.livroService.criar(dto);
                this.setStatus(201);
                return novoLivro;
            }
            catch (error) {
                if (error.message.includes("já existe")) {
                    return resError(409, { mensagem: error.message });
                }
                throw error;
            }
        });
    }
    listarTodosLivros() {
        return __awaiter(this, void 0, void 0, function* () {
            // Agora, este endpoint pode ser substituído por /livros/buscar sem termo
            // Ou você pode mantê-lo e chamar this.livroService.buscarTodos();
            return this.livroService.buscarTodos();
        });
    }
    // NOVO ENDPOINT: Busca livros com filtro
    /**
     * Lista livros, com opção de filtro por termo (título, autor, categoria, ID).
     * Inclui informação de disponibilidade.
     * @param termo Termo de busca para título, autor, categoria ou ID do livro.
     */
    buscarLivrosComFiltro(termo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.livroService.buscarLivrosComFiltro(termo);
        });
    }
    filtrarLivroPorId(id, resNaoEncontrado) {
        return __awaiter(this, void 0, void 0, function* () {
            const livro = yield this.livroService.buscarPorId(id);
            if (!livro) {
                return resNaoEncontrado(404, { mensagem: "Livro não encontrado." });
            }
            return livro;
        });
    }
};
exports.LivroController = LivroController;
__decorate([
    (0, tsoa_1.Post)(),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], LivroController.prototype, "cadastrarLivro", null);
__decorate([
    (0, tsoa_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LivroController.prototype, "listarTodosLivros", null);
__decorate([
    (0, tsoa_1.Get)("/buscar") // Rota: GET /livros/buscar?termo=exemplo
    ,
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LivroController.prototype, "buscarLivrosComFiltro", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], LivroController.prototype, "filtrarLivroPorId", null);
exports.LivroController = LivroController = __decorate([
    (0, tsoa_1.Route)("livros"),
    (0, tsoa_1.Tags)("Livro")
], LivroController);
