// frontend/js/gerenciar_emprestimos.js
// CÓDIGO CORRIGIDO E ATUALIZADO

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

            // CORREÇÃO AQUI: Buscar TODOS os empréstimos e atribuir a 'allLoans'
            const loansResponse = await fetch('http://localhost:3040/api/emprestimos'); // Buscar TODOS os empréstimos
            allLoans = await loansResponse.json(); // Atribuir à variável correta

            // Remover console.log(atrasados); pois 'atrasados' não está sendo usado
            // const atrasadosResponse = await fetch('http://localhost:3040/api/emprestimos/atrasados');
            // const atrasados = await atrasadosResponse.json();
            // console.log(atrasados);

            // Exibe todos os empréstimos que foram carregados em 'allLoans'
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

            let status = '';
            if (loan.dataDevolucao === null) {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataPrevista = new Date(loan.dataDevolucaoPrevista);
                dataPrevista.setHours(0, 0, 0, 0);

                if (dataPrevista < hoje) {
                    status = '<span style="color: red; font-weight: bold;">Atrasado</span>';
                } else {
                    status = '<span style="color: green;">Ativo</span>';
                }
            } else {
                status = 'Devolvido';
            }

            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>${bookTitle}</td>
                <td>${userName}</td>
                <td>${dataEmprestimo}</td>
                <td>${dataPrevistaDevolucao}</td>
                <td>${dataDevolucaoReal}</td>
                <td>${status}</td>
            `;
        });
        loansListContainer.appendChild(table);
    };

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredLoans = allLoans.filter(loan => {
            const user = allUsers.find(u => u.id === loan.usuarioId);
            const book = allBooks.find(b => b.id === loan.livroId);

            const userName = user ? user.nome.toLowerCase() : '';
            const bookTitle = book ? book.titulo.toLowerCase() : '';

            return userName.includes(searchTerm) || bookTitle.includes(searchTerm);
        });
        // Remap user/book names for display after filtering
        const userMap = new Map(allUsers.map(user => [user.id, user]));
        const bookMap = new Map(allBooks.map(book => [book.id, book]));
        displayLoans(filteredLoans, userMap, bookMap);
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        const userMap = new Map(allUsers.map(user => [user.id, user]));
        const bookMap = new Map(allBooks.map(book => [book.id, book]));
        displayLoans(allLoans, userMap, bookMap); // Mostra todos os empréstimos novamente
    });

    // Inicia o carregamento de todos os dados quando a página é carregada
    fetchAllData();
});