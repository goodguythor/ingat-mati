document.addEventListener('DOMContentLoaded', () => {
    const backs = document.querySelectorAll('.back');
    const fronts = document.querySelectorAll('.front');
    const cells = document.querySelectorAll('.cell');
    const scoreDisplay = document.querySelector('.score');
    const turnDisplay = document.querySelector('.turns');
    const resetButton = document.querySelector('button');
    const playerName = document.querySelector('.player-name'); 
    let clicked = 0;
    let score = 0;
    let turns = 0;
    let playerNameValue = ""; 
    const API_URL = 'http://localhost:5000'; 

    scoreDisplay.textContent = `Score: ${score}`;
    turnDisplay.textContent = `Turns: ${turns}`;
    playerName.textContent = `Player: ${playerNameValue}`;

    function updateLeaderboard() {
        fetch(`${API_URL}/leaderboard`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#leaderboard-table tbody');
                tbody.innerHTML = '';
                data.forEach((entry, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${entry.playerName}</td>
                        <td>${entry.turns}</td>
                    `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Failed to fetch leaderboard:', error);
            });
    }
    updateLeaderboard();    

    const preLoadImages = (urls) => {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    const generatePairs = () => {
        const baseImages = Array.from({ length: 8 }, (_, i) => `https://goodguythor.github.io/ingat-mati/assets/images/brainrot/${i + 1}.jpg`);
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
        turns = 0;
        playerNameValue = "";
        playerName.textContent = `Player: ${playerNameValue}`;
        turnDisplay.textContent = `Turns: ${turns}`;
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
                                fetch(`${API_URL}/leaderboard`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        playerName: playerNameValue || "Anonymous",
                                        turns: turns,
                                    }),
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to post leaderboard data');
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    console.log('Leaderboard updated:', data);
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                                fetch(`${API_URL}/leaderboard`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to post leaderboard data');
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    console.log('Leaderboard updated:', data);
                                    updateLeaderboard(); // <--- Add this
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                                resetButton.click();
                            }
                        }, 500);
                    }
                    flippedCells.forEach(cell => cell.classList.remove('flipped'));
                    clicked = 0;
                    turns++;
                    turnDisplay.textContent = `Turns: ${turns}`;
                }, 1000);
            }
        });
    });
});