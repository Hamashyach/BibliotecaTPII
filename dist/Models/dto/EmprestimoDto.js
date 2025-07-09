"use strict";
// src/Models/dto/EmprestimoDto.ts
// ARQUIVO CORRIGIDO E ATUALIZADO
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprestimoDto = void 0;
class EmprestimoDto {
    constructor(id, livroId, usuarioId, dataEmprestimo, dataDevolucaoPrevista, // ORDEM MUDADA: antes de dataDevolucao
    dataDevolucao) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucaoPrevista = dataDevolucaoPrevista; // Atribuição consistente
        this.dataDevolucao = dataDevolucao;
    }
}
exports.EmprestimoDto = EmprestimoDto;
