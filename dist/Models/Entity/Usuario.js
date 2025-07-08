"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(nome, email, senha, perfil = 'usuario') {
        if (!nome || !email || !senha) {
            throw new Error("Todas as informações devem ser preenchidas.");
        }
        if (nome.trim().length < 3) {
            throw new Error("Nome deve ter pelo menos 3 caracteres.");
        }
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            throw new Error("Email inválido.");
        }
        if (senha.length < 6) {
            throw new Error("Senha deve ter pelo menos 6 caracteres.");
        }
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }
}
exports.Usuario = Usuario;
Usuario.ultimoId = 0;
