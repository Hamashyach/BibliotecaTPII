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
exports.EmprestimoRepository = void 0;
const mysql_1 = require("../../Database/mysql");
const Emprestimo_1 = require("../../Models/Entity/Emprestimo");
class EmprestimoRepository {
    constructor() {
        this.criarTabela();
    }
    criarTabela() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            CREATE TABLE IF NOT EXISTS emprestimos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                livroId INT NOT NULL,
                usuarioId INT NOT NULL,
                dataEmprestimo DATE NOT NULL,
                dataDevolucaoPrevista DATE,
                dataDevolucao DATE,
                FOREIGN KEY (livroId) REFERENCES livros(id),
                FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
            )
        `;
            try {
                yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Tabela de empréstimos verificada/criada com sucesso.');
            }
            catch (err) {
                console.error('Erro ao criar a tabela de empréstimos:', err);
            }
        });
    }
    linhaParaEmprestimo(linha) {
        const emprestimo = new Emprestimo_1.Emprestimo(linha.livroId, linha.usuarioId);
        emprestimo.id = linha.id;
        emprestimo.dataEmprestimo = new Date(linha.dataEmprestimo);
        emprestimo.dataDevolucaoPrevista = new Date(linha.dataDevolucaoPrevista);
        emprestimo.dataDevolucao = linha.dataDevolucao ? new Date(linha.dataDevolucao) : null;
        return emprestimo;
    }
    inserirEmprestimo(emprestimo) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "INSERT INTO emprestimos (livroId, usuarioId, dataEmprestimo, dataDevolucaoprevista, dataDevolucao) VALUES (?, ?, ?, ?, ?)";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [
                    emprestimo.livroId,
                    emprestimo.usuarioId,
                    emprestimo.dataEmprestimo,
                    emprestimo.dataDevolucaoPrevista,
                    emprestimo.dataDevolucao
                ]);
                console.log('Empréstimo inserido com sucesso, ID:', resultado.insertId);
                emprestimo.id = resultado.insertId;
                return emprestimo;
            }
            catch (err) {
                console.error('Erro ao inserir empréstimo:', err);
                throw err;
            }
        });
    }
    atualizarEmprestimo(emprestimo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!emprestimo.id) {
                throw new Error("Não é possível atualizar um empréstimo sem ID.");
            }
            const query = "UPDATE emprestimos SET livroId = ?, usuarioId = ?, dataEmprestimo = ?, dataDevolucaoprevista = ?, dataDevolucao = ? WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [
                    emprestimo.livroId,
                    emprestimo.usuarioId,
                    emprestimo.dataEmprestimo,
                    emprestimo.dataDevolucaoPrevista,
                    emprestimo.dataDevolucao,
                    emprestimo.id
                ]);
                console.log('Empréstimo atualizado com sucesso, ID:', emprestimo.id);
                return emprestimo;
            }
            catch (err) {
                console.error(`Erro ao atualizar o empréstimo de ID ${emprestimo.id}:`, err);
                throw err;
            }
        });
    }
    deletarEmprestimo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "DELETE FROM emprestimos WHERE id = ?";
            try {
                yield (0, mysql_1.executarComandoSQL)(query, [id]);
                console.log('Empréstimo deletado com sucesso, ID:', id);
            }
            catch (err) {
                console.error(`Erro ao deletar o empréstimo de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarEmprestimoPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM emprestimos WHERE id = ?";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [id]);
                if (resultado.length > 0) {
                    return this.linhaParaEmprestimo(resultado[0]);
                }
                return null;
            }
            catch (err) {
                console.error(`Erro ao buscar empréstimo de ID ${id}:`, err);
                throw err;
            }
        });
    }
    filtrarTodosEmprestimos() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM emprestimos";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, []);
                console.log('Todos os empréstimos foram listados com sucesso.');
                return resultado.map(this.linhaParaEmprestimo);
            }
            catch (err) {
                console.error('Erro ao listar todos os empréstimos:', err);
                throw err;
            }
        });
    }
    contarEmprestimosPorUsuarioId(usuarioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT COUNT(*) as total FROM emprestimos WHERE usuarioId = ?";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [usuarioId]);
                return resultado[0].total;
            }
            catch (err) {
                console.error(`Erro ao contar empréstimos para o usuário de ID ${usuarioId}:`, err);
                throw err;
            }
        });
    }
    buscarAtivoPorLivroId(livroId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM emprestimos WHERE livroId = ? AND dataDevolucao IS NULL";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [livroId]);
                if (resultado.length > 0) {
                    return this.linhaParaEmprestimo(resultado[0]);
                }
                return null;
            }
            catch (err) {
                console.error(`Erro ao buscar empréstimo ativo para o livro de ID ${livroId}:`, err);
                throw err;
            }
        });
    }
    filtrarEmprestimosPorNomeUsuario(nome) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT e.* FROM emprestimos e
            JOIN usuarios u ON e.usuarioId = u.id
            WHERE u.nome LIKE ?
        `;
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [`%${nome}%`]);
                return resultado.map(this.linhaParaEmprestimo);
            }
            catch (err) {
                console.error(`Erro ao filtrar empréstimos por nome de usuário:`, err);
                throw err;
            }
        });
    }
    filtrarEmprestimosPorData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM emprestimos WHERE DATE(dataEmprestimo) = DATE(?)";
            try {
                const resultado = yield (0, mysql_1.executarComandoSQL)(query, [data]);
                return resultado.map(this.linhaParaEmprestimo);
            }
            catch (err) {
                console.error(`Erro ao filtrar empréstimos pela data ${data.toISOString()}:`, err);
                throw err;
            }
        });
    }
}
exports.EmprestimoRepository = EmprestimoRepository;
