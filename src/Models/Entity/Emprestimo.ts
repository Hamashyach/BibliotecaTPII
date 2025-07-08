// src/Modelos/Entidades/Emprestimo.ts

export class Emprestimo {
    id?: number;
    livroId: number;
    usuarioId: number;
    dataEmprestimo: Date;
    dataDevolucao: Date | null; 

  
    constructor(livroId: number, usuarioId: number) {
        if (livroId == null || usuarioId == null) {
            throw new Error("ID do Livro e ID do Usuário são obrigatórios para criar um empréstimo.");
        }

        this.livroId = livroId;
        this.usuarioId = usuarioId;

        
        this.dataEmprestimo = new Date(); 
        this.dataDevolucao = null;      
    }
}