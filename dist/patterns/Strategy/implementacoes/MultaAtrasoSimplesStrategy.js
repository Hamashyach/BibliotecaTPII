"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultaAtrasoSimplesStrategy = void 0;
class MultaAtrasoSimplesStrategy {
    constructor() {
        this.valorPorDia = 2.00;
        this.diasDeTolerancia = 0;
    }
    calcular(emprestimo) {
        const dataEmprestimo = emprestimo.dataEmprestimo.getTime();
        const dataDevolucao = new Date().getTime();
        const diffEmMs = dataDevolucao - dataEmprestimo;
        const diffEmDias = Math.ceil(diffEmMs / (1000 * 60 * 60 * 24));
        if (diffEmDias <= this.diasDeTolerancia) {
            return 0;
        }
        const diasDeAtraso = diffEmDias - this.diasDeTolerancia;
        return diasDeAtraso * this.valorPorDia;
    }
}
exports.MultaAtrasoSimplesStrategy = MultaAtrasoSimplesStrategy;
