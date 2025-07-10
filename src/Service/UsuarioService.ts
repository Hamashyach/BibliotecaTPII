
import { Usuario } from '../Models/Entity/Usuario';
import { UsuarioDto } from '../Models/dto/UsuarioDto';
import { UsuarioRepository } from '../Repository/implementacoes/UsuarioRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { Observer } from '../patterns/Observer/Observer'; 
import * as bcrypt from 'bcrypt';
import { LoginRequestDto } from '../Models/dto/LoginRequestdto';
import { UsuarioActivityService } from './UsuarioActivityService';
import { UsuarioActivityObserver } from '../patterns/Observer/UsuarioActivityObserver';
import { LogObserver } from '../patterns/Observer/LogObserver';

export class UsuarioService {
    private usuarioRepositorio: UsuarioRepository;
    private observers: Observer[] = []; 
    private usuarioActivityService: UsuarioActivityService;

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        // Usa a factory para obter a instância do repositório
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
        this.usuarioActivityService = new UsuarioActivityService(this.repositoryFactory);
        this.registrarObserver(new UsuarioActivityObserver(this.usuarioActivityService));
        this.registrarObserver(new LogObserver());
    }
    
    public registrarObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    public removerObserver(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private notificarObservers(evento: string, data: any, usuarioId?: number): void {
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }

    private usuarioParaDto(usuario: Usuario): UsuarioDto {
        return new UsuarioDto(usuario.id!, usuario.nome, usuario.email, usuario.perfil);
    }
    
      async criar(dadosCriacao: Omit<Usuario, 'id'>): Promise<UsuarioDto> {
        const emailExistente = await this.usuarioRepositorio.filtrarUsuarioPorEmail(dadosCriacao.email);
        if (emailExistente) {
            throw new Error('Este email já está em uso.');
        }

        // NOVO: Validação do comprimento da senha ANTES de fazer o hash
        if (dadosCriacao.senha.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres.');
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(dadosCriacao.senha, saltRounds);

        const novoUsuario = new Usuario(
            dadosCriacao.nome,
            dadosCriacao.email,
            senhaHash,
            dadosCriacao.perfil || 'usuario'
        );

        const usuarioSalvo = await this.usuarioRepositorio.inserirUsuario(novoUsuario);

        this.notificarObservers('usuario:criado', this.usuarioParaDto(usuarioSalvo), usuarioSalvo.id);

        return this.usuarioParaDto(usuarioSalvo);
    }


    async buscarPorId(id: number): Promise<UsuarioDto | null> {
        const usuario = await this.usuarioRepositorio.filtrarUsuarioPorId(id);
        return usuario ? this.usuarioParaDto(usuario) : null;
    }
    


    async buscarTodos(): Promise<UsuarioDto[]> {
        const usuarios = await this.usuarioRepositorio.filtrarTodosUsuarios();
        return usuarios.map(this.usuarioParaDto);
    }

    async deletar(id: number): Promise<void> {
        const usuarioExistente = await this.usuarioRepositorio.filtrarUsuarioPorId(id);
        if (!usuarioExistente) {
            throw new Error('Usuário não encontrado.');
        }
        await this.usuarioRepositorio.deletarUsuario(id);
        this.notificarObservers('usuario:deletado', { id: id, email: usuarioExistente.email }, id);
    }
    
    async atualizar(dto: UsuarioDto): Promise<UsuarioDto> {
        const usuarioExistente = await this.usuarioRepositorio.filtrarUsuarioPorId(dto.id);
        if (!usuarioExistente) {
            throw new Error('Usuário para atualizar não encontrado.');
        }

        const oldUsuarioData = { ...usuarioExistente }; // Clonar para capturar o estado antes da atualização

        usuarioExistente.nome = dto.nome;
        usuarioExistente.email = dto.email;

        if (dto.perfil !== undefined) {
            usuarioExistente.perfil = dto.perfil;
        }

        const usuarioAtualizado = await this.usuarioRepositorio.atualizarUsuario(usuarioExistente);
        this.notificarObservers('usuario:atualizado', {
            id: usuarioAtualizado.id,
            old: { nome: oldUsuarioData.nome, email: oldUsuarioData.email, perfil: oldUsuarioData.perfil },
            new: { nome: usuarioAtualizado.nome, email: usuarioAtualizado.email, perfil: usuarioAtualizado.perfil }
        }, usuarioAtualizado.id); 

        return this.usuarioParaDto(usuarioAtualizado);
    }

     async autenticar(dto: LoginRequestDto): Promise<Usuario> {
        const usuario = await this.usuarioRepositorio.filtrarUsuarioPorEmail(dto.email);

        if (!usuario) {
            
            this.notificarObservers('login:falha', { email: dto.email, mensagem: 'Email não encontrado' });
            throw new Error('Email ou senha inválidos.');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
        if (!senhaValida) {
            
            this.notificarObservers('login:falha', { email: dto.email, mensagem: 'Senha inválida' });
            throw new Error('Email ou senha inválidos.');
        }

        
        this.notificarObservers('login:sucesso', { email: usuario.email, perfil: usuario.perfil }, usuario.id); // Passe o ID do usuário logado
        return usuario;
    }
}