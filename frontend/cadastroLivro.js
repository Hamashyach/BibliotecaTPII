// frontend/js/cadastro_livro.js

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
        showMessage('', ''); // Limpa mensagens anteriores
        messageElement.style.display = 'none';

        const titulo = document.getElementById('titulo').value;
        const autor = document.getElementById('autor').value;
        const categoria = document.getElementById('categoria').value;

        try {
            // Envia a requisição para o backend
            // A rota de cadastro de livros é POST /api/livros
            const response = await fetch('http://localhost:3040/api/livros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, autor, categoria }), // Envia os dados do formulário
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Livro cadastrado com sucesso!', 'success');
                cadastroLivroForm.reset(); // Limpa o formulário após o sucesso
            } else {
                // Se houver um erro do backend (ex: livro já existe)
                showMessage(data.mensagem || data.message || 'Erro ao cadastrar livro. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro de livro:', error);
            showMessage('Não foi possível conectar ao servidor para cadastrar o livro.', 'error');
        } finally {
            messageElement.style.display = 'block'; // Mostra a mensagem
        }
    });
});