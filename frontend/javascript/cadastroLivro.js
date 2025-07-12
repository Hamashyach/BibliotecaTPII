document.addEventListener('DOMContentLoaded', async () => {
    const cadastroLivroForm = document.getElementById('cadastro-livro-form');
    const messageElement = document.getElementById('message');

    const showMessage = (text, type) => {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
    };

    cadastroLivroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage('', ''); 
        messageElement.style.display = 'none';

        const titulo = document.getElementById('titulo').value;
        const autor = document.getElementById('autor').value;
        const categoria = document.getElementById('categoria').value;

        try {
            
            const response = await fetch('http://localhost:3040/api/livros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, autor, categoria }), 
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Livro cadastrado com sucesso!', 'success');
                cadastroLivroForm.reset(); 
            } else {
               
                showMessage(data.mensagem || data.message || 'Erro ao cadastrar livro. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro de livro:', error);
            showMessage('Não foi possível conectar ao servidor para cadastrar o livro.', 'error');
        } finally {
            messageElement.style.display = 'block'; 
        }
    });
});