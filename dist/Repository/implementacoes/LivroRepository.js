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
exports.LivroRepository = void 0;
const mysql_1 = require("../../Database/mysql");
const Livro_1 = require("../../Models/Entity/Livro");
class LivroRepository {
    constructor() {
        this.criarTabela();
    }
    criarTabela() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            CREATE TABLE IF NOT EXISTS livros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                autor VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) NOT NULL
            )
        `;
            try {
                yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Tabela de livros verificada/criada com sucesso.');
            }
            catch (err) {
                console.error('Erro ao criar a tabela de livros:', err);
            }
        });
    }
    // Função auxiliar para converter uma linha do banco em um objeto Livro
    linhaParaLivro(linha) {
        const livro = new Livro_1.Livro(linha.titulo, linha.autor, linha.categoria);
        livro.id = linha.id;
        return livro;
    }
    inserirLivro(livro) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "INSERT INTO livros (titulo, autor, categoria) VALUES (?, ?, ?)";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [
                    livro.titulo,
                    livro.autor,
                    livro.categoria
                ]);
                console.log('Livro inserido com sucesso, ID:', resultado.insertId);
                livro.id = resultado.insertId;
                return livro;
            }
            catch (err) {
                console.error('Erro ao inserir livro:', err);
                throw err;
            }
        });
    }
    atualizarLivro(livro) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!livro.id) {
                throw new Error("Não é possível atualizar um livro sem ID.");
            }
            const query = "UPDATE livros SET titulo = ?, autor = ?, categoria = ? WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [
                    livro.titulo,
                    livro.autor,
                    livro.categoria,
                    livro.id
                ]);
                console.log('Livro atualizado com sucesso, ID:', livro.id);
                return livro;
            }
            catch (err) {
                console.error(`Erro ao atualizar o livro de ID ${livro.id}:`, err);
                throw err;
            }
        });
    }
    deletarLivro(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "DELETE FROM livros WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [id]);
                console.log('Livro deletado com sucesso, ID:', id);
            }
            catch (err) {
                console.error(`Erro ao deletar o livro de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarLivroPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM livros WHERE id = ?";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [id]);
                if (resultado.length > 0) {
                    return this.linhaParaLivro(resultado[0]);
                }
                return null;
            }
            catch (err) {
                console.error(`Erro ao buscar livro de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarLivroPorTituloEAutor(titulo, autor) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM livros WHERE titulo = ? AND autor = ?";
            const resultado = yield (0, mysql_1.executarComandoSQL)(query, [titulo, autor]);
            if (resultado.length === 0)
                return null;
            return this.linhaParaLivro(resultado[0]);
        });
    }
    filtrarTodosLivros() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM livros";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Todos os livros foram listados com sucesso.');
                return resultado.map(this.linhaParaLivro);
            }
            catch (err) {
                console.error('Erro ao listar todos os livros:', err);
                throw err;
            }
        });
    }
}
exports.LivroRepository = LivroRepository;
