document.addEventListener('DOMContentLoaded', () => {
    const backs = document.querySelectorAll('.back');
    const fronts = document.querySelectorAll('.front');
    const cells = document.querySelectorAll('.cell');
    const scoreDisplay = document.querySelector('.score');
    const resetButton = document.querySelector('button');
    let clicked = 0;
    let score = 0;

    scoreDisplay.textContent = `Score: ${score}`;

    const preLoadImages = (urls) => {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    const generatePairs = () => {
        const baseImages = Array.from({ length: 8 }, (_, i) => `./assets/images/brainrot/${i + 1}.jpg`);
        const imagePairs = [...baseImages, ...baseImages];
        return imagePairs.sort(() => Math.random() - 0.5);
    }

    const resetGame = () => {
        const shuffledImages = generatePairs();

        preLoadImages(shuffledImages);

        backs.forEach((element, index) => {
            const img = new Image();
            img.onload = () => {
                element.style.backgroundImage = `url(${shuffledImages[index]})`;
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${shuffledImages[index]}`);
                element.style.backgroundColor = 'black'; 
            };
            img.src = shuffledImages[index];
        })
        cells.forEach(cell => {
            cell.classList.remove('flipped', 'matched');
        });
    }

    resetGame();

    resetButton.addEventListener('click', () => {
        clicked = 0;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        resetGame();
    });

    fronts.forEach((element, index) => {
        element.textContent = `Alomani ${index + 1}`;
    });

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (clicked === 2 || cell.classList.contains('flipped') || cell.classList.contains('matched')) {
                return; // Ignore clicks on already matched or flipped cells
            }
            cell.classList.toggle('flipped');
            clicked++;
            if (clicked === 2) {
                setTimeout(() => {
                    const flippedCells = Array.from(cells).filter(cell => cell.classList.contains('flipped'));
                    const backCells = flippedCells.map(cell => cell.querySelector('.back'));
                    if(backCells[0].style.backgroundImage === backCells[1].style.backgroundImage) {
                        // console.log('flippedCells[0].style.backgroundImage', flippedCells[0].style.backgroundImage);
                        // console.log('flippedCells[1].style.backgroundImage', flippedCells[1].style.backgroundImage);
                        score++;
                        scoreDisplay.textContent = `Score: ${score}`;
                        flippedCells.forEach(cell => cell.classList.add('matched'));
                        setTimeout(() => {
                            if(score === 8) {
                                alert('You won!');
                                resetButton.click();
                            }
                        }, 500);
                    }
                    flippedCells.forEach(cell => cell.classList.remove('flipped'));
                    clicked = 0;
                }, 1000);
            }
        });
    });
});