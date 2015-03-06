var SpaceObject = function (identifier, jsonDef) {
    this.orbitalId = identifier;
    this.orbitalName = jsonDef.objectName;

    this.mass = jsonDef.objectMass;
    this.radius = jsonDef.objectRadius;

    this.position = jsonDef.position;
    this.velocity = jsonDef.velocity;
    this.acceleration = [0, 0];
    this.renderOptions = jsonDef.render;
    this.lastPos = this.position;
};

SpaceObject.prototype.validate = function () {
    var isValid = true;

    if (this.orbitalId === undefined || this.orbitalId.length > 0) {
        isValid = false;
        console.log("Invalid orbitalId.");
    }

    if (this.position === undefined || numeric.dim(this.position)[0] !== 2) {
        isValid = false;
        console.log("Invalid position vector.");
    }

    if (this.velocity === undefined || numeric.dim(this.velocity)[0] !== 2) {
        isValid = false;
        console.log("Invalid velocity vector.");
    }

    if (this.mass === undefined || this.mass <= 0) {
        isValid = false;
        console.log("Invalid mass :: " + this.mass);
    }
    if (this.radius === undefined || this.radius <= 0) {
        isValid = false;
        console.log("Invalid radius :: " + this.radius);
        console.log(typeof (this.radius));
    }
    return isValid;
};

SpaceObject.prototype.draw = function (context, trace, scale, pageExtent, centerOfMass) {
    var gradient;
    var drawPos = this.position;
    var lastPos = this.lastPosition;
    context.save();

    context.lineWidth = this.renderOptions.lineWidth / scale;
    context.strokeStyle = this.renderOptions.strokeColour;

    drawPos = numeric.sub(drawPos, centerOfMass);
    lastPos = numeric.sub(lastPos, centerOfMass);
    
    gradient = context.createRadialGradient(
            drawPos[0],
            drawPos[1],
            this.radius / (10 * scale),
            drawPos[0],
            drawPos[1],
            (10 * this.radius) / scale);

    gradient.addColorStop(0, this.renderOptions.fillColourOne);
    gradient.addColorStop(1, this.renderOptions.fillColourTwo);

    context.beginPath();
    context.arc(
            drawPos[0],
            drawPos[1],
            10 * this.radius / scale,
            2.0 * Math.PI, false);

    context.fillStyle = gradient;
    context.fill();
    context.stroke();

    context.restore();

    trace.save();

    

    trace.beginPath();
    trace.strokeStyle = this.renderOptions.strokeColour;
    trace.lineWidth = this.renderOptions.lineWidth / scale;
    trace.moveTo(lastPos[0], lastPos[1]);
    trace.lineTo(drawPos[0], drawPos[1]);
    trace.stroke();
    trace.restore();
};

SpaceObject.prototype.translate = function (delta) {
    this.lastPosition = this.position;
    this.position = numeric.add(this.position, delta);
};

SpaceObject.prototype.setAcceleration = function (newAcc) {
    this.acceleration = numeric.mul(1.0, newAcc);
};

SpaceObject.prototype.getVelocity = function () {
    return this.velocity;
};

SpaceObject.prototype.getAcceleration = function () {
    return this.acceleration;
};

SpaceObject.prototype.changeVelocity = function (delta) {
    this.velocity = numeric.add(this.velocity, delta);
};