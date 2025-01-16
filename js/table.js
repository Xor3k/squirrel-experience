function fillRatingTable() {
    let date_reload = document.getElementById('text-date-reload-table');
    date_reload.innerText = 'Последнее обновление: ' + dateReloadTable.toLocaleString();
    
    let table = document.getElementById('rating-table-data');
    let max_player_rating = Math.max(...playerData.users.map(p => p.player_rating));
    let max_shaman_rating = Math.max(...playerData.users.map(p => p.shaman_rating));
    let max_koef = 0;

    playerData.users.forEach((player) => {
        let current_koef = (player.shaman_rating / player.player_rating).toFixed(2);
        if (parseFloat(current_koef) > parseFloat(max_koef)) {
            max_koef = current_koef;
        }
    });

    playerData.users.forEach((player, index) => {
        let current_koef = (player.shaman_rating / player.player_rating).toFixed(2);
        const row = document.createElement('tr');
        row.className = 'result-additional';
        row.innerHTML = `
            <td style="width: 4%; text-align: left;">${index + 1}</td>
            <td style="width: 13%; text-align: left;">| ${player.uid}</td>
            <td style="width: 27%; text-align: left;">
                <div class="hidden-container" id="hidden-container"> 
                    <span> ${player.name} [${detectLevelByExp(player.exp)}] </span>
                    <div class="popup" id="popup">
                        <button class="copy-button-profile" data-copy="${player.uid}">Скопировать UID</button>
                        <button class="copy-button-profile" data-copy="${player.name}">Скопировать Ник</button> 
                        ${player.person_info !== 'profile not found' && player.person_info !== null && player.person_info !== '' ? `
                            <button onclick="window.open('${player.person_info}', '_blank')">Открыть профиль: `+ detectSocialNetwork(player.person_info) + `</button>
                        ` : `
                            <button class="button-disabled">Профиль не найден</button>
                        `}
                        <button class="copy-button-profile" onclick="window.open('https://squirrelsquery.yukkerike.ru/user/${player.uid}', '_blank')">Перейти на yukkerike + UID</button> 
                    </div> 
                </div>
            </td>
            <td style="width: 23%; text-align: center;">
                ${max_shaman_rating === player.shaman_rating ? `
                    <span class="max-count-rating">${player.shaman_rating.toLocaleString()}</span>
                ` : `
                    <span>${player.shaman_rating.toLocaleString()}</span>
                `}
            </td>
            <td style="width: 23%; text-align: center;">
                ${max_player_rating === player.player_rating ? `
                    <span class="max-count-rating">${player.player_rating.toLocaleString()}</span>
                ` : `
                    <span>${player.player_rating.toLocaleString()}</span>
                `}
            </td>
            <td style="width: 10%; text-align: center;">
                ${parseFloat(max_koef) == parseFloat(current_koef) ? `
                    <span class="max-count-rating">${current_koef}</span>
                ` : `
                    <span>${current_koef}</span>
                `}
            </td>
        `;
        table.appendChild(row);
    });

    innerImpontantText();
}

function detectLevelByExp(exp) {
    if (exp < 4292475) {
        return '...150';
    }

    for (let level in levelRequirements) {
        if (exp <= levelRequirements[level]) {
            return level - 1;
        }
    }
    return 200;
}

function detectSocialNetwork(url) {
    const patterns = [
        { network: "VK", pattern: /https?:\/\/(?:www\.)?vk\.(com|ru)\/.*/i },
        { network: "OK", pattern: /https?:\/\/(?:www\.)?(ok\.ru|odnoklassniki\.ru)\/.*/i },
        { network: "Facebook", pattern: /https?:\/\/(?:www\.)?facebook\.com\/.*/i },
        { network: "Email", pattern: /https?:\/\/(?:www\.|my\.)?mail\.ru\/.*/i },
        { network: "Fotostrana", pattern: /https?:\/\/(?:www\.)?fotostrana\.ru\/.*/i },
    ];

    for (const { network, pattern } of patterns) {
        if (pattern.test(url)) {
            return network;
        }
    }
    return "Unknown";
}

function makeButton() {
    const hiddenContainers = document.querySelectorAll('.hidden-container');

    hiddenContainers.forEach(container => {
        const popup = container.querySelector('.popup');

        container.addEventListener('mouseenter', () => {
            popup.classList.add('visible');
        });

        container.addEventListener('mouseleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                popup.classList.remove('visible');
            }
        });
    });
}

function initializeSortableTable() {
    const tableBody = document.getElementById('rating-table-data');
    const headers = document.querySelectorAll('.sortable');

    let currentSortColumn = null;
    let currentSortDirection = -1;

    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            if (currentSortColumn === index) {
                currentSortDirection *= -1;
            } else {
                currentSortColumn = index;
                currentSortDirection = -1;
            }

            sortTable(tableBody, currentSortColumn, currentSortDirection);
        });
    });
}

function sortTable(tableBody, columnIndex, direction) {
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const parseCellValue = (cellText, columnIndex) => {
        if (columnIndex === 1) {
            return cellText.replace(/\|\s*/, '').trim();
        }
        return cellText.trim();
    };

    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex]?.innerText || '';
        const cellB = rowB.children[columnIndex]?.innerText || '';

        const valueA = parseCellValue(cellA, columnIndex);
        const valueB = parseCellValue(cellB, columnIndex);

        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return direction * (numA - numB);
        }
        
        return direction * valueA.localeCompare(valueB, 'ru');
    });

    tableBody.innerHTML = '';
    rows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
        tableBody.appendChild(row);
    });
}

function innerImpontantText(){
    const importantText = document.getElementById('planet');
    importantText.innerHTML = `
        <span class="not-highlight-text-table">You found</span>S<span class="not-highlight-text-table">quirrel</span> EX<span class="not-highlight-text-table">perience!</span>
        <div class="container-planet">
            <div class="sphere"></div>
            <div class="particle orbit1"></div>
            <div class="particle orbit2"></div>
            <div class="particle orbit3"></div>
        </div>
    `
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

document.addEventListener('DOMContentLoaded', () => {
    fillRatingTable();
    initializeSortableTable();
});

window.addEventListener('load', makeButton);