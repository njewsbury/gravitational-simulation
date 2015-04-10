var SpaceObject = function (jsonDef, universe) {

    this.id = -1;
    this.name = "Invalid";
    this.initialPos = [0, 0];
    this.initialVel = [0, 0];
    this.mass = 1;
    this.colour = 'black';
    this.traceColour = 'white';
    

    if (typeof jsonDef !== "undefined") {
        this.id = jsonDef.id || this.id;
        this.name = jsonDef.name || this.name;
        this.initialPos = jsonDef.initialPos || this.initialPos;
        this.initialVel = jsonDef.initialVel || this.initialVel;
        this.mass = jsonDef.mass || this.mass;
        this.colour = jsonDef.colour || this.colour;
        this.traceColour = jsonDef.traceColour || this.traceColour;
    }

    this.parent = null;
    if( typeof universe !== "undefined" ) {
        this.parent = universe;
    }

    this.lastDrawPosition = null;
    //
    this.lastPosition = [this.initialPos[0], this.initialPos[1]];
    this.position = [this.initialPos[0], this.initialPos[1]];
    //
    this.lastVelocity = [this.initialVel[0], this.initialVel[1]];
    this.velocity = [this.initialVel[0], this.initialVel[1]];
    //
    this.lastAcceleration = [0, 0];
    this.acceleration = [0, 0];

};

SpaceObject.prototype.drawObject = function(context, trace ) {
    
};