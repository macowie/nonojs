var myPuzzle;

function play() {

    var data = getUrlVars()['p'];
    if (data == null) {//if no puzzle data found, pick  a pregenerated one at random

        var sampler = ["Rmx5IFRvZ2V0aGVyLEEgbWlnaHTEgmR1Y2ssTWF0xIhldyw4LDEwLMSkxKbEosSoxKfEpzHEqcSoxKzEq8SuxLHEr8SlxLTEsMSzxKrEtcSyxK3EtsS5xKTEt8SxxL7FgMS5xKzFhMS7xL3EtMS/xLjFhcS3", "S2Fma2EsQSBCdWcsTWF0dGhldywxMMSTxJXElyzElTHEmcScxJvEmMSfxJzEmsSTxKHEpMSYxJ7Eo8SnxKfEoMSbxKzEqMSjxKDEq8SvxKXEpMStxLXEssSwxJ3Et8SzxKLEtsStxLjEqcSyxKrEu8WDxJc=", "RGlhbCBJdCxNxIdhdHRoZXcsNSw2LDEsMMSWxJjElcSaxJnElMSdxJfElcSfxJ7EosSbxJfEpcSdxKDEmMSf", "RWthbnMsU25ha2UsTWF0dGhldywxMSw2LDDEmMSaxJnElcSZxJ7Em8SgxJ/ElcSjxKHEoMSdxJPEqMScxKnEq8SqxKTEn8StxKjEp8SqxK/EpsSxxKXEtMS0xLI="];
        var x = Math.floor(Math.random() * (sampler.length));
        data = sampler[x];
    }

    myPuzzle = decodePuzzle(data);
    drawTable(myPuzzle);
}

function create() {
    myPuzzle = samplePuzzle(true);
}

function arraysEqual(arr1, arr2) { //Steps through and tests if the arrays match
    if (arr1.length !== arr2.length) return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

function Puzzle(indata) { //Puzzle object
    var puzzle = new Object();
    puzzle.title = indata[0];
    puzzle.answer = indata[1]; //String to be revealed after the puzzle is solved
    puzzle.author = indata[2];
    puzzle.width = parseInt(indata[3]);
    puzzle.height = parseInt(indata[4]);
    puzzle.data = new Array(indata.length - 5); //Actual puzzle data
    puzzle.player = new Array(puzzle.data.length); //What the player has marked
    var i = 5; //Offset the array index to account for previous entries
    for (var x = 0; x < puzzle.data.length; x++) {
        puzzle.data[x] = parseInt(indata[i]);
        puzzle.player[x] = 0; //Fill in the player array with blanks while stepping through to read the data
        i++;
    }
    puzzle.solved = false;
    return puzzle;
}

function getUrlVars() { //Function to return data passed in from URL
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function readPuzzle(dec_data) { //Takes decoded data, returns puzzle object if valid
    if (dec_data != undefined) {
        var tempArr = dec_data.split(',');

        if (tempArr.length == parseInt(tempArr[3]) * parseInt(tempArr[4]) + 5) { //Integrity check, see if the data array's length matches the stated height * width

            return new Puzzle(tempArr);
        }
    }
    return false;
}



function decodePuzzle(enc_data) { //Decodes data string, returns puzzle object
    var temp = lzw_decode(Base64.decode(enc_data));

    return readPuzzle(temp);
}

function encodePuzzle(puzzle) { //Takes puzzle object, returns encoded string
    var c = puzzle.title + ',' + puzzle.answer + ',' + puzzle.author + ',' + puzzle.width + ',' + puzzle.height + ',' + puzzle.data.toString();
    var temp = Base64.encode(lzw_encode(c));
    return temp;

}

function samplePuzzle(blank) { //Generate a sample 5x7 puzzle, if true is passed in, returns a blank puzzle instead
    var sampledata = ["Test Sample", "Sample Win", "Matty", 5, 7, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0];
    if (blank) {
        sampledata = ["", "", "", 1, 1, 0];
    }

    return (new Puzzle(sampledata));
}


function calcColInfo(puzzle) { //Generate the hint numbers for each column of data
    var colInfos = new Array(puzzle.width);
    var t = 0;
    var cur = '';

    for (var c = 0; c < puzzle.width; c++) { //For each column

        for (var d = c; d < puzzle.width * puzzle.height; d += puzzle.width) { //Step though the data, incrementing by the width of the puzzle
            t = 0;
            while (puzzle.data[d] != '0' && d < puzzle.width * puzzle.height) { //Step through, but if the data is true add to count
                d += puzzle.width;
                t++;


            }
            if (t !== 0) {
                cur += t + ' '; //If a block of data was true, add it to the string

            }
            t = 0; //reset count

        }

        if (cur === '') { // If no data found for that column, set the string to 0
            cur = '0';
        }

        colInfos[c] = cur.trim(); //Add that column's hint string to the array
        cur = '';
    }
    return colInfos;
}

function calcRowInfo(puzzle) { ///Generate the hint numbers for each row of data
    //Similar to the column function, but a simpler process to step through the data
    var rowInfos = new Array(puzzle.height);
    var t = 0;
    var cur = '';

    for (var c = 0; c < puzzle.height; c++) { //For each row
        for (var e = 0; e < puzzle.width; e++) { //For each item in a row
            t = 0;
            while (puzzle.data[(c * puzzle.width) + e] != '0' && e < puzzle.width) { //Increase count while stepping through if data found
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

function tileClick(cell_num) { //Actions to take when player interacts with puzzle
    if (!myPuzzle.solved) { //Do nothing if puzzle is solved.
        var cell = document.getElementById('puzz' + cell_num);

        if (cell.className == 'empty') { //Check what state the cell is in via it's DOM class
            cell.setAttribute('class', 'marked'); //If empty, set it to marked
            window.myPuzzle.player[cell_num] = 1; //and set the player data for that cell to true
        }
        else if (cell.className == 'marked') { //If marked, cycle through to anti 
            cell.setAttribute('class', 'anti'); //(superficial state to help the player mark cells that are definitely empty)
            window.myPuzzle.player[cell_num] = 0; //player data should be false
        }
        else if (cell.className == 'anti') { //If anti, allow cycle back to empty (unsure state)
            cell.setAttribute('class', 'empty');
            window.myPuzzle.player[cell_num] = 0;
        }
        if (winTest()) { //Check if the player has finished
            playerWin();

        }

    }



}

function tileClickCreate(cell_num) { //Action to take in create mode
    var cell = document.getElementById('puzz' + cell_num);

    //If cell isn't marked, mark it and set the data  to true
    if (cell.className == 'anti') {
        cell.setAttribute('class', 'marked');
        window.myPuzzle.data[cell_num] = 1;
    }
    //And if it is, reset it
    else if (cell.className == 'marked') {
        cell.setAttribute('class', 'anti');
        window.myPuzzle.data[cell_num] = 0;
    }



}

function generateLink() { //Generate the link when player is finished in create mode
    //Grab the data from the inputs
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
    st.innerHTML = "<input type=text value=" + link + ">"; //Put the link in an input box to avoid overflow




}

function winTest() { //Test if the player's data matches the puzzle data

    return arraysEqual(window.myPuzzle.data, window.myPuzzle.player);

}

function playerWin() { //Actions to do when the player has solved
    myPuzzle.solved = true; //Set solved to true so the puzzle is inactive
    var st = document.getElementById('status');
    st.setAttribute('class', 'statusgood'); // Set the status area to positive style
    st.innerHTML = "A Winner Is You! It's a " + myPuzzle.answer; //Reveal the answer of what the picture is supposed to be


}

function drawTable(puzzle) { // Set up the page and table from the puzzle data

    //Display Puzzle information
    var temp = document.getElementById('titlefield');
    temp.appendChild(document.createTextNode(puzzle.title));
    temp = document.getElementById('authorfield');
    temp.appendChild(document.createTextNode('by ' + puzzle.author));


    var cellcount = 0;

    var row = new Array();
    var cell = new Array();

    var row_num = puzzle.height;
    var cell_num = puzzle.width;

    //Start the table element
    var tab = document.createElement('table');
    tab.setAttribute('id', 'puzzletable');
    var tbo = document.createElement('tbody');
    var colInfos = calcColInfo(puzzle); //Get the column hint data
    var rowInfos = calcRowInfo(puzzle); //Get the row hint data

    var colInfo = document.createElement('tr');
    var topleft = document.createElement('td');
    topleft.setAttribute('id', 'topleft');
    colInfo.appendChild(topleft); //Skip the top left cell

    for (var c = 0; c < cell_num; c++) { //Generate the top row with column hint data
        cell[c] = document.createElement('td');
        cell[c].setAttribute('class', 'colInfo'); //Set the class for styling
        cell[c].setAttribute('id', 'col' + c); //Set unique ID
        singleInfo = colInfos[c].split(' '); //Split the column hint data so line breaks can be inserted
        for (var s = 0; s < singleInfo.length; s++) { //Step through and insert the breaks
            cell[c].appendChild(document.createTextNode(singleInfo[s]));
            cell[c].appendChild(document.createElement('br'));
        }

        colInfo.appendChild(cell[c]); //append the the cell to the row
    }
    tbo.appendChild(colInfo); //append the row to the table body


    var rowInfo;
    var cont;


    for (c = 0; c < row_num; c++) { //For each row
        row[c] = document.createElement('tr'); //Create row
        rowInfo = document.createElement('td');
        rowInfo.setAttribute('id', 'row' + c);
        rowInfo.setAttribute('class', 'rowInfo');
        rowInfo.appendChild(document.createTextNode(rowInfos[c]));
        row[c].appendChild(rowInfo); //and append the row's hint data


        for (var k = 0; k < cell_num; k++) { //Then for each puzzle cell in the row add a cell
            cell[k] = document.createElement('td');
            cont = document.createTextNode(puzzle.data[cellcount]);
            cell[k].setAttribute('id', 'puzz' + cellcount); //set unique id
            cell[k].setAttribute('onClick', 'tileClick(' + cellcount + ')'); //Trigger for interaction
            cell[k].setAttribute('class', 'empty'); //Set the class to the unsure state
            //cell[k].appendChild(cont);  //Uncomment to display the array's data for that cell for debugging
            row[c].appendChild(cell[k]); //append cell to row
            cellcount++;
        }
        tbo.appendChild(row[c]); //append row to table body
    }

    var field = document.getElementById('puzzlefield');
    tab.appendChild(tbo); //append table body to table
    field.appendChild(tab); //append table to page at the puzzlefield div

}



function drawTableCreate() { //Draw the table in create mode

    //Get the width and height
    var cellcount = 0;
    var widthForm = document.getElementById("width");
    var width = parseInt(widthForm.options[widthForm.selectedIndex].value);
    var heightForm = document.getElementById("height");
    var height = parseInt(heightForm.options[heightForm.selectedIndex].value);


    //Create a new array based on the w*h and fill it will zeroes to match blank table
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

    //Similar to drawTable() but no info cells, just the puzzle area..
    for (c = 0; c < row_num; c++) {
        row[c] = document.createElement('tr');
        for (var k = 0; k < cell_num; k++) {
            cell[k] = document.createElement('td');
            cell[k].setAttribute('id', 'puzz' + cellcount);
            cell[k].setAttribute('onClick', 'tileClickCreate(' + cellcount + ')'); //except call tileClickCreate for the action..
            cell[k].setAttribute('class', 'anti'); //and start them as anti and not empty since we know they're blank
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






function showInstructions() {
    var inst = document.getElementById('instructions');
    inst.style.display = 'block';

}

function hideInstructions() {
    var inst = document.getElementById('instructions');
    inst.style.display = 'none';
}






var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }
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
