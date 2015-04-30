/* global numeric */

/*
 *  SOLVER PARAMS JS
 * 
 *  Container object for all choreograph solving properties.
 *  (Precision, nBodies, masses, variable coefficients)
 *  
 *  @author Nathan Jewsbury
 */

var SolverParams = function (config) {
    //set params
    this.nBodies = config.nBodies;
    this.spatialPrecision = config.precision[0];
    this.timePrecision = config.precision[1];
    this.equalMasses = config.equalMasses;
    this.maximumMass = config.maximumMass;
    this.gravConst = config.gravConst;
    this.solutionSeed = config.seedValue;

    //setup calculated params
    this.asOffset = 0;
    this.acOffset = (this.nBodies * this.spatialPrecision);
    this.bsOffset = 2.0 * this.acOffset;
    this.bcOffset = 3.0 * this.acOffset;

    this.maxTime = (2.0 * Math.PI);
    this.dt = (this.maxTime) / this.timePrecision;


    if (typeof this.solutionSeed !== "undefined") {
        numeric.seedrandom.seedrandom(this.solutionSeed);
    }
    //setup use variables
    this.massValues = this.getRandomizedMasses();
    this.initialSet = this.getRandomizedParams();
};


SolverParams.prototype.getOrbitalJson = function () {
    var jsonResults = {
        "success": false
    }; // Return value

    return jsonResults;
};

SolverParams.prototype.getRandomizedMasses = function () {
    var masses = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 1);
    if (!this.equalMasses) {
        if( typeof this.maximumMass === "undefined" ) {
            this.maximumMass = 1;
        }
        for (var i = 0; i < this.nBodies; i++) {
            masses[i] = numeric.seedrandom.random() * this.maximumMass;
        }
    }
    return masses;
};

SolverParams.prototype.getRandomizedParams = function () {
    var eachRequired = this.nBodies * this.spatialPrecision;
    var asParams, acParams;
    var bsParams, bcParams;
    var full;

    asParams = [];
    acParams = [];
    bsParams = [];
    bcParams = [];
    for (var i = 0; i < eachRequired; i++) {
        asParams.push(numeric.seedrandom.random());
        bsParams.push(numeric.seedrandom.random());
        acParams.push(numeric.seedrandom.random());
        bcParams.push(numeric.seedrandom.random());
    }
    // Modify random params to fit required distribution.
    asParams = numeric.sub(asParams, 0.5);
    asParams = numeric.mul(1.0, asParams);

    acParams = numeric.sub(acParams, 0.5);
    acParams = numeric.mul(1.0, acParams);

    bsParams = numeric.sub(bsParams, 0.5);
    bsParams = numeric.mul(0.01, bsParams);

    bcParams = numeric.sub(bcParams, 0.5);
    bcParams = numeric.mul(0.01, bcParams);


    // merge and returns
    full = asParams.concat(acParams);
    full = full.concat(bsParams);
    full = full.concat(bcParams);    
    return full;
};



/*
 * Functions below define how the solver actually works.
 */


