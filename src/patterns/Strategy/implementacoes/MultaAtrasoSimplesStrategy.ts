import { ICalculoMultaStrategy } from "../ICalculoMultaStrategy";
import { Emprestimo } from "../../../Models/Entity/Emprestimo";

export class MultaAtrasoSimplesStrategy implements ICalculoMultaStrategy {
    private valorPorDia: number = 2.00; 
    private diasDeTolerancia: number = 7; 

    calcular(emprestimo: Emprestimo): number {
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