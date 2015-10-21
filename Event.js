/**using tutorials from codeincomplete.com for game loop**/
// Global vars
var canvas = null;
var ctx = null;
//initialise the ship starting position
var shipPositionX = 624.5;
var shipPositionY = 54.5;

//for determining the tangent on the black hole relative to the vector between ship and hole centers
var pointX = null;
var pointY = null;
var b = null;
var m = null;

//holds bounds for collision box - x, y, width, height
var shipBounds = null;
//holds ship velocity in x and y directions
var velocityX = 0;
var velocityY = 0;
//used to set the strength of pull from the black hole
var gravity = 0.15;
//vector holds coords of black hole origin and position of the ship center
//used to calculate the distance from the ship to black hole
var vector = null;
var distance = null;
//populated with random coordinates to draw 'stars' on the background
var starPositions = [];

var asteroids = [];

//set the framerate
var step = 1/60;

var currentTime = 0;
var bestTime = 0;

//variables for timestamp use
var now,
	dt = 0,
	frameTime = 0,
	last = timestamp();
//keep track of which key is pressed
var keyPressed = {left:false, right:false, up:false, down:false};
//used to decide which direction the ship should be facing
var lastKeyPressed;

var KEY = {LEFT:37,UP:38,RIGHT:39,DOWN:40};

// ----------------------------------------

window.onload = function () {
    canvas = document.getElementById("screen");
    ctx = canvas.getContext("2d");
    
    //this holds coordinates for the origin of the black hole and the center point of the spaceship
	//these values will be used to calculate the distance of the ship from the black hole
	//x1,y1 = black hole; x2,y2 = ship
	vector = {x1:canvas.width/2, y1:canvas.height/2, x2:shipPositionX + 15, y2:shipPositionY + 10};
	
	//initialise star positions for the background
	for(var i=0;i<150;i++) {
		var x = Math.floor(Math.random() * 800);
		var y = Math.floor(Math.random() * 480);
		
		starPositions.push([x,y]);
	}
	
	//initialise asteroid array
	for(var i = 0; i < 5; i++) {
		asteroids.push(createAsteroid());
	}
    
    drawBackground();
    
    //start with the ship facing down
    lastKeyPressed = 'down';
    
    //set bounding box around ship
	if(lastKeyPressed == 'down' || lastKeyPressed == 'up') {
		//push values, in order, x position of top left corner, y position, width, height
		shipBounds = {x:vector.x2 - 15, y:vector.y2 -10, width:30, height:20};
	}
	if(lastKeyPressed == 'left' || lastKeyPressed == 'right') {
		shipBounds = {x:vector.x2 - 10, y:vector.y2 - 15, width:20, height:30};
	}
    drawSpaceship();
    
};

document.addEventListener('keydown', function(e) { 
	return onkey(e, e.keyCode, true);  }, false);
document.addEventListener('keyup',   function(e) {
	return onkey(e, e.keyCode, false); }, false);

function onkey(e, key, pressed) {
    switch(key) {
      case KEY.LEFT:  keyPressed.left  = pressed; e.preventDefault(); break;
      case KEY.RIGHT: keyPressed.right = pressed; e.preventDefault(); break;
      case KEY.UP: keyPressed.up  = pressed; e.preventDefault(); break;
      case KEY.DOWN: keyPressed.down = pressed; e.preventDefault(); break;
    }
}

function timestamp() {
	if(window.performance && window.performance.now()) {
		return window.performance.now();
	}
	else {
		return new Date().getTime();
	}
}

//create an asteroid with random position, radius and velocity
function createAsteroid() {
	var radius = Math.floor((Math.random() * 20) + 10);
	var x = Math.floor(Math.random() * 750 + 10);
	var y = Math.floor(Math.random() * 400 + 10);
	var velocityX = Math.random() * 8;
	var velocityY = Math.random() * 8;
	return {x:x, y:y, radius:radius, velocityX:velocityX, velocityY:velocityY};
}

//draws the background for the game
function drawBackground() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	for(var i = 0.5; i <= canvas.width; i+= 60) {
		ctx.moveTo(i,0);
		ctx.lineTo(i, canvas.height);
		ctx.moveTo(0, i);
		ctx.lineTo(canvas.width, i);	
	}
	ctx.strokeStyle = "#000DFD";
	ctx.stroke();
			
	//clear the previously set path so as not to redraw the same lines
	ctx.beginPath();
	//ctx.arc(canvas.width/2,1.6*canvas.height,canvas.height + 10,Math.PI, 2*Math.PI);
	
	//draw stars to the background
	for(var i=0;i<starPositions.length;i++) {
		var x = starPositions[i][0];
		var y = starPositions[i][1];
		
		ctx.moveTo(x,y);
		ctx.lineTo(x + 1,y + 1);
		if(i % 2 == 0) {
			ctx.strokeStyle = "#4169E1";
		}
		else if(i % 3 == 0) {
			ctx.strokeStyle = "#B22222";
		}
		else {
			ctx.strokeStyle = "#FFFFFF";
		}
		ctx.stroke();
		ctx.beginPath();
	}
	
	//add text
	ctx.font = "40px Tahoma, Geneva, sans-serif";
	ctx.fillStyle = "#00055E";
	ctx.fillText("event",canvas.width/12 + 2,canvas.height - 100 + 1);
	ctx.fillText("horizon",canvas.width/12 + 2,canvas.height - 50 + 1);
	ctx.fillStyle = "#000DFD";
	ctx.fillText("event",canvas.width/12,canvas.height - 100);
	ctx.fillText("horizon",canvas.width/12,canvas.height - 50);
}

//draw the player ship
function drawSpaceship() {
	//draw 'spaceship'
	ctx.lineWidth = 1;
	ctx.fillStyle = "#000DFD";
	//middle block
	ctx.fillRect(shipPositionX + 10,shipPositionY + 10,10,10);
	//position 'blocks' depending on which way the ship should be facing
	if(lastKeyPressed == 'down') {
		//'right' block
		ctx.fillRect(shipPositionX,shipPositionY,10,10);
		//'left' block
		ctx.fillRect(shipPositionX + 20,shipPositionY,10,10);	
	}
	if(lastKeyPressed == 'up') {
		//'left' block
		ctx.fillRect(shipPositionX,shipPositionY + 20,10,10);
		//'right' block
		ctx.fillRect(shipPositionX + 20,shipPositionY + 20,10,10);
	}
	if(lastKeyPressed == 'left') {
		//'right' block
		ctx.fillRect(shipPositionX + 20,shipPositionY,10,10);
		//'left' block
		ctx.fillRect(shipPositionX + 20,shipPositionY + 20,10,10);
	}
	if(lastKeyPressed == 'right') {
		//'right' block
		ctx.fillRect(shipPositionX, shipPositionY + 20, 10, 10);
		//'left' block
		ctx.fillRect(shipPositionX, shipPositionY, 10,10);
	}
	
	ctx.beginPath();
	
	//draw center point for testing
	/**
	ctx.beginPath();
	ctx.moveTo(vector.x2, vector.y2);
	ctx.lineTo(vector.x2 + 1, vector.y2 + 1);
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#FFFFFF";
	ctx.stroke();
	ctx.beginPath();
	**/
	
	//draw bounding box for testing
	/**
	ctx.beginPath();
	ctx.rect(shipBounds.x, shipBounds.y, shipBounds.width, shipBounds.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#FFFFFF";
	ctx.stroke();
	ctx.beginPath();
	**/
}

//returns the distance between two points
function calculateDistance(x1,y1,x2,y2) {
	return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)); 
}

//handles drawing frames
function render() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	//drawBackground
	drawBackground();
	
	//draw black hole
	ctx.arc(canvas.width/2,canvas.height/2,80,0,2*Math.PI);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width/2,canvas.height/2,75,0,2*Math.PI);
			
	ctx.strokeStyle = "#000DFD";
	ctx.fillStyle = "#000000";
	ctx.lineWidth = 10;
	ctx.stroke();
	ctx.fill();
	
	drawSpaceship();
	
	//draw line from ship to black hole - TESTING
	/**
	ctx.beginPath();
	ctx.moveTo(vector.x1, vector.y1);
	ctx.lineTo(vector.x2, vector.y2);
	ctx.strokeSTyle="#FFFFFF";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.beginPath();
	**/
		
	//draw tangent line to black hole for testing purposes
	/**
	ctx.beginPath();
	ctx.moveTo(m*b, 0);
	ctx.lineTo(m*(b - canvas.height), canvas.height);
	ctx.strokeSTyle="#FFFFFF";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.beginPath();
	**/
	
	//draw asteroids
	ctx.strokeStyle = "#FFFFFF";
	for(var i = 0; i < asteroids.length; i++) {
		ctx.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius,0, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
	}
	
	
	
	//display fps counter for testing purposes
	/**
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "10px arial, sans-serif";
	ctx.fillText(Math.floor(1/frameTime) + "fps",50,50);
	**/
}

// updates the speed and position of the ship
function updateShip(step) {
	//update the ships velocity on key presses
	//no deceleration when key is released as in vacuum!
	if(keyPressed.left) {
		lastKeyPressed = 'left';
		if(velocityX > -10)
			velocityX -= 0.2;
	}
	if(keyPressed.right) {
		lastKeyPressed = 'right';
		if(velocityX < 10)
			velocityX += 0.2;
	}
	if(keyPressed.up) {
		lastKeyPressed = 'up';
		if(velocityY > -10)
			velocityY -= 0.2;
	}
	if(keyPressed.down) {
		lastKeyPressed = 'down';
		if(velocityY < 10)
			velocityY += 0.2;
	}
	
	
	//update ship position if it moves off screen
	shipPositionX += velocityX;
	if(shipPositionX > canvas.width)
		shipPositionX = -30;
	if(shipPositionX < -30)
		shipPositionX = canvas.width;
		
	shipPositionY += velocityY;
	if(shipPositionY < -20)
		shipPositionY = canvas.height;
	if(shipPositionY > canvas.height)
		shipPositionY = -20;
	
	//calculate the distance of the ship's center from the black hole
	//first set the position of the center depending on the orientation
	if(lastKeyPressed == 'down') {
		vector.x2 = shipPositionX + 15;
		vector.y2 = shipPositionY + 10;	
	}
	if(lastKeyPressed == 'up') {
		vector.x2 = shipPositionX + 15;
		vector.y2 = shipPositionY + 20;
	}
	if(lastKeyPressed == 'left') {
		vector.x2 = shipPositionX + 20;
		vector.y2 = shipPositionY + 15;
	}
	if(lastKeyPressed == 'right') {
		vector.x2 = shipPositionX + 10;
		vector.y2 = shipPositionY + 15;
	}
	
	//distance from center of black hole to center of ship
	distance = calculateDistance(vector.x1, vector.y1, vector.x2, vector.y2);
	
	//gravitational pull from the black hole
	//calculate the angle the vector from black hole center to ship makes with the x-axis
	var angle = Math.atan2(vector.y2 - vector.y1, vector.x2 - vector.x1);
	
	//find the x and y components of the velocity caused by gravitational pull and apply
	if(velocityY < 10)
		velocityY -= gravity * Math.sin(angle);
	if(velocityX < 10)
		velocityX -= gravity * Math.cos(angle);
}

//update asteroid positions
function updateAsteroids(step) {
	for(var i = 0; i < asteroids.length; i++) {
		
		var angle = Math.atan2(asteroids[i].y - vector.y1, asteroids[i].x - vector.x1);
		if(asteroids[i].velocityY < 10) {
			asteroids[i].velocityY -= gravity * Math.sin(angle);
		}
		if(asteroids[i].velocityX < 10) {
			asteroids[i].velocityX -= gravity * Math.cos(angle);
		}
		
		
		asteroids[i].x += asteroids[i].velocityX;
		asteroids[i].y += asteroids[i].velocityY;
	}
}

function updateCollisions() {
	//set bounding box around ship
	if(lastKeyPressed == 'down' || lastKeyPressed == 'up') {
		//push values, in order, x position of top left corner, y position, width, height
		shipBounds = {x:vector.x2 - 15, y:vector.y2 -10, width:30, height:20};
	}
	if(lastKeyPressed == 'left' || lastKeyPressed == 'right') {
		shipBounds = {x:vector.x2 - 10, y:vector.y2 - 15, width:20, height:30};
	}
	
	//collision detection for vertices of bounding box with black hole
	//not perfect but acceptable at this scale
	var distToPoint1 = calculateDistance(vector.x1, vector.y1, shipBounds.x, shipBounds.y);
	var distToPoint2 = calculateDistance(vector.x1, vector.y1, shipBounds.x + shipBounds.width, shipBounds.y);
	var distToPoint3 = calculateDistance(vector.x1, vector.y1, shipBounds.x, shipBounds.y + shipBounds.height);
	var distToPoint4 = calculateDistance(vector.x1, vector.y1, shipBounds.x + shipBounds.width, shipBounds.y + shipBounds.height);
	if(distToPoint1 <= 75 || distToPoint2 <= 75 || distToPoint3 <= 75 || distToPoint4 <= 75) {
		shipPositionX = 624.5;
		shipPositionY = 54.5;
		velocityX = 0;
		velocityY = 0;
		
		if(currentTime > bestTime) {
			bestTime = currentTime;
			document.getElementById("bestTime").innerHTML = Math.round(bestTime * 10)/10;
		}
		
		currentTime = 0;
	}
	
	//collision detection for asteroids and ship
	for(var i = 0; i < asteroids.length; i++) {
		var distToPoint1 = calculateDistance(asteroids[i].x, asteroids[i].y, shipBounds.x, shipBounds.y);
		var distToPoint2 = calculateDistance(asteroids[i].x, asteroids[i].y, shipBounds.x + shipBounds.width, shipBounds.y);
		var distToPoint3 = calculateDistance(asteroids[i].x, asteroids[i].y, shipBounds.x, shipBounds.y + shipBounds.height);
		var distToPoint4 = calculateDistance(asteroids[i].x, asteroids[i].y, shipBounds.x + shipBounds.width, shipBounds.y + shipBounds.height);
		if(distToPoint1 <= asteroids[i].radius || distToPoint2 <= asteroids[i].radius || 
			distToPoint3 <= asteroids[i].radius || distToPoint4 <= asteroids[i].radius) {
				shipPositionX = 624.5;
				shipPositionY = 54.5;
				velocityX = 0;
				velocityY = 0;
				asteroids.splice(i,1);
				asteroids.push(createAsteroid());
				
				if(currentTime > bestTime) {
					bestTime = currentTime;
					//display best time on page to 1 decimal place in seconds
					document.getElementById("bestTime").innerHTML = Math.round(bestTime * 10)/10;
				}
				
				currentTime = 0;
		}
	}
	
	//collision detection for asteroids and black hole
	for(var i = 0; i < asteroids.length; i++){
		var distToAsteroid = calculateDistance(vector.x1, vector.y1, asteroids[i].x, asteroids[i].y);
		if(distToAsteroid < (75 + asteroids[i].radius)) {
			//circles overlap, so remove asteroid
			asteroids.splice(i,1);
			asteroids.push(createAsteroid());
		}
		
		//if asteroid goes too far offscreen, destroy it and replace
		if(distToAsteroid > canvas.width*2) {
			asteroids.splice(i,1);
			asteroids.push(createAsteroid());
		}
	}
}
//updates game logic each tick
function update(step) {
	currentTime += step;
	
	updateShip(step);
	
	updateAsteroids(step);
	
	updateCollisions();
	
	//TESTING - monitor no of asteroids present
	console.log(asteroids.length);
}

//main game loop
function gameLoop() {
	update(step);
	render();
	requestAnimationFrame(gameLoop, canvas);	//request the next frame
}

requestAnimationFrame(gameLoop, canvas);	//start the first frame
