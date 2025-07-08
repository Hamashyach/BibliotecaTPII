import { Emprestimo } from "../../Models/Entity/Emprestimo";

export interface ICalculoMultaStrategy {
    
    calcular(emprestimo: Emprestimo): number;
}