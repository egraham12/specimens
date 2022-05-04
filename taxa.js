// for Assignment 3, nearly all of my requirements are within the click function. They're referenced with comments that say "Assignment 3", so that you can use ctrl+f to find them easier 
// my variables
let width = 570;
let height = 570;
let i, z;
let sunbursts = [];
let mousecount = 0;

function preload() { // preload my data
  data = loadTable('taxon.csv', 'csv', 'header');
}

function setup() { // p5.js setup function. Set canvas size and some design choices
  var myCanvas = createCanvas(width, height);
  myCanvas.parent('myCanvas'); // Assignment 3 - relocating my canvas using parent()
  angleMode(DEGREES);
  strokeCap(SQUARE);
  let r = [1, 1.5, 2, 2.5]; // array of ring levels
  for (i = 0; i < 4; i++) {
    let n = i + 2; // numeric level (aka phylum, class, genus, etc.)
    let s = new Sunburst(r[i], n); // creating new sunburst objects
    sunbursts.push(s);
  }
}

function unique(value, index, self) { // function from StackOverflow that returns unique values from an array
  return self.indexOf(value) === index;
}

function mousePressed() { // Assignment 3 - my mouse pressed function
  for (i = 0; i < sunbursts.length; i++) {
    sunbursts[i].clicked(mouseX, mouseY);
  }
}

function draw() { // p5.js draw function
  translate(width / 2, height / 2); // locates 0,0 in center of canvas
  background("white");
  noFill(); // stops the arcs from looking like pie slices
  strokeWeight(30); // affects the size of the arcs

  sunbursts[0].create(); // creating my sunbursts -- could be good to put this in a loop later
  sunbursts[1].create();
  sunbursts[2].create();
  sunbursts[3].create();

  strokeWeight(1); // my text
  textSize(12);
  stroke(0);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  text("taxonomy of our >2 million specimens", -50, -50, 100, 100);
  noLoop();
} // end of p5.js draw function

class Sunburst { // my sunburst constructor function
  constructor(ringLvl, numericlevel) {
    this.taxa = data.getArray();
    this.ringLvl = ringLvl;
    this.numericlevel = numericlevel;
    this.x = 0; // x-coordinate
    this.y = 0; // y-coordinate
    this.d = 200; // diameter (used for width and height of arc)
    this.b = 0.5; // buffer between arcs
    this.colors = ["#5A6992", "#778CA8", "#DEDFD9", "#BDA498", "#D57859", "#D1ECF5", "#A0B3C1", "#64798D", "#374957", "#1F3429", "#26221D", "#0D6A54", "#06AC82", "#F1D74D", "#3f0d12", "#a71d31", "#f1f0cc", "#d5bf86", "#8d775f", "#dcf2b0", "#c2eabd", "#c0babc", "#c7ac92", "#cd533b", "#d38b5d", "#f3ffb6", "#739e82", "#2c5530", "#818d92", "#586a6a", "#b9a394", "#d4c5c7", "#dad4ef", "#74b3ce", "#508991", "#172a3a", "#004346", "#09bc8a", "#310a31", "#847996", "#88b7b5", "#a7cab1", "#f4ecd6", "#ca2e55", "#ffe0b5", "#8a6552", "#462521", "#bdb246", "#61210f", "#ea2b1f", "#edae49", "#f9df74", "#e89005", "#ec7505", "#d84a05", "#f42b03", "#e70e02", "#43c59e", "#3d7068", "#14453d", "#48beff", "#3dfaff"];
  }
  create() { // draws my sunbursts
    this.tLevel = []; // empty array for later
    for (i = 0; i < this.taxa.length; i++) {
      this.tLevel.push(this.taxa[i][this.numericlevel]);
    }
    this.uniqueNames = this.tLevel.filter(unique);
    this.uniqueTotals = []; // empty array for later
    for (i = 0; i < this.uniqueNames.length; i++) {
      this.specificName = this.uniqueNames[i];
      this.specificTotal = 0;
      for (z = 0; z < this.taxa.length; z++) {
        if (this.taxa[z][this.numericlevel] === this.specificName) {
          this.specificTotal += int(this.taxa[z][1]);
        }
      }
      if (this.specificTotal > 0) {
        this.uniqueTotals.push(this.specificTotal);
      }
    }
    this.degree = []; // empty array for later
    let rowCount = data.getRowCount();
    this.absTotal = 0;
    for (i = 0; i < rowCount; i++) {
      this.a = data.get(i, 1);
      this.absTotal += int(this.a);
    }
    for (i = 0; i < this.uniqueTotals.length; i++) {
      this.quantity = this.uniqueTotals[i];
      this.m = map(this.quantity, 0, this.absTotal, 0, 360);
      this.degree.push(this.m);
    }
    this.sa = 0;
    for (i = 0; i < this.degree.length; i++) {
      stroke(this.colors[i]);
      if (i === 0) {
        arc(this.x, this.y, this.d * this.ringLvl, this.d * this.ringLvl, 0, this.degree[i] - this.b);
      } else {
        this.sa += this.degree[i - 1];
        arc(this.x, this.y, this.d * this.ringLvl, this.d * this.ringLvl, this.sa, this.sa + this.degree[i] - this.b);
      }
    }
  }
    clicked(px, py) { // my click function
    mousecount += 1;
    if (mousecount == 1) {
      let newParagraph = createP("").id("changeme").style('font-size', '18px'); // Assignment 3 - create an element besides a canvas element
      select('#canvasH1').child(newParagraph); // Assignment 3 - make use of parent() or child() to reorganize elements on the page
    }
    let hit = false;
    let distance = dist(px, py, width / 2, height / 2);
    let ringclicktest;
    if (distance < 115 && distance > 85) { // 1st ring
      ringclicktest = 0;
    } else if (distance < 165 && distance > 135) { // 2nd ring
      ringclicktest = 1;
    } else if (distance < 215 && distance > 185) { // 3rd ring
      ringclicktest = 2;
    } else if (distance < 265 && distance > 235) { // 4th ring
      ringclicktest = 3;
    } else { // no ring
      console.log("no ring selected");
    }
    this.sa = 0;
    for (i = 0; i < sunbursts[ringclicktest].degree.length; i++) {
      let testDegree = sunbursts[ringclicktest].degree[i];
      if (i == 0) { // this is the IF statement for all the starting angles
        hit = collidePointArc(px, py, width / 2, height / 2, this.d, testDegree / 2, testDegree);
        if (hit == true) {
            select('#changeme').html("You clicked on the ring representing " + sunbursts[ringclicktest].uniqueNames[i]); // Assignment 3 - use html() to modify the content of an element on the page
            console.log(sunbursts[ringclicktest].uniqueNames[i]);
        }
      } else {
        this.sa += sunbursts[ringclicktest].degree[i - 1];
        hit = collidePointArc(px, py, width / 2, height / 2, this.d * sunbursts[ringclicktest].ringLvl, this.sa + (testDegree / 2), testDegree);
        if (hit == true) {
          select('#changeme').html("You clicked on the ring representing " + sunbursts[ringclicktest].uniqueNames[i]);
          console.log(sunbursts[ringclicktest].uniqueNames[i]);
        }
      }
    }
  }
}

// the collidePointArc function -- This was taken from the p5.js 2Dcollide library. I edited the function below, because it wasn't performing correctly when the arcs' angles were over 180 degrees. The only thing I edited was the last if/then statement-- it originally also checked if the dot variable was greater than 0. With an angle over 180 degrees, the dot can sometimes be a negative (depending on mouse position), so I removed that from the if statement.
p5.prototype.collidePointArc = function(px, py, ax, ay, arcRadius, arcHeading, arcAngle, buffer) {
  if (buffer == undefined) {
    buffer = 0;
  }
  var point = this.createVector(px, py); // point
  var arcPos = this.createVector(ax, ay); // arc center point
  var radius = this.createVector(arcRadius, 0).rotate(arcHeading); // arc radius vector
  // pointToArc creates a vector between the mouse and the center of the arc
  var pointToArc = point.copy().sub(arcPos);
  // if the distance between the mouse and 0,0 (arc center) is < or = the circle's radius
  if (point.dist(arcPos) <= (arcRadius + buffer)) {
    // calculates the dot product of the radius and line between the mouse and the center of the circle -- I think this might be the cosine of the angle? I'm unsure
    var dot = radius.dot(pointToArc);
    // finds the angle between the radius and the vector between the mouse and the center of the arc. The maximum this can be is HALF of the angle (since the angle is balanced on either side of the radius). This still produces the correct degrees, even if above 180
    var angle = radius.angleBetween(pointToArc);
    if (angle <= arcAngle / 2 && angle >= -arcAngle / 2) {
      return true;
    }
  }
  return false;
}
