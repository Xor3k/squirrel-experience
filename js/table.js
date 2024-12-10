function fillRatingTable() {
    const table = document.querySelector('.rating-table');
    
    Object.values(playerData).forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'result-additional';
        row.innerHTML = `
            <td style="width: 2%; text-align: left;">${index + 1}</td>
            <td style="width: 13%; text-align: left;">${player.uid}</td>
            <td style="width: 30%; text-align: left;">${player.name[0]}</td>
            <td style="width: 35%; text-align: left;">
                ${player.rating_info.rating_shaman.toLocaleString()} / ${player.rating_info.rating_player.toLocaleString()}
            </td>
            <td style="width: 20%; text-align: center;">
                "No data"
            </td>
        `;
        table.appendChild(row);
    });
}
document.addEventListener('DOMContentLoaded', fillRatingTable);