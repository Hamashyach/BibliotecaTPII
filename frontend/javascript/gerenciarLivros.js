document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const booksListContainer = document.getElementById('booksListContainer');
    const loadingBooksMessage = document.getElementById('loadingBooksMessage');

    let allBooks = []; 

    const fetchAndDisplayBooks = async (searchTerm = '') => {
        try {
            loadingBooksMessage.textContent = 'Carregando livros...';
            
            const url = `http://localhost:3040/api/livros/buscar?termo=${encodeURIComponent(searchTerm)}`;
            
            const response = await fetch(url);

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                allBooks = await response.json(); 
                displayBooks(allBooks); 
            } else {
              
                const errorText = await response.text();
                console.error('Erro: Resposta não é JSON. Conteúdo:', errorText);
                booksListContainer.innerHTML = '<p class="no-results-message error">Erro ao carregar lista de livros. Resposta inválida do servidor.</p>';
            }

        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            booksListContainer.innerHTML = '<p class="no-results-message error">Não foi possível conectar ao servidor para carregar os livros.</p>';
        }
    };

    const displayBooks = (booksToDisplay) => {
        booksListContainer.innerHTML = ''; 
        loadingBooksMessage.style.display = 'none';

        if (booksToDisplay.length === 0) {
            booksListContainer.innerHTML = '<p class="no-results-message">Nenhum livro encontrado.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('books-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categoria</th>
                    <th>Disponível</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        booksToDisplay.forEach(book => {
            const row = tbody.insertRow();
            const availabilityText = book.isAvailable ? '<span style="color: green; font-weight: bold;">Sim</span>' : '<span style="color: red; font-weight: bold;">Não</span>';
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.titulo}</td>
                <td>${book.autor}</td>
                <td>${book.categoria}</td>
                <td>${availabilityText}</td>
            `;
        });
        booksListContainer.appendChild(table);
    };


    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        fetchAndDisplayBooks(searchTerm); 
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        fetchAndDisplayBooks(''); 
    });

    fetchAndDisplayBooks(''); s
});