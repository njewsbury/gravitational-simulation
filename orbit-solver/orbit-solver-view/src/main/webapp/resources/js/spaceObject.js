var SpaceObject = function (identifier, q, p, v, mass, massDensity) {
    this.id = identifier;
    this.position = q;
    this.momentum = p;

    this.velocity = v;
    this.acceleration = [0, 0];

    this.mass = mass;
    this.massDensity = massDensity;

    this.colour = "#04FF04";
};

SpaceObject.prototype.draw = function (canvas, context, scale, com) {
    var oldStyle, oldWidth, oldFill;
    var drawPos = [0, 0];
    var viewSize = [ canvas.width, canvas.height];
    
    oldStyle = context.strokeStyle;
    oldWidth = context.lineWidth;
    oldFill = context.fillStyle;

    context.fillStyle = this.colour;
    context.lineWidth = 1 / scale[0];

    context.beginPath();
    drawPos = numeric.sub(this.position, com);
    //drawPos = numeric.sub(viewSize, drawPos );
    context.arc(drawPos[0], drawPos[1], 10 * (this.mass * this.massDensity) / scale[0], 2 * Math.PI, false);
    
    context.fill();
    context.stroke();

    context.strokeStyle = oldStyle;
    context.lineWidth = oldWidth;
    context.fillStyle = oldFill;
};

SpaceObject.prototype.translate = function (delta) {
    this.position = numeric.add(this.position, delta);
};

SpaceObject.prototype.setAcceleration = function (newAcc) {
    this.acceleration = numeric.mul(1.0, newAcc);
};

SpaceObject.prototype.getVelocity = function () {
    return this.velocity;
};

SpaceObject.prototype.getAcceleration = function() {
    return this.acceleration;
};

SpaceObject.prototype.changeVelocity = function(delta) {
    this.velocity = numeric.add(this.velocity, delta);
};