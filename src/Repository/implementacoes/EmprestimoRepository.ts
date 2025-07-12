import { executarComandoSQL } from '../../Database/mysql'; 
import { Emprestimo } from '../../Models/Entity/Emprestimo'; 
import { iEmprestimoRepository } from '../interfaces/iEmprestimoRepository'; 

export class EmprestimoRepository implements iEmprestimoRepository {

    constructor() {
        this.criarTabela();
    }

    private async criarTabela(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS emprestimos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                livroId INT NOT NULL,
                usuarioId INT NOT NULL,
                dataEmprestimo DATE NOT NULL,
                dataDevolucao DATE,
                FOREIGN KEY (livroId) REFERENCES livros(id),
                FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
            )
        `;

        try {
            await executarComandoSQL(query, []);
            console.log('Tabela de empréstimos verificada/criada com sucesso.');
        } catch (err) {
            console.error('Erro ao criar a tabela de empréstimos:', err);
        }
    }
    
    
    private linhaParaEmprestimo(linha: any): Emprestimo {
        const emprestimo = new Emprestimo(linha.livroId, linha.usuarioId);

            emprestimo.id = linha.id;
            emprestimo.dataEmprestimo = new Date(linha.dataEmprestimo);
            emprestimo.dataDevolucao = linha.dataDevolucao ? new Date(linha.dataDevolucao) : null;

        return emprestimo;
    }

    async inserirEmprestimo(emprestimo: Emprestimo): Promise<Emprestimo> {
        const query = "INSERT INTO emprestimos (livroId, usuarioId, dataEmprestimo, dataDevolucao) VALUES (?, ?, ?, ?)";
        try {
            const resultado = await executarComandoSQL(query, [
                emprestimo.livroId,
                emprestimo.usuarioId,
                emprestimo.dataEmprestimo,
                emprestimo.dataDevolucao
            ]);
            console.log('Empréstimo inserido com sucesso, ID:', resultado.insertId);
            emprestimo.id = resultado.insertId;
            return emprestimo;
        } catch (err) {
            console.error('Erro ao inserir empréstimo:', err);
            throw err;
        }
    }

    async atualizarEmprestimo(emprestimo: Emprestimo): Promise<Emprestimo> {
        if (!emprestimo.id) {
            throw new Error("Não é possível atualizar um empréstimo sem ID.");
        }
        const query = "UPDATE emprestimos SET livroId = ?, usuarioId = ?, dataEmprestimo = ?, dataDevolucao = ? WHERE id = ?";
        try {
            await executarComandoSQL(query, [
                emprestimo.livroId,
                emprestimo.usuarioId,
                emprestimo.dataEmprestimo,
                emprestimo.dataDevolucao,
                emprestimo.id
            ]);
            console.log('Empréstimo atualizado com sucesso, ID:', emprestimo.id);
            return emprestimo;
        } catch (err: any) {
            console.error(`Erro ao atualizar o empréstimo de ID ${emprestimo.id}:`, err);
            throw err;
        }
    }

    async deletarEmprestimo(id: number): Promise<void> {
        const query = "DELETE FROM emprestimos WHERE id = ?";
        try {
            await executarComandoSQL(query, [id]);
            console.log('Empréstimo deletado com sucesso, ID:', id);
        } catch (err: any) {
            console.error(`Erro ao deletar o empréstimo de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarEmprestimoPorId(id: number): Promise<Emprestimo | null> {
        const query = "SELECT * FROM emprestimos WHERE id = ?";
        try {
            const resultado = await executarComandoSQL(query, [id]);
            if (resultado.length > 0) {
                return this.linhaParaEmprestimo(resultado[0]);
            }
            return null;
        } catch (err: any) {
            console.error(`Erro ao buscar empréstimo de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarTodosEmprestimos(): Promise<Emprestimo[]> {
        const query = "SELECT * FROM emprestimos";
        try {
            const resultado = await executarComandoSQL(query, []);
            console.log('Todos os empréstimos foram listados com sucesso.');
            return resultado.map(this.linhaParaEmprestimo);
        } catch (err: any) {
            console.error('Erro ao listar todos os empréstimos:', err);
            throw err;
        }
    }

    async contarEmprestimosPorUsuarioId(usuarioId: number): Promise<number> {
        const query = "SELECT COUNT(*) as total FROM emprestimos WHERE usuarioId = ?";
        try {
            const resultado = await executarComandoSQL(query, [usuarioId]);
            return resultado[0].total;
        } catch (err: any) {
            console.error(`Erro ao contar empréstimos para o usuário de ID ${usuarioId}:`, err);
            throw err;
        }
    }

    async buscarAtivoPorLivroId(livroId: number): Promise<Emprestimo | null> {

        const query = "SELECT * FROM emprestimos WHERE livroId = ? AND dataDevolucao IS NULL";
        try {
            const resultado = await executarComandoSQL(query, [livroId]);
            if (resultado.length > 0) {
                return this.linhaParaEmprestimo(resultado[0]);
            }
            return null;
        } catch (err: any) {
            console.error(`Erro ao buscar empréstimo ativo para o livro de ID ${livroId}:`, err);
            throw err;
        }
    }
    
    
    async filtrarEmprestimosPorNomeUsuario(nome: string): Promise<Emprestimo[]> {
        const query = `
            SELECT e.* FROM emprestimos e
            JOIN usuarios u ON e.usuarioId = u.id
            WHERE u.nome LIKE ?
        `;
        try {
            const resultado = await executarComandoSQL(query, [`%${nome}%`]);
            return resultado.map(this.linhaParaEmprestimo);
        } catch (err) {
            console.error(`Erro ao filtrar empréstimos por nome de usuário:`, err);
            throw err;
        }
    }

    async filtrarEmprestimosPorData(data: Date): Promise<Emprestimo[]> {
        const query = "SELECT * FROM emprestimos WHERE DATE(dataEmprestimo) = DATE(?)";
        try {
            const resultado = await executarComandoSQL(query, [data]);
            return resultado.map(this.linhaParaEmprestimo);
        } catch (err) {
            console.error(`Erro ao filtrar empréstimos pela data ${data.toISOString()}:`, err);
            throw err;
        }
    }
}