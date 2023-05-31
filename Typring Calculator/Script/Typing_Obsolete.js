let typingStartTime = null;
let typingStopTime = null;
let passedSeconds = 0;
let speedInSeconds = 0;
let wordsTypedCount = 0;
let wrongWordTypedArr = null;

let masterTextData = null;
let assignedTextData = null;
let userTypedText = null;

let maxTestDuration = 10 * 60;
let minAssignedWords = 10;

let timerInterval;

let lastWordTyped = null;

$(window).on("load", function () {
    handleBrowserDefaultErrors();
    toggleAssignmentTextbox();
    handleTypingUI();
});

function handleFileSelect(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        masterTextData = reader.result;
        handleTypingUI();
        setTypingAssignment();
    };
    reader.onerror = function () {
        console.log(reader.error);
    };
}

function setTypingAssignment() {
    if (masterTextData.length < 1) {
        return;
    }

    assignedTextData = removeEnterWithoutPeriod(masterTextData.trim());
   
    while (assignedTextData.split(' ').length < minAssignedWords)
    {
        assignedTextData = assignedTextData + " " + assignedTextData;
    }
    $('#assignmentTextBox').val(assignedTextData);
}

function startTyping(event) {
    let typingBox = document.getElementById("txtBox");

    if(lastWordTyped == 'Tab' && event.key == ' '){
        console.log("Tab with space typed");
    }

    lastWordTyped = event.key;

    enableTexareaTab(event, typingBox);

    if (typingStartTime === null) {
        typingStartTime = new Date();
        typingBox.focus();

        startTimer();
    }
}

function stopTyping() {
    typingStopTime = new Date();
    clearInterval(timerInterval);
    freezTypingTextBox();

    userTypedText = $("#txtBox").val();

    $("#stopButton").hide();
    $("#chkSpell").prop("checked", true);

    handleTypingUI();
    compareUserAndMasterText();
    computeTypingInfo();
}

function freezTypingTextBox() {
    $("#txtBox").on("keypress", function (e) {
        e.preventDefault();
    });
}

function startTimer() {
    timerInterval = setInterval(function () {
        let d = new Date();
        passedSeconds = (d - typingStartTime) / 1000;
        let min = passedSeconds / 60;
        let sec = passedSeconds % 60;

        if (passedSeconds >= maxTestDuration) {
            stopTyping();
        }

        $("#timer").text(twoDecimalPlace(min) + ":" + twoDecimalPlace(sec));
    }, 1000);
}

function twoDecimalPlace(myNumber) {
    myNumber = parseInt(myNumber);
    return ("0" + myNumber).slice(-2);
}

function handleBrowserDefaultErrors() {
    let chkBox = document.getElementById("chkSpell");
    $("#txtBox").attr("spellcheck", chkBox.checked);
}

function toggleAssignmentTextbox() {
    let chkBox = document.getElementById("chkShowAssignmentText");
    if (chkBox.checked) {
        $("#assignmentTextBox").show();
    }
    else {
        $("#assignmentTextBox").hide();
    }
}

function handleTypingUI() {

    $("#sourceFile").hide();
    $('#typingInfoDiv').hide();
    $("#typingDiv").hide();
    $("#comparedTextDiv").hide();

    if (masterTextData === null) {
        $("#sourceFile").show();
    }
    else if (typingStopTime === null) {
        $('#typingInfoDiv').show();
        $("#typingDiv").show();
    }
    else {
        $('#typingInfoDiv').show();
        $("#comparedTextDiv").show();
    }
}

function Obsolete_compareUserAndMasterText() {
    wrongWordTypedArr = [];
    let comparedTextDiv = document.getElementById("comparedTextDiv");
    comparedTextDiv.textContent = null;

    let assignTextArr = assignedTextData.split(' ');
    let typedTextArr = userTypedText.split(' ');

    typedTextArr.forEach(function (typedWord, idx) {

        let assignedWord = null;
        if (assignTextArr.length > idx) {
            assignedWord = assignTextArr[idx];
        }

        let tabIdx = typedWord.indexOf('\t');

        if (tabIdx >= 0) {
            handleWordWithTab(comparedTextDiv, typedWord, assignedWord);
        }
        else {
            let isCorrect = typedWord === assignedWord;
            printResultWord(comparedTextDiv, typedWord, isCorrect, assignedWord);
        }

        comparedTextDiv.innerHTML += ' ';
    });
}

function Obsolete_handleWordWithTab(div, userWord, TargedWord) {
    let typedTextArr = userWord.split('\t');
    let assignTextArr = TargedWord.split('\t');

    typedTextArr.forEach(function (typedWord, idx) { 
        let assignedWord = null;

        if (assignTextArr.length > idx) {
            assignedWord = assignTextArr[idx];
        }

        let isCorrect = typedWord === assignedWord;

        printResultWord(comparedTextDiv, typedWord, isCorrect, assignedWord);

        if (typedTextArr.length - 1 > idx) {
            printResultWord(div, '\t', isCorrect, assignedWord);
        }
    });
}

function printResultWord(div, text, isCorrect, tooltip) {
    let wordSpan = document.createElement('span');

    if (text === '\t') {
        text = "_______";
        wordSpan.classList.add('tabSpan');
    }
    else {
        wordsTypedCount++;
        if (isCorrect) {            
            wordSpan.classList.add('correctWord');
        } else {
            wrongWordTypedArr.push(tooltip);

            wordSpan.classList.add('incorrectWord');
            if(tooltip !== null){
                wordSpan.setAttribute("title", tooltip);
            }
        }
    }

    wordSpan.innerText = text;
    div.appendChild(wordSpan);
}

function computeTypingInfo() {

    let accurateTypedWord = wordsTypedCount - wrongWordTypedArr.length;
    let accuracy = (accurateTypedWord / wordsTypedCount) * 100;
    speedInSeconds = accurateTypedWord / passedSeconds;

    $("#accuracy").text(accuracy.toFixed(2));
    $("#mistakes").text(wrongWordTypedArr.length);
    $("#speedValue").text(twoDecimalPlace(speedInSeconds * 60));
    $("#wordsTyped").text(accurateTypedWord);
}

function removeEnterWithoutPeriod(rawData) {
    let myArray = rawData.split("\n");
    let data = "";

    myArray.forEach(text => {
        text = text.trim();

        if (text.length > 0) {

            text = text.replace(/\s\s+/g, ' ');

            if (text.endsWith(".")) {
                text = text + "\n"; // add enter
                text = text + "\t"; // add tab for next line
            }
            else {
                text = text + " ";
            }

            data = data + text;
        }
    });
    return data.trim();
}

function enableTexareaTab(event, typingBox) {
    if (event.key == 'Tab') {
        event.preventDefault();
        var start = typingBox.selectionStart;
        var end = typingBox.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        typingBox.value = typingBox.value.substring(0, start) +
            "\t" + typingBox.value.substring(end);

        // put caret at right position again
        typingBox.selectionStart =
            typingBox.selectionEnd = start + 1;
    }
}

// Store your data.
function setLocalStorage(obj) {
    localStorage.mistakes = JSON.stringify(obj);
}

// Do something with your data.
function getLocalStorage() {
    return JSON.parse(localStorage.mistakes || null) || [];
}