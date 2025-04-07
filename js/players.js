let dataPlayers;

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
                Возможно, вы запрашиваете большое количество игроков, 
                что требует некоторого времени для получения всех данных. 
                Также, возможно, ваше интернет-соединение недостаточно стабильно или сервер временно недоступен. 
                Запрос будет отменет через минуту.
            </div>
        `;
        timeoutBlock.classList.remove('hidden');
        timeoutTriggered = true;
    }, 30000);
 
    try {
        const input = document.getElementById('numberInput').value;
        const ids = input.split(',').map(id => id.trim()).filter(id => id);
        let players = [];
        let failedIds = [];
        
        for (const id of ids) {
            const maxRetries = 3;
            const delay = 1500;
            let success = false;
        
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
        
                try {
                    const data = await getData(id, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    players.push({
                        uid: data.uid,
                        name: data.name,
                        exp: data.exp,
                        level: data.level,
                        clan_id: data.clan_id || "Без клана",
                        shaman_exp: data.shaman_exp,
                        shaman_level: data.shaman_level,
                        rating_player: data.rating_info.rating_player,
                        rating_shaman: data.rating_info.rating_shaman,
                        profile: data.person_info.profile || "Профиль не найден",
                        max_rating: maxRating(data.rating_history),
                    });
                    success = true;
                    break;
                } catch (error) {
                    clearTimeout(timeoutId);
                    console.log(`Попытка ${attempt} для UID ${id} не удалась.`);
        
                    if (error.name === "AbortError") {
                        console.log(`Запрос для UID ${id} был прерван по таймауту.`);
                    }
        
                    if (attempt === maxRetries) {
                        console.log(`Не удалось получить данные для UID ${id} после ${maxRetries} попыток.`);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        
            if (!success) {
                failedIds.push(id);
                console.log(`UID ${id} пропущен после всех попыток.`);
            }
        }
        clearTimeout(loadingTimeout);
        
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');

        dataPlayers = players;

        const resultBlock = document.getElementById('result');
        const resultHTML = `
            <h3 class="table-title">Результаты поиска</h3>
            <p class="info-text">Всего найдено: ${players.length}</p>
            ${!failedIds || failedIds.length === 0 ? '' :
                `<p class="info-text warning-color" style="font-size: 0.85em; margin-bottom: 15px;">
                    Не удалось получить ${failedIds.length} игрока(ов) c UID: ${failedIds.map(id => `${id}`).join(', ')}
                </p>`
            }
            <table id="players" class="stats-table" style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>№</th>
                        <th style="text-align: left;">Ник</th>
                        <th style="text-align: left;">Опыт</th>
                        <th style="text-align: left;">Кол-во игр</th>
                        <th style="text-align: left;">Спасенок</th>
                    </tr>
                </thead>
                <tbody id="players-data">
                    ${!players || players.length === 0 ? `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px;">Игроки не найдены или произошла ошибка...</td>
                        </tr>
                    ` : players.map((player, index) => {
                            const profileLink = player.profile === "Профиль не найден" ?
                                `<span>${player.profile}</span>` :
                                `<a class="info-link" href="${player.profile}" target="_blank">Профиль</a>`;

                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td style="text-align: left;">
                                        <a class="info-link" href="https://squirrelsquery.yukkerike.ru/user/${player.uid}" target="_blank">
                                            ${player.name} [${player.level}]
                                        </a>
                                    </td>
                                    <td style="text-align: left;">${player.exp.toLocaleString()}</td>
                                    <td style="text-align: left;">${player.rating_player.toLocaleString()}</td>
                                    <td style="text-align: left;">${player.rating_shaman.toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table>
            <div class="button-group">
                <button class="stats-button" id="save-excel-btn">Сохранить в Excel</button>
                <button class="stats-button" id="save-json-btn">Сохранить в Json</button>
            </div>
            <div class="result-footer" style="margin-top: 20px;">~ Xorek</div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');

        document.getElementById('save-excel-btn')?.addEventListener('click', () => saveStatisticsToExcel());
        document.getElementById('save-json-btn')?.addEventListener('click', () => saveStatisticsToJson());

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
    const timeoutId = setTimeout(() => controller.abort(), 90000);

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

function maxRating(rating_history) {
    if (!rating_history || rating_history.length === 0) {
        return 0;
    }
    
    let maxRatingValue = 0;
    for (const entry of rating_history) {
        if (entry.rating > maxRatingValue) {
            maxRatingValue = entry.rating;
        }
    }
    
    return maxRatingValue;
}

async function saveStatisticsToExcel() {
    if (!dataPlayers || !Array.isArray(dataPlayers)) {
        console.error("Данные игроков не найдены!");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Статистика игроков');
    const currentTime = new Date().toLocaleString();

    const headers = [
        "№",
        "UID",
        "Ник",
        "Уровень",
        "Общий опыт игрока",
        "Уровень шамана",
        "Опыт шамана",
        "Кол-во игр",
        "Спасено белок",
        "Максимум рейтинга",
        "ID клана",
        "Профиль"
    ];

    sheet.addRow(["Дата сохранения:", currentTime]);
    sheet.addRow(headers);

    const headerRowNumber = 2;
    headers.forEach((_, colIndex) => {
        const cell = sheet.getRow(headerRowNumber).getCell(colIndex + 1);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1B3A57' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'left' };
    });

    dataPlayers.forEach((player, rowIndex) => {
        const rowData = [
            rowIndex + 1,
            player.uid,
            player.name,
            player.level,
            player.exp,
            player.shaman_level,
            player.shaman_exp,
            player.rating_player,
            player.rating_shaman,
            player.max_rating,
            player.clan_id,
            player.profile
        ];

        sheet.addRow(rowData);
        const currentRow = sheet.getRow(headerRowNumber + rowIndex + 1);
        currentRow.eachCell((cell, colIndex) => {
            cell.alignment = { horizontal: 'left' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: rowIndex % 2 === 0 ? 'B0C4DE' : 'D6E4F0' }
            };
        });
    });

    sheet.columns.forEach(column => {
        column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const filename = `players_statistics[${currentTime}].xlsx`;

    saveFile(blob, filename);
}

async function saveStatisticsToJson() {
    if (!dataPlayers || !Array.isArray(dataPlayers)) {
        console.error("Данные игроков не найдены!");
        return;
    }

    const currentTime = new Date().toLocaleString();

    const headers = [
        "№",
        "UID",
        "Ник",
        "Уровень",
        "Общий опыт игрока",
        "Уровень шамана",
        "Опыт шамана",
        "Кол-во игр",
        "Спасено белок",
        "Максимум рейтинга",
        "ID клана",
        "Профиль"
    ];

    const playersData = dataPlayers.map((player, index) => ({
        number: index + 1,
        uid: player.uid,
        name: player.name,
        level: player.level,
        exp: player.exp,
        shaman_level: player.shaman_level,
        shaman_exp: player.shaman_exp,
        rating_player: player.rating_player,
        rating_shaman: player.rating_shaman,
        max_rating: player.max_rating,
        clan_id: player.clan_id,
        profile: player.profile
    }));

    const jsonData = {
        date: currentTime,
        headers: headers,
        rows: playersData
    };

    const json = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const filename = `players_statistics[${currentTime}].json`;

    saveFile(blob, filename);
}

function saveFile(blob, filename) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const link = document.createElement('a');
            link.href = event.target.result;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
    } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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