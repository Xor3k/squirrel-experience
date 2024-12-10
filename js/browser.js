function detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('k-meleon') !== -1) {
        console.log('Вы используете k-meleon');
        return 'kmeleon';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const browser = detectBrowser();
    const calculatorForm = document.getElementById('calculatorForm');
    
    if (browser === 'kmeleon') {
        const warningBlock = document.createElement('div');
        warningBlock.className = 'calculator-form';
        warningBlock.innerHTML = `
            <div class="result-text " style="text-align: center;">
                Извините, но ваш браузер K-Meleon не работает корректно!<br>
                <span class="result-text-small">
                    Пожалуйста, используйте другой браузер, например:<br>
                    - Google Chrome<br>
                    - Яндекс Браузер<br>
                    - Mozilla Firefox<br>
                    - Microsoft Edge
                </span>
            </div>
        `;
        calculatorForm.parentNode.replaceChild(warningBlock, calculatorForm);
        const statsButton = document.getElementById('statsButton');
        if (statsButton) {
            statsButton.style.display = 'none';
        }
    }
});

// christmas lights - TEMP
function adjustLights() {
    const lightsContainer = document.querySelector('.lights');
    const allLights = lightsContainer.querySelectorAll('li');

    let desiredLights;
    if (window.innerWidth < 480) {
        desiredLights = 4;
    } else if (window.innerWidth < 768) {
        desiredLights = 7;
    } else if (window.innerWidth < 1024) {
        desiredLights = 9;
    } else {
        desiredLights = 15;
    }
    
    allLights.forEach((light, index) => {
        if (index < desiredLights) {
            light.style.display = ''; 
        } else {
            light.style.display = 'none';
        }
    });

    // отступы между фонариками
    const visibleLights = lightsContainer.querySelectorAll('li:not([style*="display: none"])');
    const spacing = 100 / (visibleLights.length - 1);
    
    visibleLights.forEach((light, index) => {
        light.style.position = 'absolute';
        light.style.left = `${spacing * index}%`;
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function adjustDecorations() {
    const positions = {
        'image-1': { left: 7, top: 22 },
        'image-2': { left: 20, top: 40 },
        'image-3': { left: 15, bottom: 10 },
        'image-4': { right: 12, top: 10 },
        'image-5': { right: 17, top: 40 },
        'image-6': { right: 5, bottom: 10 },
        'image-7': { right: 30, bottom: 25 }
    };

    Object.entries(positions).forEach(([className, basePosition]) => {
        const element = document.querySelector(`.${className}`);
        if (element) {
            const horizontalOffset = (Math.random() - 0.5) * 10;
            const verticalOffset = (Math.random() - 0.5) * 5;

            if (basePosition.left !== undefined) {
                element.style.left = `${basePosition.left + horizontalOffset}%`;
            }
            if (basePosition.right !== undefined) {
                element.style.right = `${basePosition.right + horizontalOffset}%`;
            }
            if (basePosition.top !== undefined) {
                element.style.top = `${basePosition.top + verticalOffset}%`;
            }
            if (basePosition.bottom !== undefined) {
                element.style.bottom = `${basePosition.bottom + verticalOffset}%`;
            }
        }
    });
}

let lastContainerHeight = 0;

function checkContainerHeight() {
    const container = document.querySelector('.container');
    const currentHeight = container.scrollHeight;
    
    // Если высота контейнера увеличилась
    if (currentHeight > lastContainerHeight) {
        createImagesInRange(lastContainerHeight, currentHeight);
        lastContainerHeight = currentHeight;
    }
}

function createImagesInRange(startY, endY) {
    const container = document.querySelector('.container');
    const imagesPerSection = Math.floor((endY - startY) / 150);
    
    const images = [
        'img/jewellery/thee-ball-1.png',
        'img/jewellery/thee-ball-2.png',
        'img/jewellery/thee-ball-3.png',
        'img/jewellery/thee-ball-4.png',
        'img/jewellery/thee-ball-5.png',
        'img/jewellery/star.png'
    ];

    for (let i = 0; i < imagesPerSection; i++) {
        const img = document.createElement('img');
        img.src = images[Math.floor(Math.random() * images.length)];
        img.className = 'floating-image fade-in';
        img.style.position = 'absolute';
        img.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        img.style.top = startY + (Math.random() * (endY - startY)) + 'px';
        
        container.appendChild(img);
    }
}

const observer = new MutationObserver(debounce(() => {
    checkContainerHeight();
}, 100));

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    
    // Инициализация высоты и создание изображений
    lastContainerHeight = container.scrollHeight;
    createImagesInRange(0, lastContainerHeight);
    
    observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
    adjustLights();
    adjustDecorations();
});

window.addEventListener('resize', debounce(adjustLights, 150));