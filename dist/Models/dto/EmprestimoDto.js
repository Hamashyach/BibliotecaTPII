"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprestimoDto = void 0;
class EmprestimoDto {
    constructor(id, livroId, usuarioId, dataEmprestimo, dataDevolucao) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucao = dataDevolucao;
    }
}
exports.EmprestimoDto = EmprestimoDto;
