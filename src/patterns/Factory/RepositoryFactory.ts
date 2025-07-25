import { UsuarioRepository } from '../../Repository/implementacoes/UsuarioRepository';
import { LivroRepository } from '../../Repository/implementacoes/LivroRepository';
import { EmprestimoRepository } from '../../Repository/implementacoes/EmprestimoRepository';
import { UsuarioActivityRepository } from '../../Repository/implementacoes/UsuarioActivityRepository';

export class RepositoryFactory {
    public criarUsuarioRepositorio(): UsuarioRepository {
        return new UsuarioRepository();
    }

    
    public criarLivroRepositorio(): LivroRepository {
        return new LivroRepository();
    }

    public criarEmprestimoRepositorio(): EmprestimoRepository {
        return new EmprestimoRepository();
    }

    public criarUsuarioActivityRepositorio(): UsuarioActivityRepository {
        return new UsuarioActivityRepository();
    }
    
}