document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    let timeoutTriggered = false;

    const loadingTimeout = setTimeout(() => {
        const timeoutBlock = document.getElementById('result');
        timeoutBlock.innerHTML = `
            <div class="error-title">Запрос выполняется дольше обычного...</div>
            <hr>
            <div class="error-description">
                Возможно, интернет соединение слишком слабое или сервер игры отключен...
            </div>
        `;
        timeoutBlock.classList.remove('hidden');
        timeoutTriggered = true;
    }, 7000);
 
    let nextLevel = 0;
    let requiredXP = 0;
    let percent = 0;

    try {
        let data = await getData(document.getElementById('numberInput').value);
        clearTimeout(loadingTimeout);

        if (!data || data === 'errorMessage' || data === 'error') {
            if (timeoutTriggered) {
                throw new Error('error connection');
            }
            throw new Error();
        }

        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');

        const resultBlock = document.getElementById('result');
        if (data.exp >= 66045137) {
            const resultHTML = `
                <div class="result-text">
                    Игрок
                    ${data.vip_info.vip_exist !== 0 && data.moderator > 0 ? `
                        <span class="moderator-color">${data.name}</span>
                        <img src="img/gold_wings.png" class="icon-vip">
                    ` : data.vip_info.vip_exist !== 0 ? `
                        <span class="vip-color-${data.vip_info.vip_color}">${data.name}</span>
                        <img src="img/gold_wings.png" class="icon-vip">
                    ` : data.vip_info.vip_exist == 0 && data.moderator > 0 ? `
                        <span class="moderator-color">${data.name}</span>
                    ` : ` ${data.name} `
                    }
                    достиг максимального уровня!)
                    ${data.moderator == 1 ? `
                        <span class="result-warning warning-color">
                            Внимание! Игрок является модератором чата!
                        </span>
                    ` : ``}
                    ${data.uid == 14070362 ? `
                        <span class="result-special">${data.name} - это частичка Nevermore</span>
                    ` : ``}
                </div>
                <hr>
                <dl class="result-details">
                    <dt>Статус:</dt>
                    <dd>${data.online == 1 ? 'В сети' : 'Не в сети'}</dd>

                    <dt>Процент выполнения:</dt>
                    <dd>100%</dd>

                    <dt>Кол-во опыта после 200-го:</dt>
                    <dd>
                        ${(data.exp - 66045137).toLocaleString()} XP
                        <button class="copy-button" data-copy="${(data.exp - 66045137).toLocaleString()}">Копировать</button>
                    </dd>

                    <dt>Профиль:</dt>
                    <dd>
                        ${data.person_info.profile == null || data.person_info.profile == '' ? `
                            <span>Профиль не найден...</span>
                        ` : `
                            <a class="info-link" href="${data.person_info.profile}" target="_blank">${data.person_info.profile}</a>
                            <button class="copy-button-profile" data-copy="${data.person_info.profile}">Копировать</button>
                        `}
                    </dd>

                    <dt>Текущий уровень:</dt>
                    <dd>
                        200 (Максимальный)
                    </dd>

                    <dt>Общий опыт:</dt>
                    <dd>
                        ${(data.exp).toLocaleString()} XP
                        <button class="copy-button" data-copy="${(data.exp).toLocaleString()}">Копировать</button>
                    </dd>

                    <dt>Карточка игрока:</dt>
                    <dd>
                        <a class="info-link" href="https://squirrelsquery.yukkerike.ru/user/${data.uid}" target="_blank">${data.name}</a>
                    </dd>

                    ${data.clan_id !== 0 ? `
                        <dt>Клан (ID: ${data.clan_id}):</dt>
                        <dd>
                            <a class="info-link" href="https://squirrelsquery.yukkerike.ru/clan/${data.clan_id}" target="_blank">Карточка клана</a>
                        </dd>
                    ` : `
                        <dt>Клан:</dt>
                        <dd>Без клана</dd>
                    `}
                </dl>
                <div class="result-footer">~ Xorek</div>
            `;
            resultBlock.innerHTML = resultHTML;
            resultBlock.classList.remove('hidden');
            return;
        } else {
            for (let level in levelRequirements) {
                let xp = levelRequirements[level];
                if (data.exp < xp) {
                    let currentLevelExp = levelRequirements[level - 1] || 0; // Handle level 1
                    let nextLevelExp = levelRequirements[level];
                    nextLevel = level;
                    requiredXP = xp;
                    percent = ((data.exp - currentLevelExp)/(nextLevelExp - currentLevelExp) * 100).toFixed(2);
                    break;
                }
            }
        }

        let remainingXP = requiredXP - data.exp;
        const resultHTML = `
             <div class="result-text">
                ${data.vip_info.vip_exist !== 0 && data.moderator > 0 ? `
                        <span class="moderator-color">${data.name}</span>
                        <img src="img/gold_wings.png" class="icon-vip">
                    ` : data.vip_info.vip_exist !== 0 ? `
                        <span class="vip-color-${data.vip_info.vip_color}">${data.name}</span>
                        <img src="img/gold_wings.png" class="icon-vip">
                    ` : data.vip_info.vip_exist == 0 && data.moderator > 0 ? `
                        <span class="moderator-color">${data.name}</span>
                    ` : ` ${data.name} `
                }
                | Текущий уровень: ${data.level}
                 ${data.moderator == 1 ? `
                    <span class="result-warning warning-color">
                        Внимание! Игрок является модератором чата!
                    </span>
                 ` : ``}
                ${data.uid == 2640274 ? `
                    <span class="result-special">${data.name}, епта!</span>
                ` : data.uid == 20637878 ? `
                    <span class="result-special">Самая лучшая девочка!</span>
                ` : data.uid == 13143497 ? `
                    <span class="result-special">Ура, ${data.name}, хехехе</span>
                ` : data.uid == 17816916 ? `
                    <span class="result-special">
                        ${data.name} не испытывает счастья...<br>
                        Не хочу, чтобы кто-то испытал ту же боль и разочарование, что и я.
                        Берегите себя, учитесь на чужих ошибках, не создавайте проблем, которых можно избежать.
                        Иногда один неверный шаг оставляет шрамы на всю жизнь
                    </span>
                ` : data.uid == 10270588 ? `
                    <span class="result-special">${data.name}, художник, епта!</span>
                ` : ``}
            </div>
            <hr>
            <dl class="result-details">
                <dt>Статус:</dt>
                <dd>${data.online == 1 ? 'В сети' : 'Не в сети'}</dd>

                <dt>До ${nextLevel} уровня:</dt>
                <dd>
                    ${remainingXP.toLocaleString()} XP
                    <button class="copy-button" data-copy="${remainingXP.toLocaleString()}">Копировать</button>
                </dd>

                 ${data.level >= 100 ? `
                    <dt>Прогресс уровня:</dt>
                    <dd>${percent}%</dd>
                 ` : `
                     <dt>Прогресс уровня:</dt>
                     <dd>(Доступно с 100 уровня)</dd>
                 `}

                <dt>Профиль:</dt>
                <dd>
                     ${data.person_info.profile == null || data.person_info.profile == '' ? `
                        <span>Профиль не найден...</span>
                    ` : `
                        <a class="info-link" href="${data.person_info.profile}" target="_blank">${data.person_info.profile}</a>
                        <button class="copy-button-profile" data-copy="${data.person_info.profile}">Копировать</button>
                    `}
                </dd>

                <dt>До 200-го уровня:</dt>
                <dd>
                    ${(66045137 - data.exp).toLocaleString()} XP
                    <button class="copy-button" data-copy="${(66045137 - data.exp).toLocaleString()}">Копировать</button>
                </dd>

                <dt>Общий опыт:</dt>
                <dd>
                    ${(data.exp).toLocaleString()} XP
                    <button class="copy-button" data-copy="${(data.exp).toLocaleString()}">Копировать</button>
                </dd>

                <dt>Карточка игрока:</dt>
                <dd>
                    <a class="info-link" href="https://squirrelsquery.yukkerike.ru/user/${data.uid}" target="_blank">${data.name}</a>
                </dd>

                ${data.clan_id !== 0 ? `
                    <dt>Карточка клана:</dt>
                    <dd>
                        <a class="info-link" href="https://squirrelsquery.yukkerike.ru/clan/${data.clan_id}" target="_blank">Клан (ID: ${data.clan_id})</a>
                    </dd>
                ` : `
                    <dt>Клан:</dt>
                    <dd>Без клана</dd>
                `}
            </dl>
            <div class="result-footer">~ Xorek</div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
    } catch (error) {
        const resultBlock = document.getElementById('result');
        if (error.message === 'error connection') {
            const resultHTML = `
                <div class="error-message">
                    <div class="error-title">Похоже, сервер игры отключен...</div>
                    <hr>
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
                    <hr>
                    <div class="error-description">
                        Не удалось получить данные игрока. Возможно, указан неверный UID или связь прервана. <br>
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
    const statsTable = document.getElementById('statsTable');
    if (statsTable.classList.contains('hidden')) {
        generateStatsTable();
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

function generateStatsTable() {
    const statsTable = document.getElementById('statsTable');
    const table = document.createElement('table');
    table.className = 'stats-table';

    Object.entries(levelData)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .forEach(([level, data]) => {
            const rows = `
                <tr class="separator">
                    <td colspan="2"><span>${level}</span></td>
                </tr>
                <tr>
                    <td>Общий опыт:</td>
                    <td id="totalXp">${level === '200' ? '> ' : ''}${data.totalXp.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Уровень:</td>
                    <td id="level">${level}</td>
                </tr>
                <tr>
                    <td>Опыт до следующего уровня:</td>
                    <td id="nextLevelXp">${data.nextLevelXp ? data.nextLevelXp.toLocaleString() : '-'}</td>
                </tr>
                <tr>
                    <td>Кликуха:</td>
                    <td id="name">${data.name}</td>
                </tr>
            `;
            table.insertAdjacentHTML('beforeend', rows);
        });

    statsTable.innerHTML = '';
    statsTable.appendChild(table);
}