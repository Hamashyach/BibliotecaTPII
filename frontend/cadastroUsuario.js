// frontend/js/cadastro_usuarios.js

document.getElementById('cadastro-usuario-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const messageElement = document.getElementById('message');
    messageElement.style.display = 'none'; // Esconde a mensagem anterior
    messageElement.className = 'message'; // Limpa classes de estilo anteriores

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const perfil = 'usuario'; // Perfil fixo como 'usuario' para esta tela

    try {
        const response = await fetch('http://localhost:3040/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha, perfil }),
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = 'Usuário cadastrado com sucesso!';
            messageElement.classList.add('success');
            // Limpar formulário após sucesso, se desejar
            document.getElementById('cadastro-usuario-form').reset();
        } else {
            // Se houver um erro do backend (ex: email já em uso, validação de senha)
            messageElement.textContent = data.mensagem || data.message || 'Erro ao cadastrar usuário.';
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error('Erro na requisição de cadastro de usuário:', error);
        messageElement.textContent = 'Não foi possível conectar ao servidor para cadastrar o usuário.';
        messageElement.classList.add('error');
    } finally {
        messageElement.style.display = 'block'; // Mostra a mensagem
    }
});