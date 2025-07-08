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
exports.CommandManager = void 0;
class CommandManager {
    constructor() {
        this.historico = [];
    }
    executar(comando) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultado = yield comando.execute();
            this.historico.push(comando);
            return resultado;
        });
    }
    desfazer() {
        return __awaiter(this, void 0, void 0, function* () {
            const ultimoComando = this.historico.pop();
            if (ultimoComando) {
                yield ultimoComando.undo();
            }
            else {
                console.log("Nenhum comando no histórico para ser desfeito.");
            }
        });
    }
}
exports.CommandManager = CommandManager;
