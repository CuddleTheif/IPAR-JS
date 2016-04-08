window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

var board, categories;
var caseFiles, curCase, curSave;
var virtualSize = {x:400, y:300, out:10};

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
				var curSave = getDoc(this.result);
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
		container:'board',
		width: window.innerWidth,
		height: window.innerHeight*0.8,
		x: window.innerWidth*0.1
	});
		
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
	for(var i=0;i<catNames.length;i++)
		categories[i] = new Category(catNames[i].innerHTML, catFields[i]);
	
}

// A Category on the board
var Category = function(title, xml){
	
	// Create the button for the category (default is disabled)
	this.button = document.createElement("button");
	this.button.innerHTML = title;
	this.button.disabled = true;
	document.getElementById("board-buttons").appendChild(this.button);
	
	// Create the question objects for this category
	this.questions = [];
	var questionXmls = xml.getElementsByTagName("button");
	for(var i=0;i<questionXmls.length;i++)
		this.questions[i] = new Question(questionXmls[i]);
	
	// Create the layer for this category and add it to the stage (hidden)
	//this.layer = new Konva.Layer();
	
	
}