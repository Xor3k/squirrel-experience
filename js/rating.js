const player = document.getElementById('player');

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
    }, 7000);

    try {
        const data = await getData(document.getElementById('player').value);
        clearTimeout(loadingTimeout);
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');

        if (!data || data === 'errorMessage'  || data === 'error') {
            if (timeoutTriggered) {
                throw new Error('error connection');
            }
            throw new Error();
        }

        const resultBlock = document.getElementById('result');
        const currentSeason = getCurrentSeason() - 1;
        let maxRating = data.rating_info.rating_score;
        let maxRatingSeason = currentSeason + 1;

        if (data.rating_history && data.rating_history.length > 0) {
            data.rating_history.forEach(item => {
                if (item.rating > maxRating) {
                    maxRating = item.rating;
                    maxRatingSeason = item.season;
                }
            });
        }

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
                ` : ''}
            </div>
            <hr>
            <dl class="result-details">
                <dt>Кол-во игр:</dt>
                <dd>${(data.rating_info.rating_player).toLocaleString()}</dd>

                <dt>Спасено белок:</dt>
                <dd>${(data.rating_info.rating_shaman).toLocaleString()}</dd>

                <dt>Коэф. (Спасено/Побед):</dt>
                <dd><span class="highlight-text">${(data.rating_info.rating_shaman / data.rating_info.rating_player).toFixed(2)}</span></dd>

                <dt>Разница (Белки vs Победы):</dt>
                <dd><span class="highlight-text">${(Math.abs(data.rating_info.rating_shaman - data.rating_info.rating_player) / Math.max(data.rating_info.rating_shaman, data.rating_info.rating_player) * 100).toFixed(2)}%</span></dd>

                <dt>Текущий рейтинг:</dt>
                <dd>${(data.rating_info.rating_score).toLocaleString()}</dd>

                <dt>Макс. рейтинг:</dt>
                <dd>${(maxRating).toLocaleString()} (Сезон ${maxRatingSeason})</dd>

                <dt>Карточка игрока:</dt>
                <dd><a class="info-link" href="https://squirrelsquery.yukkerike.ru/user/${data.uid}" target="_blank">${data.name}</a></dd>
            </dl>
            <hr>
            <h3 class="table-title" style="margin-top: 30px;">История рейтинга по сезонам</h3>
            <table class="stats-table" style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>Сезон</th>
                        <th style="text-align: center;">Рейтинг</th>
                        <th style="text-align: right;">Период</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${currentSeason + 1}</td>
                        <td style="text-align: center;">${(data.rating_info.rating_score).toLocaleString()}</td>
                        <td style="text-align: right;">Текущая неделя</td>
                    </tr>
                    ${!data.rating_history || data.rating_history.length === 0 ? `
                        <tr>
                            <td colspan="3" style="text-align: center; padding: 20px;">История рейтинга пуста</td>
                        </tr>
                    ` : data.rating_history.filter(item => item.season !== currentSeason + 1)
                        .sort((a, b) => b.season - a.season)
                        .map(item => {
                            const dateRange = getSeasonStartDate(item.season, currentSeason + 1);
                            return `
                                <tr>
                                    <td>${(item.season).toLocaleString()}</td>
                                    <td style="text-align: center;">${(item.rating).toLocaleString()}</td>
                                    <td style="text-align: right;">${dateRange}</td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table>
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
            resultBlock.innerHTML = `
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

function getSeasonStartDate(season, currentSeason) {
    const today = new Date();
    const lastMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    lastMonday.setDate(today.getDate() - diff);
    
    if (season === currentSeason) return 'Текущая неделя';
    
    const startDate = new Date(lastMonday);
    startDate.setDate(startDate.getDate() - ((currentSeason - season) * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (date) => date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'numeric', 
        year: 'numeric' 
    });
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getCurrentSeason() {
    const knownSeasonStart = new Date('2024-12-02');
    const knownSeason = 487;
    const today = new Date();
    const weeksDiff = Math.floor((today - knownSeasonStart) / (7 * 24 * 60 * 60 * 1000)); 
    return knownSeason + weeksDiff;
}