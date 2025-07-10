import { UsuarioActivity } from "../../Models/Entity/UsuarioActivity";

export interface IUsuarioActivityRepository {
    inserirAtividade(activity: UsuarioActivity): Promise<UsuarioActivity>;
    
}