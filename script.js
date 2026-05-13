const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let currentInput = '';
let justEvaluated = false;

const operators = ['+', '-', '*', '/'];

function formatWithCommas(value) {
  const str = String(value);
  const [integer, decimal] = str.split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? formatted + '.' + decimal : formatted;
}

function getDigitCount(input) {
  const parts = input.split(/[+\-*/]/);
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/\./g, '').length;
}

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

function setActiveOperator(op) {
  document.querySelectorAll('.op-indicator').forEach(el => {
    el.classList.remove('active');
  });

  const map = {
    '+': 'ind-add',
    '-': 'ind-subtract',
    '*': 'ind-multiply',
    '/': 'ind-divide'
  };

  if (op && map[op]) {
    document.getElementById(map[op]).classList.add('active');
  }
}

function formatExpression(input) {
  const parts = input.split(/([+\-*/])/);
  return parts.map(part => {
    if (operators.includes(part)) return ' ' + part + ' ';
    if (part === '') return '';
    return formatWithCommas(parseFloat(part));
  }).join('');
}

function scrollExpression() {
  expressionEl.scrollLeft = expressionEl.scrollWidth;
}

document.querySelectorAll('.btn[data-value]').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');

    if (justEvaluated && !operators.includes(val)) {
      currentInput = '';
      justEvaluated = false;
      setActiveOperator(null);
    }

    justEvaluated = false;

    const lastChar = currentInput.slice(-1);

    if (operators.includes(val) && currentInput === '' && val !== '-') return;

    if (operators.includes(val) && operators.includes(lastChar)) return;

    if (val === '.') {
      const parts = currentInput.split(/[+\-*/]/);
      const lastNum = parts[parts.length - 1];
      if (lastNum.includes('.')) return;
    }

    if (val !== '.' && getDigitCount(currentInput) >= 16) return;

    currentInput += val;

    if (operators.includes(val)) {
      setActiveOperator(val);
    }

    expressionEl.textContent = '';
    const lastNum = currentInput.split(/[+\-*/]/).pop();
    resultEl.textContent = lastNum ? formatWithCommas(lastNum) : '0';
    shrinkText();
  });
});

// AC - clears everything
document.getElementById('ac').addEventListener('click', () => {
  currentInput = '';
  resultEl.textContent = '0';
  expressionEl.textContent = '';
  setActiveOperator(null);
  shrinkText();
});

// DEL - removes last character
document.getElementById('del').addEventListener('click', () => {
  currentInput = currentInput.slice(0, -1);
  const lastNum = currentInput.split(/[+\-*/]/).pop();
  resultEl.textContent = lastNum ? formatWithCommas(lastNum) : '0';
  shrinkText();
});

// EQUALS - evaluates the expression
document.getElementById('equals').addEventListener('click', () => {
  if (currentInput === '') return;

  try {
    const result = Function('"use strict"; return (' + currentInput + ')')();

    if (!isFinite(result)) {
      expressionEl.textContent = formatExpression(currentInput) + ' =';
      scrollExpression();
      resultEl.textContent = 'Error';
      currentInput = '';
      justEvaluated = true;
      setActiveOperator(null);
      return;
    }

    if (Math.abs(result) >= 1e16) {
      expressionEl.textContent = formatExpression(currentInput) + ' =';
      scrollExpression();
      resultEl.textContent = 'Overflow';
      currentInput = '';
      justEvaluated = true;
      setActiveOperator(null);
      return;
    }

    const rounded = parseFloat(result.toFixed(10));
    expressionEl.textContent = formatExpression(currentInput) + ' =';
    scrollExpression();
    resultEl.textContent = formatWithCommas(rounded);
    currentInput = String(rounded);
    justEvaluated = true;
    setActiveOperator(null);
    shrinkText();
  } catch {
    expressionEl.textContent = '';
    resultEl.textContent = 'Error';
    currentInput = '';
    setActiveOperator(null);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    document.querySelector(`.btn[data-value="${e.key}"]`)?.click();
  } else if (e.key === '.') {
    document.querySelector('.btn[data-value="."]')?.click();
  } else if (operators.includes(e.key)) {
    document.querySelector(`.btn[data-value="${e.key}"]`)?.click();
  } else if (e.key === 'Enter' || e.key === '=') {
    document.getElementById('equals').click();
  } else if (e.key === 'Backspace') {
    document.getElementById('del').click();
  } else if (e.key === 'Escape') {
    document.getElementById('ac').click();
  }
});