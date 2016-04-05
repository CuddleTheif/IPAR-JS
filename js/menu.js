document.addEventListener('DOMContentLoaded', function() {

	if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
		alert('The File APIs need to load files are not supported in this browser!');
		document.getElementById("load-button").disabled = true;
	}
	else{
		var loadInput = document.getElementById('load-input');
		var loadButton = document.getElementById('load-button');
		
		loadButton.onclick = function() {
			loadInput.click();
		}
		
		loadInput.addEventListener('change', function(event){
			
			loadButton.disabled = true;
			zip.createReader(new zip.BlobReader(loadInput.files[0]), function(zipReader) {
				console.log(zipReader);
			}, function(err){
				console.log(err);
			});
			
		}, false);
	}

});