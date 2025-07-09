"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroDto = void 0;
class LivroDto {
    constructor(id, titulo, autor, categoria, isAvailable) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
        this.isAvailable = isAvailable;
    }
}
exports.LivroDto = LivroDto;
