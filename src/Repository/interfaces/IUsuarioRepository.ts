import { Usuario } from "../../Models/Entity/Usuario";

export interface IUsuarioRepository {
    inserirUsuario(usuario: Usuario): Promise<Usuario>;
    atualizarUsuario(usuario: Usuario): Promise<Usuario>;
    deletarUsuario(id: number): Promise<void>;
    filtrarUsuarioPorId(id: number): Promise<Usuario | null>;
    filtrarUsuarioPorEmail(email: string): Promise<Usuario | null>;
    filtrarTodosUsuarios(): Promise<Usuario[]>;
    
}