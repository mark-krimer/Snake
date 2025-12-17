// Importing HTML Elements
const canvasElem = document.getElementById("canvas");
const canvas = canvasElem.getContext("2d");

const body = document.querySelector("body");

// Variables
const scale = 50; // 18 * 50 = 900px
const speed = 100; // ms delay between frames
let score = 0;
let highScore = 0;
let pixels = [];

// Functions

function setupCanvas() {
	canvasElem.width = 18 * scale;
	canvasElem.height = 18 * scale;

	// Disable anti-aliasing
	canvas.imageSmoothingEnabled = false;
	canvasElem.style.imageRendering = "pixelated";
}

function drawPixel(x, y, width = 1, height = 1, colour = "black", type = "wall", merge = false) {
	if (merge) {
		const pixel = new Pixel(x, y, width, height, colour, type);
		pixel.drawSquare();
		return [pixel];
	}

	const created = [];
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const px = x + i;
			const py = y + j;
			const pixel = new Pixel(px, py, 1, 1, colour, type);
			pixel.drawSquare();
			created.push(pixel);
		}
	}
	return created;
}

function drawBoardStatics(borderColour = "black", playColour = "grey", scoreColour = "white") {
	drawPixel(1, 1, 18, 3, borderColour, "wall");
	drawPixel(1, 4, 1, 15, borderColour, "wall");
	drawPixel(18, 4, 1, 15, borderColour, "wall");
	drawPixel(2, 18, 16, 1, borderColour, "wall");
	drawPixel(2, 4, 16, 14, playColour, "board");
	drawPixel(2, 2, 5, 1, scoreColour, "wall");
	drawPixel(13, 2, 5, 1, scoreColour, "wall");
}

function checkMovementCompatibility(direction, nextDirection) {
	if (direction == "right" && nextDirection == "left") {
		return 1;
	}
	if (direction == "left" && nextDirection == "right") {
		return 1;
	}
	if (direction == "up" && nextDirection == "down") {
		return 1;
	}
	if (direction == "down" && nextDirection == "up") {
		return 1;
	}
}

function findPixel(x, y) {
	for (let i = 0; i < pixels.length; i++) {
		const pixel = pixels[i];
		if (pixel.x === x && pixel.y === y) {
			return pixel;
		}
	}
	return undefined;
}

class Pixel {
	constructor(x, y, width = 1, height = 1, colour = "black", type = "wall", addToPixels = true) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.colour = colour;
		this.type = type;

		if (addToPixels) {
			pixels.push(this);
		}
	}

	drawSquare = function () {
		canvas.fillStyle = this.colour;
		canvas.fillRect((this.x - 1) * scale, (this.y - 1) * scale, this.width * scale, this.height * scale);
	};
}

class Snake {
	constructor() {
		this.segments = [
			new Pixel(7, 5, 1, 1, "green", "snake", false), // head
			new Pixel(6, 5, 1, 1, "green", "snake", false),
			new Pixel(5, 5, 1, 1, "green", "snake", false),
			new Pixel(4, 5, 1, 1, "green", "snake", false), // tail
		];
		this.direction = "right";
		this.nextDirection = "right";

		console.log("created");
	}

	draw = function () {
		this.segments.forEach((segment) => {
			segment.drawSquare();
		});
	};

	move = function () {
		let newHeadX = this.segments[0].x;
		let newHeadY = this.segments[0].y;

		// Setting direction
		if (checkMovementCompatibility(this.direction, this.nextDirection) == 1) {
			this.nextDirection = this.direction;
		}

		this.direction = this.nextDirection;

		// Remove tail
		this.segments.splice(-1, 1);

		// Add head
		if (this.direction == "right") {
			newHeadX++;
		} else if (this.direction == "left") {
			newHeadX--;
		} else if (this.direction == "down") {
			newHeadY++;
		} else if (this.direction == "up") {
			newHeadY--;
		}

		this.segments.splice(0, 0, new Pixel(newHeadX, newHeadY, 1, 1, "green", "snake"));

		// Check collision
		this.checkCollisions();
	};

	checkCollisions = function () {
		// Finding head location
		let headX = this.segments[0].x;
		let headY = this.segments[0].y;

		// Determining contact pixel
		let contactPixel = findPixel(headX, headY);

		if (contactPixel == undefined) {
			return;
		}

		// Wall
		console.log(contactPixel);
		if (contactPixel.type == "wall") {
			alert("lose");
		}

		// Apple
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

	// Draw border
	drawBoardStatics("darkslategrey", "greenyellow", "darkseagreen");

	// Draw current score on the screen

	// Move snake
	player.move();

	// Apple collisions

	// Wall collisions

	// Draw segments
	player.draw();

	// Draw apple
}, speed);

// Event Listeners
window.onload = function () {
	setupCanvas();
};

// Player Inputs
const directions = {
	37: "left",
	65: "left",
	38: "up",
	87: "up",
	39: "right",
	68: "right",
	40: "down",
	83: "down",
};

body.addEventListener("keydown", function (e) {
	if (directions[e.keyCode] != undefined) {
		player.nextDirection = directions[e.keyCode];
	}
});

//todo		Fundementals
//todo//		 - Get snake moving
//todo//		 - Collisions (wall, self)
//todo//		 	- Track snake segment positions
//todo//		 	- Detect head position overlap
//todo		 - Apple eating
//todo		 	- Pick random unocupied apple position
//todo		 	- Detect snake eating
//todo		 - Track score
//todo		 - Add art

//todo		Additional
//todo		 - Speed increases during play
//todo		 - Add highscore that updates during play
