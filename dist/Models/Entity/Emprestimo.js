"use strict";
// src/Modelos/Entidades/Emprestimo.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emprestimo = void 0;
class Emprestimo {
    constructor(livroId, usuarioId) {
        if (livroId == null || usuarioId == null) {
            throw new Error("ID do Livro e ID do Usuário são obrigatórios para criar um empréstimo.");
        }
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = new Date();
        this.dataDevolucao = null;
        this.dataDevolucaoPrevista = new Date();
        this.valorMulta = null;
    }
}
exports.Emprestimo = Emprestimo;
