const one_sqr = document.getElementById('player-a');
const two_sqr = document.getElementById('player-b');

document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    const loadingTimeout = setTimeout(() => {
        const timeoutBlock = document.getElementById('result');
        timeoutBlock.innerHTML = `
            <div class="error-title">Запрос выполняется дольше обычного...</div> <br>
            <div class="error-description">
                Возможно, интернет соединение слишком слабое или сервер игры отключен...
            </div>
        `;
        timeoutBlock.classList.remove('hidden');
    }, 7000);

    try {
        let one_sqr = await getData(document.getElementById('player-a').value);
        let two_sqr = await getData(document.getElementById('player-b').value);
        clearTimeout(loadingTimeout);
        
        const resultBlock = document.getElementById('result');

        if (!one_sqr || !two_sqr || one_sqr === 'errorMessage' || two_sqr === 'errorMessage') {
            throw new Error();
        }
        if (one_sqr === 'error' || two_sqr === 'error') {
            throw new Error("error connection");
        }

        const difference = Math.abs(two_sqr.exp - one_sqr.exp);
        const resultHTML = `
            <div class="result-text">
                ${one_sqr.vip_info.vip_exist !== 0 && one_sqr.moderator > 0 ? ` 
                    <span class="moderator-color">${one_sqr.name} [${one_sqr.level}]</span> 
                    <img src="img/gold_wings.png" class="icon-vip">
                ` : one_sqr.vip_info.vip_exist !== 0 ? ` 
                    <span class="vip-color-${one_sqr.vip_info.vip_color}"> 
                        ${one_sqr.name} [${one_sqr.level}] 
                        <img src="img/gold_wings.png" class="icon-vip"> 
                    </span> 
                ` : ` ${one_sqr.name} [${one_sqr.level}] `}
                и 
                ${two_sqr.vip_info.vip_exist !== 0 && two_sqr.moderator > 0 ? ` 
                    <span class="moderator-color">${two_sqr.name} [${two_sqr.level}]</span> 
                    <img src="img/gold_wings.png" class="icon-vip">
                ` : two_sqr.vip_info.vip_exist !== 0 ? ` 
                    <span class="vip-color-${two_sqr.vip_info.vip_color}"> 
                        ${two_sqr.name} [${two_sqr.level}] 
                        <img src="img/gold_wings.png" class="icon-vip"> 
                    </span> 
                ` : ` ${two_sqr.name} [${two_sqr.level}] `}
                <br>
                ${one_sqr.moderator == 1 ? `
                    <div class="result-additional warning-color">
                        Внимание! Игрок ${one_sqr.name} является модератором чата!
                    </div>
                ` : ``}
                ${two_sqr.moderator == 1 ? `
                    <div class="result-additional warning-color">
                        Внимание! Игрок ${two_sqr.name} является модератором чата!
                    </div>
                ` : ``}
            </div>
            <div class="result-additional">
                Разница в опыте: ${difference.toLocaleString()} XP <br>
                Лидирует: ${one_sqr.exp > two_sqr.exp ? one_sqr.name : two_sqr.name}
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
        // console.error('Ошибка:', error);
        const resultBlock = document.getElementById('result');
        if (error.message === 'error connection') {
            const resultHTML = `
                <div class="error-message">
                    <div class="error-title">Похоже, сервер игры отключен...</div> <br>
                    <div class="error-description">
                        Соединение с сервером игры прервано. Попробуйте позже. 
                    </div>
                </div>
            `;
            resultBlock.innerHTML = resultHTML;
            resultBlock.classList.remove('hidden');
        } else {
            const resultHTML = `
                <div class="error-message">
                    <div class="error-title">Произошла ошибка!</div>
                    <div class="error-description">
                        Не удалось получить данные игроков. Возможно, один из UID указан неверно или связь прервана. <br>
                        Повторите попытку еще раз. 
                    </div>
                </div>
            `;
            resultBlock.innerHTML = resultHTML;
            resultBlock.classList.remove('hidden');
        } 
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