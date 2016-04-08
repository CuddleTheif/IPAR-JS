
// A Question on the board
var Question = function(xml){
	
	// Save the xml
	this.xml = xml;
	
	// Create the question's button first
	this.button = new Konva.Group({
		draggable: true,
		dragBoundFunc: function(pos) {
            var x = pos.x < virtualSize.out ? virtualSize.out : (pos.x > virutalSize.x+virtualSize.out);
            var x = pos.y < virtualSize.out ? virtualSize.out : (pos.y > virutalSize.y+virtualSize.out);
            return {
                x: x,
                y: y
            };
        }
	});
	var buttonGroup = this.button;
	var buttomImg = new Image();
    buttomImg.onload = function() {

      var buttonDisplay = new Konva.Image({
        x: xml.getAttribute("xPositionPercent")*virtualSize.x+virtualSize.out,
        y: xml.getAttribute("yPositionPercent")*virtualSize.y+virtualSize.out,
        image: buttomImg
      });
      buttonGroup.add(buttonDisplay);
      
    };
    buttomImg.src = caseFiles["case\\"+xml.getAttribute("imageLink").replace(/\//g, '\\')];
	
	// Determine the question type and create the apporiate windows
	this.questionType = parseInt(this.xml.getAttribute("questionType"));
	if(this.questionType!=5){
		this.createTaskWindow();
		this.createResourceWindow();
	}
	switch(this.questionType){
		case 5:
			this.createMessageWindow();
			break;
		case 4:
			this.createFileWindow();
			break;
		case 3:
		case 2:
		case 1:
			this.createAnswerWindow(this.questionType!==2);
			break;
	}
	
}

Question.prototype.displayWindows = function(){
	
	hideWindows();
	var windowNode = document.getElementById("window");
	if(this.questionType===5){
		windowNode.appendChild(this.message);
	}
	else{
		windowNode.appendChild(this.task);
		windowNode.appendChild(this.answer);
		windowNode.appendChild(this.resource);
	}
}

function hideWindows(){
	var windowNode = document.getElementById("window");
	while (windowNode.firstChild) {
	    windowNode.removeChild(windowNode.firstChild);
	}
}

Question.prototype.createTaskWindow = function(){
	
	// Get the template for task windows
	var question = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState == 4 && request.status == 200) {
	    	
	    	// Create the task window 
	    	question.task = document.createElement("DIV");
			question.task.className = "window";
			question.task.style.top = "5vh";
			question.task.style.left = "5vw";
	        question.task.innerHTML = request.responseText;
	        question.task.innerHTML = question.task.innerHTML.replace("%title%", question.xml.getElementsByTagName("questionName")[0].innerHTML.replace(/\n/g, '<br/>'));
	        question.task.innerHTML = question.task.innerHTML.replace("%instructions%", question.xml.getElementsByTagName("instructions")[0].innerHTML.replace(/\n/g, '<br/>'));
	        question.task.innerHTML = question.task.innerHTML.replace("%question%", question.xml.getElementsByTagName("questionText")[0].innerHTML.replace(/\n/g, '<br/>'));
	        
	    }
	}
	request.open("GET", "taskWindow.html", true);
	request.send();
}

Question.prototype.createResourceWindow = function(){
	
	// Get the template for resource windows
	var question = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState == 4 && request.status == 200) {
	    	
	    	// Create the resource window 
	    	question.resource = document.createElement("DIV");
			question.resource.className = "window";
			question.resource.style.top = "50vh";
			question.resource.style.left = "5vw";
	        question.resource.innerHTML = request.responseText;
	    	
	    	// Get the template for individual resouces if any
	    	var resources = question.xml.getElementsByTagName("resourceIndex");
		    if(resources.length > 0){
				var request2 = new XMLHttpRequest();
				request2.onreadystatechange = function() {
				    if (request2.readyState == 4 && request2.status == 200) {
				    	
				    	// Get the html for each resource and then add the result to the window
				    	var resourceHTML = '';
					    for(var i=0;i<resources.length;i++){
					    	//var curResource = request.responseText.replace("%icon%", resourceFiles[parseInt(resources[i].innerHTML)].icon);
					    	//curResource = curResource.replace("%title%", resourceFiles[parseInt(resources[i].innerHTML)].title);
					    	//curResource = curResource.replace("%link%", resourceFiles[parseInt(resources[i].innerHTML)].link);
					    	//resourceHTML += curResource;
					    }
					  	question.resource.innerHTML = question.resource.innerHTML.replace("%resources%", resourceHTML);
				        
				    }
				}
				request2.open("GET", "resource.html", true);
				request2.send();
	    	}
	    	else{
	    		// Display that there aren't any resources
	    		question.resource.innerHTML = question.resource.innerHTML.replace("%resources%", "No resources have been provided for this task.");
	    		question.resource.getElementsByClassName("windowContent")[0].style.color = "grey";
	    		question.resource.getElementsByClassName("windowContent")[0].style.backgroundColor = "#FFFFFF";
	    		question.resource.getElementsByClassName("windowContent")[0].className += ", center";
	    	}
	        
	    }
	};
	request.open("GET", "resourceWindow.html", true);
	request.send();
}

Question.prototype.createAnswerWindow = function(text){
	
	// Get the template for answer windows
	var question = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState == 4 && request.status == 200) {
	    	
	    	// Create the answer window 
	    	question.answer = document.createElement("DIV");
			question.answer.className = "window";
			question.answer.style.top = "5vh";
			question.answer.style.left = "50vw";
	        question.answer.innerHTML = request.responseText;
	        
	        // Create the text element if any
	        var textArea, submit
	        if(text){
	        	textArea = document.createElement("textarea");
	        	submit = document.createElement("button");
	        	submit.className = "submit";
	        	submit.innerHTML = "Submit";
	        	submit.onclick = function() {
	        		question.correctAnswer();
	        	}
	        	textArea.addEventListener('input', function() {
	        		if(textArea.value.length > 0)
	        			submit.disabled = false;
	        		else
	        			submit.disabled = true;
	        	}, false);
	        }
	        
	        // Create and get all the answer elements
	        var answers = [];
	        var answersXml = question.xml.getElementsByTagName("answer");
	        var correct = parseInt(question.xml.getAttribute("correctAnswer"));
	        for(var i=0;i<answersXml.length;i++){
	        	if(text)
	        		textArea.disabled = true;
	        	answers[i] = document.createElement("button");
	        	if(correct===i)
	        		answers[i].className = "correct";
	        	else
	        		answers[i].className = "wrong";
	        	answers[i].innerHTML = String.fromCharCode(i + "A".charCodeAt())+answersXml.innerHTML;
	        }
	        
	        // Create the events for the answers
	        for(var i=0;i<answers.length;i++){
	        	if(answers[i].className === "wrong"){
	        		answers[i].onclick = function(){
	        			this.disabled = true;
	        			question.wrongAnswer(i);
	        		};
	        	}
	        	else{
	        		answers[i].onclick = function(){
	        			for(var j=0;j<answers.length;j++)
	        				answers[j].disabled = true;
	        			if(text)
	        				textArea.disabled = false;
	        			else
	        				question.correctAnswer();
	        		};
	        	}
	        }
	        
	        // Add the answers to the window
	        var answerHTML = ''
		    for(var i=0;i<answers.length;i++)
	        	answerHTML += answers.outerHTML;
	        if(text){
	        	answerHTML += textArea.outerHTML;
	        	answerHTML += submit.outerHTML;
	        }
	        question.answer.innerHTML = question.answer.innerHTML.replace("%answers%", answerHTML);
	    }
	}
	request.open("GET", "answerWindow.html", true);
	request.send();
}

Question.prototype.createFileWindow = function(){
	
	// Get the template for file windows
	var question = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState == 4 && request.status == 200) {
	    	
	    	// Create the file window 
	    	question.answer = document.createElement("DIV");
			question.answer.className = "window";
			question.answer.style.top = "5vh";
			question.answer.style.left = "50vw";
	        question.answer.innerHTML = request.responseText;
	        
	    }
	}
	request.open("GET", "fileWindow.html", true);
	request.send();
}

Question.prototype.createMessageWindow = function(){
	
	// Get the template for file windows
	var question = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState == 4 && request.status == 200) {
	    	
	    	// Create the file window 
	    	question.message = document.createElement("DIV");
			question.message.className = "window";
			question.message.style.top = "10vh";
			question.message.style.left = "40vw";
	        question.message.innerHTML = request.responseText;
	        question.message.innerHTML = question.message.innerHTML.replace("%title%", question.xml.getElementsByTagName("questionName")[0].innerHTML.replace(/\n/g, '<br/>'));
	        question.message.innerHTML = question.message.innerHTML.replace("%instructions%", question.xml.getElementsByTagName("instructions")[0].innerHTML.replace(/\n/g, '<br/>'));
	        question.message.innerHTML = question.message.innerHTML.replace("%question%", question.xml.getElementsByTagName("questionText")[0].innerHTML.replace(/\n/g, '<br/>'));
	        
	    }
	}
	request.open("GET", "messageWindow.html", true);
	request.send();
}