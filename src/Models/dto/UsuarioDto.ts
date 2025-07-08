export class UsuarioDto {
    id: number;
    nome: string;
    email: string;
    perfil?: 'admin' | 'usuario';

    constructor(id: number, nome: string, email: string, perfil: 'admin' | 'usuario') {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.perfil = perfil;
    }
}