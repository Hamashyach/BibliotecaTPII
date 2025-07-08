export class EmprestimoDto {
    id: number;
    livroId: number;
    usuarioId: number;
    dataEmprestimo: Date;
    dataDevolucao: Date;

    constructor(
        id: number,
        livroId: number,
        usuarioId: number,
        dataEmprestimo: Date,
        dataDevolucao: Date
    ) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucao = dataDevolucao;
    }
}