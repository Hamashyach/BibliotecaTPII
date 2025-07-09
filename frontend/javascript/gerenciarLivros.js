// frontend/js/gerenciar_livros.js
// CÓDIGO ATUALIZADO

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const booksListContainer = document.getElementById('booksListContainer');
    const loadingBooksMessage = document.getElementById('loadingBooksMessage');

    let allBooks = []; // Para armazenar os livros que vêm do backend (já com disponibilidade)

    // Função para buscar e exibir livros (agora com termo de busca)
    const fetchAndDisplayBooks = async (searchTerm = '') => {
        try {
            loadingBooksMessage.textContent = 'Carregando livros...';
            
            // MUDANÇA AQUI: Sempre inclui o parâmetro 'termo', mesmo que seja uma string vazia
            const url = `http://localhost:3040/api/livros/buscar?termo=${encodeURIComponent(searchTerm)}`;
            
            const response = await fetch(url);

            // Verifica se a resposta é JSON antes de tentar fazer o parse
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                allBooks = await response.json(); // Livros já vêm com 'isAvailable'
                displayBooks(allBooks); 
            } else {
                // Se não for JSON, é provável que seja uma página de erro HTML
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
        booksListContainer.innerHTML = ''; // Limpa resultados anteriores
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

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        fetchAndDisplayBooks(searchTerm); // Chama a busca no backend
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        fetchAndDisplayBooks(''); // Chama para exibir todos novamente, passando string vazia
    });

    // Inicia o carregamento de todos os dados quando a página é carregada
    fetchAndDisplayBooks(''); // Primeira chamada com termo vazio para carregar todos
});