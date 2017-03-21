
//on page load
window.onload = function(){
	loadImages();
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var imageList = [];	//images in image list
var activeImages = []; //active images in canvas

var mouseDown = false;
var mouseInImage = false;
var activeImageIndex;

//dragging
var prevX;
var prevY;

var activeImage = {
	imageObj:"",
	src:"",
	LeftX: 50,
	RightX: 0,
	TopY: 50,
	BottomY: 0,
	Width: 150,
	Height: 150
}

//events binding
$('#canvas').mousedown(function(e){
	prevX = e.clientX;
	prevY = e.clientY;
	mouseDown = true;
	mouseInImage = checkBoundary(e.clientX, e.clientY);
});

$('#canvas').mousemove(function(e){
	dragImage(e);
});

$('#canvas').mouseup(function(e){
	mouseDown = false;
	mouseInImage = false;
});

$('#canvas').mouseout(function(e){
	mouseDown = false;
	mouseInImage = false;
});

function draw(img){
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img.imageObj, 0, 0, img.imageObj.width, img.imageObj.height, img.LeftX, img.TopY, img.Width, img.Height);
}

//check if the mouse is in an image
function checkBoundary(x, y){
	var rect = canvas.getBoundingClientRect();
	x -= rect.left;
	y -= rect.top;
	for(var i = 0; i < activeImages.length; i++){
		var image = activeImages[i];
		// console.log("leftx: " + image.LeftX + " rightx " + image.RightX + " topy: "+image.TopY + " botY: " +image.BottomY);
		if(x > image.LeftX && x < image.RightX &&
			 y > image.TopY && y < image.BottomY){
			activeImageIndex = i;
			return true;
		}
	}
}

//set the border of the selected image in canvas
function setImageBorder(id){
}

function dragImage(e){
	var lerpX;
	var lerpY;

	if(mouseDown && mouseInImage){
		var img = activeImages[activeImageIndex];
		console.log("preX: "+prevX+ " prey: "+prevY);
		lerpX = e.clientX - prevX;
		lerpY = e.clientY - prevY;
		img.LeftX += lerpX;
		img.TopY += lerpY;
		img.BottomY += lerpY;
		img.RightX += lerpX;
		draw(img);
		prevX = e.clientX;
		prevY = e.clientY;
	}
}

//invoked when user clicked on the image in the panel
function imageListClick(address){

	var newImage = activeImage;
	var obj = new Image();

	newImage.imageObj = obj;
	obj.src =address;
	newImage.TopY = 0;
	newImage.LeftX = 0;
	newImage.src = address;
	newImage.BottomY = newImage.TopY + newImage.Height;
	newImage.RightX = newImage.LeftX + newImage.Width;

	activeImages.push(newImage);

	draw(newImage);
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
		    		list.append( '<li><img id="+i+" onclick ="imageListClick(\''+ el +'\')" src=\''+ el +'\'></li>' );
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
			alert("You have selected unsupported type of image file. Only .png and .jpg are allowed.");
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


