// Caution Me — an interactive art piece about mental warmth

let cautionImages = [];
let backgroundImage;
let startMenuImage;
let bgMusic = null;
let musicStarted = false;
let cautionLines = [];
let maxCautionLines = 40;
let frameInterval = 5;
let timer = 0;
let isMouseClicked = false;
let stopGenerating = false;

let state = 'intro';  // 'intro' | 'video' | 'fading' | 'playing' | 'ending'
let win = false;

let fadeAlpha = 0;
let fadeSpeed = 8;
let fadeDirection = 0; // 0 = none, 1 = fading out, -1 = fading in
let fadeCallback = null;

let currentRound = 0;
const TOTAL_ROUNDS = 2;

// Buttons for navigation
let startBtn = { x: 0, y: 0, w: 260, h: 64 };
let restartBtn = { x: 0, y: 0, w: 260, h: 64 };
let startHover = false;
let restartHover = false;

let previewLines = [];
const PREVIEW_COUNT = 8;

let warmWhite = [255, 248, 240];
let softRed = [220, 120, 120];
let warmBlue = [120, 180, 220];
let warmYellow = [255, 215, 50];

const BASE_WIDTH = 640;
const BASE_HEIGHT = 480;
let gameScale = 1;

// Video elements
let introVideo;
let roundEndVideo;
let endVideo;
let activeVideo = null;
let videoCallback = null;

function preload() {
  for (let i = 0; i < 6; i++) {
    cautionImages[i] = loadImage("images/caution" + (i + 1) + ".PNG");
  }
  backgroundImage = loadImage("images/Background.png");
  startMenuImage = loadImage("images/startMenu.png");
}

function setup() {
  createCanvas(640, 480);
  centerButtons();

  bgMusic = new Audio('music/music.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.8;

  for (let i = 0; i < PREVIEW_COUNT; i++) {
    previewLines.push({
      x: random(width),
      y: random(height),
      angle: random(TWO_PI),
      img: random(cautionImages),
      speed: 0,
      dx: 0,
      dy: 0,
      scale: random(1.0, 1.8)
    });
  }

  introVideo = createVideo('videos/intro.mp4');
  introVideo.hide();
  introVideo.elt.addEventListener('ended', onVideoEnded);
  introVideo.elt.addEventListener('loadedmetadata', onVideoLoaded);

  roundEndVideo = createVideo('videos/roundEnd.mp4');
  roundEndVideo.hide();
  roundEndVideo.elt.addEventListener('ended', onVideoEnded);

  endVideo = createVideo('videos/end.mp4');
  endVideo.hide();
  endVideo.elt.addEventListener('ended', onVideoEnded);
}

function onVideoLoaded() {
  let vw = introVideo.elt.videoWidth;
  let vh = introVideo.elt.videoHeight;
  if (vw > 0 && vh > 0 && (width !== vw || height !== vh)) {
    resizeCanvas(vw, vh);
    gameScale = min(vw / BASE_WIDTH, vh / BASE_HEIGHT);
    startBtn.w = 260 * gameScale;
    startBtn.h = 64 * gameScale;
    restartBtn.w = 260 * gameScale;
    restartBtn.h = 64 * gameScale;
    centerButtons();
    for (let p of previewLines) {
      p.x = random(width);
      p.y = random(height);
      p.scale = random(1.0, 1.8) * gameScale;
    }
  }
}

function centerButtons() {
  startBtn.x = width * 0.28 - startBtn.w / 2;
  startBtn.y = height * 0.76;
  restartBtn.x = width / 2 - restartBtn.w / 2;
  restartBtn.y = height / 2 + 110 * gameScale;
}

function draw() {
  if (state === 'video') {
    return;
  } else if (state === 'fading') {
    drawFading();
  } else if (state === 'intro') {
    drawIntro();
  } else if (state === 'playing') {
    drawPlaying();
  } else if (state === 'ending') {
    drawEnding();
  }
}

function startFade(callback) {
  state = 'fading';
  fadeAlpha = 0;
  fadeDirection = 1;
  fadeCallback = callback;
}

function drawFading() {
  if (state === 'intro') drawIntro();
  else if (state === 'playing') drawPlaying();
  else if (state === 'ending') drawEnding();

  if (fadeDirection === 1) {
    fadeAlpha += fadeSpeed;
    if (fadeAlpha >= 255) {
      fadeAlpha = 255;
      fadeDirection = -1;
      if (fadeCallback) fadeCallback();
      fadeCallback = null;
    }
  } else if (fadeDirection === -1) {
    fadeAlpha -= fadeSpeed;
    if (fadeAlpha <= 0) {
      fadeAlpha = 0;
      fadeDirection = 0;
    }
  }

  noStroke();
  fill(0, 0, 0, fadeAlpha);
  rect(0, 0, width, height);
}

function playVideo(video, callback) {
  state = 'video';
  activeVideo = video;
  videoCallback = callback;
  if (bgMusic) bgMusic.volume = 0.3;
  fadeAlpha = 255;
  video.elt.style.position = 'fixed';
  video.elt.style.top = '0';
  video.elt.style.left = '0';
  video.elt.style.width = '100vw';
  video.elt.style.height = '100vh';
  video.elt.style.objectFit = 'contain';
  video.elt.style.zIndex = '999';
  video.elt.style.background = '#000';
  video.time(0);
  video.play();
  video.show();
}

function onVideoEnded() {
  if (activeVideo) {
    activeVideo.hide();
    activeVideo.elt.style.position = '';
    activeVideo.elt.style.top = '';
    activeVideo.elt.style.left = '';
    activeVideo.elt.style.width = '';
    activeVideo.elt.style.height = '';
    activeVideo.elt.style.objectFit = '';
    activeVideo.elt.style.zIndex = '';
    activeVideo.elt.style.background = '';
  }
  if (bgMusic) bgMusic.volume = 0.8;
  let cb = videoCallback;
  activeVideo = null;
  videoCallback = null;
  if (cb) {
    startFade(cb);
  }
}

function drawIntro() {
  background(30);

  // Dark overlay
  noStroke();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  // Right side: startMenu image (1/3 screen) — behind caution lines
  let imgW = width / 3;
  let imgH = imgW * (startMenuImage.height / startMenuImage.width);
  let imgX = width - imgW / 2 - 30 * gameScale;
  let imgY = height / 2;

  // Image
  imageMode(CENTER);
  image(startMenuImage, imgX, imgY, imgW, imgH);
  imageMode(CORNER);

  // Static caution lines on top of image, but not over the image itself
  for (let line of previewLines) {
    if (line.x > imgX - imgW / 2 && line.x < imgX + imgW / 2 &&
        line.y > imgY - imgH / 2 && line.y < imgY + imgH / 2) {
      continue;
    }
    push();
    translate(line.x, line.y);
    rotate(line.angle);
    imageMode(CENTER);
    let w = line.img.width * line.scale * gameScale;
    let h = line.img.height * line.scale * gameScale;
    tint(255, 120);
    image(line.img, 0, 0, w, h);
    noTint();
    pop();
  }

  // Left side: title and button
  let leftX = width * 0.28;

  // Title
  push();
  textSize(56 * gameScale);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(0, 0, 0, 220);
  text('Caution Me', leftX + 2 * gameScale, height * 0.3 + 2 * gameScale);
  fill(255, 230, 120);
  text('Caution Me', leftX, height * 0.3);
  pop();

  // Subtitle
  fill(255, 255, 255);
  textSize(18 * gameScale);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  text('a quiet space for heavy thoughts', leftX, height * 0.42);

  // Divider line
  stroke(255, 230, 120, 120);
  strokeWeight(1.5 * gameScale);
  line(leftX - 80 * gameScale, height * 0.48, leftX + 80 * gameScale, height * 0.48);
  noStroke();

  // Description
  fill(230, 230, 230);
  textSize(14 * gameScale);
  text('When the world feels too heavy,', leftX, height * 0.54);
  text('shadows gather quietly.', leftX, height * 0.54 + 18 * gameScale);
  text('You can help — gently,', leftX, height * 0.54 + 38 * gameScale);
  text('one careful touch at a time.', leftX, height * 0.54 + 56 * gameScale);

  // Start button
  drawButton(startBtn, 'Begin', startHover, softRed, [180, 80, 80]);
}

function drawPlaying() {
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

  if (cautionLines.length === 0 && stopGenerating === true) {
    win = true;
    if (currentRound < TOTAL_ROUNDS) {
      playVideo(roundEndVideo, function () {
        currentRound++;
        resetRound();
        state = 'playing';
      });
    } else {
      playVideo(endVideo, function () {
        state = 'ending';
      });
    }
  }
  if (cautionLines.length >= maxCautionLines) {
    win = false;
    state = 'ending';
  }

  drawHUD();
}

function drawHUD() {
  noStroke();
  fill(0, 0, 0, 180);
  rect(10 * gameScale, 10 * gameScale, 250 * gameScale, 42 * gameScale, 14 * gameScale);
  fill(255, 255, 255);
  textSize(18 * gameScale);
  textAlign(LEFT, CENTER);
  text('Round ' + currentRound + '  |  Shadows: ' + cautionLines.length + '/' + maxCautionLines, 22 * gameScale, 30 * gameScale);

  let speed = map(frameInterval, 5, 100, 0, 100);
  let mood = speed < 30 ? 'still' : speed < 60 ? 'rippling' : 'swirling';
  fill(0, 0, 0, 180);
  rect(270 * gameScale, 10 * gameScale, 140 * gameScale, 42 * gameScale, 14 * gameScale);
  fill(255, 255, 255);
  textSize(15 * gameScale);
  text('Mood: ' + mood, 280 * gameScale, 30 * gameScale);
}

function drawEnding() {
  background(backgroundImage);
  for (let i = cautionLines.length - 1; i >= 0; i--) {
    cautionLines[i].display();
  }

  noStroke();
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  let titleCol = win ? [255, 230, 120] : [255, 180, 180];
  push();
  textSize(48 * gameScale);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(0, 0, 0, 220);
  text(win ? 'You listened' : 'A quiet weight remains', width/2 + 2 * gameScale, height/2 - 110 * gameScale + 2 * gameScale);
  fill(titleCol[0], titleCol[1], titleCol[2]);
  text(win ? 'You listened' : 'A quiet weight remains', width/2, height/2 - 110 * gameScale);
  pop();

  fill(0, 0, 0, 200);
  rect(width/2 - 240 * gameScale, height/2 - 50 * gameScale, 480 * gameScale, 100 * gameScale, 14 * gameScale);
  fill(255, 255, 255);
  textSize(20 * gameScale);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  let message = win ?
    'Each shadow was acknowledged with care.\n'
    + 'That warmth reaches farther than you know.' :
    'Sometimes the shadows are too many.\n'
    + 'You don\'t have to carry them alone.\n'
    + 'Your presence matters more than you think.';
  text(message, width/2, height/2 - 5 * gameScale);

  fill(230, 230, 230);
  textSize(17 * gameScale);
  let cleared = maxCautionLines - cautionLines.length;
  text('Cleared: ' + cleared + '  |  Remaining: ' + cautionLines.length, width/2, height/2 + 65 * gameScale);

  drawButton(restartBtn, win ? 'Continue...' : 'Try Again', restartHover, warmBlue, [80, 140, 180]);
}

function drawButton(btn, label, hover, baseCol, hoverCol) {
  let c = hover ? hoverCol : baseCol;
  let r = 18 * gameScale;
  noStroke();
  fill(0, 0, 0, 80);
  rect(btn.x + 3 * gameScale, btn.y + 3 * gameScale, btn.w, btn.h, r);
  fill(c[0], c[1], c[2]);
  rect(btn.x, btn.y, btn.w, btn.h, r);
  if (hover) {
    fill(c[0], c[1], c[2], 60);
    rect(btn.x - 4 * gameScale, btn.y - 4 * gameScale, btn.w + 8 * gameScale, btn.h + 8 * gameScale, r + 4 * gameScale);
    fill(c[0], c[1], c[2]);
    rect(btn.x, btn.y, btn.w, btn.h, r);
  }
  fill(255, 255, 255);
  textSize(24 * gameScale);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, btn.x + btn.w/2, btn.y + btn.h/2 + 1 * gameScale);
}

function mousePressed() {
  if (state === 'video' || state === 'fading') return;

  if (state === 'intro') {
    if (mouseX > startBtn.x && mouseX < startBtn.x + startBtn.w &&
        mouseY > startBtn.y && mouseY < startBtn.y + startBtn.h) {
      currentRound = 1;
      resetRound();
      if (!musicStarted) {
        bgMusic.play();
        musicStarted = true;
      }
      fadeAlpha = 0;
      fadeDirection = 1;
      fadeCallback = function() {
        playVideo(introVideo, function () {
          state = 'playing';
        });
      };
      state = 'fading';
    }
    return;
  }

  if (state === 'ending') {
    if (mouseX > restartBtn.x && mouseX < restartBtn.x + restartBtn.w &&
        mouseY > restartBtn.y && mouseY < restartBtn.y + restartBtn.h) {
      currentRound = 1;
      resetRound();
      fadeAlpha = 0;
      fadeDirection = 1;
      fadeCallback = function() {
        playVideo(introVideo, function () {
          state = 'playing';
        });
      };
      state = 'fading';
    }
    return;
  }

  if (state === 'playing') {
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
}

function mouseMoved() {
  if (state === 'video' || state === 'fading') return;
  if (state === 'intro') {
    startHover = (mouseX > startBtn.x && mouseX < startBtn.x + startBtn.w &&
                  mouseY > startBtn.y && mouseY < startBtn.y + startBtn.h);
  }
  if (state === 'ending') {
    restartHover = (mouseX > restartBtn.x && mouseX < restartBtn.x + restartBtn.w &&
                    mouseY > restartBtn.y && mouseY < restartBtn.y + restartBtn.h);
  }
}

function resetRound() {
  cautionLines = [];
  stopGenerating = false;
  timer = 0;
  frameInterval = 5;
  isMouseClicked = false;
  win = false;
}

function resetGame() {
  resetRound();
  startHover = false;
  restartHover = false;
}

class CautionLine {
  constructor() {
    this.img = random(cautionImages);
    this.scaleFactor = 1.3 * gameScale;
    this.len = this.img.width * this.scaleFactor;
    this.wid = this.img.height * this.scaleFactor;
    this.angle = random(TWO_PI);
    this.calcPosition();
  }

  calcPosition() {
    let edge = floor(random(4));
    if (edge === 0) {
      this.x = random(-10, width + 10);
      this.y = -10;
    } else if (edge === 1) {
      this.x = random(-10, width + 10);
      this.y = height + 10;
    } else if (edge === 2) {
      this.x = -10;
      this.y = random(-10, height + 10);
    } else {
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
