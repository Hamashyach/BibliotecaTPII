import { Livro } from "../../Models/Entity/Livro";

export interface ILivroRepository {
    inserirLivro(livro: Livro): Promise<Livro>;
    atualizarLivro(livro: Livro): Promise<Livro>;
    deletarLivro(id: number): Promise<void>;
    filtrarLivroPorId(id: number): Promise<Livro | null>;
    filtrarTodosLivros(): Promise<Livro[]>;
    filtrarLivroPorTituloEAutor(titulo: string, autor: string): Promise<Livro | null>;
    

}