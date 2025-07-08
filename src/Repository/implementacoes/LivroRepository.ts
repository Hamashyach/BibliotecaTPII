import { executarComandoSQL } from '../../Database/mysql'; 
import { Livro } from '../../Models/Entity/Livro'; 
import { ILivroRepository } from '../interfaces/ILivroRepository';

export class LivroRepository implements ILivroRepository {

    constructor() {
        this.criarTabela();
    }

    private async criarTabela(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS livros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                autor VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) NOT NULL
            )
        `;

        try {
            await executarComandoSQL(query, []);
            console.log('Tabela de livros verificada/criada com sucesso.');
        } catch (err) {
            console.error('Erro ao criar a tabela de livros:', err);
        }
    }

    // Função auxiliar para converter uma linha do banco em um objeto Livro
    private linhaParaLivro(linha: any): Livro {
        const livro = new Livro(linha.titulo, linha.autor, linha.categoria);
        livro.id = linha.id;
        return livro;
    }

    async inserirLivro(livro: Livro): Promise<Livro> {
        const query = "INSERT INTO livros (titulo, autor, categoria) VALUES (?, ?, ?)";
        try {
            const resultado = await executarComandoSQL(query, [
                livro.titulo,
                livro.autor,
                livro.categoria
            ]);
            console.log('Livro inserido com sucesso, ID:', resultado.insertId);
            livro.id = resultado.insertId;
            return livro;
        } catch (err) {
            console.error('Erro ao inserir livro:', err);
            throw err;
        }
    }

    async atualizarLivro(livro: Livro): Promise<Livro> {
        if (!livro.id) {
            throw new Error("Não é possível atualizar um livro sem ID.");
        }
        const query = "UPDATE livros SET titulo = ?, autor = ?, categoria = ? WHERE id = ?";
        try {
            await executarComandoSQL(query, [
                livro.titulo,
                livro.autor,
                livro.categoria,
                livro.id
            ]);
            console.log('Livro atualizado com sucesso, ID:', livro.id);
            return livro;
        } catch (err: any) {
            console.error(`Erro ao atualizar o livro de ID ${livro.id}:`, err);
            throw err;
        }
    }

    async deletarLivro(id: number): Promise<void> {
        const query = "DELETE FROM livros WHERE id = ?";
        try {
            await executarComandoSQL(query, [id]);
            console.log('Livro deletado com sucesso, ID:', id);
        } catch (err: any) {
            console.error(`Erro ao deletar o livro de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarLivroPorId(id: number): Promise<Livro | null> {
        const query = "SELECT * FROM livros WHERE id = ?";
        try {
            const resultado = await executarComandoSQL(query, [id]);
            if (resultado.length > 0) {
                return this.linhaParaLivro(resultado[0]);
            }
            return null;
        } catch (err: any) {
            console.error(`Erro ao buscar livro de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarLivroPorTituloEAutor(titulo: string, autor: string): Promise<Livro | null> {
        const query = "SELECT * FROM livros WHERE titulo = ? AND autor = ?";
        const resultado = await executarComandoSQL(query, [titulo, autor]);
        if (resultado.length === 0) return null;
        return this.linhaParaLivro(resultado[0]);
    }

    async filtrarTodosLivros(): Promise<Livro[]> {
        const query = "SELECT * FROM livros";
        try {
            const resultado = await executarComandoSQL(query, []);
            console.log('Todos os livros foram listados com sucesso.');
            return resultado.map(this.linhaParaLivro);
        } catch (err: any) {
            console.error('Erro ao listar todos os livros:', err);
            throw err;
        }
    }
}