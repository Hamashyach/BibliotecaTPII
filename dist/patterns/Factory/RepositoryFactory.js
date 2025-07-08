"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
const UsuarioRepository_1 = require("../../Repository/UsuarioRepository");
// Importe outros repositórios aqui conforme necessário
// import { LivroRepositorio } from '../../Repositorios/LivroRepositorio';
class RepositoryFactory {
    criarUsuarioRepositorio() {
        // A lógica de criação pode incluir a passagem de uma conexão de banco, etc.
        return new UsuarioRepository_1.UsuarioRepository();
    }
}
exports.RepositoryFactory = RepositoryFactory;
