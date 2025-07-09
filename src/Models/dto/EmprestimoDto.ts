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
        dataDevolucao: Date | null, 
        dataDevolucaoPrevista: Date,
    ) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucao = dataDevolucao;
        this.dataDevolucaoPrevista = dataDevolucaoPrevista;
    }
}