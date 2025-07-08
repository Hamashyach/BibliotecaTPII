import { UsuarioRepository } from '../../Repository/UsuarioRepository';
// Importe outros repositórios aqui conforme necessário
// import { LivroRepositorio } from '../../Repositorios/LivroRepositorio';

export class RepositoryFactory {
    public criarUsuarioRepositorio(): UsuarioRepository {
        // A lógica de criação pode incluir a passagem de uma conexão de banco, etc.
        return new UsuarioRepository();
    }

    /*
    public criarLivroRepositorio(): LivroRepositorio {
        return new LivroRepositorio();
    }
    */
}