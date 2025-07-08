"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emprestimo = void 0;
class Emprestimo {
    constructor(livroId, usuarioId, dataEmprestimo, dataDevolucao, id) {
        if (livroId == null ||
            usuarioId == null ||
            !dataEmprestimo ||
            !dataDevolucao) {
            throw new Error("Todas as informações devem ser preenchidas.");
        }
        if (!(dataEmprestimo instanceof Date) || isNaN(dataEmprestimo.getTime())) {
            throw new Error("Data de empréstimo inválida.");
        }
        if (!(dataDevolucao instanceof Date) || isNaN(dataDevolucao.getTime())) {
            throw new Error("Data de devolução inválida.");
        }
        if (dataDevolucao <= dataEmprestimo) {
            throw new Error("Data de devolução deve ser após a data de empréstimo.");
        }
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucao = dataDevolucao;
        // Atribui o ID se ele for passado 
        if (id) {
            this.id = id;
        }
    }
}
exports.Emprestimo = Emprestimo;
Emprestimo.ultimoId = 0;
