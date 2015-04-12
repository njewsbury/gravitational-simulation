/* global numeric, ActionFunction */

var OrbitalSolver = function (settings) {

    this.settings = null;
    this.ready = false;
    //
    this.alphaSinParams = null;
    this.alphaCosParams = null;
    this.betaSinParams = null;
    this.betaCosParams = null;
    //
    this.maxTime = (2.0 * Math.PI);
    //
    this.dt = 1;
    if (typeof settings !== "undefined") {
        this.settings = settings;
        this.dt = this.maxTime / this.settings.getTimePrecision();
        this.ready = true;

        if (typeof this.settings.getSolutionSeed() !== "undefined") {
            numeric.seedrandom.seedrandom(this.settings.getSolutionSeed());
        }

        this.generateRandomVariables();
    }

};

OrbitalSolver.prototype.generateRandomVariables = function () {
    var masses;
    var eachRequired;
    var asParams, acParams;
    var bsParams, bcParams;
    var maxMass = 1;
    var nBodies;
    if (this.ready) {
        nBodies = this.settings.getBodyParam();
        masses = Array.apply(null, new Array(nBodies))
                .map(Number.prototype.valueOf, 1);
        eachRequired = nBodies * this.settings.getFourierPrecision();

        console.log("Solving requires :: " + eachRequired * 4 + " params. [[" + eachRequired + "]] each.");

        if (!this.settings.isEqualMass()) {
            if (typeof this.settings.getMaximumMass() !== "undefined") {
                maxMass = this.settings.getMaximumMass();
            }
            for (var i = 0; i < nBodies; i++) {
                masses[i] = numeric.seedrandom.random() * maxMass;
            }
        }
        this.massSet = numeric.clone(masses);
        /**** DONE MASS, START FOURIER SERIES ***/
        this.alphaSinParams = {};
        this.alphaCosParams = {};
        this.betaSinParams = {};
        this.betaCosParams = {};
        
        var ALPHA_MULTIPLIER = 1.0;
        var BETA_MULTIPLIER = 0.01;
        var ALPHA_MODIFIER = 0.5;
        var BETA_MODIFIER = 0.5;

        for (var n = 0; n < nBodies; n++) {
            asParams = [];
            acParams = [];
            bsParams = [];
            bcParams = [];
            for (var i = 0; i < this.settings.getFourierPrecision(); i++) {
                asParams.push(numeric.seedrandom.random());
                bsParams.push(numeric.seedrandom.random());
                acParams.push(numeric.seedrandom.random());
                bcParams.push(numeric.seedrandom.random());
            }
            // Modify random params to fit required distribution.
            asParams = numeric.sub(asParams, ALPHA_MODIFIER);
            this.alphaSinParams.n = numeric.mul(ALPHA_MULTIPLIER, asParams);

            acParams = numeric.sub(acParams, ALPHA_MODIFIER);
            this.alphaCosParams.n = numeric.mul(ALPHA_MULTIPLIER, acParams);

            bsParams = numeric.sub(bsParams, BETA_MODIFIER);
            this.betaSinParams.n = numeric.mul(BETA_MULTIPLIER, bsParams);

            bcParams = numeric.sub(bcParams, BETA_MODIFIER);
            this.betaCosParams.n = numeric.mul(BETA_MULTIPLIER, bcParams);
        }
    }
};

OrbitalSolver.prototype.isReady = function () {
    return this.ready;
};

OrbitalSolver.prototype.findSolutions = function () {

    var asPrime = numeric.clone(this.alphaSinParams);
    var acPrime = numeric.clone(this.alphaCosParams);
    var bsPrime = numeric.clone(this.betaSinParams);
    var bcPrime = numeric.clone(this.betaCosParams);

    var bodies = this.settings.getBodyParam();
    var timePrecision = this.settings.getTimePrecision();
    var spacePrecision = this.settings.getFourierPrecision();
    var dt = this.dt;
    
    ActionFunction.initialize({
        "bodies": bodies,
        "timePrec": timePrecision,
        "spacePrec": spacePrecision,
        "dt" : dt 
    });

    var result = ActionFunction.evaluate({
        "as": asPrime,
        "ac": acPrime,
        "bs": bsPrime,
        "bc": bcPrime
    });

    console.log(result);

    return 1;
};



OrbitalSolver.prototype.getErrorMessage = function () {
    return "Unable to solve choreography!";
};



