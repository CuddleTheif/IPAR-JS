window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

var caseStatus, firstNameInput, lastNameInput, emailInput;

// Load the current case's info if found (If not found return to title)
document.addEventListener('DOMContentLoaded', function() {
	
	// Make sure there is a current case
	if(!localStorage['caseFiles'])
		document.location = "../";
	var caseFiles = JSON.parse(localStorage['caseFiles']);
	
	// Load if the case has a save
	window.resolveLocalFileSystemURL(caseFiles['case\\active\\saveFile.ipardata'], function(fileEntry) {
		fileEntry.file(function(file) {
			
			var reader = new FileReader();
			reader.onloadend = function() {

				// Get the case save status and values
				var curCase = getDoc(this.result).getElementsByTagName("case")[0];
				caseStatus = curCase.getAttribute("caseStatus");
				if(caseStatus=='0'){
					
					// Create the inputs for first, last, and email
					firstNameInput = document.createElement("input");
					document.getElementById("first-name").appendChild(firstNameInput);
					lastNameInput = document.createElement("input");
					document.getElementById("last-name").appendChild(lastNameInput);
					emailInput = document.getElementById("input-email");
					
					// Make it so that proceed is disabled until all three inputs have values
					var checkProceed = function(){
						var proceedButton = document.getElementById("proceed-button");
						if(firstNameInput.value=="" ||
							lastNameInput.value=="" ||
							emailInput.value=="")
							proceedButton.disabled = true;
						else
							proceedButton.disabled = false;
					};
					firstNameInput.addEventListener('change', checkProceed);
					lastNameInput.addEventListener('change', checkProceed);
					emailInput.addEventListener('change', checkProceed);
					checkProceed();
					
				}
				else{
					document.getElementById("email").style.display = 'none';
					var firstName = document.getElementById("first-name");
					firstName.innerHTML = curCase.getAttribute("profileFirst");
					firstName.style.fontWeight = 'bold';
					var lastName = document.getElementById("last-name");
					lastName.innerHTML = curCase.getAttribute("profileLast");
					lastName.style.fontWeight = 'bold';
				}
				
			};
			reader.readAsText(file);
		   
		}, function(e){
			console.log("Error: "+e.message);
		});
	});
});

function displayCase(xml){
	
	// Get the case name and description from the xml
	var curCase = xmlDoc.getElementsByTagName("case")[0];
	document.getElementById("title").innerHTML = curCase.getAttribute("caseName");
	document.getElementById("description").innerHTML = curCase.getAttribute("description");
	
}

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

// Return to title
function back(){
	document.location = "../case/";
}

// Start the current case (Saving the input if any)
function proceed(){
	// If input save it
	if(caseStatus=='0'){
		window.resolveLocalFileSystemURL(caseFiles['case\\active\\saveFile.ipardata'], function(fileEntry) {
			fileEntry.file(function(file) {
				
				var reader = new FileReader();
				reader.onloadend = function() {

					// Get the xml and change the values
					var xml = getDoc(this.result);
					var case = xml.getElementsByTagName("case")[0];
					setAttribute("profileFirst", firstNameInput.value);
					setAttribute("proflieLast", lastNameInput.value);
					setAttribute("profileMail", emailInput.value);
					
					// Write the result back to file
					console.log(xml.OuterXml);
					fileEntry.createWriter(function(fileWriter) {
						
						var blob = window.BlobBuilder ? new BlobBuilder() : new WebKitBlobBuilder();
						blob.append(xml.OuterXml);
						fileWriter.write(blob.getBlob('text/xml'));
						
				    }, function(e){
						console.log("Error: "+e.message);
					});
					
				};
				reader.readAsText(file);
			   
			}, function(e){
				console.log("Error: "+e.message);
			});
		});
	}
	
	// Load the board
	document.location = "../board/";
}