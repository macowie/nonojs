var myPuzzle;

function play() {
    //myPuzzle = readPuzzle(sampleEncPuzzle());
    myPuzzle = getDataFromUrl();
    //if (myPuzzle){
    // var st = document.getElementById('status');
    //    st.innerHTML = myPuzzle.answer + myPuzzle.width + myPuzzle.height;

    drawTable(myPuzzle);



    //}
    //else {
    //    var st = document.getElementById('status');
    //    st.innerHTML = "Error Reading Data";
    //    }




}

function create() {
    myPuzzle = samplePuzzle(true);



}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

function Puzzle(indata) {
    var puzzle = new Object();
    puzzle.title = indata[0];
    puzzle.answer = indata[1];
    puzzle.author = indata[2];
    puzzle.width = parseInt(indata[3]);
    puzzle.height = parseInt(indata[4]);
    puzzle.data = new Array(indata.length - 5);
    puzzle.player = new Array(puzzle.data.length);
    var i = 5;
    for (var x = 0; x < puzzle.data.length; x++) {
        puzzle.data[x] = parseInt(indata[i]);
        puzzle.player[x] = 0;
        i++;
    }
    puzzle.solved = false;


    return puzzle;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function readPuzzle(dec_data) {
    if (dec_data != undefined) {
        var tempArr = dec_data.split(',');

        if (tempArr.length == parseInt(tempArr[3]) * parseInt(tempArr[4]) + 5) {

            return new Puzzle(tempArr);
        }
    }
    return false;
}



function getDataFromUrl() {
    var a = decodePuzzle(getUrlVars()['p']);
    return readPuzzle(a);

}

function decodePuzzle(enc_data) {
    var temp = lzw_decode(b64_to_utf8(enc_data));

    return temp;
}

function encodePuzzle(puzzle) {
    var c = puzzle.title + ',' + puzzle.answer + ',' + puzzle.author + ',' + puzzle.width + ',' + puzzle.height + ',' + puzzle.data.toString();
    var temp = utf8_to_b64(lzw_encode(c));
    return temp;

}

function samplePuzzle(blank) { //Generate a sample 5x7 puzzle
    var sampledata = ["Test Sample", "Sample Win", "Matty", 5, 7, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0];
    if (blank) {
        sampledata = ["", "", "", 1, 1, 0];
    }

    return (new Puzzle(sampledata));
}



function sampleEncPuzzle() { //Generate an encoded sample
    var sampledata = "Test Sample,Sample Win,Matty,5,7,1,1,1,1,1,1,1,1,0,1,1,0,0,0,1,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,1,1,0";
    var c = utf8_to_b64(lzw_encode(sampledata));

    var st = document.getElementById('status');
    st.innerHTML = c;

    return decodePuzzle(c);



}

function calcColInfo(puzzle) {
    var colInfos = new Array(puzzle.width);
    var t = 0;
    var cur = '';

    for (var c = 0; c < puzzle.width; c++) {

        for (var d = c; d < puzzle.width * puzzle.height; d += puzzle.width) {
            t = 0;
            while (puzzle.data[d] != '0' && d < puzzle.width * puzzle.height) {
                d += puzzle.width;
                t++;


            }
            if (t !== 0) {
                cur += t + ' ';

            }
            t = 0;

        }

        if (cur === '') {
            cur = '0';
        }

        colInfos[c] = cur.trim();
        cur = '';
    }
    return colInfos;
}

function calcRowInfo(puzzle) {
    var rowInfos = new Array(puzzle.height);
    var t = 0;
    var cur = '';
    var d;

    for (var c = 0; c < puzzle.height; c++) {
        for (var e = 0; e < puzzle.width; e++) {
            t = 0;
            while (puzzle.data[(c * puzzle.width) + e] != '0' && e < puzzle.width) {
                t++;
                e++;

            }
            if (t !== 0) {
                cur += t + " ";
            }
            t = 0;


        }

        if (cur === '') {
            cur = '0';
        }

        rowInfos[c] = cur.trim();
        cur = '';
    }



    return rowInfos;
}

function tileClick(cell_num) {
    if (!myPuzzle.solved) {
        var cell = document.getElementById('puzz' + cell_num);

        if (cell.className == 'empty') {
            cell.setAttribute('class', 'marked');
            window.myPuzzle.player[cell_num] = 1;
        }
        else if (cell.className == 'marked') {
            cell.setAttribute('class', 'anti');
            window.myPuzzle.player[cell_num] = 0;
        }
        else if (cell.className == 'anti') {
            cell.setAttribute('class', 'empty');
            window.myPuzzle.player[cell_num] = 0;
        }
        if (winTest()) {
            playerWin();

        }

    }



}

function tileClickCreate(cell_num) {
    var cell = document.getElementById('puzz' + cell_num);

    if (cell.className == 'anti') {
        cell.setAttribute('class', 'marked');
        window.myPuzzle.data[cell_num] = 1;
    }
    else if (cell.className == 'marked') {
        cell.setAttribute('class', 'anti');
        window.myPuzzle.data[cell_num] = 0;
    }



}

function generateLink() {
    var widthForm = document.getElementById("width");
    myPuzzle.width = parseInt(widthForm.options[widthForm.selectedIndex].value);

    var heightForm = document.getElementById("height");
    myPuzzle.height = parseInt(heightForm.options[heightForm.selectedIndex].value);

    var authorForm = document.getElementById("author");
    myPuzzle.author = authorForm.value.replace(",", "");

    var titleForm = document.getElementById("title");
    myPuzzle.title = titleForm.value.replace(",", "");

    var answerForm = document.getElementById("answer");
    myPuzzle.answer = answerForm.value.replace(",", "");

    var link = "http://cowie.me/nono/?p=" + encodePuzzle(myPuzzle);

    var st = document.getElementById('status');
    st.setAttribute('class', 'statusgood');
    st.innerHTML = "<input type=text value=" + link + ">";


}

function winTest() {

    return arraysEqual(window.myPuzzle.data, window.myPuzzle.player);

}

function playerWin() {
    myPuzzle.solved = true;
    var st = document.getElementById('status');
    st.setAttribute('class', 'statusgood');
    st.innerHTML = "A Winner Is You! It's a " + myPuzzle.answer;


}

function drawTable(puzzle) {


    var temp = document.getElementById('titlefield');
    temp.appendChild(document.createTextNode(puzzle.title));
    temp = document.getElementById('authorfield');
    temp.appendChild(document.createTextNode('by ' + puzzle.author));

    var cellcount = 0;

    var row = new Array();
    var cell = new Array();

    var row_num = puzzle.height;
    var cell_num = puzzle.width;

    var tab = document.createElement('table');
    tab.setAttribute('id', 'puzzletable');
    var tbo = document.createElement('tbody');
    var colInfos = calcColInfo(puzzle);
    var rowInfos = calcRowInfo(puzzle);

    var colInfo = document.createElement('tr');
    colInfo.appendChild(document.createElement('td'));

    for (var c = 0; c < cell_num; c++) {
        cell[c] = document.createElement('td');
        cell[c].setAttribute('class', 'colInfo');
        cell[c].setAttribute('id', 'col' + c);
        singleInfo = colInfos[c].split(' ');
        for (var s = 0; s < singleInfo.length; s++) {
            cell[c].appendChild(document.createTextNode(singleInfo[s]));
            cell[c].appendChild(document.createElement('br'));
        }

        colInfo.appendChild(cell[c]);
    }
    tbo.appendChild(colInfo);


    var rowInfo;
    var cont;


    for (c = 0; c < row_num; c++) {
        row[c] = document.createElement('tr');
        rowInfo = document.createElement('td');
        rowInfo.setAttribute('id', 'row' + c);
        rowInfo.setAttribute('class', 'rowInfo');
        rowInfo.appendChild(document.createTextNode(rowInfos[c]));
        row[c].appendChild(rowInfo);


        for (var k = 0; k < cell_num; k++) {
            cell[k] = document.createElement('td');
            cont = document.createTextNode(puzzle.data[cellcount]);
            cell[k].setAttribute('id', 'puzz' + cellcount);
            cell[k].setAttribute('onClick', 'tileClick(' + cellcount + ')');
            cell[k].setAttribute('class', 'empty');
            //cell[k].appendChild(cont);
            row[c].appendChild(cell[k]);
            cellcount++;
        }
        tbo.appendChild(row[c]);
    }

    var field = document.getElementById('puzzlefield');
    tab.appendChild(tbo);
    field.appendChild(tab);

}



function drawTableCreate() {


    var cellcount = 0;
    var widthForm = document.getElementById("width");
    var width = parseInt(widthForm.options[widthForm.selectedIndex].value);
    var heightForm = document.getElementById("height");
    var height = parseInt(heightForm.options[heightForm.selectedIndex].value);
    myPuzzle.data = new Array(width * height);
    for (var x = 0; x < myPuzzle.data.length; x++) {
        myPuzzle.data[x] = 0;

    }


    var row = new Array();
    var cell = new Array();



    var row_num = height;
    var cell_num = width;

    var tab = document.createElement('table');
    tab.setAttribute('id', 'puzzletable');
    var tbo = document.createElement('tbody');


    for (c = 0; c < row_num; c++) {
        row[c] = document.createElement('tr');
        for (var k = 0; k < cell_num; k++) {
            cell[k] = document.createElement('td');
            cell[k].setAttribute('id', 'puzz' + cellcount);
            cell[k].setAttribute('onClick', 'tileClickCreate(' + cellcount + ')');
            cell[k].setAttribute('class', 'anti');
            row[c].appendChild(cell[k]);
            cellcount++;
        }
        tbo.appendChild(row[c]);
    }

    var field = document.getElementById('puzzlefield');
    tab.appendChild(tbo);
    field.innerHTML = '';
    field.appendChild(tab);




}
























// LZW-compress a string
function lzw_encode(s) {
    var d = new Date();

    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }

    var retrunedresult = out.join("");
    console.log("Input: " + s.length / 1024 + "kb Output:" + retrunedresult.length / 1024 + "kb Rate: " + (s.length / retrunedresult.length));
    console.log((new Date()).getTime() - d.getTime() + ' ms.');
    return retrunedresult;
}

// Decompress an LZW-encoded string

function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}
