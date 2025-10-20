document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const screens = document.querySelectorAll('.screen');
    const gameContainer = document.getElementById('game-container');
    const gameFrame = document.getElementById('game-frame');

    // Botões
    const playTrailBtn = document.getElementById('play-trail-btn');
    const selectGameBtn = document.getElementById('select-game-btn');
    const gameChoiceBtns = document.querySelectorAll('.game-choice-btn');
    const backToMainMenuBtn = document.getElementById('back-to-main-menu-btn');
    const quitGameBtn = document.getElementById('quit-game-btn');
    const returnToMenuBtn = document.getElementById('return-to-menu-btn');

    // Elementos da Tela de Score Final
    const finalScoreScreen = document.getElementById('final-score-screen');
    const scoreBreakdownList = document.getElementById('score-breakdown');
    const finalTotalScoreElement = document.getElementById('final-total-score');


    // --- ESTADO DO JOGO ---
    // ATUALIZADO: Adicionado o novo jogo à trilha
    const gameTrail = [
        { name: 'Jogo da Memória', path: 'JogoDaMemoria_EST/index.html' },
        { name: 'Quiz ADM', path: 'JogoADM/index.html' },
        { name: 'Quiz Infra', path: 'JogoInfra/index.html' },
        { name: 'Jogo Dev', path: 'JogoDev/index.html' },
        { name: 'Cibersegurança', path: 'JogoCiber/index.html' } // <-- NOVO JOGO
    ];
    let currentTrailIndex = 0;
    let isTrailMode = false;

    // --- LÓGICA DE PONTUAÇÃO ---
    let totalScore = 0;
    let scoreBreakdown = {}; // Armazena os scores individuais


    // --- FUNÇÕES ---

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    function loadGame(src, mode = 'single') {
        const url = `${src}?mode=${mode}`;
        gameFrame.src = url;
        showScreen('game-container');
    }

    function startTrail() {
        isTrailMode = true;
        currentTrailIndex = 0;
        totalScore = 0;
        scoreBreakdown = {}; // Limpa o placar
        scoreBreakdownList.innerHTML = ''; // Limpa a lista visual
        loadGame(gameTrail[currentTrailIndex].path, 'trail');
    }
    
    function returnToMenu() {
        gameFrame.src = 'about:blank';
        isTrailMode = false;
        showScreen('main-menu');
    }

    // --- FUNÇÃO: Mostrar Score Final ---
    function showFinalScore() {
        scoreBreakdownList.innerHTML = '';
        gameTrail.forEach(game => {
            const gameName = game.name;
            const score = scoreBreakdown[game.path] || 0;
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${gameName}:</span> <span>${score}</span>`;
            scoreBreakdownList.appendChild(li);
        });

        finalTotalScoreElement.textContent = totalScore.toString().padStart(3, '0');
        
        gameFrame.src = 'about:blank';
        showScreen('final-score-screen');
    }


    // --- EVENT LISTENERS ---

    playTrailBtn.addEventListener('click', startTrail);
    selectGameBtn.addEventListener('click', () => showScreen('game-selection'));
    backToMainMenuBtn.addEventListener('click', () => showScreen('main-menu'));
    returnToMenuBtn.addEventListener('click', returnToMenu);
    quitGameBtn.addEventListener('click', returnToMenu);

    gameChoiceBtns.forEach(button => {
        button.addEventListener('click', () => {
            const gameSrc = button.dataset.src;
            isTrailMode = false;
            loadGame(gameSrc, 'single');
        });
    });

    // --- LISTENER DE MENSAGEM ---
    window.addEventListener('message', (event) => {
        if (!isTrailMode || !event.data || event.data.type !== 'gameEnd') {
            return;
        }

        const score = event.data.score || 0;
        const currentGamePath = gameTrail[currentTrailIndex].path;
        
        totalScore += score;
        scoreBreakdown[currentGamePath] = score;

        currentTrailIndex++;
        
        if (currentTrailIndex < gameTrail.length) {
            loadGame(gameTrail[currentTrailIndex].path, 'trail');
        } else {
            showFinalScore();
            isTrailMode = false;
        }
    });
});