export class EmprestimoDto {
    id: number;
    livroId: number;
    usuarioId: number;
    dataEmprestimo: Date;
    dataDevolucao: Date | null; 
    dataDevolucaoPrevista: Date;
    statusTexto: string;
    valorMulta : number | null;

    constructor(
        id: number,
        livroId: number,
        usuarioId: number,
        dataEmprestimo: Date,
        dataDevolucaoPrevista: Date, 
        dataDevolucao: Date | null,
        statusTexto: string,
        valorMulta : number | null
    ) {
        this.id = id;
        this.livroId = livroId;
        this.usuarioId = usuarioId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucaoPrevista = dataDevolucaoPrevista; 
        this.dataDevolucao = dataDevolucao;
        this.statusTexto = statusTexto;
        this.valorMulta = valorMulta;
    
    }
}
