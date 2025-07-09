
import { Usuario } from '../Models/Entity/Usuario';
import { UsuarioDto } from '../Models/dto/UsuarioDto';
import { UsuarioRepository } from '../Repository/implementacoes/UsuarioRepository';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { Observer } from '../patterns/Observer/Observer'; 
import * as bcrypt from 'bcrypt';
import { LoginRequestDto } from '../Models/dto/LoginRequestdto';


export class UsuarioService {
    private usuarioRepositorio: UsuarioRepository;
    private observers: Observer[] = []; 

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        // Usa a factory para obter a instância do repositório
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
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

    private notificarObservers(data: any): void {
        for (const observer of this.observers) {
            observer.update(data);
        }
    }

    private usuarioParaDto(usuario: Usuario): UsuarioDto {
        return new UsuarioDto(usuario.id!, usuario.nome, usuario.email, usuario.perfil);
    }
    
    async criar(dadosCriacao: Omit<Usuario, 'id'>): Promise<UsuarioDto> {
        // Validação de email existente
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
        
        // O construtor de Usuário ainda mantém suas validações para segurança e consistência,
        // mas a validação de comprimento de senha específica para a senha *original*
        // agora é feita aqui no serviço.
        const novoUsuario = new Usuario(
            dadosCriacao.nome,
            dadosCriacao.email,
            senhaHash, // Passando a senha já hashada
            dadosCriacao.perfil || 'usuario'
        );

        const usuarioSalvo = await this.usuarioRepositorio.inserirUsuario(novoUsuario);

        this.notificarObservers(usuarioSalvo);

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
    }
    
    async atualizar(dto: UsuarioDto): Promise<UsuarioDto> {
        const usuarioExistente = await this.usuarioRepositorio.filtrarUsuarioPorId(dto.id);
        if (!usuarioExistente) {
            throw new Error('Usuário para atualizar não encontrado.');
        }

      
        usuarioExistente.nome = dto.nome;
        usuarioExistente.email = dto.email;

        if (dto.perfil !== undefined) {
            usuarioExistente.perfil = dto.perfil;
        }
        
        const usuarioAtualizado = await this.usuarioRepositorio.atualizarUsuario(usuarioExistente);
        return this.usuarioParaDto(usuarioAtualizado);
    }

    async autenticar(dto: LoginRequestDto): Promise<Usuario> {
        const usuario = await this.usuarioRepositorio.filtrarUsuarioPorEmail(dto.email);

        
        if (!usuario) {
            throw new Error('Email ou senha inválidos.');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('Email ou senha inválidos.');
        }

        
        return usuario;
    }
}