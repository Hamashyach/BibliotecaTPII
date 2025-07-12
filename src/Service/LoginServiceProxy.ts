import { UsuarioService } from './UsuarioService';
import { LoginRequestDto } from '../Models/dto/LoginRequestdto';
import { Usuario } from '../Models/Entity/Usuario';
import { UsuarioDto } from '../Models/dto/UsuarioDto';

export class LoginServiceProxy {
    
    constructor(private readonly usuarioService: UsuarioService) {}

    private usuarioParaDto(usuario: Usuario): UsuarioDto {
        return new UsuarioDto(usuario.id!, usuario.nome, usuario.email, usuario.perfil);
    }

    
    async realizarLogin(dto: LoginRequestDto): Promise<UsuarioDto> {
       
        const usuarioAutenticado = await this.usuarioService.autenticar(dto);


        if (usuarioAutenticado.perfil !== 'admin') {
            throw new Error('Acesso negado. Apenas administradores podem fazer login.');
        }

        console.log(`[LoginProxy] Acesso de administrador concedido para: ${usuarioAutenticado.email}`);
     
        return this.usuarioParaDto(usuarioAutenticado);
    }
}