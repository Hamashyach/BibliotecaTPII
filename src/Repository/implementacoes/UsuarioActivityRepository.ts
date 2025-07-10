import { executarComandoSQL } from '../../Database/mysql';
import { UsuarioActivity } from '../../Models/Entity/UsuarioActivity';
import { IUsuarioActivityRepository } from '../interfaces/IUsuarioActivityRepository';

export class UsuarioActivityRepository implements IUsuarioActivityRepository {

    constructor() {
        this.criarTabela();
    }

    private async criarTabela(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS historico_operacoes_usuario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuarioId INT NOT NULL,
                tipoOperacao VARCHAR(100) NOT NULL,
                detalhesOperacao JSON,
                dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
            )
        `;

        try {
            await executarComandoSQL(query, []);
            console.log('Tabela de histórico de operações de usuário verificada/criada com sucesso.');
        } catch (err) {
            console.error('Erro ao criar a tabela de histórico de operações de usuário:', err);
        }
    }

    private linhaParaUsuarioActivity(linha: any): UsuarioActivity {
        const activity = new UsuarioActivity(
            linha.usuarioId,
            linha.tipoOperacao,
            linha.detalhesOperacao ? JSON.parse(linha.detalhesOperacao) : null 
        );
        activity.id = linha.id;
        activity.dataHora = new Date(linha.dataHora);
        return activity;
    }

    async inserirAtividade(activity: UsuarioActivity): Promise<UsuarioActivity> {
        const query = "INSERT INTO historico_operacoes_usuario (usuarioId, tipoOperacao, detalhesOperacao) VALUES (?, ?, ?)";
        try {
            const resultado = await executarComandoSQL(query, [
                activity.usuarioId,
                activity.tipoOperacao,
                JSON.stringify(activity.detalhesOperacao)
            ]);
            console.log(`Atividade de usuário inserida com sucesso para o usuário ${activity.usuarioId}, ID:`, resultado.insertId);
            activity.id = resultado.insertId;
            return activity;
        } catch (err) {
            console.error(`Erro ao inserir atividade para o usuário ${activity.usuarioId}:`, err);
            throw err;
        }
    }

}