"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.UsuarioController = void 0;
const tsoa_1 = require("tsoa");
const UsuarioService_1 = require("../Service/UsuarioService");
const BasicresponseDto_1 = require("../Models/dto/BasicresponseDto");
const RepositoryFactory_1 = require("../patterns/Factory/RepositoryFactory");
const LoginRequestdto_1 = require("../Models/dto/LoginRequestdto");
const LoginServiceProxy_1 = require("../Service/LoginServiceProxy");
const jwt = __importStar(require("jsonwebtoken"));
let UsuarioController = class UsuarioController extends tsoa_1.Controller {
    constructor() {
        super();
        this.usuarioService = new UsuarioService_1.UsuarioService(new RepositoryFactory_1.RepositoryFactory());
        this.loginProxy = new LoginServiceProxy_1.LoginServiceProxy(this.usuarioService);
    }
    login(dto, resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminDto = yield this.loginProxy.realizarLogin(dto);
                // Se o login for bem-sucedido, gera um token JWT.
                const secret = process.env.JWT_SECRET || 'SEGREDO_PADRAO_PARA_DESENVOLVIMENTO';
                const token = jwt.sign({ id: adminDto.id, email: adminDto.email, perfil: adminDto.perfil }, secret, { expiresIn: '8h' });
                this.setStatus(200);
                return { token: token, usuario: adminDto };
            }
            catch (error) {
                if (error.message.includes('Acesso negado')) {
                    return resError(401, { mensagem: error.message });
                }
                return resError(400, { mensagem: error.message });
            }
        });
    }
    cadastrarUsuario(dadosCriacao, resError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarioCriado = yield this.usuarioService.criar(dadosCriacao);
                this.setStatus(201);
                return usuarioCriado;
            }
            catch (error) {
                if (error.message.includes('email já está em uso')) {
                    return resError(409, new BasicresponseDto_1.BasicResponseDto(error.message, undefined));
                }
                return resError(400, new BasicresponseDto_1.BasicResponseDto(error.message, undefined));
            }
        });
    }
    listarTodosUsuarios() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usuarioService.buscarTodos();
        });
    }
    /**
     * @param id
     */
    filtrarUsuarioPorId(id, resNaoEncontrado) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield this.usuarioService.buscarPorId(id);
            if (!usuario) {
                return resNaoEncontrado(404, { mensagem: "Usuário não encontrado." });
            }
            return usuario;
        });
    }
    deletarUsuario(id, resNaoEncontrado) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.usuarioService.deletar(id);
                this.setStatus(204);
                return;
            }
            catch (error) {
                if (error.message.includes('não encontrado')) {
                    return resNaoEncontrado(404, { mensagem: error.message });
                }
                throw error;
            }
        });
    }
    atualizarUsuario(id, dadosAtualizacao, resNaoEncontrado) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dtoCompleto = Object.assign({ id: id }, dadosAtualizacao);
                const usuarioAtualizado = yield this.usuarioService.atualizar(dtoCompleto);
                return usuarioAtualizado;
            }
            catch (error) {
                if (error.message.includes('não encontrado')) {
                    return resNaoEncontrado(404, { mensagem: error.message });
                }
                throw error;
            }
        });
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, tsoa_1.Post)("/login") // Rota: POST /usuarios/login
    ,
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginRequestdto_1.LoginRequestDto, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "login", null);
__decorate([
    (0, tsoa_1.Post)() // Rota: POST /usuarios
    ,
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "cadastrarUsuario", null);
__decorate([
    (0, tsoa_1.Get)() // Rota: GET /usuarios
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listarTodosUsuarios", null);
__decorate([
    (0, tsoa_1.Get)("{id}") // Rota: GET /usuarios/123
    ,
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "filtrarUsuarioPorId", null);
__decorate([
    (0, tsoa_1.Delete)("{id}") // Rota: DELETE /usuarios/123
    ,
    (0, tsoa_1.SuccessResponse)("204", "No Content"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "deletarUsuario", null);
__decorate([
    (0, tsoa_1.Put)("{id}") // Rota: PUT /usuarios/123
    ,
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "atualizarUsuario", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, tsoa_1.Route)("usuarios"),
    (0, tsoa_1.Tags)("Usuario"),
    __metadata("design:paramtypes", [])
], UsuarioController);
