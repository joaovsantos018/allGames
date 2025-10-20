document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE MODO (Trilha ou Single) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isTrailMode = urlParams.get('mode') === 'trail';

    // --- ELEMENTOS DO DOM ---
    const gridContainer = document.getElementById('grid-container');
    const wordsListElement = document.getElementById('words-list');
    const messageElement = document.getElementById('message');

    // Modais
    const startModal = document.getElementById('start-modal');
    const winModal = document.getElementById('win-modal');
    
    // Botões
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again-button');
    const nextGameButton = document.getElementById('next-game-button');

    // --- CONFIGURAÇÃO DO JOGO ---
    const wordsToFind = ['FIREWALL', 'SENHA', 'VIRUS', 'REDE', 'DADOS'];
    const gridSize = 10;
    let grid = []; // Array 2D para o tabuleiro
    let isSelecting = false;
    let selection = []; // Array para guardar as células selecionadas
    let wordsFoundCount = 0;
    const score = 100; // Score fixo por completar

    // 1. Inicializa o jogo
    function init() {
        wordsFoundCount = 0;
        isSelecting = false;
        selection = [];
        messageElement.textContent = '';
        createEmptyGrid();
        placeWords();
        fillRandomLetters();
        renderGrid();
        renderWordList();
        addEventListeners(); // Os eventos só são adicionados uma vez
    }

    // 2. Cria um tabuleiro vazio
    function createEmptyGrid() {
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    }

    // 3. Tenta posicionar as palavras no tabuleiro
    function placeWords() {
        const directions = ['horizontal', 'vertical'];
        for (const word of wordsToFind) {
            let placed = false;
            while (!placed) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * gridSize);
                const col = Math.floor(Math.random() * gridSize);

                if (canPlaceWord(word, row, col, dir)) {
                    for (let i = 0; i < word.length; i++) {
                        if (dir === 'horizontal') {
                            grid[row][col + i] = word[i];
                        } else {
                            grid[row + i][col] = word[i];
                        }
                    }
                    placed = true;
                }
            }
        }
    }

    // Verifica se a palavra pode ser colocada na posição sorteada
    function canPlaceWord(word, row, col, dir) {
        if (dir === 'horizontal') {
            if (col + word.length > gridSize) return false;
            for (let i = 0; i < word.length; i++) {
                if (grid[row][col + i] !== '') return false;
            }
        } else { // vertical
            if (row + word.length > gridSize) return false;
            for (let i = 0; i < word.length; i++) {
                if (grid[row + i][col] !== '') return false;
            }
        }
        return true;
    }

    // 4. Preenche os espaços vazios com letras aleatórias
    function fillRandomLetters() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    // 5. Renderiza (desenha) o tabuleiro na tela
    function renderGrid() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = grid[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;
                gridContainer.appendChild(cell);
            }
        }
    }

    // 6. Mostra a lista de palavras a serem encontradas
    function renderWordList() {
        wordsListElement.innerHTML = '';
        wordsToFind.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.id = `word-${word}`;
            wordsListElement.appendChild(li);
        });
    }

    // 7. Adiciona os eventos de mouse (clicar, arrastar, soltar)
    function addEventListeners() {
        gridContainer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('cell')) {
                isSelecting = true;
                selection = [e.target];
                e.target.classList.add('selected');
            }
        });

        gridContainer.addEventListener('mouseover', (e) => {
            if (isSelecting && e.target.classList.contains('cell')) {
                if (!selection.includes(e.target)) {
                    selection.push(e.target);
                    e.target.classList.add('selected');
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isSelecting) {
                isSelecting = false;
                checkSelection();
                document.querySelectorAll('.cell.selected').forEach(cell => cell.classList.remove('selected'));
            }
        });
    }

    // 8. Verifica se a seleção do usuário forma uma palavra válida
    function checkSelection() {
        const selectedWord = selection.map(cell => cell.textContent).join('');
        const selectedWordReversed = selectedWord.split('').reverse().join('');

        const foundWord = wordsToFind.find(w => w === selectedWord || w === selectedWordReversed);

        if (foundWord && !document.getElementById(`word-${foundWord}`).classList.contains('found')) {
            // Marcar células como encontradas
            selection.forEach(cell => cell.classList.add('found'));

            // Marcar palavra na lista
            const wordLi = document.getElementById(`word-${foundWord}`);
            wordLi.classList.add('found');
            wordsFoundCount++;

            // Checar condição de vitória
            if (wordsFoundCount === wordsToFind.length) {
                endGame(); // Chama a função de fim de jogo
            }
        }
    }

    // 9. NOVA FUNÇÃO: Fim de Jogo
    function endGame() {
        if (isTrailMode) {
            nextGameButton.style.display = 'inline-block';
            playAgainButton.style.display = 'none';
        } else {
            nextGameButton.style.display = 'none';
            playAgainButton.style.display = 'inline-block';
        }
        winModal.classList.remove('hidden');
    }
    
    // --- INICIALIZAÇÃO E EVENTOS DOS MODAIS ---

    startButton.addEventListener('click', () => {
        startModal.classList.add('hidden');
        init(); // Inicia o jogo
    });

    playAgainButton.addEventListener('click', () => {
        winModal.classList.add('hidden');
        init(); // Reinicia o jogo
    });

    nextGameButton.addEventListener('click', () => {
        // Envia a pontuação fixa para o menu principal
        window.parent.postMessage({ type: 'gameEnd', score: score }, '*');
    });

    // Adiciona os event listeners do mouse (só precisa fazer isso uma vez)
    addEventListeners();
    
    // Mostra o modal de início ao carregar
    startModal.classList.remove('hidden');
});