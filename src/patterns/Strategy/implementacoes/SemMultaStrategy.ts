import { ICalculoMultaStrategy } from "../ICalculoMultaStrategy";
import { Emprestimo } from "../../../Models/Entity/Emprestimo";

// Estratégia usuários VIP que não pagam multa.
export class SemMultaStrategy implements ICalculoMultaStrategy {
    calcular(emprestimo: Emprestimo): number {
        console.log("Aplicando estratégia: Sem Multa.");
        return 0;
    }
}