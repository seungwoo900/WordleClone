document.addEventListener("DOMContentLoaded", async () => {
    createSquares();

    let guessedWords = [[]];
    let availableSpace = 1;
    let guessedWordCount = 0;

    let word = "";
    await getNewWord();

    const squares = document.querySelectorAll('.square');
    const buttons = document.querySelectorAll('button[data-key]');

    console.log(squares);
    console.log(buttons);

    async function getNewWord() {
        const apiKey = "YOUR_API_KEY";
        const url = "https://wordsapiv1.p.rapidapi.com/words/?random=true&letters=5&limit=1";

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if(data.word && data.word.length === 5) {
                const isValid = await isWordValid(data.word);
                if(isValid) {
                    word = data.word.toLowerCase();
                    console.log(`Random word: ${word}`);
                } else {
                    getNewWord();
                }
            } else {
                getNewWord();
            }
        } catch (error) {
            console.error("Error fetching a random word: ", error);
        }
    }

    async function isWordValid(word) {
        const apiKey = "YOUR_API_KEY";
        const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return data.word !== undefined;
        } catch (error) {
            console.error("Error checking word validity: ", error);
            return false;
        }
    }

    function getTileColor(letter, index) {
        if(word.charAt(index) === letter) {
            return "rgb(83,141,78)";
        } else if(word.includes(letter)) {
            return "rgb(181,159,59)";
        } else {
            return "rgb(58,58,60)";
        }
    }

    async function handleSubmitWord() {
        const currentWordArr = getCurrentWordArr();

        if(currentWordArr.length != 5) {
            window.alert("Word must be a 5 letters");
            return;
        }
        
        const guessedWord = currentWordArr.join('');
        console.log(guessedWord);

        const isValid = await isWordValid(guessedWord);
        if(!isValid) {
            window.alert("This is not a valid word");
            return;
        }

        const firstLetterId = guessedWordCount * 5 + 1;
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
                const tileColor = getTileColor(letter, index);

                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                if (letterEl) {
                    letterEl.classList.add("animate__flipInX");
                    letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
                } else {
                    console.error(`No element found with ID ${letterId}`);
                }      
            }, interval * index);
        });

        guessedWordCount++;

        if(guessedWord === word) {
            window.alert("Bingo!!");
            return;
        }

        if(guessedWords.length === 6) {
            window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
            return;
        }

        guessedWords.push([]);
    }

    function handleDeleteLetter() {
        const currentWordArr = getCurrentWordArr();
        currentWordArr.pop();
        
        guessedWords[guessedWords.length - 1] = currentWordArr;

        const availableSpaceEl = document.getElementById(String(availableSpace - 1));
        availableSpaceEl.textContent = '';
        availableSpace--;
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArr();

        if(currentWordArr && currentWordArr.length < 5) {
            currentWordArr.push(letter);
            console.log(currentWordArr);

            const availableSpaceEl = document.getElementById(String(availableSpace));
            console.log('Available Space Element:', availableSpaceEl);
            
            // Check if availableSpaceEl is valid and has the expected ID
            if (availableSpaceEl) {
                availableSpaceEl.textContent = letter;
                availableSpace++;
            } else {
                console.error(`No element found with ID ${availableSpace}`);
            }
        }
    }

    function getCurrentWordArr() {
        const numberOfGuessedWords = guessedWords.length;
        const currentWordArr = guessedWords[numberOfGuessedWords - 1];

        return currentWordArr;
    }

    function createSquares() {
        const gameBoard = document.getElementById("board");

        for (let index = 0; index < 30; index++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
    }

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const letter = button.getAttribute('data-key');

            if(letter === 'enter') {
                handleSubmitWord();
                return;
            }

            if(letter === 'del') {
                handleDeleteLetter();
                return;
            }

            updateGuessedWords(letter);
        });
    });

    document.addEventListener('keydown', function (event) {
        const key = event.key.toLowerCase();

        if(key === 'enter') {
            handleSubmitWord();
            return;
        }

        if(key === 'backspace') {
            handleDeleteLetter();
            return;
        }

        if(/^[a-z]$/.test(key)) {
            updateGuessedWords(key);
        }
    });

    const themeCheckbox = document.getElementById('theme-checkbox');
    themeCheckbox.addEventListener('change', function () {
        document.body.classList.toggle('light-mode');
    });
});