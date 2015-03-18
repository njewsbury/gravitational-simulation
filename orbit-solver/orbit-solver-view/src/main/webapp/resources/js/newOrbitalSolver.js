/**
 * Constructor for the Orbital Solver (2.0).  Takes
 * the given set of parameters and attempts to minimize
 * the action function matching the given params. Returns
 * a JSON simulation entry that can be stored in a DB.
 * Also allows access to the raw solution values. 
 * (the minimized params).
 * 
 * Currently uses randomized input params as opposed to
 * a genetic algorithm to find initial guess values.
 * 
 * 
 * @param {Number} nBodies - Number of bodies to solve
 * @param {Array[2]} precision - Spacial & Time Precision to use
 * @param {Boolean} equalMasses - Should all the masses be equal
 * @param {Number} gravConst - The gravitational constant
 * @returns {NewOrbitalSolver} undefined
 */
var NewOrbitalSolver = function (config) {
    //set params
    this.nBodies = config.nBodies;
    this.spacialPrecision = config.precision[0];
    this.timePrecision = config.precision[1];
    this.equalMasses = config.equalMasses;
    this.gravConst = config.gravConst;
    this.solutionSeed = config.seedValue;

    //setup calculated params
    this.asOffset = 0;
    this.acOffset = (this.nBodies * this.spacialPrecision);
    this.bsOffset = 2.0 * this.acOffset;
    this.bcOffset = 3.0 * this.acOffset;

    this.maxTime = (2.0 * Math.PI);
    this.dt = (this.maxTime) / this.timePrecision;

    //setup use variables
    this.massValues = this.getRandomizedMasses();
    this.paramSet = this.getRandomizedParams();

    //set solution params
    this.solution = [];

    //numeric callback
    this.msgArr = [];
    this.callbackFunction = function (i, x, f, g, H) {
        this.msgArr.push({i: i, x: x, f: f, g: g, H: H});
    };


};


NewOrbitalSolver.prototype.getOrbitalJson = function () {
    var jsonResults = {
        "success": false
    }; // Return value

    return jsonResults;
};

NewOrbitalSolver.prototype.getActionValue = function () {
    var actionValue = 0.0;
    var kineticMap, potentialMap;
    var diff;

    kineticMap = this.getKineticEnergy();
    potentialMap = this.getPotentialEnergy();

    for (var t = 0; t < this.timePrecision; t++) {
        diff = kineticMap[t] - potentialMap[t];
        actionValue += (diff * this.dt);
    }

    return actionValue;
};

/*
 * Functions below define how the solver actuall works.
 */

NewOrbitalSolver.prototype.getTheta = function (time) {
    return (this.maxTime) * (time / this.timePrecision);
};

NewOrbitalSolver.prototype.getRandomizedParams = function () {
    var numRequired = (4 * this.nBodies * this.spacialPrecision);
    var eachRequired = this.nBodies * this.spacialPrecision;
    var asParams, acParams;
    var bsParams, bcParams;
    var full;

    if (typeof this.solutionSeed !== "undefined") {
        numeric.seedrandom.seedrandom(this.solutionSeed);
    }

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


NewOrbitalSolver.prototype.getKineticEnergy = function () {
    var kineticMap = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var velocityMap;
    var singleTimeKinetic;
    var singleKinetic;
    var speed, dxt, dyt;

    velocityMap = this.getVelocityMap(this.paramSet);
    for (var t = 0; t < this.timePrecision; t++) {
        //Step through all time.
        singleTimeKinetic = 0.0;
        for (var n = 0; n < this.nBodies; n++) {
            dxt = ((velocityMap[n])[0])[t];
            dyt = ((velocityMap[n])[1])[t];

            speed = numeric.norm2Squared([dxt, dyt]);
            singleKinetic = (0.5 * this.massValues[n] * speed);
            singleTimeKinetic += singleKinetic;
        }
        kineticMap[t] = singleTimeKinetic;
    }

    return kineticMap;
};

NewOrbitalSolver.prototype.getPotentialEnergy = function () {
    var potentialMap = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);

    var singlePotentials = this.getPotentialMap();
    var singleTimePotential;


    for (var t = 0; t < this.timePrecision; t++) {
        singleTimePotential = 0.0;
        for (var n = 0; n < this.nBodies; n++) {
            singleTimePotential += (
                    (singlePotentials[n])[t]
                    );
        }
        potentialMap[t] = singleTimePotential;
    }

    return potentialMap;
};

NewOrbitalSolver.prototype.getPotentialMap = function () {
    var potentialMap = new Array(this.nBodies);
    var positionMap = this.getPositionMap();

    for (var n = 0; n < this.nBodies; n++) {
        potentialMap[n] = this.getBodyPotential(n, positionMap);
    }

    return potentialMap;
};

/**
 * Calculates the effective potential of an object throughout
 * all moments in time.  The effective potential is given by
 * the equation :
 *  Uf(r) = [( L^2 ) / (2M[i]*|r|^2 )] - (GM[i]m[j] / |r|)
 *  for all i != j.
 * 
 * @param {Number} body
 * @param {n-Array} positionMap
 * @returns {Array} Potential values for each moment in time.
 */
NewOrbitalSolver.prototype.getBodyPotential = function (body, positionMap) {
    var potentialMap = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var currentDistance;
    var thisx, thisy;
    var otherx, othery;
    var effective, potential;
    var diffx, diffy;

    for (var t = 0; t < this.timePrecision; t++) {
        thisx = ((positionMap[body])[0])[t];
        thisy = ((positionMap[body])[1])[t];

        effective = 0;
        potential = 0;
        for (var n = 0; n < this.nBodies; n++) {
            if (n !== body) {
                otherx = ((positionMap[n])[0])[t];
                othery = ((positionMap[n])[1])[t];

                diffx = thisx - otherx;
                diffy = thisy - othery;
                effective += (1.0 / numeric.norm2Squared([diffx, diffy]));
                currentDistance = numeric.norm2([diffx, diffy]);

                potential += (this.massValues[n]) / (currentDistance);
            }
        }
        effective = 0.0;
        //effective = (1.0 / this.massValues[body]) * effective;
        potential = (this.gravConst * this.massValues[body]) * potential;
        potentialMap[t] = (effective - potential);
    }

    return potentialMap;
};

NewOrbitalSolver.prototype.getVelocityMap = function () {
    var velocityMap = new Array(this.nBodies);

    for (var n = 0; n < this.nBodies; n++) {
        velocityMap[n] = (this.getBodyVelocityMap(n));
    }

    return velocityMap;
};

NewOrbitalSolver.prototype.getBodyVelocityMap = function (nBody) {
    var dx = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var dy = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);

    var pos = this.getBodyPositionMap(nBody);
    var xPos = pos[0];
    var yPos = pos[1];

    for (var t = 0; t < (this.timePrecision - 1); t++) {

        dx[t] = (xPos[t + 1] - xPos[t]) / this.dt;
        dy[t] = (yPos[t + 1] - yPos[t]) / this.dt;
    }

    dx[this.timePrecision - 1] = (xPos[0] - xPos[this.timePrecision - 1]) / this.dt;
    dy[this.timePrecision - 1] = (yPos[0] - yPos[this.timePrecision - 1]) / this.dt;


    return [dx, dy];
};

NewOrbitalSolver.prototype.getPositionMap = function () {
    var positionMap = new Array(this.nBodies);

    for (var n = 0; n < this.nBodies; n++) {
        positionMap[n] = (this.getBodyPositionMap(n));
    }
    return positionMap;
};

NewOrbitalSolver.prototype.getBodyPositionMap = function (nBody) {
    var xPos = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var yPos = Array.apply(null,
            new Array(this.timePrecision))
            .map(Number.prototype.valueOf, 0);

    for (var t = 0; t < this.timePrecision; t++) {
        for (var k = 1; k <= this.spacialPrecision; k++) {
            xPos[t] += (
                    this.paramSet[ this.asOffset + (nBody * this.spacialPrecision) + (k - 1) ]
                    * Math.sin(k * this.getTheta(t))
                    );
            xPos[t] += (
                    this.paramSet[ this.acOffset + (nBody * this.spacialPrecision) + (k - 1) ]
                    * Math.cos(k * this.getTheta(t))
                    );
            yPos[t] += (
                    this.paramSet[ this.bsOffset + (nBody * this.spacialPrecision) + (k - 1) ]
                    * Math.sin(k * this.getTheta(t))
                    );
            yPos[t] += (
                    this.paramSet[ this.bcOffset + (nBody * this.spacialPrecision) + (k - 1) ]
                    * Math.cos(k * this.getTheta(t))
                    );
        }
    }
    return [xPos, yPos];
};

NewOrbitalSolver.prototype.getRandomizedMasses = function () {
    var masses = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 1);
    if (!this.equalMasses) {
        // randomize the masses.
    }
    return masses;
};





