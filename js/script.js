let currentIndex = 0; // Índice do próximo quadrado a ser preenchido
const squares = document.querySelectorAll('.line input[type="text"]'); // Seleciona todos os quadrados
const sqKeyboard = document.querySelectorAll('.line-keyboard input[type="button"]');
let retryButton = document.getElementById("retry");
let loadingScreen = document.getElementById("bg-loading");
const charLimitWord = 5; // Número de letras para cada palavra
let currentCharNum = 0;
const attemptsNum = 5;
let currentAttempt = 1;
let inputWord = "";
let wordToGuess;
let wordToGuessUpper;
let wordsArray = ["","","","",""];
let indexWord = 0;
let response;

ApiConnection();
//loadingScreen.style.display = "none";

async function ApiConnection() {
    for (let i = 0; i < wordsArray.length; i++) {
        if (wordsArray[i] == "") {
            try {
                response = await fetch(`https://eqmwlsdw2u7uhd36hpnvkcdyla0fzkop.lambda-url.us-east-2.on.aws/`);
                wordToGuess = await response.text();
                wordToGuessUpper = wordToGuess.toUpperCase();
        
                for (let j = 0; j < wordToGuess.length; j++) {
                    wordToGuessUpper = wordToGuessUpper.replace(/[Ç]/g, "C");
                    wordToGuessUpper = wordToGuessUpper.replace(/[ÁÃÂ]/g, "A");
                    wordToGuessUpper = wordToGuessUpper.replace(/[ÉÊ]/g, "E");
                    wordToGuessUpper = wordToGuessUpper.replace(/[ÍÎ]/g, "I");
                    wordToGuessUpper = wordToGuessUpper.replace(/[ÓÕÔ]/g, "O");
                    wordToGuessUpper = wordToGuessUpper.replace(/[ÚÛ]/g, "U");
                }
    
                loadingScreen.style.display = "none";
                wordsArray[i] = wordToGuessUpper;
                console.log(wordsArray[i]);
            } catch (error) {
                window.alert("Erro ao conectar com o servidor. " + error);
            }
        }
    }
}

// Adiciona evento de clique para cada botão do teclado virtual
document.querySelectorAll('.keyboard-container input[type="button"]').forEach((btn) => {
    btn.addEventListener("click", () => {
        if (currentAttempt <= attemptsNum) {
            switch (btn.value) {
                case "<":
                    deleteLetter();
                    break;
                case "ENVIAR":
                    sendWord();
                    break;
                default:
                    writeLetter(btn.value);
                    break;
            }
        }
        console.log(inputWord + " " + currentCharNum);
    });
});

// Adiciona evento para capturar a digitação pelo teclado físico
document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase(); // Converte para maiúscula

    if (currentAttempt <= attemptsNum) {
        if (/^[A-Z]$/.test(key)) {
            // Se for uma letra de A-Z, escreve no quadrado
            writeLetter(key);
        } else if (event.key === "Backspace") {
            // Se a tecla pressionada for "Backspace", apaga a última letra
            deleteLetter();
        }
        else if (event.key === "Enter") {
            // Se a tecla pressionada for "Enter", envia a palavra
            sendWord();
        }
    }
    //console.log(inputWord + " " + currentCharNum);
});

// Função para escrever a letra no próximo quadrado disponível
function writeLetter(letter) {
    if (currentCharNum < charLimitWord) {
        squares[currentIndex].value = letter;
        currentIndex++;
        currentCharNum++;
        inputWord += letter;
    }
}

// Função para apagar a última letra digitada
function deleteLetter() {
    if (currentCharNum > 0) {
        currentIndex--;
        currentCharNum--;
        squares[currentIndex].value = "";
        inputWord = inputWord.slice(0, -1);
    }
}

function sendWord() {
    if (currentCharNum === charLimitWord) {
        console.log("envieikk");

        let startIndex = (currentAttempt - 1) * charLimitWord;
        let correctLetters = 0;

        inputWord = inputWord.toUpperCase();
        //console.log(wordsArray[indexWord]);
        let remainingLetters = wordsArray[indexWord].split(""); // Cópia para controle das letras restantes

        // Primeira passagem: marca apenas os verdes
        for (let i = 0; i < wordToGuess.length; i++) {
            let square = squares[startIndex + i];
            let keyButton = document.querySelector(`.keyboard-container input[value='${inputWord.charAt(i)}']`);

            if (inputWord.charAt(i) === wordsArray[indexWord].charAt(i)) {
                square.style.backgroundColor = "green";
                if (keyButton) keyButton.style.backgroundColor = "green";
                correctLetters++;
                remainingLetters[i] = null; // Remove a letra da cópia (já foi usada)
            }
        }

        // Segunda passagem: marca os amarelos sem duplicar letras já usadas
        for (let i = 0; i < wordToGuess.length; i++) {
            let square = squares[startIndex + i];
            let letter = inputWord.charAt(i);
            let keyButton = document.querySelector(`.keyboard-container input[value='${letter}']`);

            if (square.style.backgroundColor !== "green" && remainingLetters.includes(letter)) {
                square.style.backgroundColor = "yellow";
                if (keyButton && keyButton.style.backgroundColor !== "green") {
                    keyButton.style.backgroundColor = "yellow";
                }
                remainingLetters[remainingLetters.indexOf(letter)] = null; // Remove a primeira ocorrência usada
            } else if (square.style.backgroundColor !== "green") {
                square.style.backgroundColor = "red";
                if (keyButton && keyButton.style.backgroundColor !== "green" && keyButton.style.backgroundColor !== "yellow") {
                    keyButton.style.backgroundColor = "red";
                }
            }
        }

        checkEndGame(correctLetters);
        currentCharNum = 0;
        inputWord = "";
        currentAttempt++;

    }
}

function checkEndGame(correctLetters) {
    if (correctLetters == 5) {
        window.alert("Parabéns!"+ "\n" + "Você acertou a palavra " + wordsArray[indexWord] + " em " + currentAttempt + " tentativa(s)");
        retryButton.style.display = "flex";
    }
    else if (currentAttempt == attemptsNum && correctLetters != 5) {
        window.alert("Game Over!"+ "\n" + "A palavra era " + wordsArray[indexWord]);
        retryButton.style.display = "flex";
    }
}

//função retry que irá resetar o game quando o botão for pressionado
function RetryButton() {
    //window.alert("apertaro eu :|");
    squares.forEach((square) => {
        square.style.backgroundColor = "";
        square.value = "";
    });

    sqKeyboard.forEach((keyBtn) => keyBtn.style.backgroundColor = "");

    retryButton.style.display = "none";
    wordsArray[indexWord] = "";

    if (indexWord == 4) indexWord = 0;
    else indexWord++;

    currentAttempt = 1;
    currentIndex = 0;
    ApiConnection();
}


retryButton.addEventListener("click", () =>{
    RetryButton();
});
