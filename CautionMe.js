let cautionImages = [];
let backgroundImage;
let cautionLines = [];
let maxCautionLines = 40;
let frameInterval = 5;
let timer = 0;
let isMouseClicked = false;
let stopGenerating = false;

function preload() {
  for (let i = 0; i < 6; i++) {
    cautionImages[i] = loadImage("images/caution" + (i + 1) + ".PNG");
  }
  backgroundImage = loadImage("images/Background.png");
}

function setup() {
  createCanvas(640, 480);
}

function draw() {
  background(backgroundImage);

  for (let i = cautionLines.length - 1; i >= 0; i--) {
    cautionLines[i].display();
  }

  if (isMouseClicked && frameInterval < 100) {
    frameInterval += 0.05;
  }

  timer += 1;
  if (!stopGenerating && cautionLines.length < maxCautionLines && timer >= frameInterval) {
    cautionLines.push(new CautionLine());
    timer = 0;
  }
}

function mousePressed() {
  if (!isMouseClicked) isMouseClicked = true;

  for (let i = cautionLines.length - 1; i >= 0; i--) {
    let line = cautionLines[i];
    if (line.isClicked(mouseX, mouseY)) {
      cautionLines.splice(i, 1);
      break;
    }
  }

  if (cautionLines.length === 0) {
    stopGenerating = true;
  }
}

class CautionLine {
  constructor() {
    this.img = random(cautionImages);
    this.scaleFactor = 1.3;
    this.len = this.img.width * this.scaleFactor;
    this.wid = this.img.height * this.scaleFactor;
    this.angle = random(TWO_PI);
    this.calcPosition();
  }

  calcPosition() {
    let edge = floor(random(4));
    if (edge === 0) { // top
      this.x = random(-10, width + 10);
      this.y = -10;
    } else if (edge === 1) { // bottom
      this.x = random(-10, width + 10);
      this.y = height + 10;
    } else if (edge === 2) { // left
      this.x = -10;
      this.y = random(-10, height + 10);
    } else { // right
      this.x = width + 10;
      this.y = random(-10, height + 10);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(this.img, 0, 0, this.len, this.wid);
    pop();
  }

  isClicked(mx, my) {
    let dx = mx - this.x;
    let dy = my - this.y;
    let localX = cos(-this.angle) * dx - sin(-this.angle) * dy;
    let localY = sin(-this.angle) * dx + cos(-this.angle) * dy;
    return abs(localX) < this.len / 2 && abs(localY) < this.wid / 2;
  }
}