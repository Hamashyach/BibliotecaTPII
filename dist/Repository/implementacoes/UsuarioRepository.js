"use strict";
// src/Repositories/UsuarioRepository.ts
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
exports.UsuarioRepository = void 0;
const mysql_1 = require("../../Database/mysql");
const Usuario_1 = require("../../Models/Entity/Usuario");
// A classe agora implementa a interface que definimos
class UsuarioRepository {
    // O construtor chama o método para criar a tabela
    constructor() {
        this.criarTabela();
    }
    // Método privado para garantir que a tabela 'usuarios' exista
    criarTabela() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                perfil VARCHAR(50) NOT NULL
            )
        `;
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Tabela de usuários verificada/criada com sucesso.');
            }
            catch (err) {
                console.error('Erro ao criar a tabela de usuários:', err);
            }
        });
    }
    // Mapeia uma linha do banco para um objeto Usuario
    // É útil para não repetir código
    rowToUsuario(row) {
        const usuario = new Usuario_1.Usuario(row.nome, row.email, row.senha, row.perfil);
        usuario.id = row.id;
        return usuario;
    }
    inserirUsuario(usuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [
                    usuario.nome,
                    usuario.email,
                    usuario.senha,
                    usuario.perfil
                ]);
                console.log('Usuário inserido com sucesso, ID:', resultado.insertId);
                usuario.id = resultado.insertId;
                return usuario;
            }
            catch (err) {
                console.error('Erro ao inserir usuário:', err);
                throw err; // Relança o erro original
            }
        });
    }
    atualizarUsuario(usuario) {
        return __awaiter(this, void 0, void 0, function* () {
            // Garantir que o usuário tenha um ID para a atualização
            if (!usuario.id) {
                throw new Error("Não é possível atualizar um usuário sem ID.");
            }
            const query = "UPDATE usuarios SET nome = ?, email = ?, senha = ?, perfil = ? WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [
                    usuario.nome,
                    usuario.email,
                    usuario.senha,
                    usuario.perfil,
                    usuario.id
                ]);
                console.log('Usuário atualizado com sucesso, ID:', usuario.id);
                return usuario;
            }
            catch (err) {
                console.error(`Erro ao atualizar o usuário de ID ${usuario.id}:`, err);
                throw err;
            }
        });
    }
    deletarUsuario(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "DELETE FROM usuarios WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [id]);
                console.log('Usuário deletado com sucesso, ID:', id);
            }
            catch (err) {
                console.error(`Erro ao deletar o usuário de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarUsuarioPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM usuarios WHERE id = ?";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [id]);
                if (resultado.length > 0) {
                    return this.rowToUsuario(resultado[0]);
                }
                return null;
            }
            catch (err) {
                console.error(`Erro ao buscar usuário de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarUsuarioPorEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM usuarios WHERE email = ?";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [email]);
                if (resultado.length > 0) {
                    return this.rowToUsuario(resultado[0]);
                }
                return null;
            }
            catch (err) {
                console.error(`Erro ao buscar usuário com o email ${email}:`, err);
                throw err;
            }
        });
    }
    filtrarTodosUsuarios() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM usuarios";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Todos os usuários foram listados com sucesso');
                // Mapeia cada linha para um objeto Usuario
                return resultado.map(this.rowToUsuario);
            }
            catch (err) {
                console.error('Erro ao listar todos os usuários:', err);
                throw err;
            }
        });
    }
}
exports.UsuarioRepository = UsuarioRepository;
