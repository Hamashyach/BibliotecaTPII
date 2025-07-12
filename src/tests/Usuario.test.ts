// src/Models/Entity/__tests__/Usuario.test.ts

import { Usuario } from '../Models/Entity/Usuario';

describe('Usuario', () => {
  // Teste para criação de usuário com dados válidos
  it('deve criar uma instância de Usuario com dados válidos', () => {
    const usuario = new Usuario('Teste Nome', 'teste@email.com', 'senhaSegura123');
    expect(usuario).toBeInstanceOf(Usuario);
    expect(usuario.nome).toBe('Teste Nome');
    expect(usuario.email).toBe('teste@email.com');
    expect(usuario.senha).toBe('senhaSegura123');
    expect(usuario.perfil).toBe('usuario'); // Perfil padrão
  });

  it('deve criar uma instância de Usuario com perfil admin', () => {
    const admin = new Usuario('Admin User', 'admin@example.com', 'adminSenha123', 'admin');
    expect(admin.perfil).toBe('admin');
  });

  // Testes para validações no construtor
  describe('Validações do construtor', () => {
    it('deve lançar um erro se o nome for vazio', () => {
      expect(() => new Usuario('', 'email@example.com', 'senha123')).toThrow(
        "Todas as informações devem ser preenchidas."
      );
    });

    it('deve lançar um erro se o email for vazio', () => {
      expect(() => new Usuario('Nome Teste', '', 'senha123')).toThrow(
        "Todas as informações devem ser preenchidas."
      );
    });

    it('deve lançar um erro se a senha for vazia', () => {
      expect(() => new Usuario('Nome Teste', 'email@example.com', '')).toThrow(
        "Todas as informações devem ser preenchidas."
      );
    });

    it('deve lançar um erro para email inválido (sem @)', () => {
      expect(() => new Usuario('Nome Teste', 'email.com', 'senha123')).toThrow(
        "Email inválido."
      );
    });

    it('deve lançar um erro para email inválido (sem domínio)', () => {
      expect(() => new Usuario('Nome Teste', 'email@', 'senha123')).toThrow(
        "Email inválido."
      );
    });

    it('deve lançar um erro se a senha for muito curta (menos de 6 caracteres)', () => {
      expect(() => new Usuario('Nome Teste', 'email@example.com', 'abc')).toThrow(
        "Senha deve ter pelo menos 6 caracteres."
      );
    });

    it('não deve lançar erro se a senha tiver exatamente 6 caracteres', () => {
      expect(() => new Usuario('Nome Teste', 'email@example.com', '123456')).not.toThrow();
    });
  });
});