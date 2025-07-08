export class BasicResponseDto {
    public mensagem: string;
    public objeto: any;

    constructor(mensagem: string, objeto: any) {
        this.mensagem = mensagem;
        this.objeto = objeto;
    }
}