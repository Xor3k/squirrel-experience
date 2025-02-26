const one_sqr = document.getElementById('player-a');
const two_sqr = document.getElementById('player-b');

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
        let one_sqr = await getData(document.getElementById('player-a').value);
        let two_sqr = await getData(document.getElementById('player-b').value);
        clearTimeout(loadingTimeout);
        
        const resultBlock = document.getElementById('result');

        if (!one_sqr || !two_sqr || one_sqr === 'errorMessage' || two_sqr === 'errorMessage') {
            throw new Error();
        }
        if (one_sqr === 'error' || two_sqr === 'error') {
            if (timeoutTriggered) {
                throw new Error('error connection');
            }
            throw new Error();
        }

        const difference = Math.abs(two_sqr.exp - one_sqr.exp);
        const oneMaxRating = Math.max(...one_sqr.rating_history.map(x => x.rating));
        const twoMaxRating = Math.max(...two_sqr.rating_history.map(x => x.rating));

        const resultHTML = `
            <table class="comparison-table">
                <tr>
                    <td>Ник игрока</td>
                    <td>
                        ${one_sqr.vip_info.vip_exist !== 0 && one_sqr.moderator > 0 ? ` 
                            <span class="moderator-color">${one_sqr.name}</span> 
                            <img src="img/gold_wings.png" class="icon-vip">
                        ` : one_sqr.vip_info.vip_exist !== 0 ? ` 
                            <span class="vip-color-${one_sqr.vip_info.vip_color}"> 
                                ${one_sqr.name}
                                <img src="img/gold_wings.png" class="icon-vip"> 
                            </span> 
                        ` : ` ${one_sqr.name} `}
                    </td>
                    <td>
                        ${two_sqr.vip_info.vip_exist !== 0 && two_sqr.moderator > 0 ? ` 
                            <span class="moderator-color">${two_sqr.name}</span> 
                            <img src="img/gold_wings.png" class="icon-vip">
                        ` : two_sqr.vip_info.vip_exist !== 0 ? ` 
                            <span class="vip-color-${two_sqr.vip_info.vip_color}"> 
                                ${two_sqr.name}
                                <img src="img/gold_wings.png" class="icon-vip"> 
                            </span> 
                        ` : ` ${two_sqr.name} `}
                    </td>
                </tr>
                <tr title="Разница в уровнях: ${Math.abs(one_sqr.level - two_sqr.level)}">
                    <td>Уровень</td>
                    <td>${one_sqr.level}</td>
                    <td>${two_sqr.level}</td>
                </tr>
                <tr title="Разница в опыте: ${difference.toLocaleString()}">
                    <td>Опыт</td>
                    <td>${one_sqr.exp.toLocaleString()}</td>
                    <td>${two_sqr.exp.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Разница</td>
                    <td colspan="2">
                        ${one_sqr.exp > two_sqr.exp ? 
                            `Игрок ${one_sqr.name} набрал больше на ${difference.toLocaleString()} xp` : 
                            `Игрок ${two_sqr.name} набрал больше на ${difference.toLocaleString()} xp`
                        }
                    </td>
                </tr>
                <tr title="Разница в уровнях шамана: ${Math.abs(one_sqr.shaman_level - two_sqr.shaman_level)}">
                    <td>Уровень шамана</td>
                    <td>${one_sqr.shaman_level}</td>
                    <td>${two_sqr.shaman_level}</td>
                </tr>
                <tr>
                    <td>Разница</td>
                    <td colspan="2">
                        ${one_sqr.shaman_exp === two_sqr.shaman_exp ? 
                            'Оба игрока достигли одинакового опыта шамана' :
                            one_sqr.shaman_exp > two_sqr.shaman_exp ? 
                            `Игрок ${one_sqr.name} набрал больше опыта шамана на ${(one_sqr.shaman_exp - two_sqr.shaman_exp).toLocaleString()}` : 
                            `Игрок ${two_sqr.name} набрал больше опыта шамана на ${(two_sqr.shaman_exp - one_sqr.shaman_exp).toLocaleString()}`
                        }
                    </td>
                </tr>
                <tr title="Разница в количестве игр: ${Math.abs(one_sqr.rating_info.rating_player - two_sqr.rating_info.rating_player).toLocaleString()}">
                    <td>Кол-во игр</td>
                    <td>${one_sqr.rating_info.rating_player.toLocaleString()}</td>
                    <td>${two_sqr.rating_info.rating_player.toLocaleString()}</td>
                </tr>
                <tr title="Разница в спасенных белках: ${Math.abs(one_sqr.rating_info.rating_shaman - two_sqr.rating_info.rating_shaman).toLocaleString()}">
                    <td>Спасено белок</td>
                    <td>${one_sqr.rating_info.rating_shaman.toLocaleString()}</td>
                    <td>${two_sqr.rating_info.rating_shaman.toLocaleString()}</td>
                </tr>
                <tr title="Разница в коэффициенте: ${Math.abs((one_sqr.rating_info.rating_shaman / one_sqr.rating_info.rating_player) - (two_sqr.rating_info.rating_shaman / two_sqr.rating_info.rating_player)).toFixed(2)}">
                    <td>Коэффициент</td>
                    <td>${(one_sqr.rating_info.rating_shaman / one_sqr.rating_info.rating_player).toFixed(2)}</td>
                    <td>${(two_sqr.rating_info.rating_shaman / two_sqr.rating_info.rating_player).toFixed(2)}</td>
                </tr>
                <tr title="Разница в рейтинге: ${Math.abs(one_sqr.rating_info.rating_score - two_sqr.rating_info.rating_score).toLocaleString()}">
                    <td>Очки рейтинга</td>
                    <td>${one_sqr.rating_info.rating_score.toLocaleString()}</td>
                    <td>${two_sqr.rating_info.rating_score.toLocaleString()}</td>
                </tr>
                <tr title="Разница в максимальном рейтинге: ${Math.abs(oneMaxRating - twoMaxRating).toLocaleString()}">
                    <td>Максимальный рейтинг</td>
                    <td>${oneMaxRating.toLocaleString()}</td>
                    <td>${twoMaxRating.toLocaleString()}</td>
                </tr>
                <tr title="Разница в среднем опыте за раунд: ${Math.abs((one_sqr.exp / one_sqr.rating_info.rating_player) - (two_sqr.exp / two_sqr.rating_info.rating_player)).toFixed(2)}">
                    <td>Средний опыт за раунд</td>
                    <td>${(one_sqr.exp / one_sqr.rating_info.rating_player).toFixed(2)}</td>
                    <td>${(two_sqr.exp / two_sqr.rating_info.rating_player).toFixed(2)}</td>
                </tr>
                <tr title="Разница в кол-ве приглашенных игроков: ${Math.abs(one_sqr.person_info.referrer - two_sqr.person_info.referrer)}">
                    <td>Приглашенные игроки</td>
                    <td>${one_sqr.person_info.referrer}</td>
                    <td>${two_sqr.person_info.referrer}</td>
                </tr>
                <tr>
                    <td>Ссылка на профиль</td>
                    <td>
                        ${one_sqr.person_info.profile ? `
                            <a class="header-link" href="${one_sqr.person_info.profile}" target="_blank">${one_sqr.name}</a>
                        ` : 'Не указан'}
                    </td>
                    <td>
                        ${two_sqr.person_info.profile ? `
                            <a class="header-link" href="${two_sqr.person_info.profile}" target="_blank">${two_sqr.name}</a>
                        ` : 'Не указан'}
                    </td>
                </tr>
                <tr>
                    <td><a class="header-link" href="https://squirrelsquery.yukkerike.ru/" target="_blank">Карточка игрока</a></td>
                    <td>
                        ${one_sqr.person_info.profile ? `
                            <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${one_sqr.uid}" target="_blank">${one_sqr.name}</a>
                        ` : 'Не указан'}
                    </td>
                    <td>
                        ${two_sqr.person_info.profile ? `
                            <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${two_sqr.uid}" target="_blank">${two_sqr.name}</a>
                        ` : 'Не указан'}
                    </td>
                </tr>
            </table><br>
            <div class="result-additional">
                ⚠️ Важно! Средний опыт за раунд. Этот показатель не отражает точного значение и является лишь приблизительным за каждый отдельный раунд. <br>
                Формула: Общий опыт игрока / Количество игр. <br>
                Учитывайте, что это не точное значение за один раунд и в расчет может входить: <br>
                - опыт за коллекции, <br>
                - разный опыт на каждой локации, <br>
                - разные уровни тотемов (дают разное количество опыта на разных уровнях), <br>
                - наличия или отсутсвие VIP статус в игре (который дает надбавку к опыту),
                - бонусные награды, подарки и другие источники. <br>
            </div><br> 
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