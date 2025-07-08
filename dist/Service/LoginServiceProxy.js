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
exports.LoginServiceProxy = void 0;
const UsuarioDto_1 = require("../Models/dto/UsuarioDto");
class LoginServiceProxy {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    usuarioParaDto(usuario) {
        return new UsuarioDto_1.UsuarioDto(usuario.id, usuario.nome, usuario.email, usuario.perfil);
    }
    realizarLogin(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioAutenticado = yield this.usuarioService.autenticar(dto);
            if (usuarioAutenticado.perfil !== 'admin') {
                throw new Error('Acesso negado. Apenas administradores podem fazer login.');
            }
            console.log(`[LoginProxy] Acesso de administrador concedido para: ${usuarioAutenticado.email}`);
            return this.usuarioParaDto(usuarioAutenticado);
        });
    }
}
exports.LoginServiceProxy = LoginServiceProxy;
