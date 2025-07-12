import { executarComandoSQL } from '../../Database/mysql'; 
import { Usuario } from '../../Models/Entity/Usuario'; 
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository';

export class UsuarioRepository implements IUsuarioRepository {

    constructor() {
        this.criarTabela();
    }

    private async criarTabela(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                perfil VARCHAR(50) NOT NULL
            )
        `;

        try {
            const resultado = await executarComandoSQL(query, []);
            console.log('Tabela de usuários verificada/criada com sucesso.');
        } catch (err) {
            console.error('Erro ao criar a tabela de usuários:', err);
        }
    }

    private rowToUsuario(row: any): Usuario {
        const usuario = new Usuario(row.nome, row.email, row.senha, row.perfil);
        usuario.id = row.id;
        return usuario;
    }

    async inserirUsuario(usuario: Usuario): Promise<Usuario> {
        const query = "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)";

        try {
            const resultado = await executarComandoSQL(query, [
                usuario.nome,
                usuario.email,
                usuario.senha,
                usuario.perfil
            ]);
            console.log('Usuário inserido com sucesso, ID:', resultado.insertId);
            usuario.id = resultado.insertId;
            return usuario;
        } catch (err) {
            console.error('Erro ao inserir usuário:', err);
            throw err; 
        }
    }

    async atualizarUsuario(usuario: Usuario): Promise<Usuario> {
  
        if (!usuario.id) {
            throw new Error("Não é possível atualizar um usuário sem ID.");
        }
        
        const query = "UPDATE usuarios SET nome = ?, email = ?, senha = ?, perfil = ? WHERE id = ?";

        try {
            await executarComandoSQL(query, [
                usuario.nome,
                usuario.email,
                usuario.senha,
                usuario.perfil,
                usuario.id
            ]);
            console.log('Usuário atualizado com sucesso, ID:', usuario.id);
            return usuario;
        } catch (err: any) {
            console.error(`Erro ao atualizar o usuário de ID ${usuario.id}:`, err);
            throw err;
        }
    }

    async deletarUsuario(id: number): Promise<void> {
        const query = "DELETE FROM usuarios WHERE id = ?";

        try {
            await executarComandoSQL(query, [id]);
            console.log('Usuário deletado com sucesso, ID:', id);
        } catch (err: any) {
            console.error(`Erro ao deletar o usuário de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarUsuarioPorId(id: number): Promise<Usuario | null> {
        const query = "SELECT * FROM usuarios WHERE id = ?";

        try {
            const resultado = await executarComandoSQL(query, [id]);
            if (resultado.length > 0) {
                return this.rowToUsuario(resultado[0]);
            }
            return null;
        } catch (err: any) {
            console.error(`Erro ao buscar usuário de ID ${id}:`, err);
            throw err;
        }
    }

    async filtrarUsuarioPorEmail(email: string): Promise<Usuario | null> {
        const query = "SELECT * FROM usuarios WHERE email = ?";

        try {
            const resultado = await executarComandoSQL(query, [email]);
            if (resultado.length > 0) {
                return this.rowToUsuario(resultado[0]);
            }
            return null;
        } catch (err: any) {
            console.error(`Erro ao buscar usuário com o email ${email}:`, err);
            throw err;
        }
    }

    async filtrarTodosUsuarios(): Promise<Usuario[]> {
        const query = "SELECT * FROM usuarios";

        try {
            const resultado = await executarComandoSQL(query, []);
            console.log('Todos os usuários foram listados com sucesso');
            return resultado.map(this.rowToUsuario);
        } catch (err: any) {
            console.error('Erro ao listar todos os usuários:', err);
            throw err;
        }
    }
}