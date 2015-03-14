var OrbitalSolver = function (nBodies, fourierPrecision, timePrecision) {
    this.nBodies = nBodies;
    this.fourierPrecision = fourierPrecision;
    this.timePrecision = timePrecision;

    this.AS_OFFSET = 0;
    this.AC_OFFSET = (this.nBodies * this.fourierPrecision);
    this.BS_OFFSET = 2.0 * (this.nBodies * this.fourierPrecision);
    this.BC_OFFSET = 3.0 * (this.nBodies * this.fourierPrecision);

    this.aNot = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 0);
    this.bNot = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 0);

    this.timeMap = new Array(this.timePrecision);
    for (var i = 0; i < this.timePrecision; i++) {
        this.timeMap[i] = i;
    }

    this.dt = (2.0 * Math.PI) / this.timePrecision;
    this.thetaMap = numeric.mul(this.timeMap, this.dt);
};

OrbitalSolver.prototype.calculateQRegular = function (paramArray) {
    var x = new Array(this.nBodies);
    var y = new Array(this.nBodies);

    for (var m = 0; m < this.nBodies; m++) {
        x[m] = new Array(this.timePrecision);
        y[m] = new Array(this.timePrecision);
    }

    for (var i = 0; i < this.nBodies; i++) {
        for (var t = 0; t < this.timePrecision; t++) {
            x[i][t] = this.aNot[i];
            y[i][t] = this.bNot[i];
            for (var k = 0; k < this.fourierPrecision; k++) {

                x[i][t] += (
                        paramArray[this.AS_OFFSET + (i * this.fourierPrecision) + k]
                        * Math.sin(k * this.thetaMap[t])
                        );
                x[i][t] += (
                        paramArray[this.AC_OFFSET + (i * this.fourierPrecision) + k]
                        * Math.cos(k * this.thetaMap[t])
                        );

                y[i][t] += (
                        paramArray[this.BS_OFFSET + (i * this.fourierPrecision) + k]
                        * Math.sin(k * this.thetaMap[t])
                        );
                y[i][t] += (
                        paramArray[this.BC_OFFSET + (i * this.fourierPrecision) + k]
                        * Math.cos(k * this.thetaMap[t])
                        );
            }

        }
    }
    return [x, y];
};

OrbitalSolver.prototype.calculateQDot = function (paramArray) {
    var xdot = new Array(this.nBodies);
    var ydot = new Array(this.nBodies);

    for (var m = 0; m < this.nBodies; m++) {
        xdot[m] = new Array(this.timePrecision);
        ydot[m] = new Array(this.timePrecision);
    }

    for (var i = 0; i < this.nBodies; i++) {
        for (var t = 0; t < this.timePrecision; t++) {
            xdot[i][t] = 0.0;
            ydot[i][t] = 0.0;
            for (var k = 0; k < this.fourierPrecision; k++) {

                xdot[i][t] += (
                        paramArray[this.AS_OFFSET + (i * this.fourierPrecision) + k]
                        * k * Math.cos(k * this.thetaMap[t])
                        );
                xdot[i][t] -= (
                        paramArray[this.AC_OFFSET + (i * this.fourierPrecision) + k]
                        * k * Math.sin(k * this.thetaMap[t])
                        );

                ydot[i][t] += (
                        paramArray[this.BS_OFFSET + (i * this.fourierPrecision) + k]
                        * k * Math.cos(k * this.thetaMap[t])
                        );
                ydot[i][t] -= (
                        paramArray[this.BC_OFFSET + (i * this.fourierPrecision) + k]
                        * k * Math.sin(k * this.thetaMap[t])
                        );
            }
        }
    }
    return [xdot, ydot];
};

OrbitalSolver.prototype.calculateQDotDot = function (paramArray) {
    var xdotdot = new Array(this.nBodies);
    var ydotdot = new Array(this.nBodies);

    for (var m = 0; m < this.nBodies; m++) {
        xdotdot[m] = new Array(this.timePrecision);
        ydotdot[m] = new Array(this.timePrecision);
    }

    for (var i = 0; i < this.nBodies; i++) {
        for (var t = 0; t < this.timePrecision; t++) {
            xdotdot[i][t] = 0.0;
            ydotdot[i][t] = 0.0;
            for (var k = 0; k < this.fourierPrecision; k++) {

                xdotdot[i][t] -= (
                        paramArray[this.AS_OFFSET + (i * this.fourierPrecision) + k]
                        * k * k * Math.sin(k * this.thetaMap[t])
                        );
                xdotdot[i][t] -= (
                        paramArray[this.AC_OFFSET + (i * this.fourierPrecision) + k]
                        * k * k * Math.cos(k * this.thetaMap[t])
                        );

                ydotdot[i][t] -= (
                        paramArray[this.BS_OFFSET + (i * this.fourierPrecision) + k]
                        * k * k * Math.sin(k * this.thetaMap[t])
                        );
                ydotdot[i][t] -= (
                        paramArray[this.BC_OFFSET + (i * this.fourierPrecision) + k]
                        * k * k * Math.cos(k * this.thetaMap[t])
                        );
            }
        }
    }
    return [xdotdot, ydotdot];
};


OrbitalSolver.prototype.calculateActionGradient = function (paramArray) {
    var mu = [];
    var kappa = [];
    var q, qdot, qdotdot;
    var modQDot, modQDotDot;
    var actionGradient = 0.0;
    var x, y, xdot, ydot, xdotdot, ydotdot;

    q = OrbitalSolver.prototype.calculateQRegular(paramArray);
    qdot = OrbitalSolver.prototype.calculateQDot(paramArray);
    qdotdot = OrbitalSolver.prototype.calculateQDotDot(paramArray);

    x = q[0];
    y = q[1];

    xdot = qdot[0];
    ydot = qdot[1];

    xdotdot = qdotdot[0];
    ydotdot = qdotdot[1];

    for (var t = 0; t < this.timePrecision; t++) {
        kappa[t] = 0.0;
        mu[t] = 0.0;

        for (var i = 0; i < this.nBodies; i++) {
            modQDot = Math.sqrt((xdot[i][t] * xdot[i][t]) + (ydot[i][t] * ydot[i][t]));
            modQDotDot = Math.sqrt((xdotdot[i][t] * xdotdot[i][t]) + (ydotdot[i][t] * ydotdot[i][t]));
            kappa[t] += (modQDot * modQDotDot);

            for (var j = (i + 1); j < this.nBodies; j++) {
                var xSingle = (x[i][t] - x[j][t]);
                var ySingle = (y[i][t] - y[j][t]);

                var sum = (xSingle * xSingle) + (ySingle * ySingle);
                mu[t] = (1.0 / (sum));
            }
        }
    }

    for (var t = 0; t < this.timePrecision; t++) {
        actionGradient += ((kappa[t] - mu[t]) * this.dt);
    }

    var actionGradientVector = new Array(1);
    actionGradientVector[0] = actionGradient;
    return actionGradientVector;
};

OrbitalSolver.prototype.calculateActionFunction = function (paramArray) {
    var actionFunction = 0.0;
    var x, y, xdot, ydot;
    var potential = [];
    var kinetic = [];
    var q, qdot;

    q = OrbitalSolver.prototype.calculateQRegular(paramArray);
    qdot = OrbitalSolver.prototype.calculateQDot(paramArray);

    x = q[0];
    y = q[1];
    xdot = qdot[0];
    ydot = qdot[1];

    for (var t = 0; t < this.timePrecision; t++) {
        kinetic[t] = 0.0;
        potential[t] = 0.0;

        for (var i = 0; i < this.nBodies; i++) {
            kinetic[t] += (xdot[i][t] * xdot[i][t]);
            kinetic[t] += (ydot[i][t] * ydot[i][t]);
            kinetic[t] *= (1.0 / 2.0);

            for (var j = (i + 1); j < this.nBodies; j++) {
                var xSingle = (x[i][t] - x[j][t]);
                var ySingle = (y[i][t] - y[j][t]);

                var sum = (xSingle * xSingle) + (ySingle * ySingle);
                potential[t] = (1.0 / Math.sqrt(sum));
            }
        }
    }

    for (var t = 0; t < this.timePrecision; t++) {
        actionFunction += ((kinetic[t] - potential[t]) * this.dt);
    }
    return actionFunction;
};

OrbitalSolver.prototype.findInitialPosition = function (resultArray) {
    var x = new Array(this.nBodies);
    var y = new Array(this.nBodies);

    for (var i = 0; i < this.nBodies; i++) {
        x[i] = this.aNot[i];
        y[i] = this.bNot[i];
        for (var k = 0; k < this.fourierPrecision; k++) {

            x[i] += (
                    resultArray[this.AC_OFFSET + (i * this.fourierPrecision) + k]
                    );

            y[i] += (
                    resultArray[this.BC_OFFSET + (i * this.fourierPrecision) + k]
                    );
        }
    }
    return [x, y];
};

OrbitalSolver.prototype.findInitialVelocity = function (resultArray) {
    var vx = new Array(this.nBodies);
    var vy = new Array(this.nBodies);

    for (var i = 0; i < this.nBodies; i++) {
        vx[i] = 0;
        vy[i] = 0;

        for (var k = 0; k < this.fourierPrecision; k++) {
            vx[i] += (
                    resultArray[this.AS_OFFSET + (i * this.fourierPrecision) + k] * k
                    );
            vy[i] += (
                    resultArray[this.BS_OFFSET + (i * this.fourierPrecision) + k] * k
                    );
        }
    }
    return [vx, vy];
};

OrbitalSolver.prototype.findRandomizedParamSet = function (seed) {
    var required = (4 * this.nBodies * this.fourierPrecision);
    var aParams = numeric.random([1, required / 2])[0];
    var bParams = numeric.random([1, required / 2])[0];

    aParams = numeric.sub(aParams, 0.5);
    aParams = numeric.mul(1.0, aParams);

    bParams = numeric.sub(bParams, 0.5);
    bParams = numeric.mul(0.01, bParams);
    return aParams.concat(bParams);
};

OrbitalSolver.prototype.solve = function (seed) {
    var paramSet;
    var results;
    var msgArr = [];
    var jsonVar = {};
    var objectList = [];

    var callbackFunction = function (i, x, f, g, H) {
        msgArr.push({i: i, x: x, f: f, g: g, H: H});
    };

    paramSet = this.findRandomizedParamSet(seed);
    jsonVar.success = false;
    try {
        msgArr = [];
        results = numeric.uncmin(
                this.calculateActionFunction,
                paramSet,
                1e-10,
                this.calculateActionGradient,
                1e10, callbackFunction
                );
        jsonVar.success = true;
        jsonVar.simulationId = "randomGenSim";
        jsonVar.nBodies = this.nBodies;



        var initialPos = this.findInitialPosition(results.solution);
        var initialVel = this.findInitialVelocity(results.solution);
        var singleJson;
        var totalMass = 0;

        for (var n = 0; n < this.nBodies; n++) {
            singleJson = {
                'objectId': n,
                'objectName': ("nOrbital-" + n),
                'objectMass': 1,
                'objectRadius': 1,
                'position': [
                    initialPos[0][n],
                    initialPos[1][n]
                ],
                'velocity': [
                    initialVel[0][n],
                    initialVel[1][n]
                ],
                'render': {
                    'lineWidth': 2,
                    'strokeColour': '#FF9900',
                    'fillColourOne': 'green',
                    'fillColourTwo': 'yellow'
                }
            };
            totalMass += singleJson.objectMass;
            objectList.push(singleJson);
        }
        jsonVar.totalMass = totalMass;
        jsonVar.objectList = objectList;
    } catch (err) {
        console.log("Error :: " + err);
        jsonVar.errorMsg = err;
    }

    return jsonVar;
};