import { ICalculoMultaStrategy } from "../ICalculoMultaStrategy";
import { Emprestimo } from "../../../Models/Entity/Emprestimo";

// Esta estratégia cobra um valor fixo por dia de atraso.
export class MultaAtrasoSimplesStrategy implements ICalculoMultaStrategy {
    private valorPorDia: number = 2.00; // R$ 2,00 por dia
    private diasDeTolerancia: number = 7; // O usuário tem 7 dias para devolver

    calcular(emprestimo: Emprestimo): number {
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