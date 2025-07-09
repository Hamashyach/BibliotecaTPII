// src/Models/dto/EmprestimoDto.ts
// ARQUIVO CORRIGIDO E ATUALIZADO

export class EmprestimoDto {
    id: number;
    livroId: number;
    usuarioId: number;
    dataEmprestimo: Date;
    dataDevolucao: Date | null; 
    dataDevolucaoPrevista: Date;

    constructor(
        id: number,
        livroId: number,
        usuarioId: number,
        dataEmprestimo: Date,
        dataDevolucaoPrevista: Date, // ORDEM MUDADA: antes de dataDevolucao
        dataDevolucao: Date | null
    ) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucaoPrevista = dataDevolucaoPrevista; // Atribuição consistente
        this.dataDevolucao = dataDevolucao;
    }
}