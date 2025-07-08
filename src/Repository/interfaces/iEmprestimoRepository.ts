import { Emprestimo } from "../../Models/Entity/Emprestimo";

export interface iEmprestimoRepository {
    inserirEmprestimo(emprestimo: Emprestimo): Promise<Emprestimo>;
    atualizarEmprestimo(emprestimo: Emprestimo): Promise<Emprestimo>;
    deletarEmprestimo(id: number): Promise<void>;
    filtrarEmprestimoPorId(id: number): Promise<Emprestimo | null>;
    filtrarTodosEmprestimos(): Promise<Emprestimo[]>;
    contarEmprestimosPorUsuarioId(usuarioId: number): Promise<number>;
    buscarAtivoPorLivroId(livroId: number): Promise<Emprestimo | null>;
    filtrarEmprestimosPorNomeUsuario(nomeUsuario: string): Promise<Emprestimo[]>;
    filtrarEmprestimosPorData(data: Date): Promise<Emprestimo[]>;
}