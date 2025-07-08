

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
            // 2. O controller agora fala com o Proxy, não com o serviço diretamente.
            const adminDto = await this.loginProxy.realizarLogin(dto);

            // 3. Se o login for bem-sucedido, gera um token JWT.
            const secret = process.env.JWT_SECRET || 'SEGREDO_PADRAO_PARA_DESENVOLVIMENTO';
            const token = jwt.sign(
                { id: adminDto.id, email: adminDto.email, perfil: adminDto.perfil },
                secret,
                { expiresIn: '8h' } // Token expira em 8 horas
            );
            
            this.setStatus(200);
            return { token: token, usuario: adminDto };

        } catch (error: any) {
            // O catch agora lida com erros tanto do Serviço quanto do Proxy.
            if (error.message.includes('Acesso negado')) {
                return resError(401, { mensagem: error.message }); // 401 Unauthorized
            }
            return resError(400, { mensagem: error.message }); // 400 Bad Request
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
            this.setStatus(201); // Define o status HTTP para 201 Created
            return usuarioCriado;
        } catch (error: any) {
            if (error.message.includes('email já está em uso')) {
                // `resError` é uma função para enviar respostas de erro.
                return resError(409, new BasicResponseDto(error.message, undefined));
            }
            return resError(400, new BasicResponseDto(error.message, undefined));
        }
    }

    /**
     * Lista todos os usuários cadastrados.
     */
    @Get() // Rota: GET /usuarios
    public async listarTodosUsuarios(): Promise<UsuarioDto[]> {
        return this.usuarioService.buscarTodos();
    }

    /**
     * Busca um usuário específico pelo seu ID.
     * @param id O identificador numérico do usuário. Ex: 123
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
    
    /**
     * Deleta um usuário específico pelo seu ID.
     */
    @Delete("{id}") // Rota: DELETE /usuarios/123
    @SuccessResponse("204", "No Content") // Sucesso em delete não retorna corpo
    public async deletarUsuario(
        @Path() id: number,
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<void> {
        try {
            await this.usuarioService.deletar(id);
            this.setStatus(204);
            return; // Retorna void para a resposta 204
        } catch (error: any) {
            if (error.message.includes('não encontrado')) {
                return resNaoEncontrado(404, { mensagem: error.message });
            }
            // Lança o erro para um middleware de erro genérico tratar
            throw error;
        }
    }

    /**
     * Atualiza os dados de um usuário existente.
     */
    @Put("{id}") // Rota: PUT /usuarios/123
    public async atualizarUsuario(
        @Path() id: number,
        @Body() dadosAtualizacao: Partial<Omit<UsuarioDto, 'id'>>, // Permite atualizar campos parciais
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<UsuarioDto> {
        try {
            // No mundo real, o serviço `atualizar` receberia o id e os dados parciais.
            // Por simplicidade, vamos assumir que o serviço `atualizar` foi adaptado.
            // Ex: const usuarioAtualizado = await this.usuarioService.atualizar(id, dadosAtualizacao);
            
            // Simulação para o exemplo funcionar com nosso service atual:
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