document.addEventListener('DOMContentLoaded', () => {
    const cardData = [
        { id: 1, type: 'title', text: 'Levantamento de requisitos' }, { id: 1, type: 'description', text: 'Entrevistar usuários para entender necessidades' },
        { id: 2, type: 'title', text: 'Análise de Requisitos' }, { id: 2, type: 'description', text: 'Identificar funcionalidades e restrições do sistema' },
        { id: 3, type: 'title', text: 'Modelagem de Sistema' }, { id: 3, type: 'description', text: 'Criar diagramas, fluxogramas e casos de uso' },
        { id: 4, type: 'title', text: 'Especificação técnica' }, { id: 4, type: 'description', text: 'Documentar como o sistema será implementado' },
        { id: 5, type: 'title', text: 'Validação Técnica' }, { id: 5, type: 'description', text: 'Confirmar com o cliente se os requisitos estão completos' },
        { id: 6, type: 'title', text: 'Comunicação com o cliente' }, { id: 6, type: 'description', text: 'Reuniões para alinhar expectativa do escopo' },
        { id: 7, type: 'title', text: 'Testes' }, { id: 7, type: 'description', text: 'Verificar se o sistema funciona como esperado' },
        { id: 8, type: 'title', text: 'Entrega' }, { id: 8, type: 'description', text: 'Implementar o sistema no ambiente do cliente' },
    ];
    const pairs = cardData.length / 2;
    const initialScore = 1000;
    const initialAttempts = 15;
    const hintTrigger = 3;

    // --- ELEMENTOS DO DOM ---
    const game = document.querySelector('.memory-game');
    const scoreDisplay = document.getElementById('score-value');
    const attemptsDisplay = document.getElementById('attempts-counter');
    
    // Modais
    const startModal = document.getElementById('start-modal');
    const winModal = document.getElementById('win-modal');
    const loseModal = document.getElementById('lose-modal');
    const finalScoreDisplay = document.getElementById('final-score');
    
    // Botões
    const startButton = document.getElementById('start-button');
    const retryButtons = document.querySelectorAll('.retry-button');
    const restartButton = document.getElementById('restart-button');
    const reviewButton = document.getElementById('review-button');
    const hintButton = document.getElementById('hint-button');
    const nextGameButton = document.getElementById('next-game-button');

    // --- ESTADO DO JOGO ---
    let flippedCards = [];
    let lockBoard = false;
    let score = initialScore;
    let attempts = initialAttempts;
    let pairsFound = 0;
    let errorCount = 0;
    let isFirstGame = true;
    
    // --- LÓGICA DE MODO (Trilha ou Single) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isTrailMode = urlParams.get('mode') === 'trail';

    // --- FUNÇÕES DE TEMPO (REMOVIDAS) ---

    // --- FUNÇÕES DO JOGO ---
    function createBoard() {
        // Reseta o estado
        game.innerHTML = '';
        flippedCards = [];
        lockBoard = false;
        score = initialScore;
        attempts = initialAttempts;
        pairsFound = 0;
        errorCount = 0;
        
        updateDisplays();
        hintButton.disabled = true;
        hintButton.textContent = `Dica (${hintTrigger} Erros)`;
        hintButton.classList.remove('ready'); // <-- ADICIONADO: Reseta a cor do botão
        
        winModal.classList.add('hidden');
        loseModal.classList.add('hidden');

        const shuffledCards = [...cardData].sort(() => 0.5 - Math.random());
        const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];

        shuffledCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.id = card.id;

            const color = colorClasses[card.id - 1];

            cardElement.innerHTML = `
                <div class="front-face ${color} ${card.type}">
                    ${card.text}
                </div>
                <div class="back-face"></div>
            `;
            
            cardElement.addEventListener('click', () => flipCard(cardElement));
            game.appendChild(cardElement);
        });
    }

    function flipCard(card) {
        if (lockBoard || card.classList.contains('flip') || flippedCards.length === 2) return;

        card.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.id === card2.dataset.id;

        if (isMatch) {
            pairsFound++;
            card1.classList.add('correct');
            card2.classList.add('correct');
            resetBoardState();
            if (pairsFound === pairs) checkForWin();
        } else {
            attempts--;
            score -= 50; // Penalidade por erro
            errorCount++;

            card1.classList.add('incorrect');
            card2.classList.add('incorrect');

            if (errorCount >= hintTrigger) {
                hintButton.disabled = false;
                hintButton.textContent = 'Usar Dica!';
                hintButton.classList.add('ready'); // <-- ADICIONADO: Muda a cor do botão
            }

            updateDisplays();

            if (attempts <= 0) {
                checkForLose();
                return;
            }

            setTimeout(() => {
                card1.classList.remove('flip', 'incorrect');
                card2.classList.remove('flip', 'incorrect');
                resetBoardState();
            }, 1200);
        }
    }

    function resetBoardState() {
        flippedCards = [];
        lockBoard = false;
    }

    function updateDisplays() {
        scoreDisplay.textContent = score.toString().padStart(4, '0');
        attemptsDisplay.textContent = attempts.toString().padStart(2, '0');
    }

    function checkForWin() {
        lockBoard = true;
        triggerConfetti();

        let attemptsUsed = initialAttempts - attempts;
        score = Math.max(0, initialScore - (attemptsUsed * 50));
        updateDisplays();
        
        finalScoreDisplay.textContent = score.toString().padStart(3, '0');
        winModal.classList.remove('hidden');

        if (isTrailMode) {
            nextGameButton.style.display = 'inline-block';
            retryButtons.forEach(btn => btn.style.display = 'none');
            restartButton.style.display = 'none';
        } else {
            nextGameButton.style.display = 'none';
            retryButtons.forEach(btn => btn.style.display = 'inline-block');
        }
    }

    function checkForLose() {
        lockBoard = true;
        loseModal.classList.remove('hidden');
    }

    function triggerConfetti() {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    // --- INICIALIZAÇÃO E EVENTOS ---
    startButton.addEventListener('click', () => {
        startModal.classList.add('hidden');
        isFirstGame = false;
        createBoard();
    });

    retryButtons.forEach(button => {
        button.addEventListener('click', () => {
            createBoard();
        });
    });
    
    restartButton.addEventListener('click', () => {
        createBoard();
    });

    reviewButton.addEventListener('click', () => {
        winModal.classList.add('hidden');
    });

    hintButton.addEventListener('click', () => {
        if(hintButton.disabled) return;
        
        hintButton.disabled = true;
        hintButton.textContent = `Dica (${hintTrigger} Erros)`;
        hintButton.classList.remove('ready'); // <-- ADICIONADO: Reseta a cor ao usar
        errorCount = 0;
        lockBoard = true;

        const unmatchedCards = document.querySelectorAll('.memory-card:not(.flip)');
        unmatchedCards.forEach(card => card.classList.add('flip'));
        
        setTimeout(() => {
            unmatchedCards.forEach(card => card.classList.remove('flip'));
            lockBoard = false;
        }, 2000);
    });
    
    nextGameButton.addEventListener('click', () => {
        window.parent.postMessage({ type: 'gameEnd', score: score }, '*');
    });

    if (isFirstGame) {
        startModal.classList.remove('hidden');
    }
});