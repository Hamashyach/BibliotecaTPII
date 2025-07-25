export class Usuario {
    private static ultimoId = 0;
    id?: number;
    nome: string;
    email: string;
    senha: string;
    perfil: 'admin' | 'usuario';

    constructor(nome: string, email: string, senha: string, perfil: 'admin' | 'usuario' = 'usuario') {
        if (!nome || !email || !senha) {
            throw new Error("Todas as informações devem ser preenchidas.");
        }
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            throw new Error("Email inválido.");
        }
        if (senha.length < 6) {
            throw new Error("Senha deve ter pelo menos 6 caracteres.");
        }
        
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }
}