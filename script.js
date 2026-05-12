const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let currentInput = '';
let justEvaluated = false;

const MAX_DIGITS = 16;

function shrinkText() {
  const display = document.querySelector('.display');
  const maxWidth = display.clientWidth - 32;
  resultEl.style.fontSize = '28px';
  if (resultEl.scrollWidth <= maxWidth) return;
  let size = 28;
  while (resultEl.scrollWidth > maxWidth && size > 10) {
    size -= 1;
    resultEl.style.fontSize = size + 'px';
  }
}

function formatWithCommas(value) {
  const str = String(value);
  const [integer, decimal] = str.split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? formatted + '.' + decimal : formatted;
}

function getDigitCount(input) {
  const parts = input.split(/[\+\-\*\/]/);
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/\./g, '').length;
}

function updateDisplay(expr, res) {
  expressionEl.textContent = expr;
  resultEl.textContent = res;
  shrinkText();
}

function formatExpression(expr) {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷');
}

function getFirstNum(input) {
  const match = input.match(/^-?[\d.]*/);
  return match ? parseFloat(match[0]) : 0;
}

function getOperator(input) {
  const match = input.match(/[\+\-\*\/](?=[\d\.])/);
  return match ? match[0] : '';
}

function getLastNum(input) {
  const parts = input.split(/(?<=[0-9])[\+\-\*\/]/);
  return parts[parts.length - 1];
}

function buildTopDisplay(input) {
  const firstNum = getFirstNum(input);
  const op = getOperator(input);
  if (!op) return '';
  return formatWithCommas(firstNum) + ' ' + formatExpression(op);
}

// Number / decimal buttons
document.querySelectorAll('.btn[data-value]').forEach(btn => {
  const val = btn.getAttribute('data-value');
  if (['+', '-', '*', '/'].includes(val)) return;

  btn.addEventListener('click', () => {
    if (justEvaluated) {
      currentInput = '';
      justEvaluated = false;
    }

    if (val !== '.' && getDigitCount(currentInput) >= MAX_DIGITS) return;

    if (val === '.') {
      const lastNum = getLastNum(currentInput);
      if (lastNum.includes('.')) return;
      if (lastNum === '') currentInput += '0';
    }

    currentInput += val;

    const op = getOperator(currentInput);
    const lastNum = getLastNum(currentInput);

    if (op) {
      const displayBottom = lastNum === '' || lastNum === '-'
        ? '0'
        : formatWithCommas(lastNum);
      updateDisplay(buildTopDisplay(currentInput), displayBottom);
    } else {
      const displayResult = lastNum === '' ? '0' : formatWithCommas(lastNum);
      updateDisplay('', displayResult);
    }
  });
});

// Operator buttons
document.querySelectorAll('.btn[data-value]').forEach(btn => {
  const val = btn.getAttribute('data-value');
  if (!['+', '-', '*', '/'].includes(val)) return;

  btn.addEventListener('click', () => {
    justEvaluated = false;

    if (currentInput === '' && val === '-') {
      currentInput = '-';
      updateDisplay('', '-');
      return;
    }

    if (currentInput === '') return;

    const lastChar = currentInput.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
      currentInput = currentInput.slice(0, -1);
    }

    currentInput += val;

    const firstNum = getFirstNum(currentInput);
    updateDisplay(formatWithCommas(firstNum) + ' ' + formatExpression(val), '0');
  });
});

// Equals
document.getElementById('equals').addEventListener('click', () => {
  if (currentInput === '') return;

  try {
    const expr = currentInput;
    const evaluated = Function('"use strict"; return (' + expr + ')')();

    if (!isFinite(evaluated)) {
      updateDisplay(buildTopDisplay(expr) + ' ' + getLastNum(expr) + ' =', 'Error');
      currentInput = '';
      justEvaluated = true;
      return;
    }

    const rounded = parseFloat(evaluated.toFixed(10));

    if (Math.abs(rounded) >= 1e16) {
      updateDisplay(buildTopDisplay(expr), 'Overflow');
      currentInput = '';
      justEvaluated = true;
      return;
    }

    const firstNum = getFirstNum(expr);
    const op = getOperator(expr);
    const lastNum = getLastNum(expr);
    const topDisplay = formatWithCommas(firstNum) + ' ' + formatExpression(op) + ' ' + formatWithCommas(lastNum) + ' =';

    updateDisplay(topDisplay, formatWithCommas(rounded));
    currentInput = String(rounded);
    justEvaluated = true;
  } catch {
    updateDisplay('', 'Error');
    currentInput = '';
    justEvaluated = true;
  }
});

// AC
document.getElementById('ac').addEventListener('click', () => {
  currentInput = '';
  justEvaluated = false;
  updateDisplay('', '0');
});

// DEL
document.getElementById('del').addEventListener('click', () => {
  if (justEvaluated) {
    currentInput = '';
    justEvaluated = false;
    updateDisplay('', '0');
    return;
  }

  currentInput = currentInput.slice(0, -1);

  const op = getOperator(currentInput);
  const lastNum = getLastNum(currentInput);

  if (currentInput === '') {
    updateDisplay('', '0');
  } else if (op) {
    const displayBottom = lastNum === '' ? '0' : formatWithCommas(lastNum);
    updateDisplay(buildTopDisplay(currentInput), displayBottom);
  } else {
    updateDisplay('', formatWithCommas(lastNum) || '0');
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    document.querySelector(`.btn[data-value="${e.key}"]`)?.click();
  } else if (e.key === '.') {
    document.querySelector('.btn[data-value="."]')?.click();
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    document.querySelector(`.btn[data-value="${e.key}"]`)?.click();
  } else if (e.key === 'Enter' || e.key === '=') {
    document.getElementById('equals').click();
  } else if (e.key === 'Backspace') {
    document.getElementById('del').click();
  } else if (e.key === 'Escape') {
    document.getElementById('ac').click();
  }
});