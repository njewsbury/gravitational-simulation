var SpaceObject = function (identifier, jsonDef) {
    this.orbitalId = identifier;
    this.orbitalName = jsonDef.objectName;

    this.mass = jsonDef.objectMass;
    this.radius = jsonDef.objectRadius;

    this.position = jsonDef.position;
    this.positionPrime = [0,0];
    this.positionDoublePrime = [0,0];

    this.velocity = jsonDef.velocity;
    this.velocityPrime = [0,0];
    this.velocityDoublePrime = [0,0];
    
    this.acceleration = [0,0];
    
    this.renderOptions = jsonDef.render;
    
    this.lastPos = null;
    this.firstDrawPos = null;

    this.orbitCount = 0;
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
    return isValid;
};

SpaceObject.prototype.checkCompleteOrbit = function (drawPos) {
    var diff;
    if (this.orbitalId === 1) {
        if (this.firstDrawPos !== null) {
            diff = numeric.sub(this.firstDrawPos, drawPos);
            diff = numeric.norm2(diff);
            if( diff < 0.05 ) {                
                this.orbitCount++;                
            }
        }
    }
};

SpaceObject.prototype.draw = function (context, trace, scale, pageExtent, centerOfMass) {
    var gradient;
    var drawPos = this.position;
    var lastDrawPos = [];
    context.save();

    context.lineWidth = this.renderOptions.lineWidth / scale;
    context.strokeStyle = this.renderOptions.strokeColour;

    drawPos = numeric.sub(drawPos, centerOfMass);
    if (this.firstDrawPos === null) {
        this.firstDrawPos = numeric.clone(drawPos);
    } else {
        this.checkCompleteOrbit(drawPos);
    }
    lastDrawPos = numeric.clone(drawPos);
    
    /*
     gradient = context.createRadialGradient(
     drawPos[0],
     drawPos[1],
     this.radius / (10 * scale),
     drawPos[0],
     drawPos[1],
     (10 * this.radius) / scale);
     
     gradient.addColorStop(0, this.renderOptions.fillColourOne);
     gradient.addColorStop(1, this.renderOptions.fillColourTwo);
     context.fillStyle = gradient;
     */
    this.radius = (10/scale)*(this.mass*10);
    context.fillStyle = this.renderOptions.fillColour;
    context.beginPath();
    context.arc(
            drawPos[0],
            drawPos[1],
            10 * this.radius / scale,
            2.0 * Math.PI, false);

    context.fill();
    context.stroke();
    context.restore();

    if (this.lastPos !== undefined && this.lastPos !== null) {
        trace.save();

        trace.beginPath();
        trace.strokeStyle = this.renderOptions.strokeColour;
        trace.lineWidth = this.renderOptions.lineWidth / scale;
        trace.moveTo(this.lastPos[0], this.lastPos[1]);
        trace.lineTo(drawPos[0], drawPos[1]);
        trace.stroke();
        trace.restore();
    }
    this.lastPos = lastDrawPos;
};


SpaceObject.prototype.getPosition = function(primeCount) {
    var primePosition = this.position;
    
    if( primeCount === 1 ) {
        primePosition = this.positionPrime;
    } else if( primeCount === 2 ) {
        primePosition = this.positionDoublePrime;
    }
    
    return primePosition;
};

SpaceObject.prototype.getVelocity = function(primeCount) {
    var primeVelocity = this.velocity;
    
    if( primeCount === 1 ) {
        primeVelocity = this.velocityPrime;
    } else if( primeCount === 2 ) {
        primeVelocity = this.velocityDoublePrime;
    }
    
    return primeVelocity;
};

SpaceObject.prototype.translatePosition = function(displacement) {
    this.position = numeric.add(this.position, displacement);
};

SpaceObject.prototype.translateVelocity = function(increase ) {
    this.velocity = numeric.add(this.velocity, increase);
};