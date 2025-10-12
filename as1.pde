PImage[] cautionImages = new PImage[6];
PImage backgroundImage;
ArrayList<CautionLine> cautionLines = new ArrayList<CautionLine>();
int maxCautionLines = 40; 
float frameInterval = 5; // Initial interval to generate new caution lines
float timer = 0; // control line generation
boolean isMouseClicked = false;      
boolean stopGenerating = false;

void setup() {
  size(640, 480); 

  for (int i = 0; i < 6; i++) {
    cautionImages[i] = loadImage("caution" + (i + 1) + ".PNG");
  }

  backgroundImage = loadImage("Background.png");
}

void draw() 
{
  background(backgroundImage);

  // Update and draw all caution lines
  for (int i = cautionLines.size() - 1; i >= 0; i--) {
    CautionLine line = cautionLines.get(i);
    line.display();
  }

  // slow down the speed of line generation if mouse clicked
  if (isMouseClicked && frameInterval < 100) {
    frameInterval += 0.05; 
  }

  // Control line generation using a timer
  timer += 1;
  if (!stopGenerating && cautionLines.size() < maxCautionLines && timer >= frameInterval) {
    cautionLines.add(new CautionLine());
    timer = 0; // Reset the timer after generating a line
  }
}

void mousePressed() {
  if (!isMouseClicked) {
    isMouseClicked = true; 
  }
  
  // check all the line which one is clicked
  for (int i = 0; i < cautionLines.size(); i++) { 
    CautionLine line = cautionLines.get(i);
    if (line.isClicked(mouseX, mouseY)) { // Check if the line is clicked
      cautionLines.remove(i);
      break; // Exit the loop after removing one line
    }
  }

  // Stop generating new lines if all are removed
  if (cautionLines.size() == 0) {
    stopGenerating = true;
  }
}

class CautionLine {
  PImage img;
  float x, y; // Center of the line
  float angle;
  float length, wid;
  float scaleFactor;

  CautionLine() {
    img = cautionImages[int(random(6))]; // Random select a caution image

    scaleFactor = 1.3; // Adjust scaling factor
    length = img.width * scaleFactor;
    wid = img.height * scaleFactor;
    
    // Ensure the line start and end all full the screen
    calculateLinePosition();
  }

  void calculateLinePosition() {
    // Random angle
    angle = random(TWO_PI);

    // Random starting edge
    int edge = int(random(4));
    if (edge == 0) { // Top edge
      x = random(-10, width + 10);
      y = -10;
    } 
    else if (edge == 1) { // Bottom edge
      x = random(-10, width + 10);
      y = height + 10;
    } 
    else if (edge == 2) { // Left edge
      x = -10;
      y = random(-10, height + 10);
    } 
    else if (edge == 3) { // Right edge
      x = width + 10;
      y = random(-10, height + 10);
    }
  }

  void display() {
    pushMatrix();
    translate(x, y); // moves the drawing system to where the caution line should be
    rotate(angle); // turns the drawing system to match the line's angle
    imageMode(CENTER); // the image is centered at above position
    image(img, 0, 0, length, wid);
    popMatrix();
  }

  boolean isClicked(float mx, float my) { // get mouse position
    // Convert mouse position to the local coordinate system
    float dx = mx - x; // calculate distance from line center and mouse click position
    float dy = my - y; // calculate distance from line center and mouse click position
    float localX = cos(-angle) * dx - sin(-angle) * dy; // unrotate and convert the click position
    float localY = sin(-angle) * dx + cos(-angle) * dy;

    // Check if the mouse point is within the bounds of the line
    return abs(localX) < length / 2 && abs(localY) < wid / 2;
  }
}

