export class Emprestimo {
    private static ultimoId = 0;
    id?: number;
    livroId: number;
    usuarioId: number;
    dataEmprestimo: Date;
    dataDevolucao: Date;

    constructor(livroId: number, usuarioId: number, dataEmprestimo: Date, dataDevolucao: Date, id?: number) {
        if (
            
            livroId == null ||
            usuarioId == null ||
            !dataEmprestimo ||
            !dataDevolucao
        ) {
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