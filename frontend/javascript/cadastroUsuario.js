document.getElementById('cadastro-usuario-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const messageElement = document.getElementById('message');
    messageElement.style.display = 'none'; 
    messageElement.className = 'message'; 

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const perfil = 'usuario'; 

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
           
            document.getElementById('cadastro-usuario-form').reset();
        } else {
            
            messageElement.textContent = data.mensagem || data.message || 'Erro ao cadastrar usuário.';
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error('Erro na requisição de cadastro de usuário:', error);
        messageElement.textContent = 'Não foi possível conectar ao servidor para cadastrar o usuário.';
        messageElement.classList.add('error');
    } finally {
        messageElement.style.display = 'block'; 
    }
});