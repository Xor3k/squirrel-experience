const clan = document.getElementById('clan-id');

document.getElementById('calculatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    let timeoutTriggered = false;

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
        const data = await getData(document.getElementById('clan-id').value);

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
        const maxRating = Math.max(...data.rating_history.map(x => x.rating));

        const resultHTML = `
            <div class="photo-container">
                <img src="${data.info.emblem}" alt="emblem" />
                <span class="img-text">${data.info.name}</span>
            </div><br>
            <div class="result-additional">
                <a class="header-link" href="https://squirrelsquery.yukkerike.ru/clan/${data.id}" target="_blank">Карточка клана, больше информации</a>
            </div><br>
            <div class="result-additional"><br>
                Активные тотемы: <br>
                ${data.totems.slotData
                    .filter(slot => slot.totem_id in totems)
                    .map((slot, index) => {
                        const totem = totems[slot.totem_id];
                        return index === 0 
                            ? `${totem.name}.` 
                            : `${totem.name}, истекает через ${expires(slot.expires)}.`;
                    })
                    .join('<br>')}
            </div><br>
            <div class="result-additional">
                Уровни тотемов у клана: <br>
                ${data.totem_rangs
                    .filter(slot => slot.totem_id in totems)
                    .map(slot => {
                        const totem = totems[slot.totem_id];
                        return `
                            ${totem.name}: Уровень ${slot.level}. 
                        `;
                    })
                    .join('<br>')}
            </div><br>
            <div class="result-additional">
                Текущий сезон ${currentSeason + 1} <br> Текущий рейтинг: ${(data.rating_info.rating_score).toLocaleString()} <br>
                Максимальный рейтинг:
                ${!data.rating_history || data.rating_history.length === 0 ? `
                    Данных нет
                ` : 
                    `${(maxRating).toLocaleString()}`
                }
            </div>
            <table class="rating-table" style="width: 100%; text-align: left;">
                <tr class="result-additional current-season">
                    <td style="width: 25%;">Сезон: ${currentSeason + 1}</td>
                    <td style="width: 30%; text-align: center;">Рейтинг: ${(data.rating_info.rating_score).toLocaleString()}</td>
                    <td style="width: 45%; text-align: right;">Сезон не завершен</td>
                </tr>
                ${!data.rating_history || data.rating_history.length === 0 ? `
                    <tr class="result-additional">
                        <td colspan="3" style="text-align: center;">История рейтинга пуста</td>
                    </tr>
                ` : data.rating_history.filter(item => item.season !== currentSeason + 1)
                    .sort((a, b) => b.season - a.season)
                    .map(item => {
                        const dateRange = getSeasonStartDate(item.season, currentSeason + 1);
                        return `
                            <tr class="result-additional">
                                <td style="width: 25%;">Сезон: ${(item.season).toLocaleString()}</td>
                                <td style="width: 30%; text-align: center;">Рейтинг: ${(item.rating).toLocaleString()}</td>
                                <td style="width: 45%; text-align: right;">${dateRange}</td>
                            </tr>
                        `;
                    }).join('')}
            </table>
            <br>
            <div class="result-additional">~ Xorek</div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
    } catch (error) {
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
            const errorHTML = `
                <div class="error-message">
                    <div class="error-title">Произошла ошибка!</div>
                    <div class="error-description">
                        Не удалось получить данные игрока. Возможно, указан неверный UID или связь прервана. <br>
                        Повторите попытку еще раз. 
                    </div>
                </div>
            `;
            resultBlock.innerHTML = errorHTML;
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
        const response = await fetch('https://squirrelsquery.yukkerike.ru/clan/' + id + '?json', {
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
    const knownSeasonStart = new Date('2025-02-17');
    const knownSeason = 498;
    const today = new Date();
    const weeksDiff = Math.floor((today - knownSeasonStart) / (7 * 24 * 60 * 60 * 1000)); 
    return knownSeason + weeksDiff;
}

function expires(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}