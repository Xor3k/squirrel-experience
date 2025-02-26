let clanData;

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
        timeoutTriggered = true;
    }, 7000);

    try {
        let data = await getData(document.getElementById('numberInput').value, true);
        clearTimeout(loadingTimeout);

        if (!data || data === 'errorMessage' || data === 'error') {
            if (timeoutTriggered) {
                throw new Error('error connection');
            }
            throw new Error();
        }
        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');

        data_player = [];
        for (let player of data.statistics) {
            if (!player.uid.exp) {
                const data = await getData(player.uid.uid, false);
                if (data !== null) {
                    player.uid.exp = data.exp;
                    player.uid.name = data.name + " | покинул клан";
                    data_player.push(player);
                }
                else {
                    player.uid.exp = 'data error';
                    data_player.push(player);
                }
            }
        }
        clanData = data;

        const resultBlock = document.getElementById('result');
        const resultHTML = `
            <div class="photo-container">
                <img src="${clanData.info.emblem}" alt="emblem" />
                <span class="img-text">${clanData.info.name}</span>
            </div><br>
            <div class="result-additional">
                <a class="header-link" href="https://squirrelsquery.yukkerike.ru/clan/${clanData.id}" target="_blank">Карточка клана</a>
            </div><br>
            <div class="result-text-small">
                Вождь: 
                    <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${clanData.leader_id.uid}" target="_blank">
                        ${clanData.leader_id.name} [${clanData.leader_id.level}]
                    </a> <br>
                Участников: ${clanData.size} <br>
                Уровень клана: ${clanData.rank.level} [${clanData.rank.exp.toLocaleString()} XP] <br>
                Рейтинг клана: ${clanData.rating_info.rating_score.toLocaleString()} <br>
                Стоимость тотемов: ${(clanData.size * 60).toLocaleString()} <br>
            </div>
            Статистика клана: <br>
            <table id="clan-statistics" class="rating-table" style="width: 100%; text-align: left;">
                <thead>
                    <tr class="result-additional text-table-clan">
                        <td style="width: 5%;">№</td>
                        <td style="width: 20%; text-align: left;">Ник</td>
                        <td style="width: 20%; text-align: center;">Опыт игрока</td>
                        <td style="width: 20%; text-align: center;">Опыт клана</td>
                        <td style="width: 20%; text-align: center;">Очки рейтинга</td>
                        <td style="width: 20%; text-align: center;">Общий опыт игрока</td>
                    </tr>
                </thead>
                <tbody id="clan-statistics-data">
                    ${clanData.statistics.map((item, index) => {
                        return `
                            <tr class="result-additional">
                                <td style="width: 5%;">${index + 1}</td>
                                <td style="width: 20%; text-align: left;">
                                    <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${item.uid.uid}" target="_blank">${item.uid.name} [${item.uid.level}]</a>
                                </td>
                                <td style="width: 20%; text-align: center;">${item.samples.toLocaleString()}</td>
                                <td style="width: 20%; text-align: center;">${item.exp.toLocaleString()}</td>
                                <td style="width: 20%; text-align: center;">${item.clan_rating.toLocaleString()}</td>
                                <td style="width: 20%; text-align: center;">${item.uid.exp.toLocaleString()}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="result-additional no-data-table-excel">
                        <td style="width: 5%;"></td>
                        <td style="width: 20%;">Всего: </td>
                        <td style="width: 20%; text-align: center;">${clanData.rank.dailyPlayerExp.toLocaleString()}</td>
                        <td style="width: 20%; text-align: center;">${clanData.rank.dailyTotalExp.toLocaleString()}</td>
                        <td style="width: 20%; text-align: center;">${clanData.rank.DailyTotalRaiting.toLocaleString()}</td>
                        <td style="width: 20%; text-align: center;"></td>
                    </tr>
                </tbody>
            </table> <br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToExcel()">Сохранить статистику в Excel</button>
            </div><br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToJson()">Сохранить статистику в Json</button>
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
                        Не удалось получить данные клана. Возможно, указан неверный ID или связь прервана. <br>
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

async function saveStatisticsToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Статистика клана');
    const headers = ["№", "UID", "Ник", "Опыт игрока", "Опыт клана", "Очки рейтинга", "Общий опыт игрока"];
    const currentTime = new Date().toLocaleString();

    sheet.addRow(["ID клана:", clanData.id]);
    sheet.addRow(["UID вождя:", clanData.leader_id.uid]);
    sheet.addRow(["Название клана:", clanData.info.name]);
    sheet.addRow(["Дата сохранения:", currentTime]);
    sheet.addRow(headers);

    const headerRowNumber = 5;
    headers.forEach((_, colIndex) => {
        const cell = sheet.getRow(headerRowNumber).getCell(colIndex + 1);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1B3A57' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center' };
    });

    clanData.statistics.forEach((item, rowIndex) => {
        const rowData = [
            rowIndex + 1,
            item.uid.uid,
            item.uid.name,
            item.samples,
            item.exp,
            item.clan_rating,
            item.uid.exp
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

    sheet.addRow([
        "Всего: ",
        "",
        clanData.rank.dailyPlayerExp,
        clanData.rank.dailyTotalExp,
        clanData.rank.DailyTotalRaiting,
        ""
    ]);

    sheet.columns.forEach(column => {
        column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const filename = `clan_statistics-${clanData.info.name}[${currentTime}].xlsx`;

    saveFile(blob, filename);
}

function saveStatisticsToJson() {
    const currentTime = new Date().toLocaleString();
    const statistics = {
        date: currentTime,
        id: clanData.id,
        leader_id: clanData.leader_id.uid,
        name: clanData.info.name,
        total_players_exp: clanData.rank.dailyPlayerExp,
        total_clan_exp: clanData.rank.dailyTotalExp,
        total_raiting_exp: clanData.rank.DailyTotalRaiting,
        headers: ["№", "UID", "Ник", "Опыт игрока", "Опыт клана", "Очки рейтинга", "Общий опыт игрока"],
        rows: clanData.statistics.map((item, index) => [
            index + 1,
            item.uid.uid,
            item.uid.name,
            item.samples,
            item.exp,
            item.clan_rating,
            item.uid.exp
        ])
    };

    const json = JSON.stringify(statistics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `clan_statistics-${clanData.info.name}[${currentTime}].json`;

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

async function getData(id, is_clan) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch('https://squirrelsquery.yukkerike.ru/' + (is_clan ? 'clan/' : 'user/') + id + '?json', {
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
            e.target.textContent = 'Сохранено!';
            e.target.classList.add('copied');
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.classList.remove('copied');
            }, 2000);
        });
    }
});