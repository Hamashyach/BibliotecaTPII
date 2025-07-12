import { 
    Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Res, TsoaResponse, SuccessResponse 
} from "tsoa";
import { UsuarioService } from '../Service/UsuarioService'; 
import { Usuario } from "../Models/Entity/Usuario"; 
import { UsuarioDto } from '../Models/dto/UsuarioDto';
import { BasicResponseDto } from '../Models/dto/BasicresponseDto';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory'; 
import { LoginRequestDto } from '../Models/dto/LoginRequestdto';
import { LoginServiceProxy } from "../Service/LoginServiceProxy";
import * as jwt from 'jsonwebtoken';

@Route("usuarios") 
@Tags("Usuario")   
export class UsuarioController extends Controller {

    private usuarioService = new UsuarioService(new RepositoryFactory());
    private loginProxy = new LoginServiceProxy(this.usuarioService);

    constructor() {
        super();
        
    }

    @Post("/login") // Rota: POST /usuarios/login
    public async login(
        @Body() dto: LoginRequestDto,
        @Res() resError: TsoaResponse<400 | 401, { mensagem: string }>
    ): Promise<{ token: string, usuario: UsuarioDto }> {
        try {
            
            const adminDto = await this.loginProxy.realizarLogin(dto);

            // Se o login for bem-sucedido, gera um token JWT.
            const secret = process.env.JWT_SECRET || 'SEGREDO_PADRAO_PARA_DESENVOLVIMENTO';
            const token = jwt.sign(
                { id: adminDto.id, email: adminDto.email, perfil: adminDto.perfil },
                secret,
                { expiresIn: '8h' } 
            );
            
            this.setStatus(200);
            return { token: token, usuario: adminDto };

        } catch (error: any) {
            if (error.message.includes('Acesso negado')) {
                return resError(401, { mensagem: error.message }); 
            }
            return resError(400, { mensagem: error.message }); 
        }
    }

    @Post() // Rota: POST /usuarios
    @SuccessResponse("201", "Created") 
    public async cadastrarUsuario(
       
        @Body() dadosCriacao: Omit<Usuario, 'id'>,
        @Res() resError: TsoaResponse<400 | 409, BasicResponseDto>
    ): Promise<UsuarioDto> {
        try {
            const usuarioCriado = await this.usuarioService.criar(dadosCriacao);
            this.setStatus(201); 
            return usuarioCriado;
        } catch (error: any) {
            if (error.message.includes('email já está em uso')) {
                return resError(409, new BasicResponseDto(error.message, undefined));
            }
            return resError(400, new BasicResponseDto(error.message, undefined));
        }
    }

    @Get() // Rota: GET /usuarios
    public async listarTodosUsuarios(): Promise<UsuarioDto[]> {
        return this.usuarioService.buscarTodos();
    }

    /**
     * @param id 
     */
    @Get("{id}") // Rota: GET /usuarios/123
    public async filtrarUsuarioPorId(
        @Path() id: number,
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<UsuarioDto> {
        const usuario = await this.usuarioService.buscarPorId(id);
        if (!usuario) {
            return resNaoEncontrado(404, { mensagem: "Usuário não encontrado." });
        }
        return usuario;
    }
    
    @Delete("{id}") // Rota: DELETE /usuarios/123
    @SuccessResponse("204", "No Content") 
    public async deletarUsuario(
        @Path() id: number,
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<void> {
        try {
            await this.usuarioService.deletar(id);
            this.setStatus(204);
            return; 
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return resNaoEncontrado(404, { mensagem: error.message });
            }
            throw error;
        }
    }

    @Put("{id}") // Rota: PUT /usuarios/123
    public async atualizarUsuario(
        @Path() id: number,
        @Body() dadosAtualizacao: Partial<Omit<UsuarioDto, 'id'>>, 
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<UsuarioDto> {
        try {
        
            const dtoCompleto: UsuarioDto = { id: id, ...dadosAtualizacao } as UsuarioDto;
            const usuarioAtualizado = await this.usuarioService.atualizar(dtoCompleto);
            return usuarioAtualizado;

        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return resNaoEncontrado(404, { mensagem: error.message });
            }
            throw error;
        }
    }
}