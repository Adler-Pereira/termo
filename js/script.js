const loadingScreen = document.getElementById("bg-loading");
const lettersDisplay = document.querySelectorAll('.letter-display'); // Seleciona todos os quadrados
const keyboardKeys = document.querySelectorAll('.keybutton');
const retryButton = document.getElementById("retry");
const meanPage = document.getElementById("bg-word");
const wordMeanPage = document.getElementById("word-mean");
const meaningMeanPage = document.getElementById("meaning");

const attemptsNum = 5;
let currentAttempt = 1;

let wordsArrayUpper = ["",""];
let words = ["",""];
let resRandomWord;
let wordToGuess;
let wordToGuessUpper;
let meanings = ["",""];

let wordMeaning;

const charLimitWord = 5; // Número de letras para cada palavra
let currentCharNum = 0;
let currentIndex = 0; // Índice do próximo quadrado a ser preenchido
let inputWord = "";

let indexWord = 0;

requestRandomWord();
//loadingScreen.style.display = "none";

// Adiciona evento de clique para cada botão do teclado virtual
keyboardKeys.forEach((key) => {
    key.addEventListener("click", () => {
        if (currentAttempt <= attemptsNum) {
            switch (key.value) {
                case "<":
                    deleteLetter();
                    break;
                case "ENVIAR":
                    sendWord();
                    break;
                default:
                    writeLetter(key.value);
                    break;
            }
        }
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


//FUNÇÕES
//API que retorna uma palavra de 5 letras aleatória
async function requestRandomWord() {
    for (let i = 0; i < wordsArrayUpper.length; i++) {
        if (wordsArrayUpper[i] == "" && words[i] == "") {
            try {
                resRandomWord = await fetch(`https://eqmwlsdw2u7uhd36hpnvkcdyla0fzkop.lambda-url.us-east-2.on.aws/`);
                wordToGuess = await resRandomWord.text();
                words[i] = wordToGuess;
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
                wordsArrayUpper[i] = wordToGuessUpper;
                meanings[i] = await requestWordMeaning(wordToGuess);
                
            } catch (error) {
                console.error("Error: ", error);
                //window.alert("Erro ao conectar com o servidor. " + error);
            }
        }
    }
    wordMeanPage.innerText = words[indexWord];
    meaningMeanPage.innerText = meanings[indexWord];
}

async function requestWordMeaning(word) {
    let resWordMeaning;
    let resJson;
    try {
        resWordMeaning = await fetch(`https://request-word-meaning.onrender.com/api/meaning-request?word=${word}`)
        resJson = await resWordMeaning.json();
        wordMeaning = resJson.body;
        return wordMeaning;
    } catch (error) {
        console.log("Error: ", error);
    }
}

// Função para escrever a letra no próximo quadrado disponível
function writeLetter(letter) {
    if (currentCharNum < charLimitWord) {
        lettersDisplay[currentIndex].value = letter;
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
        lettersDisplay[currentIndex].value = "";
        inputWord = inputWord.slice(0, -1);
    }
}

function sendWord() {
    if (currentCharNum === charLimitWord) {

        let startIndex = (currentAttempt - 1) * charLimitWord;
        let correctLetters = 0;

        inputWord = inputWord.toUpperCase();
        //console.log(wordsArrayUpper[indexWord]);
        let remainingLetters = wordsArrayUpper[indexWord].split(""); // Cópia para controle das letras restantes

        // Primeira passagem: marca apenas os verdes
        for (let i = 0; i < wordToGuess.length; i++) {
            let square = lettersDisplay[startIndex + i];
            let keyButton = document.querySelector(`.keyboard-container input[value='${inputWord.charAt(i)}']`);

            if (inputWord.charAt(i) === wordsArrayUpper[indexWord].charAt(i)) {
                square.style.backgroundColor = "green";
                if (keyButton) keyButton.style.backgroundColor = "green";
                correctLetters++;
                remainingLetters[i] = null; // Remove a letra da cópia (já foi usada)
            }
        }

        // Segunda passagem: marca os amarelos sem duplicar letras já usadas
        for (let i = 0; i < wordToGuess.length; i++) {
            let square = lettersDisplay[startIndex + i];
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
        window.alert("Parabéns!"+ "\n" + "Você acertou a palavra " + wordsArrayUpper[indexWord] + " em " + currentAttempt + " tentativa(s)");
        retryButton.style.display = "flex";
        meanPage.style.display = "flex";
    }
    else if (currentAttempt == attemptsNum && correctLetters != 5) {
        window.alert("Game Over!"+ "\n" + "A palavra era " + wordsArrayUpper[indexWord]);
        retryButton.style.display = "flex";
        meanPage.style.display = "flex";
    }
}

//função retry que irá resetar o game quando o botão for pressionado
function RetryButton() {
    //window.alert("apertaro eu :|");
    lettersDisplay.forEach((square) => {
        square.style.backgroundColor = "";
        square.value = "";
    });

    keyboardKeys.forEach((keyBtn) => keyBtn.style.backgroundColor = "");

    meanPage.style.display = "none";
    retryButton.style.display = "none";
    wordsArrayUpper[indexWord] = "";
    words[indexWord] = "";

    if (indexWord == words.length-1) indexWord = 0;
    else indexWord++;

    currentAttempt = 1;
    currentIndex = 0;
    requestRandomWord();
}


retryButton.addEventListener("click", () =>{
    RetryButton();
});