const one_sqr = document.getElementById('player-a');
const two_sqr = document.getElementById('player-b');

document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        let one_sqr = await getData(document.getElementById('player-a').value);
        let two_sqr = await getData(document.getElementById('player-b').value);
        
        const resultBlock = document.getElementById('result');

        if (!one_sqr || !two_sqr || one_sqr === 'errorMessage' || two_sqr === 'errorMessage') {
            throw new Error();
        }

        const difference = Math.abs(two_sqr.exp - one_sqr.exp);
        
        const resultHTML = `
            <div class="result-text">
                ${one_sqr.name} [${one_sqr.level}] и ${two_sqr.name} [${two_sqr.level}]<br>
                ${one_sqr.moderator == 1 ? `
                    <div class="result-additional">
                        Внимание! Игрок ${one_sqr.name} является модератором чата!
                    </div>
                ` : ``}
                ${two_sqr.moderator == 1 ? `
                    <div class="result-additional">
                        Внимание! Игрок ${two_sqr.name} является модератором чата!
                    </div>
                ` : ``}
            </div>
            <div class="result-additional">
                Разница в опыте: ${difference.toLocaleString()} XP
                <button class="copy-button" data-copy="${difference.toLocaleString()}">Копировать</button>
            </div><br>
            <div class="result-additional">
                ${one_sqr.person_info.profile == null || one_sqr.person_info.profile == '' ? `
                    <div class="result-additional">
                        Профиль игрока ${one_sqr.name} не найден...
                    </div>
                ` : `
                    <a class="header-link" href="${one_sqr.person_info.profile}" target="_blank">1. ${one_sqr.person_info.profile}</a>
                    <button class="copy-button-profile" data-copy="${one_sqr.person_info.profile}">Копировать</button>
                `}
                </div><br>
                <div class="result-additional">
                    ${two_sqr.person_info.profile == null || two_sqr.person_info.profile == '' ? `
                        <div class="result-additional">
                            Профиль игрока ${two_sqr.name} не найден...
                        </div>
                    ` : `
                    <a class="header-link" href="${two_sqr.person_info.profile}" target="_blank">2. ${two_sqr.person_info.profile}</a>
                    <button class="copy-button-profile" data-copy="${two_sqr.person_info.profile}">Копировать</button>
                `}
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
                    Не удалось получить данные игроков. Возможно, один из ID указан неверно или связь прервана. <br>
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

// кнопки копирования
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('copy-button') || e.target.classList.contains('copy-button-profile')) {
        const textToCopy = e.target.getAttribute('data-copy');
        navigator.clipboard.writeText(textToCopy).then(() => {
            e.target.textContent = 'Скопировано!';
            e.target.classList.add('copied');
            setTimeout(() => {
                e.target.textContent = 'Копировать';
                e.target.classList.remove('copied');
            }, 2000);
        });
    }
});
