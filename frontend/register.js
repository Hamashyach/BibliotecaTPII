// register.js

// Adiciona um "ouvinte de eventos" que espera o formulário ser enviado
document.getElementById('register-form').addEventListener('submit', async function(event) {
    // Previne o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // Pega a referência do elemento que mostrará a mensagem de erro/sucesso
    const messageElement = document.getElementById('register-error-message'); // Pode ser usado para sucesso também
    messageElement.textContent = ''; // Limpa mensagens antigas
    messageElement.style.color = 'red'; // Define a cor padrão para erro

    // Pega os valores digitados pelo usuário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Envia a requisição para o backend usando a API Fetch
        // A rota de cadastro é POST /api/usuarios
        const response = await fetch('http://localhost:3040/api/usuarios', { // URL completa para a rota de cadastro
            method: 'POST',
            headers: {
                // Informa ao backend que estamos enviando dados em formato JSON
                'Content-Type': 'application/json',
            },
            // Converte o objeto JavaScript em uma string JSON para envio
            body: JSON.stringify({ nome, email, senha }),
        });

        // Converte a resposta do backend (que também é JSON) em um objeto JavaScript
        const data = await response.json();

        // Verifica se a resposta do servidor foi bem-sucedida (status 2xx)
        if (response.ok) {
            // Se o cadastro for bem-sucedido
            messageElement.textContent = 'Cadastro realizado com sucesso! Redirecionando para o login...';
            messageElement.style.color = 'green'; // Muda a cor para sucesso
            // Redireciona o usuário para a página de login após um pequeno atraso
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000); // Redireciona após 2 segundos
        } else {
            // Se houver um erro de negócio (ex: email já em uso, validação de senha), mostra a mensagem de erro vinda do backend
            // A mensagem de erro pode vir em 'data.mensagem' (do BasicResponseDto) ou 'data.message' (erro genérico)
            messageElement.textContent = data.mensagem || data.message || 'Ocorreu um erro no cadastro. Tente novamente.';
        }

    } catch (error) {
        // Se houver um erro de rede (ex: servidor offline, CORS), mostra uma mensagem genérica
        console.error('Erro na requisição de cadastro:', error);
        messageElement.textContent = 'Não foi possível conectar ao servidor para realizar o cadastro.';
    }
});