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
});