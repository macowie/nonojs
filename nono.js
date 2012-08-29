function main(){

var myPuzzle = new samplePuzzle();
drawTable(myPuzzle);


}

function playerField(puzzle){
    var playerfield = new Array(puzzle.data.length);
    for (var c = 0; c < playerfield.length;c++)
    {
        playerfield[c] = 0;
    }
    return playerfield;
}

function Puzzle(indata){
    var puzzle = new Object();
	puzzle.title = indata[0];
	puzzle.author = indata[1];
	puzzle.width = indata[2];
	puzzle.height = indata[3];
	puzzle.data = new Array(indata.length-4);
	var i = 4;
	for (var x=0;x < puzzle.data.length; x++){
		puzzle.data[x] = indata[i];
		i++;
	}
	return puzzle;
}

function param( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results === null )
    return "";
  else
    return results[1];
}


function samplePuzzle(){ //Generate a sample 5x5 puzzle

	var sampledata = ["Test Sample","Matty",5,5,1,1,1,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,1];
    return (new Puzzle(sampledata));
}

function calcrowInfo(puzzle){
    var rowInfos = new Array(puzzle.height);
    var t = 0;
    var streak = true;
    var cur = '';

    for(var c=0;c < puzzle.height;c++){

        for(var d=c;d < puzzle.data.length;d += puzzle.width){

            if(puzzle.data[d]== 1){
                t++;
                streak = true;
            }
            if(puzzle.data[d]=== 0){
                streak = false;
            }
            if ((!streak && puzzle.data[d] == 1) || (d + puzzle.width) >= puzzle.data.length){
                cur +=  ' ' + t;
                t = 0;
                streak = false;
            }


        }
         if (cur === ''){
                 cur = '0';
            }

        rowInfos[c] = cur;
        cur = '';


    }

    alert(rowInfos[0]);
return rowInfos;

}

function tileClick(cell_num){
    cell = document.getElementById(puzz+cell_num);

    cell.setAttribute('class','marked');



}

function drawTable(puzzle){


    var temp = document.getElementById('titlefield');
    temp.appendChild(document.createTextNode(puzzle.title));
    temp = document.getElementById('authorfield');
    temp.appendChild(document.createTextNode('by ' + puzzle.author));

	var cellcount = 0;

var row=new Array();
var cell=new Array();

var row_num=puzzle.height;
var cell_num=puzzle.width;

var tab = document.createElement('table');
tab.setAttribute('id','puzzletable');
var tbo = document.createElement('tbody');

var colInfo = document.createElement('tr');
colInfo.appendChild(document.createElement('td'));
for(var c=0;c<row_num;c++){
	cell[c]=document.createElement('td');
	cell[c].setAttribute('class','colInfo');
	cell[c].setAttribute('id','col' + c);
	cell[c].appendChild(document.createTextNode('colInfo'));
    colInfo.appendChild(cell[c]);
    }
tbo.appendChild(colInfo);


var rowInfo;
var cont;
rowInfos = calcrowInfo(puzzle);

for(c=0;c<row_num;c++){
	row[c]=document.createElement('tr');
	rowInfo = document.createElement('td');
    rowInfo.setAttribute('id','row' + c);
	rowInfo.setAttribute('class','rowInfo');
    rowInfo.appendChild(document.createTextNode(rowInfos[c]));
    row[c].appendChild(rowInfo);


	for(var k=0;k<cell_num;k++) {
		cell[k]=document.createElement('td');
		cont=document.createTextNode(puzzle.data[cellcount]);
		cell[k].setAttribute('id','puzz' + cellcount);
        cell[k].setAttribute('onClick','tileClick('+cellcount+')');
		cell[k].setAttribute('class','puzzlecell');
		cell[k].appendChild(cont);
		row[c].appendChild(cell[k]);
        cellcount++;
		}
	tbo.appendChild(row[c]);
	}

var field = document.getElementById('puzzlefield');
tab.appendChild(tbo);
field.appendChild(tab);


}