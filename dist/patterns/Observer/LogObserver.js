"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogObserver = void 0;
const Usuario_1 = require("../../Models/Entity/Usuario");
class LogObserver {
    update(data) {
        if (data instanceof Usuario_1.Usuario) {
            console.log(`[LogObserver]: Um novo usuário foi criado com sucesso! ID: ${data.id}, Email: ${data.email}`);
        }
    }
}
exports.LogObserver = LogObserver;
