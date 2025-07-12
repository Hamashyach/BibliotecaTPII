document.getElementById('login-form').addEventListener('submit', async function(event) {
 
    event.preventDefault();

   
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = '';

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
   
        const response = await fetch('http://localhost:3040/api/usuarios/login', {
            method: 'POST',
            headers: {
           
                'Content-Type': 'application/json',
            },
       
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        // Verifica se a resposta do servidor foi bem-sucedida 
        if (response.ok) {
           
            localStorage.setItem('authToken', data.token);
            window.location.href = 'admin.html';
        } else {
            
            errorMessageElement.textContent = data.message || 'Credenciais inválidas.';
        }

    } catch (error) {

        console.error('Erro na requisição:', error);
        errorMessageElement.textContent = 'Não foi possível conectar ao servidor.';
    }
});