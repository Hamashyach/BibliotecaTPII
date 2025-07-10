// frontend/js/gerenciar_emprestimos.js
// CÓDIGO CORRIGIDO E ATUALIZADO PARA USAR statusTexto DO BACKEND

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const loansListContainer = document.getElementById('loansListContainer');
    const loadingLoansMessage = document.getElementById('loadingLoansMessage');

    let allLoans = []; // Para armazenar todos os empréstimos carregados
    let allUsers = []; // Para buscar nomes de usuários
    let allBooks = []; // Para buscar títulos de livros

    const fetchAllData = async () => {
        try {
            loadingLoansMessage.textContent = 'Carregando empréstimos...';
            
            // Buscar todos os usuários e livros primeiro para mapeamento
            const usersResponse = await fetch('http://localhost:3040/api/usuarios');
            allUsers = await usersResponse.json();
            const userMap = new Map(allUsers.map(user => [user.id, user]));

            const booksResponse = await fetch('http://localhost:3040/api/livros');
            allBooks = await booksResponse.json();
            const bookMap = new Map(allBooks.map(book => [book.id, book]));

            const loansResponse = await fetch('http://localhost:3040/api/emprestimos');
            allLoans = await loansResponse.json();

            displayLoans(allLoans, userMap, bookMap); 
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            loansListContainer.innerHTML = '<p class="no-results-message error">Erro ao carregar lista de empréstimos.</p>';
        }
    };

    const displayLoans = (loansToDisplay, userMap, bookMap) => {
        loansListContainer.innerHTML = ''; // Limpa resultados anteriores
        loadingLoansMessage.style.display = 'none';

        if (loansToDisplay.length === 0) {
            loansListContainer.innerHTML = '<p class="no-results-message">Nenhum empréstimo encontrado.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('loans-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Livro</th>
                    <th>Usuário</th>
                    <th>Data Empréstimo</th>
                    <th>Data Prevista Devolução</th>
                    <th>Data Devolução Real</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        loansToDisplay.forEach(loan => {
            const user = userMap.get(loan.usuarioId);
            const book = bookMap.get(loan.livroId);

            const userName = user ? user.nome : 'Usuário Desconhecido';
            const bookTitle = book ? book.titulo : 'Livro Desconhecido';
            const dataEmprestimo = new Date(loan.dataEmprestimo).toLocaleDateString('pt-BR');
            const dataPrevistaDevolucao = new Date(loan.dataDevolucaoPrevista).toLocaleDateString('pt-BR');
            const dataDevolucaoReal = loan.dataDevolucao ? new Date(loan.dataDevolucao).toLocaleDateString('pt-BR') : 'Empréstimo Ativo';

            // NOVO: Usar statusTexto do backend e aplicar classes CSS
            let statusHtml = '';
            let statusClass = '';
            if (loan.statusTexto === 'Atrasado') {
                statusClass = 'status-atrasado';
            } else if (loan.statusTexto === 'Ativo') {
                statusClass = 'status-ativo';
            } else { // Devolvido
                statusClass = 'status-devolvido';
            }
            statusHtml = `<span class="${statusClass}">${loan.statusTexto}</span>`;


            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>${bookTitle}</td>
                <td>${userName}</td>
                <td>${dataEmprestimo}</td>
                <td>${dataPrevistaDevolucao}</td>
                <td>${dataDevolucaoReal}</td>
                <td>${statusHtml}</td> `;
        });
        loansListContainer.appendChild(table);
    };

    // Event Listeners (permanecem os mesmos)
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredLoans = allLoans.filter(loan => {
            const user = allUsers.find(u => u.id === loan.usuarioId);
            const book = allBooks.find(b => b.id === loan.livroId);

            const userName = user ? user.nome.toLowerCase() : '';
            const bookTitle = book ? book.titulo.toLowerCase() : '';

            return userName.includes(searchTerm) || bookTitle.includes(searchTerm);
        });
        const userMap = new Map(allUsers.map(user => [user.id, user]));
        const bookMap = new Map(allBooks.map(book => [book.id, book]));
        displayLoans(filteredLoans, userMap, bookMap);
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        const userMap = new Map(allUsers.map(user => [user.id, user]));
        const bookMap = new Map(allBooks.map(book => [book.id, book]));
        displayLoans(allLoans, userMap, bookMap);
    });

    fetchAllData();
});