var questionSize = 100;

// A Question on the board
var Question = function(xml, save, category, onCorrect){
	
	// Save and create class variables
	this.xml = xml;
  this.category = category;
  this.onCorrect = onCorrect;
  this.lines = [];
	
	// Create the question's button and change it's position depending on the save
  this.button = new Konva.Group({
		x: xml.getAttribute("xPositionPercent")/100*virtualSize.x+virtualSize.out,
    y: xml.getAttribute("yPositionPercent")/100*virtualSize.y+virtualSize.out,
    draggable: true,
		dragBoundFunc: function(pos) {
            var outline = virtualSize.out*board.scale().x,
              boardWidth = virtualSize.x*board.scale().x,
              boardHeight = virtualSize.y*board.scale().y,
              width = this.imageHeight*board.scale().x,
              height = this.imageWidth*board.scale().y,
              offset = board.x();
            var x = pos.x-offset < outline ? outline+offset : (pos.x-offset+width > boardWidth ? boardWidth-width+offset : pos.x);
            var y = pos.y < outline ? outline : (pos.y+height > boardHeight ? boardHeight-height : pos.y);
            return {
                x: x,
                y: y
            };
        }
	});
  this.button.hide();
    
  // Create the circle for this question
  this.circle = new Konva.Circle({
    x: questionSize/10,
    y: questionSize/10,
    radius: questionSize/20,
    fill: 'blue',
    stroke: '#0000FF',
    strokeWidth: questionSize/200
  });

  // Show windows on click
  this.button.on('click', function() {
    question.displayWindows();
  });

  // Get the image for the button based on the case file
	var question = this;
  var buttonImg = new Image();
  buttonImg.onload = function() {

    var buttonDisplay = new Konva.Image({
      image: buttonImg,
      width: questionSize,
      height: questionSize/buttonImg.width*buttonImg.height,
      shadowOpacity: 1,
      shadowColor: 'black',
      shadowBlur: 20*board.scale().x,
      shadowEnabled: false
    });
    question.button.imageWidth = buttonDisplay.width();
    question.button.imageHeight = buttonDisplay.height();
    question.button.add(buttonDisplay, question.circle);
    
    // Create hover "effect"
    question.button.on('mouseover dragend', function() {
      buttonDisplay.shadowEnabled(true);
      question.button.getLayer().draw();
    });
    question.button.on('mouseout dragstart', function() {
      buttonDisplay.shadowEnabled(false);
      question.button.getLayer().draw();
    });
    
    // Create the checkmark for this question but don't add it yet
    var checkImg = new Image();
    checkImg.onload = function() {
      question.check = new Konva.Image({
        image: checkImg,
        x: question.button.imageWidth-checkImg.width/2,
        y: question.button.imageHeight-checkImg.height/2
      });
    };
    checkImg.src = '../img/iconPostItCheck.png';
  
    // Use add connection to display this question if it doesn't require any connections
    question.addConnection();

  };
  buttonImg.src = caseFiles["case\\"+xml.getAttribute("imageLink").replace(/\//g, '\\')];
	
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

Question.prototype.addConnection = function(line){
  
  // Get the number of connections required to show this question
  var required = parseInt(this.xml.getAttribute("revealThreshold"));
  
  // Add the new line to the list and if number of connections has been reached display all the lines and the question
  if(line)
    this.lines.push(line);
  if(this.lines.length>=required){
    for(var i=0;i<this.lines.length;i++)
      this.lines[i].line.show();
    this.button.show();
    if(this.button.getLayer())
      this.button.getLayer().draw();
  }

}

Question.prototype.wrongAnswer = function(num){
	
  // If feeback display it
	var feedbacks = this.xml.getElementsByTagName("feedback");
	if(feedbacks.length>0)
		this.feedback.innerHTML = '"'+String.fromCharCode(num + "A".charCodeAt())+
											'" is not correct <br/>&nbsp;<span class="feedbackI">'+
											feedbacks[num].innerHTML+'</span><br/>';
	
}

Question.prototype.correctAnswer = function(){	

	// Get the number for the correct answer
	var correct = parseInt(this.xml.getAttribute("correctAnswer"));
	
	// If feeback display it
	var feedbacks = this.xml.getElementsByTagName("feedback");
	if(feedbacks.length>0)
		this.feedback.innerHTML = '"'+String.fromCharCode(correct + "A".charCodeAt())+
											'" is the correct response <br/><span class="feedbackI">'+
											feedbacks[correct].innerHTML+'</span><br/>';
	
	
	if(this.questionType===3 && this.justification.value != '')
		this.feedback.innerHTML = 'Submitted Text:<br/><span class="feedbackI">'+this.justification.value+'</span><br/>';
	
	if(this.questionType===1 && this.justification.value != '')
		this.feedback.innerHTML += 'Submitted Text:<br/><span class="feedbackI">'+this.justification.value+'</span><br/>';
	
	if(this.questionType===4){
		if(this.fileInput.files.length>0)
			this.feedback.innerHTML = 'Submitted Files:<br/>';
		else
			this.feedback.innerHTML = '';
		for(var i=0;i<this.fileInput.files.length;i++)
			this.feedback.innerHTML += '<span class="feedbackI">'+this.fileInput.files[i].name+'</span><br/>';
	}
  
  if(((this.questionType===3 || this.questionType===1) && this.justification.value != '') ||
      (this.questionType===4 && this.fileInput.files.length>0) ||
       this.questionType===2){ 
    // Set the state of the question to correct
    this.newState = "correct";
  }
	
}

Question.prototype.displayWindows = function(){
	
	hideWindows();
	var windowNode = document.getElementById("window");
	var exitButton = new Image();
  exitButton.src = "../img/iconClose.png";
  exitButton.className = "exit-button";
  var question = this;
  exitButton.onclick = function() { question.hideWindows(); };
  if(this.questionType===5){
		windowNode.appendChild(this.message);
    exitButton.style.left = "75vw";
	}
	else{
		windowNode.appendChild(this.task);
		windowNode.appendChild(this.answer);
		windowNode.appendChild(this.resource);
    exitButton.style.left = "85vw";
	}
  windowNode.appendChild(exitButton);
}

Question.prototype.hideWindows = function(){
  hideWindows();
  if(this.newState != this.state){
    this.state = this.newState;
    if(this.state == "correct"){
      this.circle.fill('red');
      this.circle.stroke('#00FF00');
      this.button.add(this.check);
      this.button.getLayer().draw();
      this.onCorrect();
    }
  }
  curCategory.button.focus();
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
        question.task.style.top = "10vh";
        question.task.style.left = "5vw";
        question.task.innerHTML = request.responseText;
        question.task.innerHTML = question.task.innerHTML.replace("%title%", question.xml.getElementsByTagName("questionName")[0].innerHTML.replace(/\n/g, '<br/>'));
        question.task.innerHTML = question.task.innerHTML.replace("%instructions%", question.xml.getElementsByTagName("instructions")[0].innerHTML.replace(/\n/g, '<br/>'));
        question.task.innerHTML = question.task.innerHTML.replace("%question%", question.xml.getElementsByTagName("questionText")[0].innerHTML.replace(/\n/g, '<br/>'));
        question.feedback = question.task.getElementsByClassName("feedback")[0];
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
			  question.resource.style.top = "55vh";
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
                var curResource = request2.responseText.replace("%icon%", resourceFiles[parseInt(resources[i].innerHTML)].icon);
					    	curResource = curResource.replace("%title%", resourceFiles[parseInt(resources[i].innerHTML)].title);
					    	curResource = curResource.replace("%link%", resourceFiles[parseInt(resources[i].innerHTML)].link);
					    	resourceHTML += curResource;
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
        question.answer.style.top = "10vh";
        question.answer.style.left = "50vw";
        question.answer.innerHTML = request.responseText;
	        
	        // Create the text element if any
	        var submit;
	        if(text){
	        	question.justification = document.createElement("textarea");
	        	submit = document.createElement("button");
	        	submit.className = "submit";
	        	submit.innerHTML = "Submit";
	        	submit.disabled = true;
            submit.onclick = function() {
	        		question.correctAnswer();
	        	}
	        	question.justification.addEventListener('input', function() {
	        		if(question.justification.value.length > 0)
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
	        		question.justification.disabled = true;
	        	answers[i] = document.createElement("button");
	        	if(correct===i)
	        		answers[i].className = "correct";
	        	else
	        		answers[i].className = "wrong";
	        	answers[i].innerHTML = String.fromCharCode(i + "A".charCodeAt())+". "+answersXml[i].innerHTML;
	        }
	        
	        // Create the events for the answers
	        for(var i=0;i<answers.length;i++){
	        	if(answers[i].className == "wrong"){
	        		answers[i].num = i;
              answers[i].onclick = function(){
                this.disabled = true;
	        			question.wrongAnswer(this.num);
	        		};
	        	}
	        	else{
	        		answers[i].onclick = function(){
                for(var j=0;j<answers.length;j++)
                  answers[j].disabled = true;
                if(text)
                  question.justification.disabled = false;
                  question.correctAnswer();
              };
	        	}
	        }
	        
	        // Add the answers to the window
          for(var i=0;i<answers.length;i++)
            question.answer.getElementsByClassName("windowContent")[0].appendChild(answers[i]);
	        if(text){
	        	question.answer.getElementsByClassName("windowContent")[0].appendChild(question.justification);
	        	question.answer.getElementsByClassName("windowContent")[0].appendChild(submit);
	        }
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
        question.answer.style.top = "10vh";
        question.answer.style.left = "50vw";
        question.answer.innerHTML = request.responseText;
        question.fileInput = question.answer.getElementsByTagName("input")[0];
        question.fileInput.onchange = function(){
          question.correctAnswer();
        };
	        
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
	      question.message.getElementsByTagName("button")[0].onclick = function() {
          question.newState = "correct";
          question.hideWindows();
        };

	    }
	}
	request.open("GET", "messageWindow.html", true);
	request.send();
}
