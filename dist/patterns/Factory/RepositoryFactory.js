"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
const UsuarioRepository_1 = require("../../Repository/implementacoes/UsuarioRepository");
const LivroRepository_1 = require("../../Repository/implementacoes/LivroRepository");
const EmprestimoRepository_1 = require("../../Repository/implementacoes/EmprestimoRepository");
class RepositoryFactory {
    criarUsuarioRepositorio() {
        return new UsuarioRepository_1.UsuarioRepository();
    }
    criarLivroRepositorio() {
        return new LivroRepository_1.LivroRepository();
    }
    criarEmprestimoRepositorio() {
        return new EmprestimoRepository_1.EmprestimoRepository();
    }
}
exports.RepositoryFactory = RepositoryFactory;
