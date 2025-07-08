"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemMultaStrategy = void 0;
// Estratégia usuários VIP que não pagam multa.
class SemMultaStrategy {
    calcular(emprestimo) {
        console.log("Aplicando estratégia: Sem Multa.");
        return 0;
    }
}
exports.SemMultaStrategy = SemMultaStrategy;
