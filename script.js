
        let currentExpression = '';
        let calculationHistory = [];

        function updateDisplay() {
            document.getElementById('expression').textContent = currentExpression;
            document.getElementById('result').textContent = '';
        }
        
        function appendNumber(number) {
            currentExpression += number;
            updateDisplay();
        }
        
        function appendOperation(operation) {
            if (operation === '±') {
                if (currentExpression.charAt(0) === '-') {
                    currentExpression = currentExpression.substring(1);
                } else {
                    currentExpression = '-' + currentExpression;
                }
            } else if (operation === '√') {
                currentExpression = `Math.sqrt(${currentExpression})`;
                calculate();
            } else if (operation === '^') {
                currentExpression += '^';
            } else {
                currentExpression += operation;
            }
            updateDisplay();
        }
        
        function appendTrig(func) {
            const trigMap = {
                'sin': 'Math.sin',
                'cos': 'Math.cos',
                'tan': 'Math.tan',
                'asin': 'Math.asin',
                'acos': 'Math.acos',
                'atan': 'Math.atan'
            };
            
            if (currentExpression) {
                currentExpression = `${trigMap[func]}(${currentExpression})`;
            } else {
                currentExpression = `${trigMap[func]}( `;
            }
            updateDisplay();
        }
        
        function appendLog(func) {
            if (func === 'log') {
                currentExpression = `Math.log10(${currentExpression})`;
            } else {
                currentExpression = `Math.log(${currentExpression})`;
            }
            calculate();
        }
        
        function insertConstant(constant) {
            currentExpression += (constant === 'π') ? 'Math.PI' : 'Math.E';
            updateDisplay();
        }
        
        function appendDecimal() {
            if (!currentExpression.includes('.')) {
                currentExpression += '.';
                updateDisplay();
            }
        }
        
        function clearDisplay() {
            currentExpression = '';
            updateDisplay();
        }
        
        function backspace() {
            currentExpression = currentExpression.slice(0, -1);
            updateDisplay();
        }

        function factorial(n) {
            if (n === 0 || n === 1) return 1;
            if (n > 170) return Infinity;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        }
        
        function isValidExpression(expr) {
            try {
                new Function(`return ${expr}`);
                return true;
            } catch {
                return false;
            }
        }

        function calculate() {
            if (!currentExpression) return;
            
            let expression = currentExpression;
            expression = expression.replace(/\^/g, "**")
                                  .replace(/Math\.PI/g, Math.PI.toString())
                                  .replace(/Math\.E/g, Math.E.toString());
            
            if (expression.includes('!')) {
                const num = parseFloat(expression.replace('!', ''));
                if (isNaN(num)) {
                    document.getElementById('result').textContent = 'Erreur';
                    return;
                }
                const result = factorial(num);
                addToHistory(expression, result);
                currentExpression = result.toString();
                document.getElementById('result').textContent = result;
                return;
            }

            if (/[a-zA-Z]/.test(expression) && !expression.includes('Math')) {
                document.getElementById('result').textContent = 'Erreur';
                return;
            }

            if (!isValidExpression(expression)) {
                document.getElementById('result').textContent = 'Erreur';
                return;
            }
            
            try {
                const result = new Function(`return ${expression}`)();
                const formattedResult = parseFloat(result.toFixed(10));
                addToHistory(currentExpression, formattedResult);
                currentExpression = formattedResult.toString();
                document.getElementById('result').textContent = formattedResult;
            } catch (error) {
                document.getElementById('result').textContent = 'Erreur';
            }
        }
        
        function addToHistory(expression, result) {
            calculationHistory.unshift({ expression, result });
            renderHistory();
        }
        
        function renderHistory() {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';
            
            calculationHistory.slice(0, 20).forEach(entry => {
                const historyEntry = document.createElement('div');
                historyEntry.className = 'history-entry';
                historyEntry.innerHTML = `
                    <div class="history-expression">${entry.expression}</div>
                    <div class="history-result">= ${entry.result}</div>
                `;
                historyEntry.addEventListener('click', () => {
                    currentExpression = entry.expression;
                    updateDisplay();
                });
                historyList.appendChild(historyEntry);
            });
        }
        
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            document.getElementById('themeToggle').textContent = 
                document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
            if (e.key === '.') appendDecimal();
            if (['+', '-', '*', '/', '%'].includes(e.key)) appendOperation(e.key);
            if (e.key === 'Enter' || e.key === '=') calculate();
            if (e.key === 'Escape') clearDisplay();
            if (e.key === 'Backspace') backspace();
        });

        updateDisplay();