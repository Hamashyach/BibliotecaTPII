"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealizarEmprestimoCommand = void 0;
class RealizarEmprestimoCommand {
    // O comando precisa do "Chef" (Service) e dos "ingredientes" (DTO)
    constructor(emprestimoService, dto) {
        this.emprestimoService = emprestimoService;
        this.dto = dto;
        // Guarda o estado do empréstimo criado para poder desfazê-lo
        this.emprestimoCriado = null;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Executando o comando: Realizar Empréstimo...");
            // Chama o serviço para realizar a ação principal
            this.emprestimoCriado = yield this.emprestimoService.criar(this.dto);
            console.log(`Comando executado: Empréstimo ID ${this.emprestimoCriado.id} criado.`);
            return this.emprestimoCriado;
        });
    }
    undo() {
        return __awaiter(this, void 0, void 0, function* () {
            // Só podemos desfazer se o comando foi executado com sucesso
            if (this.emprestimoCriado && this.emprestimoCriado.id) {
                console.log(`Desfazendo o comando: Deletando Empréstimo ID ${this.emprestimoCriado.id}...`);
                yield this.emprestimoService.deletar(this.emprestimoCriado.id);
                console.log("Comando desfeito com sucesso.");
                this.emprestimoCriado = null;
            }
            else {
                console.log("Nada a ser desfeito.");
            }
        });
    }
}
exports.RealizarEmprestimoCommand = RealizarEmprestimoCommand;
