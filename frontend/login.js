// Adiciona um "ouvinte de eventos" que espera o formulário ser enviado
document.getElementById('login-form').addEventListener('submit', async function(event) {
    // Previne o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // Pega a referência do elemento que mostrará a mensagem de erro
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = ''; // Limpa mensagens de erro antigas

    // Pega os valores digitados pelo usuário
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Envia a requisição para o backend usando a API Fetch
        const response = await fetch('http://localhost:3040/api/usuarios/login', {
            method: 'POST',
            headers: {
                // Informa ao backend que estamos enviando dados em formato JSON
                'Content-Type': 'application/json',
            },
            // Converte o objeto JavaScript em uma string JSON para envio
            body: JSON.stringify({ email, senha }),
        });

        // Converte a resposta do backend (que também é JSON) em um objeto JavaScript
        const data = await response.json();

        // Verifica se a resposta do servidor foi bem-sucedida (status 2xx)
        if (response.ok) {
            // Se o login for bem-sucedido, salva o token no armazenamento local do navegador
            localStorage.setItem('authToken', data.token);
            // Redireciona o usuário para a página de administração
            window.location.href = 'admin.html';
        } else {
            // Se houver um erro de negócio (ex: senha errada), mostra a mensagem de erro vinda do backend
            errorMessageElement.textContent = data.message || 'Ocorreu um erro. Tente novamente.';
        }

    } catch (error) {
        // Se houver um erro de rede (ex: servidor offline), mostra uma mensagem genérica
        console.error('Erro na requisição:', error);
        errorMessageElement.textContent = 'Não foi possível conectar ao servidor.';
    }
});