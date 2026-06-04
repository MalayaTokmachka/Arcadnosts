// ==========================================
//  ВСПЛЫВАЮЩЕЕ ОКНО
// ==========================================

function showOverlay(win, emoji, title, sub, onRetry) {
  document.getElementById('overlay-emoji').textContent = emoji;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-sub').textContent   = sub;

  var box = document.getElementById('overlay-box');
  box.className = 'overlay-box ' + (win ? '' : 'lose-box');

  var btn = document.getElementById('overlay-btn');
  btn.style.background = win ? '#00c8ff' : '#33ff44';
  btn.style.color = '#000';

  btn.onclick = function() {
    closeOverlay();
    onRetry();
  };

  document.getElementById('overlay').classList.add('show');
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('show');
}


// ==========================================
//  ЗМЕЙКА
// ==========================================

var CELL = 20;
var COLS = 20;
var ROWS = 20;

var snake;
var dir;
var nextDir;
var food;
var snakeRunning;
var snakeInterval;
var snakeBest   = 0;
var snakePoints = 0;

function initSnake() {
  var canvas = document.getElementById('snake-canvas');
  canvas.width  = COLS * CELL;
  canvas.height = ROWS * CELL;

  snake        = [{ x: 10, y: 10 }];
  dir          = { x: 1, y: 0 };
  nextDir      = { x: 1, y: 0 };
  food         = randomFood();
  snakePoints  = 0;
  snakeRunning = false;

  document.getElementById('snake-score').textContent  = 0;
  document.getElementById('snake-status').textContent = 'Нажми ПРОБЕЛ или СТАРТ';
  drawSnake();
}

function stopSnake() {
  clearInterval(snakeInterval);
  snakeRunning = false;
}

function startSnake() {
  stopSnake();

  snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food    = randomFood();
  snakePoints = 0;

  document.getElementById('snake-score').textContent  = 0;
  document.getElementById('snake-status').textContent = 'Управление: стрелки / WASD';

  snakeRunning  = true;
  snakeInterval = setInterval(snakeTick, 200);
}

function randomFood() {
  var f;
  do {
    f = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake && snake.some(function(s) { return s.x === f.x && s.y === f.y; }));
  return f;
}

function snakeDir(dx, dy) {
  if (dx === 1  && dir.x === -1) return;
  if (dx === -1 && dir.x ===  1) return;
  if (dy === 1  && dir.y === -1) return;
  if (dy === -1 && dir.y ===  1) return;

  nextDir = { x: dx, y: dy };

  if (!snakeRunning) startSnake();
}

document.addEventListener('keydown', function(e) {
  var keyMap = {
    'ArrowUp':    [0, -1],
    'ArrowDown':  [0,  1],
    'ArrowLeft':  [-1, 0],
    'ArrowRight': [1,  0],
    'w': [0, -1], 'W': [0, -1],
    's': [0,  1], 'S': [0,  1],
    'a': [-1, 0], 'A': [-1, 0],
    'd': [1,  0], 'D': [1,  0]
  };

  if ((e.key === ' ' || e.key === 'Enter') && !snakeRunning) {
    startSnake();
  }

  if (keyMap[e.key]) {
    snakeDir(keyMap[e.key][0], keyMap[e.key][1]);
    e.preventDefault();
  }
});

function snakeTick() {
  dir = { x: nextDir.x, y: nextDir.y };

  var head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  var hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
  var hitSelf = snake.some(function(s) { return s.x === head.x && s.y === head.y; });

  if (hitWall || hitSelf) {
    clearInterval(snakeInterval);
    snakeRunning = false;

    if (snakePoints > snakeBest) {
      snakeBest = snakePoints;
      document.getElementById('snake-best').textContent = snakeBest;
    }

    document.getElementById('snake-status').textContent = 'ИГРА ОКОНЧЕНА!';
    showOverlay(false, '💀', 'КОНЕЦ ИГРЫ!', 'Счёт: ' + snakePoints, startSnake);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakePoints += 10;
    document.getElementById('snake-score').textContent = snakePoints;
    food = randomFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  var canvas = document.getElementById('snake-canvas');
  var ctx    = canvas.getContext('2d');

  ctx.fillStyle = '#021002';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#0a1a0a';
  ctx.lineWidth   = 0.5;
  for (var x = 0; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (var y = 0; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }

  ctx.fillStyle = '#ff4d8d';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach(function(seg, i) {
    ctx.fillStyle = (i === 0) ? '#33ff44' : '#22aa33';
    ctx.fillRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4);
  });
}

// Запуск
initSnake();
