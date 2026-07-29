// Configurações do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// Tamanho do grid (20x20 com células de 30px para canvas 600x600)
const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;


// Variáveis do jogo
let snake = [];
let food = { x: 12, y: 12 };
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let fase = 1;
let gameLoop = null;
let isGameOver = false;
let isPaused = false;


// Velocidades base (ms)
const SPEEDS = {
   FACIL: 150,
   MEDIO: 110,
   DIFICIL: 75
};


let currentSpeed = SPEEDS.FACIL;


// Função para determinar dificuldade baseada na fase
function getDifficultyByFase(faseNum) {
   if (faseNum >= 1 && faseNum <= 5) return 'Fácil';
   if (faseNum >= 6 && faseNum <= 10) return 'Médio';
   if (faseNum >= 11 && faseNum <= 15) return 'Difícil';
   return 'Difícil';
}


// Atualizar velocidade conforme fase atual
function updateSpeedByFase() {
   const difficulty = getDifficultyByFase(fase);
   switch(difficulty) {
       case 'Fácil':
           currentSpeed = SPEEDS.FACIL;
           break;
       case 'Médio':
           currentSpeed = SPEEDS.MEDIO;
           break;
       case 'Difícil':
           currentSpeed = SPEEDS.DIFICIL;
           break;
   }
  
   if (gameLoop && !isGameOver && !isPaused) {
       clearInterval(gameLoop);
       gameLoop = setInterval(gameStep, currentSpeed);
   }
}


// Inicializar ou resetar jogo
function initGame(resetFase = true) {
   // Corpo inicial da vaca (3 segmentos)
   snake = [
       { x: 10, y: 10 },
       { x: 9, y: 10 },
       { x: 8, y: 10 }
   ];
  
   direction = 'RIGHT';
   nextDirection = 'RIGHT';
  
   if (resetFase) {
       fase = 1;
       score = 0;
   } else {
       score = 0;
   }
  
   isGameOver = false;
   isPaused = false;
  
   document.getElementById('pausarBtn').innerHTML = '<span>⏸️</span> PAUSAR';
   updateUI();
   updateSpeedByFase();
   generateValidFood();
  
   if (gameLoop) clearInterval(gameLoop);
   gameLoop = setInterval(gameStep, currentSpeed);
  
   draw();
}


// Reinício completo
function fullRestart() {
   initGame(true);
}


// Avançar para próxima fase
function checkNextFase() {
   if (score >= 10) {
       if (fase < 15) {
           fase++;
           score = 0;
           updateUI();
           updateSpeedByFase();
          
           // Resetar posição da cobra
           snake = [
               { x: 10, y: 10 },
               { x: 9, y: 10 },
               { x: 8, y: 10 }
           ];
           direction = 'RIGHT';
           nextDirection = 'RIGHT';
           generateValidFood();
          
           if (gameLoop) clearInterval(gameLoop);
           gameLoop = setInterval(gameStep, currentSpeed);
          
           showMessage(`🐄 FASE ${fase} - ${getDifficultyByFase(fase)}! 🎉`, '#4caf50');
       }
       else if (fase === 15 && score >= 10) {
           // Vitória completa!
           if (gameLoop) clearInterval(gameLoop);
           gameLoop = null;
           isGameOver = true;
           showMessage("🏆 PARABÉNS! VOCÊ COMPLETOU TODAS AS 15 FASES! 🏆", '#ffd700');
           draw();
       }
   }
}


// Gerar comida em posição válida
function generateValidFood() {
   const maxAttempts = 2000;
  
   for (let i = 0; i < maxAttempts; i++) {
       const randX = Math.floor(Math.random() * GRID_SIZE);
       const randY = Math.floor(Math.random() * GRID_SIZE);
      
       if (!snake.some(segment => segment.x === randX && segment.y === randY)) {
           food = { x: randX, y: randY };
           return;
       }
   }
  
   // Busca linear como fallback
   for (let y = 0; y < GRID_SIZE; y++) {
       for (let x = 0; x < GRID_SIZE; x++) {
           if (!snake.some(s => s.x === x && s.y === y)) {
               food = { x, y };
               return;
           }
       }
   }
  
   // Vitória por preenchimento total
   if (gameLoop) clearInterval(gameLoop);
   isGameOver = true;
   showMessage("✨ VOCÊ PREENCHEU O CAMPO! VITÓRIA! ✨", '#ffd700');
}


// Passo do jogo (movimento)
function gameStep() {
   if (isGameOver || isPaused) return;
  
   direction = nextDirection;
  
   // Calcular nova cabeça
   let newHead = { ...snake[0] };
   switch(direction) {
       case 'RIGHT': newHead.x += 1; break;
       case 'LEFT': newHead.x -= 1; break;
       case 'UP': newHead.y -= 1; break;
       case 'DOWN': newHead.y += 1; break;
   }
  
   // Verificar colisão com parede
   if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
       gameOver();
       return;
   }
  
   // Verificar se comeu a comida
   const willEat = (newHead.x === food.x && newHead.y === food.y);
  
   // Movimento da cobra
   snake.unshift(newHead);
   if (!willEat) {
       snake.pop();
   } else {
       score++;
       updateUI();
       generateValidFood();
       checkNextFase();
      
       if (isGameOver) {
           draw();
           return;
       }
   }
  
   // Verificar colisão com o próprio corpo
   const headCollision = snake.slice(1).some(segment =>
       segment.x === snake[0].x && segment.y === snake[0].y
   );
  
   if (headCollision) {
       gameOver();
       return;
   }
  
   draw();
}


// Fim de jogo
function gameOver() {
   if (isGameOver) return;
   isGameOver = true;
  
   if (gameLoop) clearInterval(gameLoop);
   gameLoop = null;
  
   draw();
   showMessage(`💀 GAME OVER! Fase ${fase} | Terneiros: ${score} 💀`, '#f44336');
}


// Exibir mensagem temporária
let messageTimeout;
function showMessage(msg, color = '#ffd966') {
   const messageDiv = document.getElementById('gameMessage');
   messageDiv.innerHTML = msg;
   messageDiv.style.color = color;
   messageDiv.style.fontWeight = 'bold';
  
   if (messageTimeout) clearTimeout(messageTimeout);
   messageTimeout = setTimeout(() => {
       if (!isGameOver) {
           document.getElementById('gameMessage').innerHTML = '🐮 Ajude a vaca a encontrar o terneiro!';
           document.getElementById('gameMessage').style.color = '#ffd966';
       }
   }, 2500);
}


// Atualizar interface
function updateUI() {
   document.getElementById('faseNum').innerText = fase;
   document.getElementById('scoreNum').innerText = score;
  
   const nivel = getDifficultyByFase(fase);
   const nivelElement = document.getElementById('nivelTexto');
   nivelElement.innerText = nivel;
  
   // Cores por nível
   if (nivel === 'Fácil') nivelElement.style.color = '#81c784';
   else if (nivel === 'Médio') nivelElement.style.color = '#ffb74d';
   else nivelElement.style.color = '#ef5350';
}


// Desenhar o jogo
function draw() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
  
   // Desenhar grid
   ctx.strokeStyle = '#a5d6a7';
   ctx.lineWidth = 0.5;
   for (let i = 0; i <= GRID_SIZE; i++) {
       ctx.beginPath();
       ctx.moveTo(i * CELL_SIZE, 0);
       ctx.lineTo(i * CELL_SIZE, canvas.height);
       ctx.stroke();
       ctx.moveTo(0, i * CELL_SIZE);
       ctx.lineTo(canvas.width, i * CELL_SIZE);
       ctx.stroke();
   }
  
   // Desenhar a vaca (cobra)
   for (let i = 0; i < snake.length; i++) {
       const seg = snake[i];
       const x = seg.x * CELL_SIZE;
       const y = seg.y * CELL_SIZE;
       const isHead = (i === 0);
      
       // Corpo
       ctx.fillStyle = isHead ? '#f5f0d7' : '#e8d8b2';
       ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      
       // Manchas marrons
       ctx.fillStyle = '#9c6b3e';
       if (isHead) {
           ctx.fillRect(x + 5, y + 5, 6, 6);
           ctx.fillRect(x + 19, y + 5, 6, 6);
          
           // Orelhas
           ctx.fillStyle = '#c08552';
           ctx.fillRect(x + 2, y - 3, 6, 6);
           ctx.fillRect(x + CELL_SIZE - 8, y - 3, 6, 6);
          
           // Olhos
           ctx.fillStyle = '#2c1a0f';
           ctx.fillRect(x + 9, y + 9, 4, 5);
           ctx.fillRect(x + 19, y + 9, 4, 5);
          
           // Focinho
           ctx.fillStyle = '#aa7a4c';
           ctx.fillRect(x + 13, y + 18, 6, 5);
          
           // Chifres
           ctx.fillStyle = '#d6b575';
           ctx.beginPath();
           ctx.moveTo(x + 7, y + 2);
           ctx.lineTo(x + 3, y - 5);
           ctx.lineTo(x + 10, y + 2);
           ctx.fill();
           ctx.beginPath();
           ctx.moveTo(x + CELL_SIZE - 7, y + 2);
           ctx.lineTo(x + CELL_SIZE - 3, y - 5);
           ctx.lineTo(x + CELL_SIZE - 10, y + 2);
           ctx.fill();
       } else {
           // Manchas no corpo
           if (i % 2 === 0) {
               ctx.fillRect(x + 5, y + 9, 7, 7);
               ctx.fillRect(x + 18, y + 18, 6, 6);
           } else {
               ctx.fillRect(x + 14, y + 5, 6, 7);
               ctx.fillRect(x + 5, y + 19, 7, 5);
           }
       }
   }
  
   // Desenhar o Terneiro (comida)
   const fx = food.x * CELL_SIZE;
   const fy = food.y * CELL_SIZE;
  
   // Corpo do terneiro
   ctx.fillStyle = '#d4a373';
   ctx.beginPath();
   ctx.ellipse(fx + CELL_SIZE/2, fy + CELL_SIZE/2 - 3, 9, 10, 0, 0, Math.PI * 2);
   ctx.fill();
  
   // Cabeça
   ctx.fillStyle = '#f7d9a5';
   ctx.beginPath();
   ctx.ellipse(fx + CELL_SIZE/2 - 4, fy + CELL_SIZE/2 - 6, 3, 3.5, 0, 0, Math.PI * 2);
   ctx.fill();
   ctx.beginPath();
   ctx.ellipse(fx + CELL_SIZE/2 + 4, fy + CELL_SIZE/2 - 6, 3, 3.5, 0, 0, Math.PI * 2);
   ctx.fill();
  
   // Olhos
   ctx.fillStyle = '#3e2723';
   ctx.fillRect(fx + CELL_SIZE/2 - 6, fy + CELL_SIZE/2 - 7, 2, 2);
   ctx.fillRect(fx + CELL_SIZE/2 + 2, fy + CELL_SIZE/2 - 7, 2, 2);
  
   // Focinho
   ctx.fillStyle = '#5d3a1a';
   ctx.fillRect(fx + CELL_SIZE/2 - 2, fy + CELL_SIZE/2, 4, 3);
  
   // Orelhas
   ctx.fillStyle = '#b97f44';
   ctx.fillRect(fx + 3, fy + 4, 5, 4);
   ctx.fillRect(fx + CELL_SIZE - 8, fy + 4, 5, 4);
  
   // Ícone de terneiro
   ctx.font = `${CELL_SIZE - 8}px "Segoe UI"`;
   ctx.fillStyle = '#8b5e3c';
   ctx.fillText("🐮", fx + 8, fy + CELL_SIZE - 8);
  
   // Mensagens de estado
   if (isGameOver) {
       ctx.fillStyle = 'rgba(0,0,0,0.8)';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = '#ffecb3';
       ctx.font = 'bold 28px "Segoe UI"';
       ctx.textAlign = 'center';
       ctx.fillText('💀 FIM DE JOGO 💀', canvas.width/2, canvas.height/2 - 20);
       ctx.font = '16px Arial';
       ctx.fillStyle = '#ffd966';
       ctx.fillText('Clique em "RECOMEÇAR"', canvas.width/2, canvas.height/2 + 30);
       ctx.textAlign = 'left';
   } else if (isPaused) {
       ctx.fillStyle = 'rgba(0,0,0,0.6)';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = 'white';
       ctx.font = 'bold 32px Arial';
       ctx.textAlign = 'center';
       ctx.fillText('⏸ PAUSADO', canvas.width/2, canvas.height/2);
       ctx.textAlign = 'left';
   }
}


// Controles do teclado
function handleKey(e) {
   if (isGameOver) return;
  
   const key = e.key;
   if (key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
   else if (key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
   else if (key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
   else if (key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
   else if (key === ' ' || key === 'Space') {
       e.preventDefault();
       togglePause();
   }
}


// Pausar/Retomar
function togglePause() {
   if (isGameOver) return;
  
   isPaused = !isPaused;
   const pBtn = document.getElementById('pausarBtn');
   pBtn.innerHTML = isPaused ? '<span>▶️</span> INICIAR' : '<span>⏸️</span> PAUSAR';
   draw();
  
   if (!isPaused && !isGameOver) {
       if (gameLoop) clearInterval(gameLoop);
       gameLoop = setInterval(gameStep, currentSpeed);
   } else if (isPaused && gameLoop) {
       clearInterval(gameLoop);
       gameLoop = null;
   }
}


// Controles mobile
function setupMobileControls() {
   const buttons = document.querySelectorAll('.mobile-btn');
   buttons.forEach(btn => {
       btn.addEventListener('click', (e) => {
           if (isGameOver || isPaused) return;
           const dir = btn.getAttribute('data-dir');
           if (dir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
           else if (dir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
           else if (dir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
           else if (dir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
       });
   });
  
   // Swipe para mobile
   let touchStart = null;
   canvas.addEventListener('touchstart', (e) => {
       e.preventDefault();
       const rect = canvas.getBoundingClientRect();
       const touch = e.touches[0];
       touchStart = {
           x: touch.clientX - rect.left,
           y: touch.clientY - rect.top
       };
   });
  
   canvas.addEventListener('touchend', (e) => {
       if (!touchStart || isGameOver || isPaused) return;
       const rect = canvas.getBoundingClientRect();
       const endX = e.changedTouches[0].clientX - rect.left;
       const endY = e.changedTouches[0].clientY - rect.top;
       const dx = endX - touchStart.x;
       const dy = endY - touchStart.y;
      
       if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      
       if (Math.abs(dx) > Math.abs(dy)) {
           if (dx > 0 && direction !== 'LEFT') nextDirection = 'RIGHT';
           else if (dx < 0 && direction !== 'RIGHT') nextDirection = 'LEFT';
       } else {
           if (dy > 0 && direction !== 'UP') nextDirection = 'DOWN';
           else if (dy < 0 && direction !== 'DOWN') nextDirection = 'UP';
       }
       touchStart = null;
   });
}


// Inicialização
window.addEventListener('load', () => {
   initGame(true);
   window.addEventListener('keydown', handleKey);
   document.getElementById('reiniciarBtn').addEventListener('click', () => {
       if (gameLoop) clearInterval(gameLoop);
       fullRestart();
       draw();
   });
   document.getElementById('pausarBtn').addEventListener('click', togglePause);
   setupMobileControls();
   draw();
});
