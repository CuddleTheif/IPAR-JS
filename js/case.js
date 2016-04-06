window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

document.addEventListener('DOMContentLoaded', function() {
	if(!localStorage['caseFiles'])
		document.location = "index.html";
	var caseFiles = JSON.parse(localStorage['caseFiles']);
	window.resolveLocalFileSystemURL(caseFiles['case\\active\\caseFile.ipardata'], function(fileEntry) {
		fileEntry.file(function(file) {
			
		   var reader = new FileReader();
		   reader.onloadend = function() {
			 displayCase(this.result);
		   };
		   reader.readAsText(file);
		   
		}, onError);
	});
});

function onError(e){
	if(e.message)
		console.log("Error: "+e.message);
	else if(e.name)
		console.log("Error: "+e.name);
	else
		console.log("Error: "+JSON.stringify(e));
}

function displayCase(xml){
	
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
	
	// Get the case name and description from the xml
	var curCase = xmlDoc.getElementsByTagName("case")[0];
	document.getElementById("title").innerHTML = curCase.getAttribute("caseName");
	document.getElementById("description").innerHTML = curCase.getAttribute("description");
	
}