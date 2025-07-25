// frontend/js/devolucoes.js
// CÓDIGO ATUALIZADO

document.addEventListener('DOMContentLoaded', async () => {
    const devolucaoForm = document.getElementById('devolucao-form');
    const emprestimoIdInput = document.getElementById('emprestimoId');
    const multaStrategySelect = document.getElementById('multaStrategy'); // NOVO: Seleção da estratégia
    const messageElement = document.getElementById('message');
    const returnDetailsDiv = document.getElementById('returnDetails');
    const returnedLoanId = document.getElementById('returnedLoanId');
    const returnedBookTitle = document.getElementById('returnedBookTitle');
    const returnedUserName = document.getElementById('returnedUserName');
    const returnedFineAmount = document.getElementById('returnedFineAmount');

    let allUsers = []; 
    let allBooks = []; 

    const fetchSupportingData = async () => {
        try {
            const usersResponse = await fetch('http://localhost:3040/api/usuarios');
            allUsers = await usersResponse.json();

            const booksResponse = await fetch('http://localhost:3040/api/livros');
            allBooks = await booksResponse.json();
        } catch (error) {
            console.error('Erro ao carregar dados de suporte (usuários/livros):', error);
            showMessage('Erro ao carregar dados de suporte. Algumas informações podem estar incompletas.', 'error');
        }
    };

    const showMessage = (text, type) => {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        returnDetailsDiv.style.display = 'none'; // Esconde detalhes antigos
    };

    const displayReturnDetails = (devolucaoData) => {
        const emprestimo = devolucaoData.emprestimo;
        const valorMulta = devolucaoData.valorMulta;

        const user = allUsers.find(u => u.id === emprestimo.usuarioId);
        const book = allBooks.find(b => b.id === emprestimo.livroId);

        returnedLoanId.textContent = emprestimo.id;
        returnedBookTitle.textContent = book ? book.titulo : 'Livro Desconhecido';
        returnedUserName.textContent = user ? user.nome : 'Usuário Desconhecido';
        returnedFineAmount.textContent = valorMulta.toFixed(2); // Formata para 2 casas decimais

        returnDetailsDiv.style.display = 'block';
        messageElement.style.display = 'none'; // Esconde a mensagem de sucesso
    };

    devolucaoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage('', '');

        const emprestimoId = parseInt(emprestimoIdInput.value);
        const strategyType = multaStrategySelect.value; 

        if (isNaN(emprestimoId)) {
            showMessage('Por favor, insira um ID de empréstimo válido.', 'error');
            return;
        }

        try {
            
            const response = await fetch(`http://localhost:3040/api/emprestimos/${emprestimoId}/devolver`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
               
                body: JSON.stringify({ strategyType: strategyType }), 
            });

            const data = await response.json(); 

            if (response.ok) {
                showMessage('Devolução registrada com sucesso!', 'success');
                devolucaoForm.reset(); 
                displayReturnDetails(data);
            } else {
             
                showMessage(data.mensagem || data.message || 'Erro ao processar devolução. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de devolução:', error);
            showMessage('Não foi possível conectar ao servidor para processar a devolução.', 'error');
        } finally {
           
        }
    });


    fetchSupportingData();
});