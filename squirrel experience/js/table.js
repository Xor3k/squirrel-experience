function fillRatingTable() {
    
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
            <td style="width: 1%; text-align: left;">${index + 1}</td>
            <td style="width: 12%; text-align: left;">${player.uid}</td>
            <td style="width: 26%; text-align: left;">${player.name} [${detectLevelByExp(player.exp)}]</td>
            <td style="width: 20%; text-align: center;">
                ${max_shaman_rating === player.shaman_rating ? `
                    <span class="max-count-rating">${player.shaman_rating.toLocaleString()}</span>
                ` : `
                    <span>${player.shaman_rating.toLocaleString()}</span>
                `}
            </td>
            <td style="width: 24%; text-align: center;">
                ${max_player_rating === player.player_rating ? `
                    <span class="max-count-rating">${player.player_rating.toLocaleString()}</span>
                ` : `
                    <span>${player.player_rating.toLocaleString()}</span>
                `}
            </td>
            <td style="width: 17%; text-align: center;">
                ${parseFloat(max_koef) == parseFloat(current_koef) ? `
                    <span class="max-count-rating">${current_koef}</span>
                ` : `
                    <span>${current_koef}</span>
                `}
            </td>
        `;
        table.appendChild(row);
    });
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

document.addEventListener('DOMContentLoaded', fillRatingTable);