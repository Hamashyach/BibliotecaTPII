"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultaAtrasoSimplesStrategy = void 0;
// Esta estratégia cobra um valor fixo por dia de atraso.
class MultaAtrasoSimplesStrategy {
    constructor() {
        this.valorPorDia = 2.00; // R$ 2,00 por dia
        this.diasDeTolerancia = 7; // O usuário tem 7 dias para devolver
    }
    calcular(emprestimo) {
        const dataEmprestimo = emprestimo.dataEmprestimo.getTime();
        const dataDevolucao = new Date().getTime(); // A data de hoje
        const diffEmMs = dataDevolucao - dataEmprestimo;
        const diffEmDias = Math.ceil(diffEmMs / (1000 * 60 * 60 * 24));
        if (diffEmDias <= this.diasDeTolerancia) {
            return 0; // Sem multa se devolver dentro do prazo
        }
        const diasDeAtraso = diffEmDias - this.diasDeTolerancia;
        return diasDeAtraso * this.valorPorDia;
    }
}
exports.MultaAtrasoSimplesStrategy = MultaAtrasoSimplesStrategy;
