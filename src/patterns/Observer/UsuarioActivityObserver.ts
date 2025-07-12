import { Observer } from './Observer';
import { UsuarioActivityService } from '../../Service/UsuarioActivityService';
import { Usuario } from '../../Models/Entity/Usuario';
import { Emprestimo } from '../../Models/Entity/Emprestimo';
import { DevolucaoDto } from '../../Models/dto/DevolucaoDto';

export class UsuarioActivityObserver implements Observer {
    constructor(private readonly usuarioActivityService: UsuarioActivityService) {}

    update(eventData: { evento: string; data: any; usuarioId?: number }): void {
        const { evento, data, usuarioId } = eventData;

      
        let activityUsuarioId: number | undefined = usuarioId;

        if (!activityUsuarioId) {
            if (data instanceof Usuario && data.id) {
                activityUsuarioId = data.id;
            } else if (data instanceof Emprestimo && data.usuarioId) {
                activityUsuarioId = data.usuarioId;
            } else if (data && data.usuarioId) { 
            } else if (data.emprestimo && data.emprestimo.usuarioId) {
                activityUsuarioId = data.emprestimo.usuarioId;
            }
        }

        if (!activityUsuarioId) {
            console.warn(`[UsuarioActivityObserver]: Não foi possível determinar o ID do usuário para o evento '${evento}'. Atividade não registrada.`);
            return;
        }

        let tipoOperacao: string = evento;
        let detalhesOperacao: any = { ...data }; 

        switch (evento) {
            case 'usuario:criado':
                tipoOperacao = 'USUARIO_CRIADO';
                break;
            case 'usuario:atualizado':
                tipoOperacao = 'USUARIO_ATUALIZADO';
                break;
            case 'usuario:deletado':
                tipoOperacao = 'USUARIO_DELETADO';
                break;
            case 'livro:criado':
                tipoOperacao = 'LIVRO_CRIADO';
                break;
            case 'livro:atualizado':
                tipoOperacao = 'LIVRO_ATUALIZADO';
                break;
            case 'livro:deletado':
                tipoOperacao = 'LIVRO_DELETADO';
                break;
            case 'emprestimo:criado':
                tipoOperacao = 'EMPRESTIMO_CRIADO';
                break;
            case 'emprestimo:devolvido':
                tipoOperacao = 'EMPRESTIMO_DEVOLVIDO';
                detalhesOperacao = {
                    emprestimoId: (data as DevolucaoDto).emprestimo.id,
                    livroId: (data as DevolucaoDto).emprestimo.livroId,
                    valorMulta: (data as DevolucaoDto).valorMulta
                };
                break;
            case 'emprestimo:deletado': 
                tipoOperacao = 'EMPRESTIMO_DELETADO_POR_DESFAZER';
      
                if (data && data.id) {
                    detalhesOperacao = { emprestimoId: data.id };
                }
                break;
            case 'login:sucesso':
                tipoOperacao = 'LOGIN_SUCESSO';
                detalhesOperacao = { email: data.email, perfil: data.perfil };
                break;
            case 'login:falha':
                tipoOperacao = 'LOGIN_FALHA';
                detalhesOperacao = { email: data.email, mensagem: data.mensagem };
                break;
            default:
                console.warn(`[UsuarioActivityObserver]: Evento desconhecido: ${evento}. Registrando como genérico.`);
                break;
        }

        this.usuarioActivityService.registrarAtividade(activityUsuarioId, tipoOperacao, detalhesOperacao)
            .then(() => console.log(`[UsuarioActivityObserver]: Atividade '${tipoOperacao}' registrada para o usuário ${activityUsuarioId}`))
            .catch(error => console.error(`[UsuarioActivityObserver]: Erro ao registrar atividade '${tipoOperacao}' para o usuário ${activityUsuarioId}:`, error));
    }
}