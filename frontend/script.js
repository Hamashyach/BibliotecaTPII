document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorMessageElement = document.getElementById('error-message');

    // Esconde mensagens de erro antigas antes de uma nova tentativa
    errorMessageElement.style.display = 'none';
    errorMessageElement.textContent = '';

    try {
        const response = await fetch('/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        // Lê a resposta do corpo, seja ela de sucesso ou de erro
        const data = await response.json();

        // response.ok é true para status de sucesso (200-299)
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            alert('Login realizado com sucesso! Redirecionando...');
            // Redireciona para a página de dashboard após o login
            window.location.href = '/admin/dashboard.html'; 
        } else {
            // Se response.ok for false, sabemos que houve um erro.
            // Exibimos a mensagem que o backend enviou no JSON.
            errorMessageElement.textContent = data.mensagem || 'Ocorreu um erro desconhecido.';
            errorMessageElement.style.display = 'block'; // Torna a mensagem de erro visível
        }

    } catch (error) {
        // Este erro ocorre se houver falha de rede (servidor offline, etc.)
        console.error('Erro na comunicação com o servidor:', error);
        errorMessageElement.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        errorMessageElement.style.display = 'block';
    }
});