// Importing HTML Elements
const canvasElem = document.getElementById("canvas");
const canvas = canvasElem.getContext("2d");

// Variables
const scale = 50; // 18 * 50 = 900px
const speed = 100; // ms delay between frames

// Functions
function gameLoop() {}

function setupCanvas() {
	canvasElem.width = 18 * scale;
	canvasElem.height = 18 * scale;

	// Disable anti-aliasing
	canvas.imageSmoothingEnabled = false;
	canvasElem.style.imageRendering = "pixelated";
}

function drawPixel(x, y, width = 1, height = 1, colour = "black") {
	canvas.fillStyle = colour;
	canvas.fillRect((x - 1) * scale, (y - 1) * scale, width * scale, height * scale);
	canvas.fillStyle = "black";
}

function drawBoardStatics(borderColour = "black", playColour = "grey", scoreColour = "white") {
	drawPixel(1, 1, 18, 18, borderColour);
	drawPixel(2, 4, 16, 14, playColour);
	drawPixel(2, 2, 5, 1, scoreColour);
	drawPixel(13, 2, 5, 1, scoreColour);
}

// Game Loop
setInterval(() => {
	// Clear canvas
	canvas.clearRect(1, 18);

	// Draw curerent score on the screen
	// Move snake in current direction
	// Collisions
	// Apple
	// Draw segments
	// Draw apple
	// Draw border
}, speed);

// Event Listeners
window.onload = function () {
	setupCanvas();
	drawBoardStatics("darkslategrey", "greenyellow", "darkseagreen");
};

// Player Inputs

//todo		Fundementals
//todo		 - Get snake moving
//todo		 - Collisions (wall, self)
//todo		 	- Track snake segment positions
//todo		 	- Detect head position overlap
//todo		 - Apple eating
//todo		 	- Pick random unocupied apple position
//todo		 	- Detect snake eating
//todo		 - Track score
//todo		 - Add art

//todo		Additional
//todo		 - Speed increases during play
