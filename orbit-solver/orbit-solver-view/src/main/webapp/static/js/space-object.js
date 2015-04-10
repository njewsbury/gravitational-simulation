var SpaceObject = function (jsonDef, universe) {

    this.id = -1;
    this.name = "Invalid";
    this.initialPos = [0, 0];
    this.initialVel = [0, 0];
    this.mass = 1;
    this.colour = 'black';
    this.traceColour = 'white';

    this.totalStepCount = 0;


    if (typeof jsonDef !== "undefined") {
        this.id = parseInt(jsonDef.id) || this.id;
        this.name = jsonDef.name || this.name;
        this.initialPos = jsonDef.initialPos || this.initialPos;
        this.initialVel = jsonDef.initialVel || this.initialVel;
        this.mass = jsonDef.mass || this.mass;
        this.colour = jsonDef.colour || this.colour;
        this.traceColour = jsonDef.traceColour || this.traceColour;
    }

    this.parent = null;
    if (typeof universe !== "undefined") {
        this.parent = universe;
    }

    this.lastDrawPosition = null;
    //
    this.lastPosition = [this.initialPos[0], this.initialPos[1]];
    this.position = [this.initialPos[0], this.initialPos[1]];
    this.interPosition = [this.position, this.position];
    //
    this.lastVelocity = [this.initialVel[0], this.initialVel[1]];
    this.velocity = [this.initialVel[0], this.initialVel[1]];
    this.interVelocity = [this.velocity, this.velocity];
    //
    this.lastAcceleration = [0, 0];
    this.acceleration = [0, 0];
    this.interAcceleration = [this.acceleration, this.acceleration];

};

SpaceObject.prototype.drawObject = function (context, trace, com, maxMass) {

    var drawPosition = [0, 0];
    var radius = this.getDrawRadius(maxMass);
    context.save();
    trace.save();
    //
    context.fillStyle = this.colour;
    trace.strokeStyle = this.traceColour;

    drawPosition = numeric.clone( this.position);
    context.beginPath();
    context.arc(drawPosition[0], drawPosition[1], radius, 2.0 * Math.PI, false);
    context.fill();
    context.strokeStyle = '#FF6600';
    context.lineWidth = 2/100;
    context.strokeStyle = 'black';
    context.lineWidth = 1/100;
    context.stroke();
    
    if( this.lastDrawPosition !== null ) {
        trace.strokeStyle = this.traceColour;
        trace.lineWidth = 1/100;
        trace.beginPath();
        trace.moveTo( this.lastDrawPosition[0], this.lastDrawPosition[1] );
        trace.lineTo( drawPosition[0], drawPosition[1] );
        trace.stroke();
    }
    this.lastDrawPosition = numeric.clone(drawPosition);
    //
    context.restore();
    trace.restore();
};

SpaceObject.prototype.getId = function() {
    return this.id-1;
};

SpaceObject.prototype.increaseStepCount = function (timestep) {
    this.totalStepCount += timestep;
};

SpaceObject.prototype.getTotalStepCount = function () {
    return this.totalStepCount;
};

SpaceObject.prototype.moveObject = function (delta) {
    if (typeof delta !== "undefined") {
        this.lastPosition = numeric.clone(this.position);
        this.position = numeric.add(this.position, delta);
    }
};

SpaceObject.prototype.setPosition = function (newPosition) {
    if (typeof newPosition !== "undefined") {
        this.lastPosition = numeric.clone(this.position);
        this.position = numeric.clone(newPosition);
    }
};
SpaceObject.prototype.getPosition = function() {
    return numeric.clone(this.position);
};

SpaceObject.prototype.getMass = function() {
    return this.mass;
};

SpaceObject.prototype.addMass = function(toAdd) {
    this.mass += toAdd;
};

SpaceObject.prototype.getDrawRadius = function(maxMass) {
    //A maximum mass obj at 100 scale should be 15 px...
    
    var radius = (15/100) * (this.mass/maxMass);
    return radius;
};

/* *******************************************************
 * MOTION FUNCTIONS
 ******************************************************* */

SpaceObject.prototype.calculateGravitationalForce = function( gravConst, others, prime ) {
    var totalInteraction = [0, 0];
    
    
    
    return totalInteraction;
};

SpaceObject.prototype.calculateGravitationalInteraction = function( gravConst, other, prime ) {
    var singleInteraction = [0, 0];
    
    
    return singleInteraction;
};