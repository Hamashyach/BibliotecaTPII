import { UsuarioActivity } from '../Models/Entity/UsuarioActivity';
import { UsuarioActivityRepository } from '../Repository/implementacoes/UsuarioActivityRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory'; 

export class UsuarioActivityService {
    private usuarioActivityRepository: UsuarioActivityRepository;

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.usuarioActivityRepository = this.repositoryFactory.criarUsuarioActivityRepositorio();
    }

    /**
     * Registra uma nova atividade de usuário.
     * @param usuarioId 
     * @param tipoOperacao 
     * @param detalhesOperacao 
     * @returns 
     */
    async registrarAtividade(usuarioId: number, tipoOperacao: string, detalhesOperacao: any): Promise<UsuarioActivity> {
        const novaAtividade = new UsuarioActivity(usuarioId, tipoOperacao, detalhesOperacao);
        const atividadeSalva = await this.usuarioActivityRepository.inserirAtividade(novaAtividade);
        return atividadeSalva;
    }

}