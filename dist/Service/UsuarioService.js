"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const Usuario_1 = require("../Models/Entity/Usuario");
const UsuarioDto_1 = require("../Models/dto/UsuarioDto");
const bcrypt = __importStar(require("bcrypt"));
const UsuarioActivityService_1 = require("./UsuarioActivityService");
const UsuarioActivityObserver_1 = require("../patterns/Observer/UsuarioActivityObserver");
const LogObserver_1 = require("../patterns/Observer/LogObserver");
class UsuarioService {
    constructor(repositoryFactory) {
        this.repositoryFactory = repositoryFactory;
        this.observers = [];
        // Usa a factory para obter a instância do repositório
        this.usuarioRepositorio = this.repositoryFactory.criarUsuarioRepositorio();
        this.usuarioActivityService = new UsuarioActivityService_1.UsuarioActivityService(this.repositoryFactory);
        this.registrarObserver(new UsuarioActivityObserver_1.UsuarioActivityObserver(this.usuarioActivityService));
        this.registrarObserver(new LogObserver_1.LogObserver());
    }
    registrarObserver(observer) {
        this.observers.push(observer);
    }
    removerObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    notificarObservers(evento, data, usuarioId) {
        for (const observer of this.observers) {
            observer.update({ evento, data, usuarioId });
        }
    }
    usuarioParaDto(usuario) {
        return new UsuarioDto_1.UsuarioDto(usuario.id, usuario.nome, usuario.email, usuario.perfil);
    }
    criar(dadosCriacao) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailExistente = yield this.usuarioRepositorio.filtrarUsuarioPorEmail(dadosCriacao.email);
            if (emailExistente) {
                throw new Error('Este email já está em uso.');
            }
            // NOVO: Validação do comprimento da senha ANTES de fazer o hash
            if (dadosCriacao.senha.length < 6) {
                throw new Error('Senha deve ter pelo menos 6 caracteres.');
            }
            const saltRounds = 10;
            const senhaHash = yield bcrypt.hash(dadosCriacao.senha, saltRounds);
            const novoUsuario = new Usuario_1.Usuario(dadosCriacao.nome, dadosCriacao.email, senhaHash, dadosCriacao.perfil || 'usuario');
            const usuarioSalvo = yield this.usuarioRepositorio.inserirUsuario(novoUsuario);
            this.notificarObservers('usuario:criado', this.usuarioParaDto(usuarioSalvo), usuarioSalvo.id);
            return this.usuarioParaDto(usuarioSalvo);
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield this.usuarioRepositorio.filtrarUsuarioPorId(id);
            return usuario ? this.usuarioParaDto(usuario) : null;
        });
    }
    buscarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarios = yield this.usuarioRepositorio.filtrarTodosUsuarios();
            return usuarios.map(this.usuarioParaDto);
        });
    }
    deletar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioExistente = yield this.usuarioRepositorio.filtrarUsuarioPorId(id);
            if (!usuarioExistente) {
                throw new Error('Usuário não encontrado.');
            }
            yield this.usuarioRepositorio.deletarUsuario(id);
            this.notificarObservers('usuario:deletado', { id: id, email: usuarioExistente.email }, id);
        });
    }
    atualizar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioExistente = yield this.usuarioRepositorio.filtrarUsuarioPorId(dto.id);
            if (!usuarioExistente) {
                throw new Error('Usuário para atualizar não encontrado.');
            }
            const oldUsuarioData = Object.assign({}, usuarioExistente); // Clonar para capturar o estado antes da atualização
            usuarioExistente.nome = dto.nome;
            usuarioExistente.email = dto.email;
            if (dto.perfil !== undefined) {
                usuarioExistente.perfil = dto.perfil;
            }
            const usuarioAtualizado = yield this.usuarioRepositorio.atualizarUsuario(usuarioExistente);
            this.notificarObservers('usuario:atualizado', {
                id: usuarioAtualizado.id,
                old: { nome: oldUsuarioData.nome, email: oldUsuarioData.email, perfil: oldUsuarioData.perfil },
                new: { nome: usuarioAtualizado.nome, email: usuarioAtualizado.email, perfil: usuarioAtualizado.perfil }
            }, usuarioAtualizado.id);
            return this.usuarioParaDto(usuarioAtualizado);
        });
    }
    autenticar(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield this.usuarioRepositorio.filtrarUsuarioPorEmail(dto.email);
            if (!usuario) {
                this.notificarObservers('login:falha', { email: dto.email, mensagem: 'Email não encontrado' });
                throw new Error('Email ou senha inválidos.');
            }
            const senhaValida = yield bcrypt.compare(dto.senha, usuario.senha);
            if (!senhaValida) {
                this.notificarObservers('login:falha', { email: dto.email, mensagem: 'Senha inválida' });
                throw new Error('Email ou senha inválidos.');
            }
            this.notificarObservers('login:sucesso', { email: usuario.email, perfil: usuario.perfil }, usuario.id); // Passe o ID do usuário logado
            return usuario;
        });
    }
}
exports.UsuarioService = UsuarioService;
