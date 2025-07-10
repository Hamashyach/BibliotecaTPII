export class UsuarioActivity {
    id?: number;
    usuarioId: number;
    tipoOperacao: string;
    detalhesOperacao: any; 
    dataHora?: Date;

    constructor(usuarioId: number, tipoOperacao: string, detalhesOperacao: any) {
        if (!usuarioId || !tipoOperacao) {
            throw new Error("ID do Usuário e Tipo de Operação são obrigatórios para registrar uma atividade.");
        }
        this.usuarioId = usuarioId;
        this.tipoOperacao = tipoOperacao;
        this.detalhesOperacao = detalhesOperacao;
        this.dataHora = new Date(); 
    }
}