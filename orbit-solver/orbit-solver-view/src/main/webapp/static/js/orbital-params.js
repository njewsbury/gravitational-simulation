var OrbitalParams = function( jsonDef ) {
    this.N_BODY_RANGE = [ 2, 5];
    this.TIME_STEP_RANGE = [0, 2];
    this.MASS_RANGE = [1, 99];
    this.TIME_RANGE = [-1, 999999];
    //
    this.TIME_PRECISION = 250;
    this.SPATIAL_PRECISION = 1;
    //
    this.givenNBody = parseInt(jsonDef.nBodies);
    this.givenTimeStep = parseFloat(jsonDef.timeStep);
    this.equalMasses = jsonDef.equalMasses;
    this.symplectic = jsonDef.symplectic;
    this.givenMaxMass = parseFloat(jsonDef.maximumMass);
    this.givenMaxTime = parseFloat(jsonDef.maximumTime);
    this.givenSeed = jsonDef.solutionSeed;
    this.givenGravConst = jsonDef.gravConstant || 1;
    //
    this.givenTimePrecision = parseInt(jsonDef.timePrecision);
    this.givenFourierPrecision = parseInt(jsonDef.fourierPrecision);
        
};
/* UTIL FUNCTIONS */
OrbitalParams.prototype.validateInput = function() {
    this.message = "";
    var success = true;
    
    return success;
};

/* ACCESSORS && MUTATORS */
OrbitalParams.prototype.getMessage = function() {
    return this.message;
};
OrbitalParams.prototype.getBodyParam = function() {
    return this.givenNBody;
};
OrbitalParams.prototype.getTimeStepParam = function() {
    return this.givenTimeStep;
};
OrbitalParams.prototype.isEqualMass = function() {
    return this.equalMasses;
};
OrbitalParams.prototype.isSymplectic = function() {
    return this.symplectic;
};

OrbitalParams.prototype.getMaximumMass = function() {
    return this.givenMaxMass;
};
OrbitalParams.prototype.getMaximumTime = function() {
    return this.givenMaxTime;
};
OrbitalParams.prototype.getSolutionSeed = function() {
    return this.givenSeed;
};

OrbitalParams.prototype.getGravitationalConstant = function() {
    return this.givenGravConst;
};

OrbitalParams.prototype.getTimePrecision = function() {
    return this.givenTimePrecision;
};

OrbitalParams.prototype.getFourierPrecision = function() {
    return this.givenFourierPrecision;
};

