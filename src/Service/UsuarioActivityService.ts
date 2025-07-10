// src/Service/UserActivityService.ts

import { UsuarioActivity } from '../Models/Entity/UsuarioActivity';
import { UsuarioActivityRepository } from '../Repository/implementacoes/UsuarioActivityRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory'; 

export class UsuarioActivityService {
    private usuarioActivityRepository: UsuarioActivityRepository;

    // O construtor recebe a factory para criar o repositório, mantendo a injeção de dependência.
    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.usuarioActivityRepository = this.repositoryFactory.criarUsuarioActivityRepositorio();
    }

    /**
     * Registra uma nova atividade de usuário.
     * @param usuarioId O ID do usuário associado à atividade.
     * @param tipoOperacao Uma string que descreve o tipo de operação (ex: 'EMPRESTIMO_CRIADO').
     * @param detalhesOperacao Um objeto com detalhes adicionais da operação.
     * @returns A atividade de usuário registrada.
     */
    async registrarAtividade(usuarioId: number, tipoOperacao: string, detalhesOperacao: any): Promise<UsuarioActivity> {
        const novaAtividade = new UsuarioActivity(usuarioId, tipoOperacao, detalhesOperacao);
        const atividadeSalva = await this.usuarioActivityRepository.inserirAtividade(novaAtividade);
        return atividadeSalva;
    }

}