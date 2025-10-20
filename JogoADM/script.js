document.addEventListener('DOMContentLoaded', () => {
    const quizData = [
        {
            question: "Qual é a função principal da área administrativa dentro do setor de TI?",
            options: [
                { text: "Resolver problemas técnicos", isCorrect: false },
                { text: "Gerenciar servidores", isCorrect: false },
                { text: "Organizar processos, documentos e recursos da área", isCorrect: true },
                { text: "Criar sistemas", isCorrect: false }
            ]
        },
        {
            question: "O que é o rateio mensal de contas que o TI realiza?",
            options: [
                { text: "Implementação de segurança", isCorrect: false },
                { text: "Distribuição de despesas entre áreas", isCorrect: true },
                { text: "Compra de equipamentos", isCorrect: false },
                { text: "Controle de estoque", isCorrect: false }
            ]
        },
        {
            question: "Quem envia para lançamento as notas fiscais de aquisição de licenças e equipamentos de TI?",
            options: [
                { text: "O setor de eventos", isCorrect: false },
                { text: "Administração de TI", isCorrect: true },
                { text: "Os clientes", isCorrect: false },
                { text: "O setor de marketing", isCorrect: false }
            ]
        }
        // Adicione mais perguntas aqui...
    ];

    // --- ELEMENTOS DO DOM ---
    const questionText = document.getElementById('question-text');
    const answerOptionsContainer = document.getElementById('answer-options');
    const scoreDisplay = document.getElementById('score-value');
    
    // Modais
    const startModal = document.getElementById('start-modal');
    const endModal = document.getElementById('end-modal');
    const endModalTitle = document.getElementById('end-modal-title');
    const endModalScore = document.getElementById('end-modal-score');

    // Botões
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again-button');
    const nextGameButton = document.getElementById('next-game-button');
    const restartButton = document.getElementById('restart-button'); // Botão no painel lateral

    // Feedback
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackIcon = document.getElementById('feedback-icon');

    // --- ESTADO DO JOGO ---
    let currentQuestionIndex = 0;
    let score = 0;
    const maxScore = quizData.length * 10;
    let quizInProgress = false;

    // --- LÓGICA DE MODO (Trilha ou Single) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isTrailMode = urlParams.get('mode') === 'trail';

    // --- FUNÇÕES DO QUIZ ---

    function startGame() {
        currentQuestionIndex = 0;
        score = 0;
        quizInProgress = true;
        updateScoreDisplay();
        showQuestion(quizData[currentQuestionIndex]);
        startModal.classList.add('hidden');
        endModal.classList.add('hidden');
        hideFeedbackOverlay();
    }

    function showQuestion(question) {
        if (!question) {
            endQuiz();
            return;
        }
        questionText.textContent = question.question;
        answerOptionsContainer.innerHTML = '';
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.className = 'answer-btn';
            button.addEventListener('click', () => selectAnswer(option.isCorrect, button));
            answerOptionsContainer.appendChild(button);
        });
    }

    function selectAnswer(isCorrect, button) {
        if (!quizInProgress) return;

        // Desabilita botões para evitar cliques múltiplos
        document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            score += 10;
            updateScoreDisplay();
            button.classList.add('correct');
            showFeedbackOverlay(true);
        } else {
            button.classList.add('incorrect');
            showFeedbackOverlay(false);
            // Mostra a resposta correta
            const correctButton = Array.from(answerOptionsContainer.children).find((child, index) => 
                quizData[currentQuestionIndex].options[index].isCorrect
            );
            correctButton.classList.add('correct');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            hideFeedbackOverlay();
            if (currentQuestionIndex < quizData.length) {
                showQuestion(quizData[currentQuestionIndex]);
            } else {
                endQuiz();
            }
        }, 1500); // Espera 1.5s antes de ir para a próxima
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score.toString().padStart(3, '0');
    }

    function endQuiz() {
        quizInProgress = false;
        questionText.textContent = "Quiz finalizado!";
        answerOptionsContainer.innerHTML = '';
        endModalScore.textContent = score.toString().padStart(3, '0');
        endModal.classList.remove('hidden');

        // Lógica de Trilha vs Single
        if (isTrailMode) {
            nextGameButton.style.display = 'inline-block';
            playAgainButton.style.display = 'none';
        } else {
            nextGameButton.style.display = 'none';
            playAgainButton.style.display = 'inline-block';
        }

        if (score >= maxScore * 0.7) {
            endModalTitle.textContent = "Parabéns!";
            triggerConfetti();
        } else {
            endModalTitle.textContent = "Quiz Finalizado!";
        }
        hideFeedbackOverlay(); // Garante que a overlay esteja escondida
    }
    
    // --- FUNÇÕES DE FEEDBACK VISUAL ---
    function showFeedbackOverlay(isCorrect) {
        feedbackOverlay.className = 'feedback-overlay show'; // Reseta classes
        feedbackIcon.className = 'fas'; // Reseta classes
        
        if (isCorrect) {
            feedbackOverlay.classList.add('correct-feedback');
            feedbackIcon.classList.add('fa-check-circle');
        } else {
            feedbackOverlay.classList.add('incorrect-feedback');
            feedbackIcon.classList.add('fa-times-circle');
        }
    }

    function hideFeedbackOverlay() {
        feedbackOverlay.classList.remove('show');
    }

    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // --- FUNÇÕES DO CRONÔMETRO (REMOVIDAS) ---
    // startTimer, stopTimer, formatTime foram removidos.
    
    // --- INICIALIZAÇÃO E EVENTOS ---
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // EVENTO ATUALIZADO: Envia o objeto de score para o pai
    nextGameButton.addEventListener('click', () => {
        window.parent.postMessage({ type: 'gameEnd', score: score }, '*');
    });

    // Inicia o modal de start
    startModal.classList.remove('hidden');
});