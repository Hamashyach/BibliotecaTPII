"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Livro = void 0;
class Livro {
    constructor(titulo, autor, categoria) {
        if (!titulo || !autor || !categoria) {
            throw new Error("Todas as informações devem ser preenchidas.");
        }
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
    }
}
exports.Livro = Livro;
Livro.ultimoId = 0;
