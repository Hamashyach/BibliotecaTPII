import { ILivroRepository } from "../../Repository/interfaces/ILivroRepository";
import { IUsuarioRepository } from "../../Repository/interfaces/IUsuarioRepository";
import { iEmprestimoRepository } from "../../Repository/interfaces/iEmprestimoRepository";
import { IUsuarioActivityRepository } from "../../Repository/interfaces/IUsuarioActivityRepository";

export interface IRepositoryFactory {
    criarLivroRepository(): ILivroRepository;
    criarUsuarioRepository(): IUsuarioRepository;
    criarEmprestimoRepository(): iEmprestimoRepository;
    criarUsuarioActivityRepository(): IUsuarioActivityRepository;
}