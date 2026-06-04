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
  btn.style.color = win ? '#000' : '#fff';

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
//  САПЁР
// ==========================================

var MS_CONFIGS = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 13, cols: 13, mines: 30 },
  hard:   { rows: 16, cols: 16, mines: 50 }
};

var msDiff    = 'easy';
var msBoard;
var msRevealed;
var msFlagged;
var msMines;
var msRows;
var msCols;
var msStarted = false;
var msTimer   = 0;
var msTimerInterval = null;

function setDiff(d) {
  msDiff = d;
  ['easy', 'medium', 'hard'].forEach(function(x) {
    document.getElementById('diff-' + x).classList.toggle('active', x === d);
  });
  initMS();
}

function initMS() {
  clearInterval(msTimerInterval);

  var cfg  = MS_CONFIGS[msDiff];
  msRows   = cfg.rows;
  msCols   = cfg.cols;
  msMines  = cfg.mines;

  var total  = msRows * msCols;
  msBoard    = new Array(total).fill(0);
  msRevealed = new Array(total).fill(false);
  msFlagged  = new Array(total).fill(false);

  msStarted = false;
  msTimer   = 0;

  document.getElementById('ms-mines').textContent  = msMines;
  document.getElementById('ms-flags').textContent  = 0;
  document.getElementById('ms-time').textContent   = 0;
  document.getElementById('ms-status').textContent = 'Левый клик — открыть, правый — флаг';

  renderMSBoard();
}

function placeMines(firstIdx) {
  var placed = 0;
  while (placed < msMines) {
    var r = Math.floor(Math.random() * msRows * msCols);
    if (r !== firstIdx && msBoard[r] !== -1) {
      msBoard[r] = -1;
      placed++;
    }
  }

  for (var i = 0; i < msRows * msCols; i++) {
    if (msBoard[i] !== -1) {
      msBoard[i] = getNeighbors(i).filter(function(n) { return msBoard[n] === -1; }).length;
    }
  }
}

function getNeighbors(i) {
  var row = Math.floor(i / msCols);
  var col = i % msCols;
  var result = [];

  for (var dr = -1; dr <= 1; dr++) {
    for (var dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      var nr = row + dr;
      var nc = col + dc;
      if (nr >= 0 && nr < msRows && nc >= 0 && nc < msCols) {
        result.push(nr * msCols + nc);
      }
    }
  }

  return result;
}

function msReveal(i) {
  if (msRevealed[i] || msFlagged[i]) return;

  if (!msStarted) {
    placeMines(i);
    msStarted = true;
    msTimerInterval = setInterval(function() {
      msTimer++;
      document.getElementById('ms-time').textContent = msTimer;
    }, 1000);
  }

  msRevealed[i] = true;

  if (msBoard[i] === -1) {
    clearInterval(msTimerInterval);
    for (var j = 0; j < msBoard.length; j++) {
      if (msBoard[j] === -1) msRevealed[j] = true;
    }
    renderMSBoard();
    document.getElementById('ms-status').textContent = '💥 ВЗРЫВ! ИГРА ОКОНЧЕНА';
    showOverlay(false, '💥', 'Бах!', 'Вы наступили на мину!', initMS);
    return;
  }

  if (msBoard[i] === 0) {
    getNeighbors(i).forEach(function(n) {
      if (!msRevealed[n]) msReveal(n);
    });
  }

  renderMSBoard();
  checkMSWin();
}

function msFlag(i) {
  if (msRevealed[i]) return;
  msFlagged[i] = !msFlagged[i];
  document.getElementById('ms-flags').textContent = msFlagged.filter(Boolean).length;
  renderMSBoard();
}

function checkMSWin() {
  var allSafe = msRevealed.every(function(revealed, i) {
    return revealed || msBoard[i] === -1;
  });

  if (allSafe) {
    clearInterval(msTimerInterval);
    document.getElementById('ms-status').textContent = '🏆 ПОБЕДА! Время: ' + msTimer + 'с';
    showOverlay(true, '🏆', 'ПОБЕДА!', 'Все мины найдены за ' + msTimer + ' сек!', initMS);
  }
}

function renderMSBoard() {
  var board = document.getElementById('ms-board');
  board.style.gridTemplateColumns = 'repeat(' + msCols + ', 1fr)';
  board.innerHTML = '';

  var longPressTimer;

  for (var i = 0; i < msRows * msCols; i++) {
    var cell = document.createElement('div');
    cell.className = 'ms-cell';

    if (!msRevealed[i]) {
      cell.classList.add(msFlagged[i] ? 'flagged' : 'covered');
    } else if (msBoard[i] === -1) {
      cell.classList.add('revealed', 'mine');
    } else {
      cell.classList.add('revealed');
      if (msBoard[i] > 0) {
        cell.textContent = msBoard[i];
        cell.dataset.n   = msBoard[i];
      }
    }

    cell.addEventListener('click', (function(idx) {
      return function(e) {
        e.preventDefault();
        if (!msFlagged[idx] || msRevealed[idx]) msReveal(idx);
      };
    })(i));

    cell.addEventListener('contextmenu', (function(idx) {
      return function(e) {
        e.preventDefault();
        if (!msRevealed[idx]) msFlag(idx);
      };
    })(i));

    cell.addEventListener('touchstart', (function(idx) {
      return function() {
        longPressTimer = setTimeout(function() {
          if (!msRevealed[idx]) msFlag(idx);
        }, 500);
      };
    })(i), { passive: true });

    cell.addEventListener('touchend',  function() { clearTimeout(longPressTimer); }, { passive: true });
    cell.addEventListener('touchmove', function() { clearTimeout(longPressTimer); }, { passive: true });

    board.appendChild(cell);
  }
}

// Запуск
initMS();
