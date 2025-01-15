function detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('k-meleon') !== -1) {
        console.log('Вы используете k-meleon');
        return 'kmeleon';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const browser = detectBrowser();
    if (browser === 'kmeleon') {
        const calculatorForm = document.getElementById('calculatorForm');
        const message = document.getElementById('planet');
        const warningBlock = document.createElement('div');
        
        warningBlock.className = 'calculator-form';
        warningBlock.innerHTML = `
            <div class="result-text " style="text-align: center;">
                Извините, но ваш браузер K-Meleon не работает корректно!<br>
                <span class="result-text-small">
                    Пожалуйста, используйте другой браузер, например:<br>
                    - Google Chrome<br>
                    - Яндекс Браузер<br>
                    - Mozilla Firefox<br>
                    - Microsoft Edge
                </span>
            </div>
        `;
        
        if (message) message.innerHTML = '';
        
        calculatorForm.parentNode.replaceChild(warningBlock, calculatorForm);
        
        const statsButton = document.getElementById('statsButton');
        if (statsButton) {
            statsButton.style.display = 'none';
        }
        
    }
    else {
        importantText();
    }
});

// Important text title!
function importantText() {
    const importantText = document.querySelector('.highlight-text-title');
    const letters = importantText.innerText.split('');
    importantText.innerHTML = '';

    const firstFadeIndexes = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18];
    const firstDelay = 2000;
    const SecondDelay = 4000;

    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.classList.add('highlight-title');
        importantText.appendChild(span);

        if (firstFadeIndexes.includes(index)) {
            setTimeout(() => {
                span.classList.add('faded-title');
            }, firstDelay);
        } else {
            setTimeout(() => {
                span.classList.add('faded-title');
            }, SecondDelay);
        }
    });

    setTimeout(() => {
        importantText.classList.add('disappear-title');
    }, SecondDelay);
}