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
            <div class="error-title">Запрос выполняется дольше обычного...</div> <br>
            <div class="error-description">
                Возможно, вы запрашиваете большое количество игроков и они долго обрабатываются. А может интернет соединение слишком слабое или сервер игры отключен... <br>
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
                    console.log(`Попытка ${attempt} для ID ${id} не удалась.`);
        
                    if (error.name === "AbortError") {
                        console.log(`Запрос для ID ${id} был прерван по таймауту.`);
                    }
        
                    if (attempt === maxRetries) {
                        console.log(`Не удалось получить данные для ID ${id} после ${maxRetries} попыток.`);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        
            if (!success) {
                failedIds.push(id);
                console.log(`ID ${id} пропущен после всех попыток.`);
            }
        }
        clearTimeout(loadingTimeout);
        
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');

        dataPlayers = players;

        const resultBlock = document.getElementById('result');
        const resultHTML = `
            Всего игроков: ${players.length} <br>
            ${!failedIds || failedIds.length === 0 ? '' : 
                `Не удалось получить ${failedIds.length} игрока(ов) c UID: <br>
                <span class="result-additional">${failedIds.map(id => `${id}`).join(', ')}</span>`}
            <br>
            Данные игроков: <br>
            <table id="players" class="data-table" style="width: 100%; text-align: left;">
                <thead>
                    <tr class="result-additional text-table-clan">
                        <td style="width: 5%;">№</td>
                        <td style="width: 35%; text-align: left;">Ник</td>
                        <td style="width: 20%; text-align: left;">Общий опыт игрока</td>
                        <td style="width: 20%; text-align: left;">Кол-во игр</td>
                        <td style="width: 20%; text-align: left;">Спасено белок</td>
                    </tr>
                </thead>
                <tbody id="players-data">
                    ${!players || players.length === 0 ? `
                        <tr class="result-additional">
                            <td colspan="3" style="text-align: center;">Что-то пошло не так...</td>
                        </tr>
                    ` : players.map((player, index) => {
                            return `
                                <tr class="result-additional">
                                    <td style="width: 5%;">${index + 1}</td>
                                    <td style="width: 35%; text-align: left;">
                                        <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${player.uid}" target="_blank">${player.name} [${player.level}]</a>
                                    </td>
                                    <td style="width: 20%; text-align: left;">${player.exp.toLocaleString()}</td>
                                    <td style="width: 20%; text-align: left;">${player.rating_player.toLocaleString()}</td>
                                    <td style="width: 20%; text-align: left;">${player.rating_shaman.toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table> <br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToExcel('')">Сохранить в Excel</button>
            </div><br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToJson('')">Сохранить в Json</button>
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
                    <div class="error-title">Произошла ошибка!</div> <br>
                    <div class="error-description">
                        Не удалось получить данные игроков. Возможно, один из указаных UID неправильный или связь прервана. <br>
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

async function saveStatisticsToExcel(datalayers) {
    if (!dataPlayers || !Array.isArray(dataPlayers)) {
        console.error("Данные игроков не найдены или неверный формат!");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Статистика игроков');

    const currentTime = new Date().toLocaleString();

    const headers = [
        "№", 
        "UID", 
        "Name", 
        "Общий опыт игрока", 
        "Уровень", 
        "Уровень шамана", 
        "Кол-во игр", 
        "Спасено белок", 
        "ID клана", 
        "Максимум рейтинга", 
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
            player.exp,
            player.level,
            player.shaman_level,
            player.rating_player,
            player.rating_shaman,
            player.clan_id,
            player.max_rating,
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
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `players_statistics[${currentTime}].xlsx`);
}

async function saveStatisticsToJson() {
    if (!dataPlayers || !Array.isArray(dataPlayers)) {
        console.error("Данные игроков не найдены или неверный формат!");
        return;
    }

    const currentTime = new Date().toLocaleString();

    const headers = [
        "№", 
        "UID", 
        "Name", 
        "Общий опыт игрока", 
        "Уровень", 
        "Уровень шамана", 
        "Кол-во игр", 
        "Спасено белок", 
        "ID клана", 
        "Максимум рейтинга", 
        "Профиль"
    ];

    const playersData = dataPlayers.map((player, index) => ({
        number: index + 1,
        uid: player.uid,
        name: player.name,
        exp: player.exp,
        level: player.level,
        shaman_level: player.shaman_level,
        rating_player: player.rating_player,
        rating_shaman: player.rating_shaman,
        clan_id: player.clan_id,
        max_rating: player.max_rating,
        profile: player.profile
    }));

    const jsonData = {
        timeSaved: currentTime,
        headers: headers,
        rows: playersData
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `players_statistics[${currentTime}].json`);
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