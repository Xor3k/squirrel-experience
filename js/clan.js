let rank;

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

        rank = {
            id: data.id,
            name: data.info.name,
            players_exp: data.rank.dailyPlayerExp,
            clan_exp: data.rank.dailyTotalExp,
            raiting_exp: data.rank.DailyTotalRaiting,
        };

        const resultBlock = document.getElementById('result');
        const resultHTML = `
            <div class="photo-container">
                <img src="${data.info.emblem}" alt="emblem" />
                <span class="img-text">${data.info.name}</span>
            </div><br>
            <div class="result-additional">
                <a class="header-link" href="https://squirrelsquery.yukkerike.ru/clan/${data.id}" target="_blank">Перейти на yukkerike.ru + ID</a>
            </div><br>
            <div class="result-text-small">
                Вождь: 
                    <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${data.leader_id.uid}" target="_blank">
                        ${data.leader_id.name} [${data.leader_id.level}]
                    </a> <br>
                Участников: ${data.size} <br>
                Уровень клана: ${data.rank.level} [${data.rank.exp.toLocaleString()} XP] <br>
                Рейтинг клана: ${data.rating_info.rating_score.toLocaleString()} <br>
                Стоимость тотемов: ${data.size.toLocaleString() * 60} <br>
            </div>
            Статистика клана: <br>
            <table id="clan-statistics" class="rating-table" style="width: 100%; text-align: left;">
                <thead>
                    <tr class="result-additional text-table-clan">
                        <td style="width: 5%;">№</td>
                        <td style="display: none; width: 4%;">UID</td>
                        <td style="width: 20%; text-align: left;">Ник</td>
                        <td style="width: 20%; text-align: center;">Опыт игрока</td>
                        <td style="width: 20%; text-align: center;">Опыт клана</td>
                        <td style="width: 20%; text-align: center;">Очки рейтинга</td>
                        <td style="width: 20%; text-align: center;">Общий опыт игрока</td>
                    </tr>
                </thead>
                <tbody id="clan-statistics-data">
                    ${!data.statistics || data.statistics.length === 0 ? `
                        <tr class="result-additional">
                            <td colspan="3" style="text-align: center;">Что-то пошло не так...</td>
                        </tr>
                    ` : data.statistics.map((item, index) => {
                            return `
                                <tr class="result-additional">
                                    <td style="width: 5%;">${index + 1}</td>
                                    <td style="display: none; width: 5%;">${item.uid.uid}</td>
                                    <td style="width: 20%; text-align: left;">
                                        <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${item.uid.uid}" target="_blank">${item.uid.name}</a>
                                    </td>
                                    <td style="width: 20%; text-align: center;">${item.samples.toLocaleString()}</td>
                                    <td style="width: 20%; text-align: center;">${item.exp.toLocaleString()}</td>
                                    <td style="width: 20%; text-align: center;">${item.clan_rating.toLocaleString()}</td>
                                    ${item.uid.exp ? `
                                        <td style="width: 20%; text-align: center;">${item.uid.exp.toLocaleString()}</td>
                                    ` : `
                                        <td style="width: 20%; text-align: center;">---</td>
                                    `}
                                </tr>
                            `;
                        }).join('')}
                        <tr class="result-additional no-data-table-excel">
                            <td style="width: 5%;"></td>
                            <td style="width: 20%;">Всего: </td>
                            <td style="width: 20%; text-align: center;">${data.rank.dailyPlayerExp.toLocaleString()}</td>
                            <td style="width: 20%; text-align: center;">${data.rank.dailyTotalExp.toLocaleString()}</td>
                            <td style="width: 20%; text-align: center;">${data.rank.DailyTotalRaiting.toLocaleString()}</td>
                            <td style="width: 20%; text-align: center;"></td>
                        </tr>
                </tbody>
            </table> <br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToExcel('')">Сохранить статистику в Excel</button>
            </div><br>
            <div class="result-additional">
                <button class="copy-button-profile" id="save-btn" onclick="saveStatisticsToJson('')">Сохранить статистику в Json</button>
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
    const table = document.getElementById('clan-statistics');
    if (!table) {
        console.error("Таблица не найдена!");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Статистика клана');
    const rows = table.querySelectorAll('tbody tr');
    const headerRow = table.querySelector('thead tr');
    const headers = Array.from(headerRow.querySelectorAll('td')).map(cell => cell.textContent.trim());
    const currentTime = new Date().toLocaleString();

    sheet.addRow(["ID клана:", rank.id]);
    sheet.addRow(["Название клана:", rank.name]);
    sheet.addRow(["Дата сохранения:", currentTime]);
    sheet.addRow(headers); 

    rows.forEach(row => {
        if (!row.classList.contains('no-data-table-excel')) {
            const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim());
            sheet.addRow(rowData);
        }
    });

    const headerRowNumber = 4;
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

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > headerRowNumber) {
            row.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: rowNumber % 2 === 0 ? 'B0C4DE' : 'D6E4F0' }
                };
            });
        }
    });

    const skippedColumns = ["Всего: ", "", ""];
    sheet.addRow([
        ...skippedColumns,
        rank.players_exp.toLocaleString(),
        rank.clan_exp.toLocaleString(),
        rank.raiting_exp.toLocaleString()
    ]);

    sheet.columns.forEach(column => {
        column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `clan_statistics-${rank.name}.xlsx`);
}

function saveStatisticsToJson() {
    var table = document.getElementById('clan-statistics');
    if (!table) {
        console.error("Таблица не найдена!");
        return;
    }

    const rows = table.querySelectorAll('tbody tr');
    const headerRow = table.querySelector('thead tr');
    const headers = Array.from(headerRow.querySelectorAll('td')).map(cell => cell.textContent);
    const currentTime = new Date().toLocaleString();
    const statistics = {
        date: currentTime,
        id: rank.id,
        name: rank.name,
        total_players_exp: rank.players_exp,
        total_clan_exp: rank.clan_exp,
        total_raiting_exp: rank.raiting_exp,
        headers: headers,
        rows: [],
    };

    rows.forEach((row) => {
        if (!row.classList.contains('no-data-table-excel')) {
            const rowData = [];
            const cells = row.querySelectorAll('td');

            cells.forEach((cell, index) => {
                let cellValue = cell.textContent.trim();
                if (index !== 2) {
                    cellValue = cellValue.replace(/\u00A0/g, '');
            }

            rowData.push(cellValue);
            });

            statistics.rows.push(rowData);
        }
    });

    const json = JSON.stringify(statistics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clan_statistics-' + rank.id + '.json';
    link.click();
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