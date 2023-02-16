(function () {
    // global keyword 'print' where 'this' is bound to 'console'
    const print = console.log.bind(console);

    let SCREENWIDTH = 40;
    let SCREENHEIGHT = 30;
    let pixelSize = 15;

    // time stuff
    let previousTime, currentTime;
    let targetFrametime = 1000; // 1 second
    let framerate = 24; // frames
    let iter = 0;

    // helper class
    class Point {
	constructor(x, y) {
	    this.x = x;
	    this.y = y;
	}
    }

    // list containing every orthogonal direction
    let offSets = [
	new Point(-1, -1),
	new Point(0, -1),
	new Point(1, -1),
	new Point(-1, 0),
	new Point(1, 0),
	new Point(-1, 1),
	new Point(0, 1),
	new Point(1, 1)
    ];
    
    // Helper Function
    function isInBounds(x, y) {
	return x < SCREENWIDTH && x >= 0 && y < SCREENHEIGHT && y >= 0;
    }

    class Buffer {
	constructor(width, height) {
	    this.buffer = new Array(width * height);
	}

	set(x, y, val) {
	    if (isInBounds(x, y)) {
		this.buffer[y * SCREENWIDTH + x] = val;
	    }
	}

	get(x, y) {
	    return this.buffer[y * SCREENWIDTH + x];
	}
    }

    class Screen {
	constructor(width, height) {
	    this.running = false;
	    // create the buffers
	    this.buffer = new Buffer(width, height);
	    this.backbuffer = new Buffer(width, height);

	    // populate the buffers with Cells
	    this.initialize();

	    // canvas properties
	    this.canvas = document.getElementById("canvas");
	    this.ctx = this.canvas.getContext("2d");

	    this.canvas.width = SCREENWIDTH * pixelSize;
	    this.canvas.height = SCREENHEIGHT * pixelSize;

	    // canvas ui
	    this.runButton = document.getElementById("start");
	    this.nextTickButton = document.getElementById("nextTick");
	    this.resetButton = document.getElementById("reset");
	    this.randomButton = document.getElementById("random");
	    this.gosperGliderGunButton = document.getElementById("gosper");

	    this.generationNo = document.getElementById("generationNo");
	    this.liveCellCount = document.getElementById("liveCells");
	    this.updateCounters();
	    
	    // add event listener for mouse clicks and explicitly bind 'this' to the class for the callback
	    this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false );
	    this.nextTickButton.addEventListener("click", this.tick.bind(this), false);
	    this.runButton.addEventListener("click", this.run.bind(this), false);
	    this.resetButton.addEventListener("click", this.reset.bind(this), false);
	    this.randomButton.addEventListener("click", this.randomize.bind(this), false);
	    this.gosperGliderGunButton.addEventListener("click", this.gosperGliderGun.bind(this), false);

	    // immediately render the screen to the canvas
	    this.render();
	}

	initialize() {
	    // insert a new Cell for each coordinate pair
	    for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
		    this.buffer.set(x, y, 0);
		    this.backbuffer.set(x, y, 0);
		}
	    }
	}

	mouseDown(event) {
	    let mousePos = this.getMousePos(this.canvas, event);
	    let x = Math.floor(mousePos.x / pixelSize);
	    let y = Math.floor(mousePos.y / pixelSize);

	    print(x, y);
	    this.buffer.set(x, y, !this.buffer.get(x, y));
	    this.render();
	}

	getMousePos(canvas, event) {
	    let rect = this.canvas.getBoundingClientRect();
	    return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	    };
	}

	getNeighbors(x, y) {
	    let count = 0;
	    for (let i = 0; i < offSets.length; i++) {
		if (isInBounds(x + offSets[i].x, y + offSets[i].y)) {
		    const neighboringCellIsAlive = this.buffer.get(
			x + offSets[i].x,
			y + offSets[i].y
		    );
		    if (neighboringCellIsAlive) {
			count++;
		    }
		}
	    }
	    return count;
	}

	updateCounters() {
	    this.generationNo.innerHTML = iter;
	}
	
	update() {
	    for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
		    let neighborCount = 0;
		    neighborCount = this.getNeighbors(x, y);
		    
		    switch (neighborCount) {
		    case 2:
			this.backbuffer.set(x, y, this.buffer.get(x, y));
			break;
		    case 3:
			this.backbuffer.set(x, y, 1);
			break;
		    default:
			this.backbuffer.set(x, y, 0);
			break;
		    }
		}
	    }

	    // swap buffers
	    let temp = this.buffer;
	    this.buffer = this.backbuffer;
	    this.backbuffer = temp;

	    this.updateCounters();
	}

	render() {
	    this.clear();
	    for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
		    if(this.buffer.get(x, y)) {
			this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
		    }
		}
	    }
	}

	randomize() {
	    for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
		    this.buffer.set(x, y, !!Math.round(Math.random()));
		}
	    }
	    this.render();
	}

	gosperGliderGun(event, x = 2, y = 5) {
	    this.buffer.set(x + 1, y + 8, 1);
	    this.buffer.set(x + 0, y + 8, 1);
	    this.buffer.set(x + 1, y + 9, 1);
	    this.buffer.set(x + 0, y + 9, 1);

	    this.buffer.set(x + 10, y + 8, 1);
	    this.buffer.set(x + 10, y + 9, 1);
	    this.buffer.set(x + 10, y + 10, 1);
	    this.buffer.set(x + 11, y + 7, 1);
	    this.buffer.set(x + 11, y + 11, 1);
	    this.buffer.set(x + 12, y + 6, 1);
	    this.buffer.set(x + 12, y + 12, 1);
	    this.buffer.set(x + 13, y + 6, 1);
	    this.buffer.set(x + 13, y + 12, 1);
	    this.buffer.set(x + 14, y + 9, 1);
	    this.buffer.set(x + 15, y + 7, 1);
	    this.buffer.set(x + 15, y + 11, 1);
	    this.buffer.set(x + 16, y + 8, 1);
	    this.buffer.set(x + 16, y + 9, 1);
	    this.buffer.set(x + 16, y + 10, 1);
	    this.buffer.set(x + 17, y + 9, 1);

	    this.buffer.set(x + 20, y + 8, 1);
	    this.buffer.set(x + 21, y + 8, 1);
	    this.buffer.set(x + 20, y + 7, 1);
	    this.buffer.set(x + 21, y + 7, 1);
	    this.buffer.set(x + 20, y + 6, 1);
	    this.buffer.set(x + 21, y + 6, 1);
	    this.buffer.set(x + 22, y + 5, 1);
	    this.buffer.set(x + 22, y + 9, 1);
	    this.buffer.set(x + 24, y + 5, 1);
	    this.buffer.set(x + 24, y + 9, 1);
	    this.buffer.set(x + 24, y + 4, 1);
	    this.buffer.set(x + 24, y + 10, 1);

	    this.buffer.set(x + 34, y + 6, 1);
	    this.buffer.set(x + 35, y + 6, 1);
	    this.buffer.set(x + 34, y + 7, 1);
	    this.buffer.set(x + 35, y + 7, 1);

	    this.render();
	}

	tick() {
	    this.update();
	    this.render();
	    iter++;
	}

	nextTick() {
	    currentTime = Date.now();
	    if (this.running)
	    {
		if (previousTime == undefined || (currentTime - previousTime) >= targetFrametime / framerate)
		{
		    this.tick();
		    previousTime = currentTime;
		}
	    }
	    requestAnimationFrame(()=>this.nextTick());
	}

	run() {
	    this.running = !this.running;
	    if (this.running)
	    {
		this.runButton.innerHTML = "Stop";
		requestAnimationFrame(this.nextTick.bind(this));
	    }
	    else
	    {
		this.runButton.innerHTML = "Start";
	    }
	}

	reset() {
	    if (this.running)
	    {
		this.running = !this.running;
		this.runButton.innerHTML = "Start";
	    }
	    this.clear();
	    for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
		    this.buffer.set(x, y, 0);
		    this.backbuffer.set(x, y, 0);
		}
	    }
	    iter = 0;
	    this.updateCounters(0);
	}

	clear() {
	    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    this.drawGrid();
	}

	drawGrid() {
	    this.ctx.beginPath();
	    for (let x = 0; x <= this.canvas.width; x += pixelSize) {
		this.ctx.moveTo(x, 0);
		this.ctx.lineTo(x, this.canvas.height);
	    }
	    this.ctx.closePath();
	    this.ctx.stroke();

	    this.ctx.beginPath();
	    for (let y = 0; y <= this.canvas.height; y += pixelSize) {
		this.ctx.moveTo(0, y);
		this.ctx.lineTo(this.canvas.width, y);
	    }
	    this.ctx.closePath();
	    this.ctx.stroke();
	}
    }
    
    let gameScreen = new Screen(SCREENWIDTH, SCREENHEIGHT);
})();
