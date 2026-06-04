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
  btn.style.background = win ? '#00c8ff' : '#ff4d8d';
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
//  КРЕСТИКИ-НОЛИКИ
// ==========================================

var tttBoard;
var tttCurrent;
var tttGameOver;
var tttMode = 'pvp';
var tttScores = { X: 0, O: 0, D: 0 };

function initTTT() {
  tttBoard    = ['', '', '', '', '', '', '', '', ''];
  tttCurrent  = 'X';
  tttGameOver = false;
  renderTTTBoard();
  updateTTTStatus();
}

function setTTTMode(m) {
  tttMode = m;
  document.getElementById('ttt-pvp').classList.toggle('active', m === 'pvp');
  document.getElementById('ttt-ai').classList.toggle('active',  m === 'ai');
  initTTT();
}

function resetTTT() {
  initTTT();
}

function renderTTTBoard() {
  var board = document.getElementById('ttt-board');
  board.innerHTML = '';

  for (var i = 0; i < 9; i++) {
    var cell = document.createElement('div');
    cell.className = 'ttt-cell';

    if (tttBoard[i] === 'X') cell.classList.add('x');
    if (tttBoard[i] === 'O') cell.classList.add('o');

    cell.textContent = tttBoard[i];

    cell.onclick = (function(idx) {
      return function() { tttClick(idx); };
    })(i);

    board.appendChild(cell);
  }
}

function updateTTTStatus() {
  var who = tttCurrent === 'X' ? '✕ Ход крестиков' : '○ Ход ноликов';
  var aiHint = (tttMode === 'ai' && tttCurrent === 'O') ? ' (ИИ думает...)' : '';
  document.getElementById('ttt-status').textContent = who + aiHint;
}

function tttClick(i) {
  if (tttGameOver)        return;
  if (tttBoard[i] !== '') return;
  if (tttMode === 'ai' && tttCurrent === 'O') return;

  tttMakeMove(i);
}

function tttMakeMove(i) {
  tttBoard[i] = tttCurrent;
  renderTTTBoard();

  var result = checkTTT();
  if (result) {
    finishTTT(result);
    return;
  }

  tttCurrent = (tttCurrent === 'X') ? 'O' : 'X';
  updateTTTStatus();

  if (tttMode === 'ai' && tttCurrent === 'O' && !tttGameOver) {
    setTimeout(function() {
      var move = getBestTTTMove();
      if (move !== -1) tttMakeMove(move);
    }, 400);
  }
}

function checkTTT() {
  var lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (var k = 0; k < lines.length; k++) {
    var a = lines[k][0], b = lines[k][1], c = lines[k][2];
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[b] === tttBoard[c]) {
      return { winner: tttBoard[a], line: lines[k] };
    }
  }

  if (tttBoard.every(function(v) { return v !== ''; })) {
    return { winner: 'D' };
  }

  return null;
}

function finishTTT(result) {
  tttGameOver = true;

  if (result.winner !== 'D' && result.line) {
    var cells = document.getElementById('ttt-board').children;
    result.line.forEach(function(idx) {
      cells[idx].classList.add('win');
    });
  }

  if (result.winner === 'X') {
    tttScores.X++;
    document.getElementById('ttt-score-x').textContent = tttScores.X;
    showOverlay(true, '🏆', 'ПОБЕДА!', 'Крестики выиграли!', resetTTT);

  } else if (result.winner === 'O') {
    tttScores.O++;
    document.getElementById('ttt-score-o').textContent = tttScores.O;
    if (tttMode === 'ai') {
      showOverlay(false, '🤖', 'ИИ ПОБЕДИЛ!', 'ИИ победил!', resetTTT);
    } else {
      showOverlay(true, '🏆', 'ПОБЕДА!', 'Нолики выиграли!', resetTTT);
    }

  } else {
    tttScores.D++;
    document.getElementById('ttt-score-d').textContent = tttScores.D;
    showOverlay(true, '🤝', 'НИЧЬЯ!', 'Равная игра!', resetTTT);
  }
}

function getBestTTTMove() {
  var bestScore = -Infinity;
  var bestMove  = -1;

  for (var i = 0; i < 9; i++) {
    if (tttBoard[i] === '') {
      tttBoard[i] = 'O';
      var score = minimax(tttBoard, 0, false);
      tttBoard[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove  = i;
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMax) {
  var res = checkTTT();
  if (res) {
    if (res.winner === 'O') return 10 - depth;
    if (res.winner === 'X') return depth - 10;
    return 0;
  }

  if (isMax) {
    var best = -Infinity;
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = '';
      }
    }
    return best;

  } else {
    var best = Infinity;
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = '';
      }
    }
    return best;
  }
}

// Запуск
initTTT();
