// frontend/js/gerenciarUsuario.js

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const userListContainer = document.getElementById('userListContainer');
    const loadingUsersMessage = document.getElementById('loadingUsersMessage');
    const loanDetailsSection = document.getElementById('loan-details-section');
    const selectedUserNameElement = document.getElementById('selectedUserName');
    const userLoansContainer = document.getElementById('userLoansContainer');

    let allUsers = []; 
    let normalUsers = [];
    let allBooks = []; 
    let allLoans = []; 

    const fetchAllData = async () => {
        try {
            loadingUsersMessage.textContent = 'Carregando usuários...';
            
            const usersResponse = await fetch('http://localhost:3040/api/usuarios');
            allUsers = await usersResponse.json();
            
            normalUsers = allUsers.filter(user => user.perfil === 'usuario');

            const booksResponse = await fetch('http://localhost:3040/api/livros');
            allBooks = await booksResponse.json();

            const loansResponse = await fetch('http://localhost:3040/api/emprestimos');
            allLoans = await loansResponse.json();

            displayUsers(normalUsers); 
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            userListContainer.innerHTML = '<p class="no-results error">Erro ao carregar lista de usuários.</p>';
        }
    };

    const displayUsers = (usersToDisplay) => {
        userListContainer.innerHTML = ''; 
        loadingUsersMessage.style.display = 'none';

        if (usersToDisplay.length === 0) {
            userListContainer.innerHTML = '<p class="no-results">Nenhum usuário encontrado.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('user-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        usersToDisplay.forEach(user => {
            const row = tbody.insertRow();
            row.dataset.userId = user.id; 
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.perfil}</td>
            `;
            row.addEventListener('click', () => displayUserLoans(user));
        });
        userListContainer.appendChild(table);
    };

    const displayUserLoans = (user) => {
        selectedUserNameElement.textContent = user.nome;
        userLoansContainer.innerHTML = ''; 
        loanDetailsSection.style.display = 'block'; 

        const userLoans = allLoans.filter(loan => loan.usuarioId === user.id);

        if (userLoans.length === 0) {
            userLoansContainer.innerHTML = '<p class="no-loans-message">Este usuário não possui empréstimos registrados.</p>';
            return;
        }

        const bookMap = new Map(allBooks.map(book => [book.id, book]));

        const table = document.createElement('table');
        table.classList.add('loan-details-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Livro</th>
                    <th>Data Empréstimo</th>
                    <th>Data Prevista Devolução</th>
                    <th>Data Devolução Real</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        userLoans.forEach(loan => {
            const book = bookMap.get(loan.livroId);
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
                <td>${bookTitle}</td>
                <td>${dataEmprestimo}</td>
                <td>${dataPrevistaDevolucao}</td>
                <td>${dataDevolucaoReal}</td>
                <td>${status}</td>
            `;
        });
        userLoansContainer.appendChild(table);
    };

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredUsers = normalUsers.filter(user => 
            user.nome.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
        );
        displayUsers(filteredUsers);
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        displayUsers(normalUsers); 
        loanDetailsSection.style.display = 'none'; 
    });

  
    fetchAllData();
});