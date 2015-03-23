'use strict';
/* stable version 564 */

function checkInput() {
    var guess = get('inputarea').value;
    //if (guess == 'test win') endQuiz('win');
    for (var i = 0; i < quiz.clues.length; i++) {
        var answers = quiz.answers[i];
        for (var j = 0; j < answers.length; j++) {
            var answer = answers[j];
            if (guess.toLowerCase() == answer.toLowerCase()) {
                var clue = quiz.clues[i];
                revealAnswer(clue, answers[0], true);
                if (guessed(clue)) {
                    flashCellBG(get(clue + '_answer'), 1, true);
                } else {
                    get('inputarea').value = '';
                    quiz.correctAnswers.push(clue);
                    updateNumberCorrect(quiz.correctAnswers.length);
                }
            }
        }
    }
}

function flashCellBG(cell, speed, guessed) {
    var from = (guessed) ? '#66CCFF' : '#FF1111';
    var to = (guessed) ? '#FFFFFF' : '#FFFFEE';
    cell.style.transition = '';
    cell.style['-webkit-transition'] = '';
    cell.style.backgroundColor = from;
    window.getComputedStyle(cell).backgroundColor;
    cell.style.transition = 'background ' + speed + 's';
    cell.style['-webkit-transition'] = 'background ' + speed + 's'; 
    cell.style.backgroundColor = to;
}

function revealAnswer(clue, answer, guessed) {
    var cell = get(clue + '_answer');
    cell.innerHTML = answer;
    flashCellBG(cell, (guessed) ? 2 : 1, guessed);
    if (!guessed) {
        cell.style.color = '#FF1111';
    }
}

function guessed(clue) {
    return quiz.correctAnswers.indexOf(clue) >= 0;
}

function endQuiz(reason) {
    // reason accepts 'win', 'giveUp', or 'timesUp'

    clearInterval(quiz.timerId);

    var button = get('button');
    button.innerHTML = '&#x21A9;';
    // TODO: avoid getting current quizid from dropdown
    button.onclick = (function() {
        return setCurrentQuiz(get('dropdown').value);
    });

    if (reason == 'win') {
        alert('You win!');
    } else {
        var clue;
        for (var i = 0; i < quiz.clues.length; i++) {
            clue = quiz.clues[i];
            if (!guessed(clue)) {
                revealAnswer(clue, quiz.answers[i][0], false);
            }
        }
        if (reason == 'timesUp') {
            alert('Time\'s up!');
        }
    }

    quiz.correctAnswers.length = 0;
}

function updateTimer() {
    var timer = get('timer');
    if (quiz.timeLeft > 0) {
        quiz.timeLeft -= 1;
        timer.innerHTML = formatTime(quiz.timeLeft);
        if (quiz.timeLeft == (quiz.timerWarn)) {
            timer.style.color = 'red';
            timer.style.textDecoration = 'blink'; // FF only
        }
        if (quiz.timeLeft == (quiz.timerWarn - 5)) {
            timer.style.textDecoration = 'none'; // only blink for 5s
        }
    } else {
        endQuiz('timesUp');
    }
}

function startTimer() {
    quiz.timerId = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    clearInterval(quiz.timerId);
    alert('Click OK to resume');
    startTimer();
    get('inputarea').focus();
}

function startQuiz() {
    var inputbox = get('inputbox');

    var button = get('button');
    button.innerHTML = '||';
    button.onclick = pauseTimer;

    var inputArea = create('input', 'inputarea');
    inputArea.type = 'text';
    inputArea.autocomplete = 'off';
    inputArea.oninput = checkInput;
    inputArea.onkeydown = function(e) {
        if (e.keyCode == 13) {
            inputArea.value = '';
        }
    }

    inputbox.appendChild(inputArea);
    inputbox.appendChild(button);

    get('revealanswers').innerHTML = 'Give up?';
    updateNumberCorrect(0);

    startTimer();
    inputArea.focus();
}

function updateNumberCorrect(num) {
    var text = [num, '/', quiz.clues.length, ' correct'].join('');
    get('numbercorrect').innerHTML = text;
    if (num == quiz.clues.length) {
        endQuiz('win');
    }
}

function formatTime(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.toTimeString().substr(3, 5);
}

function buildTable() {
    var table = get('answertable');

    var quizLen = quiz.clues.length
    var maxRows = quiz.maxTableRows;

    var tdCount = Math.floor(quizLen / maxRows);
    if (quizLen % maxRows) {
        tdCount++; // add an extra column for leftovers
    }
    tdCount *= 2; // add an answer column for each clue column

    var trCount = ((quizLen / maxRows) <= 1) ? quizLen : maxRows;

    // build table header
    var thead = create('thead')
    var thRow = create('tr');
    var thCell = [];
    for (var i = 0; i < tdCount; i++) {
        thCell[i] = create('th');
        if (i % 2 == 0) {
            // even - clue header
            thCell[i].className = 'cluecellheader';
            thCell[i].innerHTML = 'Clue';
        } else {
            // odd - answer header
            thCell[i].className = 'answercellheader';
            thCell[i].innerHTML = 'Answer';
        }
        thRow.appendChild(thCell[i]);
    }
    thead.appendChild(thRow);
    table.appendChild(thead);

    // build table body
    var tbody = create('tbody')
    var row = [];
    var cell = [];
    for (var i = 0; i < trCount; i++) {
        row[i] = create('tr');
        
        for (var j = 0; j < tdCount; j++) {
            cell[j] = create('td');
            if (j % 2 == 0) {
                // even - clue column
                var clue = quiz.clues[i+((j/2)*maxRows)];
                if (clue == undefined) {
                    break;
                }
                cell[j].innerHTML = clue;
                cell[j].className = 'cluecell';
                cell[j].id = clue;
            } else {
                // odd - answer column
                cell[j].className = 'answercell';
                cell[j].id = clue += '_answer';
            }
            row[i].appendChild(cell[j]);
        }
        tbody.appendChild(row[i]);
    }
    table.appendChild(tbody);
}

function resetPageState() {
    if (window.quiz) {
        clearInterval(quiz.timerId);
    }

    removeChildren(get('answertable'));

    get('dropdown').className = null;
    get('quizname').className = null;
    get('sitename').className = null;
    get('refimg').src = null;
    
    var controlBoxChildren = get('quizcontrolbox').childNodes;
    for (var i = 0; i < controlBoxChildren.length; i++) {
        removeChildren(controlBoxChildren[i]);
    }
}

function setCurrentQuiz(qname) {
    resetPageState();

    var sitename = get('sitename');
    sitename.className = 'mini';
    sitename.innerHTML = sitename.innerHTML.link('index.html');

    var mainmenu = get('mainmenu');
    if (mainmenu) {
        mainmenu.className = 'hidden';
    }

    get('dropdown').value = qname;

    var q = window[qname];
    q.clues = (function() {
        return Object.keys(q.clueAnswerTable);
    })();

    q.answers = (function() {
        return q.clues.map(function(e) {
            return q.clueAnswerTable[e];
        }); 
    })();

    q.timeLeft = q.timeLimit;
    q.correctAnswers = [];

    window.quiz = q;

    get('quizname').innerHTML = quiz.name;
    get('refimg').src = quiz.refImg;
    get('revealanswers').innerHTML = 'Study';
    var timer = get('timer');
    timer.innerHTML = formatTime(quiz.timeLimit);
    timer.style.color = '#000';
    get('revealanswers').onclick = function() { 
        endQuiz('giveUp');
    };
    buildTable();
    var numberCorrect = create('div', 'numbercorrect');
    var button = create('button', 'button');
    button.innerHTML = 'Start';
    button.onclick = startQuiz;
    inputbox.appendChild(button);
    inputbox.appendChild(numberCorrect);
    button.focus();
}

function setUndefinedQuiz(qname) {
    resetPageState();

    if (qname !== '') {
        var quizname = get('quizname');
        quizname.className = 'error';
        quizname.innerHTML = qname + " not found"
    }

    get('dropdown').className = 'hidden';
    if (!get('mainmenu')) {
        var mainmenu = create('ul', 'mainmenu');
        var h2, li;
        for (var fname in window.quizIndex) {
            h2 = create('h2');
            li = create('li');
            h2.innerHTML = window[fname].name.link('#' + fname);
            li.appendChild(h2);
            mainmenu.appendChild(li);
        }
        get('menu').appendChild(mainmenu);
    } else {
        get('mainmenu').className = null;
    }
}

function get(id) {
    return document.getElementById(id);
}

function create(type, id) {
    var obj = document.createElement(type);
    if (id != undefined) {
        obj.id = id;
    }
    return obj;
}

function removeChildren(node) {
    var retval = node.hasChildNodes();
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
    return retval;
}

function handleHashChange(qname) {
    if (window[qname] == undefined) {
        console.log('debug: setting undefined quiz');
        setUndefinedQuiz(qname);
    } else {
        console.log('debug: setting current quiz as ' + qname);
        setCurrentQuiz(qname);
    }
}

function init() {
    var select = create('select', 'dropdown');
    var option, fname;
    for (fname in window.quizIndex) {
        option = create('option');
        option.value = fname;
        option.innerHTML = window[fname].name;
        select.appendChild(option);
    }
    get('menu').appendChild(select);
    select.addEventListener(
        'change', function() {window.location.hash = this.value}, false
    );

    for (fname in window.quizIndex) {
        // let the quiz obj know what it's called
        window[fname].fname = fname;
    }

    handleHashChange(window.location.hash.substring(1));
}

(function() {
    var body = document.getElementsByTagName('body')[0];
    for (var fname in window.quizIndex) {
        var script = create('script');
        script.type = 'text/javascript';
        script.src = 'data/' + fname + '.js';
        body.appendChild(script);
    }

    window.onhashchange = (function() {
        return handleHashChange(window.location.hash.substring(1));
    });

    window.onload = init;
})();
