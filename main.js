const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
const canvasW = canvas.getBoundingClientRect().width;
const canvasH = canvas.getBoundingClientRect().height;

let particles = [];
const particleAmount = 400;

const speed = 0.05;

//* Hunger makes the star "eat" the other star if it's larger
const hunger = 0.0001;
const gravity = 0.00003;
const influence = 20;
let growthRate = () => Math.random() * 0.001;
let age = () => Math.random() * 200 + 50;

class Particle {
	constructor({ pos = getRandomPos(), size = 20 }) {
		this.delta = getRandomDelta();
		this.pos = pos;
		this.size = size;
		this.radius = getRandomRadius(this.size);
		this.sight = this.radius * influence;
		this.greenAmount = Math.floor(Math.random() * 100) + 155;
		this.redAmount = Math.floor(Math.random() * 255);
	}
	move() {
		this.physics();
		this.pos[0] += this.delta[0];
		this.pos[1] += this.delta[1];
		this.radius += growthRate();

		if (
			this.pos[0] > canvasW ||
			this.pos[0] < 0 ||
			this.pos[1] > canvasH ||
			this.pos[1] < 0
		) {
			this.replaceSelf();
		}
	}

	replaceSelf() {
		let anotherParticle = new Particle({ size: 5 });
		particles.splice(particles.indexOf(this), 1, anotherParticle);
	}

	physics() {
		//* if the particle is of age (randomized) or smaller than 2 it dies and is reborn
		if (this.radius < 1 || this.radius > age()) {
			this.replaceSelf();
		}
		particles.forEach((particle) => {
			if (particle != this) {
				if (
					particle.pos[0] < this.pos[0] + this.sight &&
					particle.pos[0] > this.pos[0] - this.sight &&
					particle.pos[1] < this.pos[1] + this.sight &&
					particle.pos[1] > this.pos[1] - this.sight
				) {
					//* steers the other particle in the direction of this particle based on this radius
					particle.delta[0] +=
						(this.pos[0] - particle.pos[0]) * particle.radius * gravity;
					particle.delta[1] +=
						(this.pos[1] - particle.pos[1]) * particle.radius * gravity;

					if (this.radius > particle.radius) {
						this.radius += hunger;
					} else {
						this.radius -= hunger;
					}
				}
			}
		});
	}

	drawParticle() {
		context.beginPath();

		context.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
		let gradient = context.createRadialGradient(
			this.pos[0],
			this.pos[1],
			0,
			this.pos[0],
			this.pos[1],
			this.radius
		);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(
			0.05,
			`rgb(${this.redAmount},${this.greenAmount},255,0.5)`
		);

		gradient.addColorStop(
			1,
			`rgb(${this.redAmount - 100},${this.greenAmount - 100},50,0)`
		);

		context.fillStyle = gradient;

		context.fill();
	}
}

function draw() {
	context.fillStyle = "rgb(0,0,0,0.05)"; //* Star tails are made by the low alpha value
	context.fillRect(0, 0, canvasW, canvasH);

	particles.forEach((particle) => {
		particle.move();
		particle.drawParticle();
	});
	requestAnimationFrame(draw);
}

function getRandomDelta() {
	let deltaX = Math.random() * speed - speed / 2;
	let deltaY = Math.random() * speed - speed / 2;
	return [deltaX, deltaY];
}

function getRandomPos() {
	let randY = Math.random() * canvasH;
	let randX = Math.random() * canvasW;
	return [randX, randY];
}

function getRandomRadius(limit) {
	let randRad = Math.floor(Math.random() * limit + 1.1); //* 1.1 being the minimum value
	return randRad;
}

draw();

canvas.addEventListener("click", (e) => {
	let aParticle = new Particle({ pos: [e.offsetX, e.offsetY] }); //* adds a new particle at position
	particles.push(aParticle);
});
