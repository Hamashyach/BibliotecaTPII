export class LivroDto {
    id: number;
    titulo: string;
    autor: string;
    categoria: string;
    isAvailable?: boolean;

    constructor(id: number, titulo: string, autor: string, categoria: string, isAvailable?: boolean) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
        this.isAvailable = isAvailable;
    }
}