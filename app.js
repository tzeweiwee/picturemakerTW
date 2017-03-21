
//on page load
window.onload = function(){
	loadImages();
}

var imageList = [];	//images in image list
var activeImages = []; //active images in canvas
var activeTexts = []; //active texts

var mouseInImageId;
var activeID;

//events binding
$('.canvas .block').mousedown(function(e){
	checkBoundary(e.clientX, e.clientY);
	activeID = e.target.id;
	console.log(activeID);
});


/* 

id code
---------
5xx:   image on canvas
1xxx:  div wrapping image on canvas
2xxx:  text on canvas

*/


function deleteItem(){

	if(!activeID){
		return;
	}

	$('#'+activeID).remove();

	//remove from array
	if(activeID >= 500 && activeID < 1000){
		var divID = parseInt(activeID) + 500;
		activeImages.splice( activeImages.indexOf(divID), 1 );
		$('#'+divID).remove();
	}else if(activeID >= 2000){
		activeTexts.splice( activeTexts.indexOf(activeID), 1 );
	}
}

function clearCanvas(){
	$('.canvas .block').empty();
	activeImages = [];
	activeTexts = [];
}

//check if the mouse is in an image
function checkBoundary(x, y){
	for(var id = 0; id < activeImages.length; id++){
		var image = $('#'+activeImages[id]);
		var imageLeftX = image.offset().left;
		var imageRightX = image.offset().left + image.width();
		var imageTopY = image.offset().top;
		var imageBottomY = image.offset().top+image.height();

		if(x > imageLeftX && x < imageRightX &&
			 y > imageTopY && y < imageBottomY){
			setImageBorder(id);
			return;
		}
	}

	setImageBorder(-1);
}

//set the border of the selected image in canvas
function setImageBorder(id){
	var PrevImage = $('#'+activeImages[mouseInImageId]);
	PrevImage.css({"border-color":"transparent",
				"border-width":"1px",
				"border-style":"solid"});
	$('#'+activeImages[mouseInImageId]+' .ui-resizable-se').css({"display":"none"});
	if(id == -1){
		return;
	}
	var newImage = $('#'+activeImages[id]);
	newImage.css({"border-color":"black",
				"border-width":"1px",
				"border-style":"solid"});
	$('#'+activeImages[id]+' .ui-resizable-se').css({"display":"block"});
	mouseInImageId = id;
}

//add text to canvas
function textClick(size){ 
	//assign new id number
	var fontsize = size*10; 
	var newID = activeTexts.length + 2000;
	$txtContent = $('<input id='+newID+' class="draggable-text" style="font-size: '+fontsize+'px;" placeholder="Text" />'); 
	$('.canvas .block').append($txtContent);
	activeTexts.push(newID);
	
	$('.draggable-text').draggable({ //bind draggable to element with this class
		cancel:null,
		containment: ".canvas .block", //fix movement within this div
	    scroll: false,
	    cursor: "move"
	});
}

//add image to canvas and set new id for the new image
function imageListClick(id){
	//assign new id number
	var divID = activeImages.length + 1000;
	var imgID = activeImages.length + 500;
	$('.canvas .block').append("<div id="+divID+" class='draggable' style='display:inline-block'><img id="+imgID+" class='resizable ui-widget-content' src='"+ imageList[id] +"'></div>");
	activeImages.push(divID);

	$('.draggable').draggable({ //bind draggable to element with this class
		cancel:null,
		containment: ".canvas .block", //fix movement within this div
	    scroll: false,
	    cursor: "move"
	});

	$('.resizable').resizable();
}


//refresh all images in the panel
function loadImages(){
	//clear the child nodes and append the images
	var list = $(".list-unstyled");
	imageList = [];
	list.empty();
	$.get('/images', (data)=>{
		data.forEach((el, i)=>{
			if( el.match(/\.(jpe?g|png)$/) ) { 
		    		list.append( "<li><img id="+i+" onclick ='imageListClick("+i+")' src='"+ el +"'></li>" );
		    		imageList[i] = el;
		    	}
		});
	});
}


//uploads the image without refreshing the page
$('#form').submit(function(e){
	var files = $('#upload').get(0).files;
	e.preventDefault();

	//validation
	//check for the number of files selected
	if(!(files.length > 0)){
		alert("Error: You have not selected any images");
		return;
	}else if(files.length > 1){
		alert("Multiple uploads: You have selected more than 1 images. Only the last selected will be uploaded");
	}

	var fd = new FormData();

	//check for file type
	switch(files[0].type){
		case "image/png":
		case "image/jpg":
		case "image/jpeg":
			fd.append('upload', files[0], files[0].name);
			break;
		default:
			alert("You have selected an image file of supported type. Only .png and .jpg are allowed.");
			return;
	}

	//send the data to server
	$.ajax({
		url: '/uploads',
		type: 'POST',
		data: fd,
		processData: false,
		contentType: false,
		success: function(){
			console.log('upload successful');
			loadImages();
		}
	});
});


