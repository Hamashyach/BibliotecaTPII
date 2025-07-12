document.getElementById('register-form').addEventListener('submit', async function(event) {
   
    event.preventDefault();
    const messageElement = document.getElementById('register-error-message'); 
    messageElement.textContent = ''; 
    messageElement.style.color = 'red';

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const perfil = 'admin';

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
    
            messageElement.textContent = 'Cadastro realizado com sucesso! Redirecionando para o login...';
            messageElement.style.color = 'green'; 
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000); 
        } else {
            messageElement.textContent = data.mensagem || data.message || 'Ocorreu um erro no cadastro. Tente novamente.';
        }

    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);
        messageElement.textContent = 'Não foi possível conectar ao servidor para realizar o cadastro.';
    }
});