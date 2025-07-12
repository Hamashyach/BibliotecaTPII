document.addEventListener('DOMContentLoaded', async () => {
    const usuarioSelect = document.getElementById('usuarioSelect');
    const livroSelect = document.getElementById('livroSelect');
    const cadastroEmprestimoForm = document.getElementById('cadastro-emprestimo-form');
    const messageElement = document.getElementById('message');

    let allUsers = [];
    let allBooks = [];
    let activeLoans = new Set(); 

    const fetchInitialData = async () => {
        try {
           
            const usersResponse = await fetch('http://localhost:3040/api/usuarios');
            allUsers = await usersResponse.json();
            populateSelect(usuarioSelect, allUsers, 'id', 'nome', 'Carregando usuários...');

           
            const booksResponse = await fetch('http://localhost:3040/api/livros');
            allBooks = await booksResponse.json();

            
            const loansResponse = await fetch('http://localhost:3040/api/emprestimos');
            const loans = await loansResponse.json();
            activeLoans.clear(); 
            loans.forEach(loan => {
                if (loan.dataDevolucao === null) { 
                    activeLoans.add(loan.livroId);
                }
            });
            
            
            const availableBooks = allBooks.filter(book => !activeLoans.has(book.id));
            populateSelect(livroSelect, availableBooks, 'id', 'titulo', 'Carregando livros...');

        } catch (error) {
            console.error('Erro ao carregar dados iniciais para empréstimo:', error);
            usuarioSelect.innerHTML = '<option value="">Erro ao carregar usuários</option>';
            livroSelect.innerHTML = '<option value="">Erro ao carregar livros</option>';
            showMessage('Erro ao carregar dados. Tente novamente mais tarde.', 'error');
        }
    };

    const populateSelect = (selectElement, items, valueKey, textKey, defaultMessage) => {
        selectElement.innerHTML = `<option value="">${defaultMessage}</option>`;
        if (items && items.length > 0) {
            selectElement.innerHTML = `<option value="">-- Selecione --</option>`;
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueKey];
                option.textContent = item[textKey];
                selectElement.appendChild(option);
            });
        } else {
            selectElement.innerHTML = `<option value="">Nenhum item encontrado</option>`;
        }
    };

    const showMessage = (text, type) => {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
    };

    cadastroEmprestimoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage('', ''); 
        messageElement.style.display = 'none';

        const usuarioId = usuarioSelect.value;
        const livroId = livroSelect.value;

        if (!usuarioId || !livroId) {
            showMessage('Por favor, selecione um usuário e um livro.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3040/api/emprestimos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuarioId: parseInt(usuarioId), livroId: parseInt(livroId) }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Empréstimo registrado com sucesso!', 'success');
                cadastroEmprestimoForm.reset();
                await fetchInitialData(); 
            } else {
                showMessage(data.mensagem || data.message || 'Erro ao registrar empréstimo.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro de empréstimo:', error);
            showMessage('Não foi possível conectar ao servidor para registrar o empréstimo.', 'error');
        }
    });

    fetchInitialData();
});