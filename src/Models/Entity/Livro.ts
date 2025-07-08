export class Livro {
    private static ultimoId = 0;
    id?: number;
    titulo: string;
    autor: string;
    categoria: string;

    constructor(titulo: string, autor: string, categoria: string) {
        if (!titulo || !autor || !categoria) {
            throw new Error("Todas as informações devem ser preenchidas.");
        }
        
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
    }
}