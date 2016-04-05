document.addEventListener('DOMContentLoaded', function() {
	
	// Make sure the need APIs are supported
	if(!window.File || !window.FileReader || !window.FileList || !window.Blob || !window.ArrayBuffer){
		alert('The File APIs need to load files are not supported in this browser!');
		document.getElementById("load-button").disabled = true;
	}
	else{
		// Get the load button and input
		var loadInput = document.getElementById('load-input');
		var loadButton = document.getElementById('load-button');
		
		// When click the load button call the load input
		loadButton.onclick = function() {
			loadInput.click();
		}
		
		// When load input choosen load the file
		loadInput.addEventListener('change', function(event){
			
			// Set the button to disabled so that it can't be pressed while loading
			loadButton.disabled = true;
			
			// Create a reader and read the zip
			var reader = new FileReader();
			reader.onload = function(event){
				
				// Create form for sending data
				var form = document.createElement("FORM");
				form.setAttribute("method", "POST");
				form.setAttribute("action", "case");
				
				// Read each file from the zip, save to Cache, and add the URLs w/ respect to files to the form 
				var curCase = new JSZip(event.target.result);
				for (var file in curCase.files) {
					if (!curCase.files.hasOwnProperty(file)) continue;
					var fileField = document.createElement("input");
					fileField.setAttribute("type", "hidden");
					fileField.setAttribute("name", file);
					fileField.setAttribute("value", createURL(curCase, file));
					form.appendChild(fileField);
				}
				
				// send the form request
				document.body.appendChild(form);
				form.submit();
				
			};
			reader.readAsArrayBuffer(event.target.files[0]);
			
		}, false);
	}

});

function createURL(zip, file){
	return URL.createObjectURL(new Blob([zip.file(file).asArrayBuffer()], {type : getMimeType(file)}));
}

function getMimeType(file){
	switch(file.substr(file.lastIndexOf('.')+1)){
		case 'png':
			return 'image/png';
		case 'jpeg':
		case 'jpg':
			return 'image/jpeg';
		case 'pdf':
			return 'application/pdf';
		case 'docx':
		case 'doc':
			return 'application/msword';
		case 'rtf':
			return 'text/richtext';
		case 'ipardata':
			return 'text/xml';
		default:
			return 'text/plain';
	}
}