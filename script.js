// Importing HTML Elements
const canvasElem = document.getElementById("canvas");
const canvas = canvasElem.getContext("2d");

// Variables
const scale = 50; // 18 * 50 = 900px
const speed = 100; // ms delay between frames
let score = 0;
let highScore = 0;
let pixels = [];

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
	let pixel = new Pixel(x, y, width, height, colour);
	pixel.drawSquare();
}

function drawBoardStatics(borderColour = "black", playColour = "grey", scoreColour = "white") {
	drawPixel(1, 1, 18, 18, borderColour);
	drawPixel(2, 4, 16, 14, playColour);
	drawPixel(2, 2, 5, 1, scoreColour);
	drawPixel(13, 2, 5, 1, scoreColour);
}

// Classes
class Pixel {
	constructor(x, y, width = 1, height = 1, colour = "black") {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.colour = colour;

		pixels.push(this);
	}

	drawSquare = function () {
		canvas.fillStyle = this.colour;
		canvas.fillRect((this.x - 1) * scale, (this.y - 1) * scale, this.width * scale, this.height * scale);
	};
}

class Snake {
	constructor() {
		this.segments = [new Pixel(7, 5, 1, 1, "green"), new Pixel(6, 5, 1, 1, "green"), new Pixel(5, 5, 1, 1, "green")];
		this.direction = "right";
		this.nextDirection = "right";

		console.log("created");
	}

	drawSnake = function () {
		console.log("drawing");

		this.segments.forEach((segment) => {
			segment.drawSquare();
		});
	};
}

const player = new Snake();

class Apple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

// Game Loop
setInterval(() => {
	// Clear canvas
	canvas.clearRect(0, 0, canvasElem.width, canvasElem.height);
	pixels = [];

	// Draw current score on the screen
	// Move snake in current direction
	// Collisions
	// Apple
	// Draw border
	drawBoardStatics("darkslategrey", "greenyellow", "darkseagreen");

	// Draw segments
	player.drawSnake();

	// Draw apple
}, speed);

// Event Listeners
window.onload = function () {
	setupCanvas();
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
//todo		 - Add highscore that updates during play
