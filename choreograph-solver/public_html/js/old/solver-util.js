/* global numeric, Base64 */

/*
 *  SOLVER UTIL JS
 * 
 *  Choreograph solver, JavaScript implementation of Action
 *  function minimzation.
 *  
 *  @author Nathan Jewsbury
 */


var SolverUtil = new Object();

SolverUtil.setParams = function (paramSet) {
    SolverUtil.paramSet = paramSet;
    SolverUtil.solution = null;
    SolverUtil.solved = false;

};

SolverUtil.getActionValue = function () {
    return SolverUtil.solveActionFunction(SolverUtil.paramSet.initialSet);
};

SolverUtil.minimizeFunction = function (callback) {
    SolverUtil.solved = false;
    var solutionSet;
    var actionEvals = [];
    var catchEval = function (i, x, f, g, H) {
        actionEvals.push(f);
    };
    //try {
    // Use numericjs minimzation to minimize the action function and get solution set.
        solutionSet = numeric.uncmin(
                SolverUtil.solveActionFunction,
                SolverUtil.paramSet.initialSet,
                undefined, undefined, undefined,
                catchEval);
        //console.log( solutionSet );
        SolverUtil.solution = (solutionSet.solution);
        SolverUtil.solutionSet = solutionSet;
        SolverUtil.solved = true;
        SolverUtil.actionEvals = actionEvals;
    //} catch (err) {
    //    console.log(err);
    //}
    callback();
};

SolverUtil.getPastelColour = function () {
    var r = (Math.round(Math.random() * 127) + 127).toString(16);
    var g = (Math.round(Math.random() * 127) + 127).toString(16);
    var b = (Math.round(Math.random() * 127) + 127).toString(16);
    return '#' + r + g + b;
};

/*
 * Convert the solved choreograph into a JSON object
 * that can be 'read' by the simulation page.
 */
SolverUtil.getOrbitJson = function () {
    var positionMap, velocityMap;
    var solutionVals, nBodies, id;
    var totalMass, colour;
    var spaceObject;
    var objectList = [];

    var solution = {
        "success": false
    };

    if (SolverUtil.solved === true) {
        solutionVals = SolverUtil.solution;
        positionMap = SolverUtil.getPositionMap(solutionVals);
        velocityMap = SolverUtil.getVelocityMap(solutionVals);

        nBodies = SolverUtil.paramSet.nBodies;
        solution.nBodies = nBodies;

        id = (nBodies + "[");
        totalMass = 0.0;

        for (var i = 0; i < nBodies; i++) {
            id += SolverUtil.paramSet.massValues[i].toFixed(3).toString();
            totalMass += SolverUtil.paramSet.massValues[i];
            colour = SolverUtil.getPastelColour();
            colour = SolverUtil.hexToRGB(colour);
            if (i < nBodies - 1) {
                id += ",";
            }
            spaceObject = {
                "id": i,
                "name": "SpaceObject-" + i.toString(),
                "mass": SolverUtil.paramSet.massValues[i],
                "initialPos": [
                    ((positionMap[i])[0])[0], //Xo
                    ((positionMap[i])[1])[0] //Yo
                ],
                "initialVel": [
                    ((velocityMap[i])[0])[0], //VXo
                    ((velocityMap[i])[1])[0] //VYo
                ],
                "traceColour": "rgba(" + colour.r +","+colour.g+","+colour.b+","+1+")",
                "colour": "rgba(" + colour.r +","+colour.g+","+colour.b+","+0.5+")"
            };
            objectList.push(spaceObject);
        }
        id += "]";
        if (typeof SolverUtil.paramSet.solutionSeed !== "undefined") {
            id += SolverUtil.paramSet.solutionSeed;
        }
        solution.objectList = objectList;
        solution.simulationType = "solved";
        solution.simulationId = Base64.encode(SolverUtil.paramSet.solutionSeed).replace(/=/g, '-');
        solution.gravConstant = SolverUtil.paramSet.gravConst;
        solution.success = true;
    }

    return solution;
};

SolverUtil.hexToRGB = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    result = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    return result;
};

/**
 * Using the random coefficients, solve for the kinetic and potential energy
 * of the system throughout a single period then solve for the total action.
 */
SolverUtil.solveActionFunction = function (params) {
    var actionValue = 0.0;
    var kineticMap, potentialMap, actionMap;
    var diff;

    kineticMap = SolverUtil.getKineticEnergy(params);
    potentialMap = SolverUtil.getPotentialEnergy(params);
    actionMap = new Array(SolverUtil.paramSet.timePrecision);

    for (var t = 0; t < SolverUtil.paramSet.timePrecision; t++) {
        diff = kineticMap[t] - potentialMap[t];
        actionMap[t] = diff;
        actionValue += (diff * SolverUtil.paramSet.dt);
    }
    SolverUtil.actionMap = actionMap;
    return actionValue;
};

SolverUtil.getTheta = function (time) {
    return (SolverUtil.paramSet.maxTime) * (time / SolverUtil.paramSet.timePrecision);
};

SolverUtil.getKineticEnergy = function (paramSet) {
    var kineticMap = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var velocityMap;
    var singleTimeKinetic;
    var singleKinetic;
    var speed, dxt, dyt;

    velocityMap = SolverUtil.getVelocityMap(paramSet);
    for (var t = 0; t < SolverUtil.paramSet.timePrecision; t++) {
        //Step through all time.
        singleTimeKinetic = 0.0;
        for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
            dxt = ((velocityMap[n])[0])[t];
            dyt = ((velocityMap[n])[1])[t];

            speed = numeric.norm2Squared([dxt, dyt]);
            singleKinetic = (0.5 * SolverUtil.paramSet.massValues[n] * speed);
            singleTimeKinetic += singleKinetic;
        }
        kineticMap[t] = singleTimeKinetic;
    }

    return kineticMap;
};

SolverUtil.getPotentialEnergy = function (paramSet) {
    var potentialMap = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);

    var singlePotentials = SolverUtil.getPotentialMap(paramSet);
    var singleTimePotential;


    for (var t = 0; t < SolverUtil.paramSet.timePrecision; t++) {
        singleTimePotential = 0.0;
        for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
            singleTimePotential += (
                    (singlePotentials[n])[t]
                    );
        }
        potentialMap[t] = singleTimePotential;
    }

    return potentialMap;
};

SolverUtil.getPotentialMap = function (paramSet) {
    var potentialMap = new Array(SolverUtil.paramSet.nBodies);
    var positionMap = SolverUtil.getPositionMap(paramSet);

    for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
        potentialMap[n] = SolverUtil.getBodyPotential(n, positionMap);
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
 *  ************************ 
 *  Current implementation does not use effective potential,
 *  just regular potential! (effective is set to zero before use)
 *  ************************
 * 
 * @param {Number} body
 * @param {n-Array} positionMap
 * @returns {Array} Potential values for each moment in time.
 */
SolverUtil.getBodyPotential = function (body, positionMap) {
    var potentialMap = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var currentDistance;
    var thisx, thisy;
    var otherx, othery;
    var effective, potential;
    var diffx, diffy;

    for (var t = 0; t < SolverUtil.paramSet.timePrecision; t++) {
        thisx = ((positionMap[body])[0])[t];
        thisy = ((positionMap[body])[1])[t];

        effective = 0;
        potential = 0;
        for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
            if (n !== body) {
                otherx = ((positionMap[n])[0])[t];
                othery = ((positionMap[n])[1])[t];

                diffx = thisx - otherx;
                diffy = thisy - othery;
                effective += (1.0 / numeric.norm2Squared([diffx, diffy]));
                currentDistance = numeric.norm2([diffx, diffy]);

                potential += (SolverUtil.paramSet.massValues[n]) / (currentDistance * currentDistance);
            }
        }
        effective = 0.0;
        //effective = (1.0 / SolverUtil.paramSet.massValues[body]) * effective;
        potential = (SolverUtil.paramSet.gravConst * SolverUtil.paramSet.massValues[body]) * potential;
        potentialMap[t] = (effective - potential);
    }

    return potentialMap;
};

SolverUtil.getVelocityMap = function (paramSet) {
    var velocityMap = new Array(SolverUtil.paramSet.nBodies);

    for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
        velocityMap[n] = (SolverUtil.getBodyVelocityMap(n, paramSet));
    }

    return velocityMap;
};

SolverUtil.getBodyVelocityMap = function (nBody, paramSet) {
    var dx = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var dy = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);

    var pos = SolverUtil.getBodyPositionMap(nBody, paramSet);
    var xPos = pos[0];
    var yPos = pos[1];

    for (var t = 0; t < (SolverUtil.paramSet.timePrecision - 1); t++) {

        dx[t] = (xPos[t + 1] - xPos[t]) / SolverUtil.paramSet.dt;
        dy[t] = (yPos[t + 1] - yPos[t]) / SolverUtil.paramSet.dt;
    }

    dx[SolverUtil.paramSet.timePrecision - 1] = (xPos[0] - xPos[SolverUtil.paramSet.timePrecision - 1]) / SolverUtil.paramSet.dt;
    dy[SolverUtil.paramSet.timePrecision - 1] = (yPos[0] - yPos[SolverUtil.paramSet.timePrecision - 1]) / SolverUtil.paramSet.dt;


    return [dx, dy];
};

SolverUtil.getPositionMap = function (paramSet) {
    var positionMap = new Array(SolverUtil.paramSet.nBodies);

    for (var n = 0; n < SolverUtil.paramSet.nBodies; n++) {
        positionMap[n] = (SolverUtil.getBodyPositionMap(n, paramSet));
    }
    return positionMap;
};

SolverUtil.getBodyPositionMap = function (nBody, paramSet) {
    var xPos = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var yPos = Array.apply(null,
            new Array(SolverUtil.paramSet.timePrecision))
            .map(Number.prototype.valueOf, 0);

    for (var t = 0; t < SolverUtil.paramSet.timePrecision; t++) {
        for (var k = 1; k <= SolverUtil.paramSet.spatialPrecision; k++) {
            xPos[t] += (
                    paramSet[ SolverUtil.paramSet.asOffset + (nBody * SolverUtil.paramSet.spatialPrecision) + (k - 1) ]
                    * Math.sin(k * SolverUtil.getTheta(t))
                    );
            xPos[t] += (
                    paramSet[ SolverUtil.paramSet.acOffset + (nBody * SolverUtil.paramSet.spatialPrecision) + (k - 1) ]
                    * Math.cos(k * SolverUtil.getTheta(t))
                    );
            yPos[t] += (
                    paramSet[ SolverUtil.paramSet.bsOffset + (nBody * SolverUtil.paramSet.spatialPrecision) + (k - 1) ]
                    * Math.sin(k * SolverUtil.getTheta(t))
                    );
            yPos[t] += (
                    paramSet[ SolverUtil.paramSet.bcOffset + (nBody * SolverUtil.paramSet.spatialPrecision) + (k - 1) ]
                    * Math.cos(k * SolverUtil.getTheta(t))
                    );
        }
    }
    return [xPos, yPos];
};


