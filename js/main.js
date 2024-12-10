document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    const loadingTimeout = setTimeout(() => {
        const timeoutBlock = document.getElementById('result');
        timeoutBlock.innerHTML = `
            <div class="result-text">
                Запрос выполняется дольше обычного...<br>
                Возможно, интернет соединение слабое или сервер игры отключен...
            </div>
        `;
        timeoutBlock.classList.remove('hidden');
    }, 7000);
 
    let currentLevel = 0;
    let nextLevel = 0;
    let requiredXP = 0;

    try {
        let data = await getData(document.getElementById('numberInput').value);
        clearTimeout(loadingTimeout);
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');
        console.log(data);
        
        if (!data || data === 'errorMessage') {
            throw new Error();
        } 

        const resultBlock = document.getElementById('result');
        if (data.exp >= 66045137) {
            const resultHTML = `
                <div class="result-text">
                    Игрок ${data.vip_info.vip_exist !== 0 ? `
                        <span class="vip-color-${data.vip_info.vip_color}">${data.name}</span>
                    ` : data.moderator > 0 ? `
                        <span class="moderator-color">${data.name}</span>
                    ` : `
                        ${data.name} 
                    `}
                    достиг максимального уровня!) <br>
                    <div class="result-additional">
                        Игрок набрал больше на ${(data.exp - 66045137).toLocaleString()} XP от максимального уровня.
                    </div><br>
                    <div class="result-additional">
                        Общий опыт: ${(data.exp).toLocaleString()}
                    </div><br>
                    <div class="result-additional">
                        <a class="header-link" href="${data.person_info.profile}" target="_blank">${data.person_info.profile}</a>
                        <button class="copy-button-profile" data-copy="${data.person_info.profile}">Копировать</button>
                    </div>
                    <div class="result-additional">~ Xorek</div>
                </div>
            `;
            resultBlock.innerHTML = resultHTML;
            resultBlock.classList.remove('hidden');
            return;
        } else {
            for (let level in levelRequirements) {
                let xp = levelRequirements[level];
                if (data.exp < xp) {
                    nextLevel = parseInt(level);
                    requiredXP = xp;
                    currentLevel = nextLevel - 1;
                    break;
                }
            }
        }

        let remainingXP = requiredXP - data.exp;
        const resultHTML = `
            <div class="result-text">
                ${data.vip_info.vip_exist !== 0 ? `
                    <span class="vip-color-${data.vip_info.vip_color}">${data.name}</span>
                ` : data.moderator > 0 ? `
                    <span class="moderator-color">${data.name}</span>
                ` : `
                    ${data.name} 
                `}
                | Текущий уровень: ${data.level} <br>
                ${data.moderator == 1 ? `
                    <div class="result-additional warning-color">
                        Внимание! Игрок является модератором чата!
                    </div>
                ` : ``}
                ${data.uid == 2640274 ? `
                    <div class="result-additional">
                        Мрак, епта!
                    </div>
                ` : ``}
                ${data.uid == 20637878 ? `
                    <div class="result-additional">
                        Самая лучшая девочка!
                    </div>
                ` : ``}
                ${data.uid == 19198621 ? `
                    <div class="result-additional">
                        ${data.name} лучший качер!
                    </div>
                ` : ``}
            </div>
            <div class="result-additional">
                До ${nextLevel} уровня осталось: ${remainingXP.toLocaleString()} XP
                <button class="copy-button" data-copy="${remainingXP.toLocaleString()}">Копировать</button>
            </div><br>
            <div class="result-additional">
                ${data.person_info.profile == null || data.person_info.profile == '' ? `
                    <div class="result-additional">
                        Профиль не найден...
                    </div>
                    ` : `
                    <a class="header-link" href="${data.person_info.profile}" target="_blank">${data.person_info.profile}</a>
                    <button class="copy-button-profile" data-copy="${data.person_info.profile}">Копировать</button>
                `} 
            </div><br>
            <div class="result-additional">
                До 200-го уровня осталось: ${(66045137 - data.exp).toLocaleString()} XP
            </div><br>
            <div class="result-additional">
                Общий опыт: ${(data.exp).toLocaleString()}
            </div><br> 
            <div class="result-additional">~ Xorek</div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка:', error);
        const resultBlock = document.getElementById('result');
        const resultHTML = `
            <div class="error-message">
                <div class="error-title">Произошла ошибка!</div>
                <div class="error-description">
                    Не удалось получить данные игрока. Возможно, указан неверный UID или связь прервана. <br>
                    Повторите попытку еще раз. 
                </div>
            </div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

async function getData(id) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch('https://squirrelsquery.yukkerike.ru/user/' + id + '?json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Запрос отменен по таймауту (15 секунд)');
        } else {
            console.error('Ошибка:', error);
        }
        return 'error';
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('copy-button') || e.target.classList.contains('copy-button-profile')) {
        const textToCopy = e.target.getAttribute('data-copy');
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = e.target.textContent;
            e.target.textContent = 'Скопировано!';
            e.target.classList.add('copied');
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.classList.remove('copied');
            }, 2000);
        });
    }
});

document.getElementById('statsButton').addEventListener('click', function() {
    let statsTable = document.getElementById('statsTable');
    
    if (statsTable.classList.contains('hidden')) {
        statsTable.classList.remove('hidden');
        setTimeout(() => {
            statsTable.classList.add('visible');
        }, 10);
    } else {
        statsTable.classList.remove('visible');
        setTimeout(() => {
            statsTable.classList.add('hidden');
        }, 300);
    }
});