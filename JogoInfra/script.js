document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE MODO (Trilha ou Single) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isTrailMode = urlParams.get('mode') === 'trail';

    // --- CONFIGURAÇÕES DO JOGO ---
    const ordem = ["nuvem", "firewall", "core", "acesso", "pc"];
    const devicesInfo = {
        nuvem: { nome: "🌐 Nuvem", img: "assets/cloud.jpg", desc: "Representa a Internet, o ponto de partida de onde o sinal chega." },
        firewall: { nome: "🛡 Firewall", img: "assets/Firewall.png", desc: "Controla o tráfego que entra e sai da rede para protegê-la." },
        core: { nome: "💻 Core Switch", img: "assets/core.jpg", desc: "O coração da rede. Distribui o tráfego de forma eficiente." },
        acesso: { nome: "🔌 Switch de Acesso", img: "assets/switch.jpg", desc: "Conecta os dispositivos finais (como computadores) à rede." },
        pc: { 
            nome: "🖥 PC Final", img: "assets/pc.png", desc: "O computador do usuário, o destino final da conexão.",
            connectedState: { nome: "💻 Notebook Conectado", img: "assets/Note.png" }
        }
    };

    // --- ELEMENTOS DO DOM ---
    const container = document.getElementById("container");
    const svgCabo = document.getElementById("svgCabo");
    const mensagem = document.getElementById("mensagem");
    const pontuacaoDisplay = document.getElementById("pontuacao");
    const explicacoesContainer = document.getElementById("explicacoes");
    
    const startModal = document.getElementById('start-modal');
    const winModal = document.getElementById('win-modal');
    const finalScoreElement = document.getElementById('final-score');
    
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again-button');
    const nextGameButton = document.getElementById('next-game-button');
    const reiniciarButton = document.getElementById("reiniciar");

    // --- ESTADO DO JOGO ---
    let pontuacao = 0;
    let conexoesFeitas = 0;
    let origem = null;
    let caboAtual = null;

    // --- FUNÇÕES DO JOGO ---

    function atualizarPontuacao(valor) {
        pontuacao = Math.max(0, pontuacao + valor);
        pontuacaoDisplay.innerHTML = `<strong>Pontuação:</strong> ${pontuacao}`;
    }

    function mostrarMensagem(texto, tipo = "info") {
        mensagem.textContent = texto;
        mensagem.style.color = tipo === "erro" ? "#dc3545" : "#212529";
    }

    function mostrarErro(texto, origemDevice, destinoDevice) {
        mostrarMensagem(texto, "erro");
        document.querySelectorAll('.device').forEach(d => d.classList.remove('destaque'));
        
        if (origemDevice) {
            origemDevice.classList.add('flash-red');
            setTimeout(() => origemDevice.classList.remove('flash-red'), 500);
        }
        if (destinoDevice) {
            destinoDevice.classList.add('flash-red');
            setTimeout(() => destinoDevice.classList.remove('flash-red'), 500);
        }
    }

    function montarDispositivos() {
        container.innerHTML = '<svg id="svgCabo"></svg>';
        explicacoesContainer.innerHTML = '';
        conexoesFeitas = 0;
        pontuacao = 0;
        atualizarPontuacao(0);
        mostrarMensagem("Clique no primeiro dispositivo para começar.");

        const devicesEmbaralhados = [...ordem].sort(() => Math.random() - 0.5);

        // Configurações para anti-colisão
        const containerHeight = container.offsetHeight;
        const containerWidth = container.offsetWidth;
        const deviceSize = 150; // ATUALIZADO: Tamanho do novo círculo (do CSS)
        const padding = 20;
        const minDistance = deviceSize + 20; // ATUALIZADO: Distância mínima
        
        let devicePositions = [];

        devicesEmbaralhados.forEach((id) => {
            const info = devicesInfo[id];
            const deviceDiv = document.createElement("div");
            
            // --- CORREÇÃO PRINCIPAL DO BUG DE COR ---
            // Remove as classes de Bootstrap que estavam causando conflito
            deviceDiv.className = "device"; 
            // --- FIM DA CORREÇÃO ---
            
            deviceDiv.id = id;
            deviceDiv.innerHTML = `
                <img src="${info.img}" alt="${info.nome}" class="img-fluid mb-2">
                <h5>${info.nome}</h5>
                <p class.small">${info.desc}</p>
            `;
            
            // Lógica de Posição (Anti-Colisão)
            let validPosition = false;
            let newPos = {};
            let attempts = 0;

            while (!validPosition && attempts < 100) {
                newPos.x = Math.random() * (containerWidth - deviceSize - (padding * 2)) + padding;
                newPos.y = Math.random() * (containerHeight - deviceSize - (padding * 2)) + padding;
                validPosition = true;
                
                for (const pos of devicePositions) {
                    const dx = pos.x - newPos.x;
                    const dy = pos.y - newPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy); 
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            devicePositions.push(newPos);
            deviceDiv.style.left = `${newPos.x}px`;
            deviceDiv.style.top = `${newPos.y}px`;
            
            deviceDiv.addEventListener("click", () => cliqueDevice(deviceDiv, id));
            container.appendChild(deviceDiv);
        });

        // Timeline Aleatória (sem alteração)
        const explicacoesEmbaralhadas = [...ordem].sort(() => Math.random() - 0.5);
        
        explicacoesEmbaralhadas.forEach(id => {
            const info = devicesInfo[id];
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.id = `ex-${id}`;
            item.innerHTML = `<h5>${info.nome}</h5><p>${info.desc}</p>`;
            explicacoesContainer.appendChild(item);
        });
        
        destacarProximoDevice();
    }

    // Função de Destaque (sem alteração)
    function destacarProximoDevice() {
        document.querySelectorAll('.device').forEach(d => d.classList.remove('destaque'));
        document.querySelectorAll('.timeline-item').forEach(i => {
            i.classList.remove('active');
        });

        const proximoId = ordem[conexoesFeitas];
        if (!proximoId) return; 

        const proximoDevice = document.getElementById(proximoId);
        const proximaExplicacao = document.getElementById(`ex-${proximoId}`);
        
        if (proximoDevice) {
            proximoDevice.classList.add('destaque'); // Fica com fundo AZUL
        }
        if (proximaExplicacao) {
            proximaExplicacao.classList.add('active'); // Ponto da timeline fica AZUL
        }
    }
    
    // Função de Clique (sem alteração)
    function cliqueDevice(deviceDiv, id) {
        if (deviceDiv.classList.contains("conectado")) return;
        const svgCaboElem = document.getElementById('svgCabo');
        
        const idCorreto = ordem[conexoesFeitas];

        if (!origem) {
            // --- PRIMEIRO CLIQUE (Início da conexão) ---
            if (id !== idCorreto) {
                mostrarErro("❌ Este não é o próximo dispositivo!", deviceDiv, null);
                return;
            }

            origem = deviceDiv;
            mostrarMensagem(`Conectando ${devicesInfo[id].nome}... Clique no próximo dispositivo.`);
            
            caboAtual = document.createElementNS("http://www.w3.org/2000/svg", "path");
            caboAtual.classList.add("cabo");
            const x1 = deviceDiv.offsetLeft + deviceDiv.offsetWidth / 2;
            const y1 = deviceDiv.offsetTop + deviceDiv.offsetHeight / 2;
            
            const pathData = `M ${x1},${y1} L ${x1},${y1}`;
            caboAtual.setAttribute("d", pathData);
            svgCaboElem.appendChild(caboAtual);

            container.onmousemove = (e) => {
                const containerRect = container.getBoundingClientRect();
                const x2 = e.clientX - containerRect.left;
                const y2 = e.clientY - containerRect.top;
                const pathData = getCurvePath(x1, y1, x2, y2);
                caboAtual.setAttribute("d", pathData);
            };
            
        } else {
            // --- SEGUNDO CLIQUE (Fim da conexão) ---
            container.onmousemove = null;
            const origemId = origem.id;
            const destinoId = id;
            
            const x1 = origem.offsetLeft + origem.offsetWidth / 2;
            const y1 = origem.offsetTop + origem.offsetHeight / 2;
            const x2 = deviceDiv.offsetLeft + deviceDiv.offsetWidth / 2;
            const y2 = deviceDiv.offsetTop + deviceDiv.offsetHeight / 2;
            const pathData = getCurvePath(x1, y1, x2, y2);
            caboAtual.setAttribute("d", pathData);

            if (origemId === idCorreto && destinoId === ordem[conexoesFeitas + 1]) {
                // --- Conexão CORRETA ---
                origem.classList.add("conectado"); // Fica VERDE
                origem.classList.remove("destaque"); // Sai o AZUL
                caboAtual.classList.add("conectado"); // Linha fica VERDE
                
                const origemItem = document.getElementById(`ex-${origemId}`);
                if (origemItem) {
                    origemItem.classList.remove('active');
                    origemItem.classList.add('completed');
                }
                
                mostrarMensagem(`✅ Conexão ${devicesInfo[origemId].nome} -> ${devicesInfo[destinoId].nome} correta!`);
                atualizarPontuacao(10);
                conexoesFeitas++;

                if (destinoId === "pc") {
                    deviceDiv.classList.add("conectado"); // PC Fica VERDE
                    const info = devicesInfo[destinoId].connectedState;
                    deviceDiv.querySelector('img').src = info.img;
                    deviceDiv.querySelector('h5').textContent = info.nome;
                }

                if (conexoesFeitas === ordem.length - 1) {
                    // --- Vitória ---
                    mostrarMensagem("🎉 Parabéns! Topologia de rede concluída!");
                    finalScoreElement.textContent = pontuacao; 
                    
                    if (isTrailMode) {
                        nextGameButton.style.display = 'inline-block';
                        playAgainButton.style.display = 'none';
                    } else {
                        nextGameButton.style.display = 'none';
                        playAgainButton.style.display = 'inline-block';
                    }
                    winModal.classList.remove('hidden');
                    document.querySelectorAll('.device').forEach(d => d.classList.remove('destaque'));
                    
                    const destinoItem = document.getElementById(`ex-${destinoId}`);
                    if(destinoItem) {
                        destinoItem.classList.remove('active');
                        destinoItem.classList.add('completed');
                    }

                } else {
                     destacarProximoDevice(); // Próximo fica AZUL
                }
            } else {
                // --- Conexão ERRADA ---
                caboAtual.remove();
                mostrarErro("❌ Conexão errada! Tente novamente.", origem, deviceDiv);
                atualizarPontuacao(-5);
                destacarProximoDevice(); 
            }
            caboAtual = null;
            origem = null;
        }
    }
    
    function getCurvePath(x1, y1, x2, y2) {
        const curveAmount = 50; 
        const cp1x = x1;
        const cp1y = y1 + curveAmount;
        const cp2x = x2;
        const cp2y = y2 - curveAmount;
        return `M ${x1},${y1} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }


    // --- INICIALIZAÇÃO E EVENTOS ---
    reiniciarButton.addEventListener("click", montarDispositivos);
    
    startButton.addEventListener('click', () => {
        startModal.classList.add('hidden');
        montarDispositivos();
    });

    playAgainButton.addEventListener('click', () => {
        winModal.classList.add('hidden');
        montarDispositivos();
    });

    nextGameButton.addEventListener('click', () => {
        window.parent.postMessage({ type: 'gameEnd', score: pontuacao }, '*');
    });

    startModal.classList.remove('hidden');
});