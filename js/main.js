document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
 
    let currentLevel = 0;
    let nextLevel = 0;
    let requiredXP = 0;

    try {
        let data = await getData(document.getElementById('numberInput').value);
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');
        console.log(data);
        const resultBlock = document.getElementById('result');

        if (!data || data === 'errorMessage') {
            throw new Error();
        }

        if (data.exp >= 66045137) {
            const resultHTML = `
                <div class="result-text">
                    Игрок ${data.name} достиг максимального уровня!) <br>
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
                ${data.name} | Текущий уровень: ${data.level} <br>
                ${data.moderator == 1 ? `
                    <div class="result-additional">
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
                    Не удалось получить данные игрока. Возможно, указан неверный ID или связь прервана. <br>
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
    try {
        const response = await fetch('https://squirrelsquery.yukkerike.ru/user/' + id + '?json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
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
