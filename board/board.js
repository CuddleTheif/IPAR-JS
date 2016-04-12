window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

var board, categories, curCategory;
var caseFiles, curCase, curSave;
var virtualSize = {x:1200, y:750, out:30};

// Read the current case files
document.addEventListener('DOMContentLoaded', function() {
	
	// Make sure there is a current case
	if(!localStorage['caseFiles'])
		document.location = "../";
	caseFiles = JSON.parse(localStorage['caseFiles']);
	
	// Create variable used for loading files
	var loading = false;
	
	// Load the current case
	window.resolveLocalFileSystemURL(caseFiles['case\\active\\caseFile.ipardata'], function(fileEntry) {
		fileEntry.file(function(file) {
			
			var reader = new FileReader();
			reader.onloadend = function() {

				// Get the case
				curCase = getDoc(this.result);
				if(!loading)
					loading = true;
				else
					setupBoard();
			   
			};
			reader.readAsText(file);
		   
		}, function(e){
			console.log("Error: "+e.message);
		});
	});
	
	// Load the case's current save
	window.resolveLocalFileSystemURL(caseFiles['case\\active\\saveFile.ipardata'], function(fileEntry) {
		fileEntry.file(function(file) {
			
			var reader = new FileReader();
			reader.onloadend = function() {

				// Get the save
				curSave = getDoc(this.result);
				if(!loading)
					loading = true;
				else
					setupBoard();
				
			};
			reader.readAsText(file);
		   
		}, function(e){
			console.log("Error: "+e.message);
		});
	});
	
});

// Make sure the board resizes with the window
function resize() {
  board.width(window.innerWidth);
  board.height(window.innerHeight*0.8);
  var vWidth = virtualSize.x+virtualSize.out*2,
      vHeight = virtualSize.y+virtualSize.out*2;
  var scale = window.innerWidth/vWidth*vHeight > window.innerHeight*0.8 ? (window.innerHeight*0.8)/vHeight : window.innerWidth/vWidth;
  board.x((window.innerWidth-vWidth*scale)/2);
  board.scale({x:scale, y:scale});
  board.draw();
}
window.onresize = resize;


// Get the xmlDoc of an given xml
function getDoc(xml){
	// Load the xml as doc for parseing
	var xmlDoc;
	if (window.DOMParser){
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(xml, "text/xml");
	}
	else{ // IE
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xml);
	}
	return xmlDoc;
}


// Setup the board based on the current case and save files
function setupBoard(){
	
		
	// Create the board itself
  board = new Konva.Stage({
		container:'board'
	});
  resize();
		
	// Add the background layer
	var background = new Konva.Layer();
	background.add(new Konva.Rect({
		x: virtualSize.out,
		y: virtualSize.out,
		width: virtualSize.x,
		height: virtualSize.y,
		fill: '#D3B185',
		stroke: '#CB9966',
		strokeWidth: virtualSize.out
	}));
	board.add(background);
	
	// Get the categories from the case
	categories = [];
	var catNames = curCase.getElementsByTagName("categoryList")[0].getElementsByTagName("element");
	var catFields = curCase.getElementsByTagName("category");
	var savedQuestions = curSave.getElementsByTagName("question");
	var questionNum = 0;
	for(var i=0;i<catNames.length;questionNum += parseInt(catFields[i].getAttribute("questionCount")), i++)
		categories[i] = new Category(catNames[i].innerHTML, catFields[i], questionNum, savedQuestions);
  categories[0].button.disabled = false;
  changeCategory(categories[0]);
}

function changeCategory(cat){
  if(curCategory!=null){
    curCategory.layer.hide();
    curCategory.button.className = '';
  }
  curCategory = cat;
  curCategory.button.className = 'cur-case';
  curCategory.layer.show();
  board.draw();
}

// A Category on the board
var Category = function(title, xml, qIndex, qSave){

	// Create the button for the category (default is disabled)
	this.button = document.createElement("button");
	this.button.innerHTML = title;
  this.button.disabled = true;
  var cat = this;
	this.button.onclick = function(){
    changeCategory(cat);
  };
	document.getElementById("board-buttons").appendChild(this.button);
	
	// Create the question objects for this category and add them to this category's layer
	this.questions = [];
	var questionXmls = xml.getElementsByTagName("button");
	this.layer = new Konva.Layer();
	for(var i=0;i<questionXmls.length;i++){
		this.questions[i] = new Question(questionXmls[i], qSave[i+qIndex], this, function(){
      
      var lines = this.xml.getElementsByTagName("connections");
      for(var i=0;i<lines.length;i++){
        
        // Create the line between this line and the next one
        var question = this.category.questions[parseInt(lines[i].innerHTML)-1];
        var line = new Line(this, question);
        this.category.layer.add(line.line);
        question.addConnection(line);

      }
      // Check if all the questions are done in the category
      this.category.checkQuestions();

    });
		this.layer.add(this.questions[i].button);
	}
  this.layer.hide();
  board.add(this.layer);

}

// Checks if all the questions in the current category are done
Category.prototype.checkQuestions = function(){
  
  this.done = true;
  for(var i=0;i<this.questions.length && this.done;i++)
    if(this.questions[i].state!="correct")
      this.done = false;
  
  var index = categories.indexOf(this);
  if(this.done && index+1<categories.length)
    categories[index+1].button.disabled = false;

}

// A line between two questions
var Line = function(question1, question2){
  
  // Create the actual line
  this.line = new Konva.Line({
    points: [question1.button.x()+questionSize/10, question1.button.y()+questionSize/10, question2.button.x()+questionSize/10, question2.button.y()+questionSize/10],
    stroke: 'black',
    strokeWidth: questionSize/100
  });
  this.line.hide();

  // Set the line to move and resize with the questions movement
  var line = this;
  var updateLine = function(){
    line.line.points([question1.button.x()+questionSize/10, question1.button.y()+questionSize/10, question2.button.x()+questionSize/10, question2.button.y()+questionSize/10]);
    line.line.getLayer().draw();
  }
  question1.button.on('dragmove', updateLine);
  question2.button.on('dragmove', updateLine);

}
