let loadingScreen = document.getElementById("bg-loading");
const squares = document.querySelectorAll('.line input[type="text"]'); // Seleciona todos os quadrados
const sqKeyboard = document.querySelectorAll('.line-keyboard input[type="button"]');
let retryButton = document.getElementById("retry");
let wordDefH1 = document.getElementById("word-mean");
let meaningH3 = document.getElementById("meaning");
let pageMeaning = document.getElementById("bg-word");

let currentIndex = 0; // Índice do próximo quadrado a ser preenchido
const charLimitWord = 5; // Número de letras para cada palavra
let currentCharNum = 0;
const attemptsNum = 5;
let currentAttempt = 1;
let inputWord = "";
let wordToGuess;
let wordToGuessUpper;
let words = ["",""];
let wordsArrayUpper = ["",""];
let meanings = ["",""];
let indexWord = 0;
let resRandomWord;
let resJson;
let resWordMeaning;
let wordMeaning;

requestRandomWord();
//loadingScreen.style.display = "none";

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
    wordDefH1.innerText = words[indexWord];
    meaningH3.innerText = meanings[indexWord];
}

async function requestWordMeaning(word) {
    try {
        resWordMeaning = await fetch(`https://requestwordmeaning.up.railway.app/api/meaning-request?word=${wordToGuess}`)
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

        let startIndex = (currentAttempt - 1) * charLimitWord;
        let correctLetters = 0;

        inputWord = inputWord.toUpperCase();
        //console.log(wordsArrayUpper[indexWord]);
        let remainingLetters = wordsArrayUpper[indexWord].split(""); // Cópia para controle das letras restantes

        // Primeira passagem: marca apenas os verdes
        for (let i = 0; i < wordToGuess.length; i++) {
            let square = squares[startIndex + i];
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
        window.alert("Parabéns!"+ "\n" + "Você acertou a palavra " + wordsArrayUpper[indexWord] + " em " + currentAttempt + " tentativa(s)");
        retryButton.style.display = "flex";
        pageMeaning.style.display = "flex";
    }
    else if (currentAttempt == attemptsNum && correctLetters != 5) {
        window.alert("Game Over!"+ "\n" + "A palavra era " + wordsArrayUpper[indexWord]);
        retryButton.style.display = "flex";
        pageMeaning.style.display = "flex";
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

    pageMeaning.style.display = "none";
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