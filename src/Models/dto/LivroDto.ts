export class LivroDto {
    id: number;
    titulo: string;
    autor: string;
    categoria: string;

    constructor(id: number, titulo: string, autor: string, categoria: string) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
    }
}