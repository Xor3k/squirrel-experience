const skillNames = {
    0: "Большой орех",
    1: "Массовое безумие",
    2: "Обожание шамана",
    3: "Дух моржа",
    4: "Тонкий лёд",
    5: "Ледяной куб",
    6: "Руна",
    7: "Цепкие коготки",
    8: "Аура шустрости",
    9: "Указатель",
    10: "Отстающий",
    11: "Воодушевление",
    12: "Друг шамана",
    13: "Телепорт",
    14: "Беличье счастье",
    15: "Любимчик",
    16: "Массовое бессмертие",
    17: "Большая голова",
    18: "Тучка",
    19: "Тяжелый шаман",
    20: "Капитуляция",
    21: "Летун",
    22: "Улучшенный телекинез",
    23: "Фронтальный телепорт",
    24: "Капитан крюк",
    25: "Шустряк",
    26: "Ленивый шаман",
    27: "Повелитель времени",
    28: "Концентрация",
    29: "Умелец",
    30: "Карманный телепорт",
    31: "Райские врата",
    32: "Сосредоточение",
    33: "Бессмертный шам",
    34: "Динамит",
    35: "Гелий",
    36: "Тяжелая гиря",
    37: "Помощник",
    38: "Скачок",
    39: "Билет в одну сторону",
    41: "Таймер",
    42: "Оплот",
    43: "Духи предков",
    44: "Замедление времени",
    45: "Гроза",
    46: "Грави-блок",
    47: "Уничтожитель",
    48: "Режим рисования",
    49: "Мастер порталов",
    50: "Крановщик",
    51: "Безопасный путь",
};

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
        const data = await getData(document.getElementById('player').value);
        clearTimeout(loadingTimeout);

        const resultBlock = document.getElementById('result');
        if (!data || data === 'errorMessage'  || data === 'error' || data.shaman_skills.length == 0) {
            if (data.shaman_skills.length == 0) {
                throw new Error('error skills');
            }
            if (timeoutTriggered) {
                throw new Error('error connection');
            }
            throw new Error();
        }

        console.log('Спасибо за использование Squirrel EXperience!)');
        console.log('Данные предоставлены squirrelsquery.yukkerike.ru. Обязательно посетите https://squirrelsquery.yukkerike.ru для поддержки!');
        
        const professions = [
            { name: "Наставник", start: 0, end: 16 },
            { name: "Вожак", start: 17, end: 33 },
            { name: "Творец", start: 34, end: 51 }
        ];

        const skillLevels = {};
        data.shaman_skills.forEach(skill => {
            skillLevels[skill.skillId] = skill.levelFree + skill.levelPaid;
        });

        data.shaman_skills.sort((a, b) => a.skillId - b.skillId);

        const playerProfession = professions.find(profession =>
            data.shaman_skills.some(skill => skill.skillId >= profession.start && skill.skillId <= profession.end)
        );

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
                | Текущий уровень: ${data.level}  [${data.shaman_level}] <br>
                ${data.moderator == 1 ? `
                    <div class="result-additional warning-color">
                        Внимание! Игрок является модератором чата!
                    </div>
                ` : ''}
            </div>
            <div class="result-additional">
                <a class="header-link" href="https://squirrelsquery.yukkerike.ru/user/${data.uid}" target="_blank">Карточка игрока</a>
            </div><br> 
            <div class="result-text">
                У игрока сейчас выбран: ${playerProfession.name}
            </div>
            <div class="result-text">    
                ${playerProfession ? `
                    <div class="result-text-small">
                        Имеется ${data.shaman_skills.length} навыков из 17 возможных: <br>
                        ${Array.from({ length: playerProfession.end - playerProfession.start + 1 }, (_, i) => {
                            const skillId = playerProfession.start + i;
                            
                            if (skillId === 40) return ''; 

                            const skillName = skillNames[skillId];
                            const skillLevel = skillLevels[skillId] || 0;
                            const className = skillLevel > 2 && skillLevel < 5 ? 'shaman-skills-part' : skillLevel == 6 ? 'shaman-skills-full' : '';

                            // Исключение навыка с ID 40, так как он, почему-то, пропущен, получая навыки игрока от сервера в data.shaman_skills
                            // В исключение имею ввиду то, что я вывожу как currentIndex. Номер навыка в профессии, исключая 40-ой ID навыка
                            const filteredSkills = Array.from({ length: playerProfession.end - playerProfession.start + 1 })
                                .map((_, i) => playerProfession.start + i)
                                .filter(skillId => skillId !== 40);  
                            const currentIndex = filteredSkills.indexOf(skillId);

                            return `
                                <div>
                                    ${currentIndex + 1}. ${skillName}: 
                                    <span class="${className}"> ${skillLevel} / 6 </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ``}
            </div>
        `;
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
    } catch (error) {
        const resultBlock = document.getElementById('result');
        let resultHTML = '';
        if (error.message === 'error connection') {
            resultHTML = `
                <div class="error-message">
                    <div class="error-title">Похоже, сервер игры отключен...</div> <br>
                    <div class="error-description">
                        Соединение с сервером игры прервано. Попробуйте позже. 
                    </div>
                </div>
            `;
        } else if (error.message === 'error skills'){
            resultHTML = `
                <div class="error-message">
                    <div class="error-title">Не получилось получить навыки!</div>
                    <div class="error-description">
                        Кажется, игрок не имеет навыков. Как так? <br>
                        Скорее всего игрок не прошел "школу шамана" и / или не выбрал навыки шамана в самом начале игры. 
                    </div>
                </div>
            `;
        } else {
            resultHTML = `
                <div class="error-message">
                    <div class="error-title">Произошла ошибка!</div>
                    <div class="error-description">
                        Не удалось получить данные игрока. Возможно, указан неверный UID или связь прервана. <br>
                        Повторите попытку еще раз. 
                    </div>
                </div>
            `;
        }
        resultBlock.innerHTML = resultHTML;
        resultBlock.classList.remove('hidden');
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