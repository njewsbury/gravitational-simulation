var OrbitalSolver = new Object();

OrbitalSolver.solvedOrbits = 0;

OrbitalSolver.log = function (str) {
    var newDiv = $("<div class='log-msg'></div>");
    var dateDiv = $("<div class='date-span'></div>");
    var logDiv = $("<div class='log-text'></div>");

    $(dateDiv).text(new Date().toDateString());
    $(logDiv).html(str);

    $(newDiv).append(dateDiv);
    $(newDiv).append(logDiv);

    $("#console-output").append(newDiv);
};


OrbitalSolver.clearLogs = function () {
    $("#console-log").html("");
};


OrbitalSolver.initialize = function () {
    OrbitalSolver.solvedOrbits = 0;

    OrbitalSolver.nBodies = 3;
    OrbitalSolver.fourierPrecision = 5;
    OrbitalSolver.timePrecision = 10;

    OrbitalSolver.AS_OFFSET = 0;
    OrbitalSolver.AC_OFFSET = (this.nBodies * this.fourierPrecision);
    OrbitalSolver.BS_OFFSET = 2.0 * (this.nBodies * this.fourierPrecision);
    OrbitalSolver.BC_OFFSET = 3.0 * (this.nBodies * this.fourierPrecision);

    OrbitalSolver.aNot = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 0);
    OrbitalSolver.bNot = Array.apply(null, new Array(this.nBodies))
            .map(Number.prototype.valueOf, 0);

    OrbitalSolver.timeMap = new Array(this.timePrecision);
    for (var i = 0; i < this.timePrecision; i++) {
        OrbitalSolver.timeMap[i] = i;
    }

    OrbitalSolver.dt = (2.0 * Math.PI) / OrbitalSolver.timePrecision;
    OrbitalSolver.thetaMap = numeric.mul(OrbitalSolver.timeMap, OrbitalSolver.dt);


    OrbitalSolver.log("Initializing Orbit Solver...");
    OrbitalSolver.minimizeLoopCount = 0;
    OrbitalSolver.selectParams();
};

OrbitalSolver.calculateQRegular = function (paramArray) {
    var x = new Array(OrbitalSolver.nBodies);
    var y = new Array(OrbitalSolver.nBodies);

    for (var m = 0; m < OrbitalSolver.nBodies; m++) {
        x[m] = new Array(OrbitalSolver.timePrecision);
        y[m] = new Array(OrbitalSolver.timePrecision);
    }

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
            x[i][t] = OrbitalSolver.aNot[i];
            y[i][t] = OrbitalSolver.bNot[i];
            for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {

                x[i][t] += (
                        paramArray[OrbitalSolver.AS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );
                x[i][t] += (
                        paramArray[OrbitalSolver.AC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );

                y[i][t] += (
                        paramArray[OrbitalSolver.BS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );
                y[i][t] += (
                        paramArray[OrbitalSolver.BC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );
            }

        }
    }
    return [x, y];
};

OrbitalSolver.calculateQDot = function (paramArray) {
    var xdot = new Array(OrbitalSolver.nBodies);
    var ydot = new Array(OrbitalSolver.nBodies);

    for (var m = 0; m < OrbitalSolver.nBodies; m++) {
        xdot[m] = new Array(OrbitalSolver.timePrecision);
        ydot[m] = new Array(OrbitalSolver.timePrecision);
    }

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
            xdot[i][t] = 0.0;
            ydot[i][t] = 0.0;
            for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {

                xdot[i][t] += (
                        paramArray[OrbitalSolver.AS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );
                xdot[i][t] -= (
                        paramArray[OrbitalSolver.AC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );

                ydot[i][t] += (
                        paramArray[OrbitalSolver.BS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );
                ydot[i][t] -= (
                        paramArray[OrbitalSolver.BC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );
            }
        }
    }
    return [xdot, ydot];
};

OrbitalSolver.calculateQDotDot = function (paramArray) {
    var xdotdot = new Array(OrbitalSolver.nBodies);
    var ydotdot = new Array(OrbitalSolver.nBodies);

    for (var m = 0; m < OrbitalSolver.nBodies; m++) {
        xdotdot[m] = new Array(OrbitalSolver.timePrecision);
        ydotdot[m] = new Array(OrbitalSolver.timePrecision);
    }

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
            xdotdot[i][t] = 0.0;
            ydotdot[i][t] = 0.0;
            for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {

                xdotdot[i][t] -= (
                        paramArray[OrbitalSolver.AS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * k * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );
                xdotdot[i][t] -= (
                        paramArray[OrbitalSolver.AC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * k * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );

                ydotdot[i][t] -= (
                        paramArray[OrbitalSolver.BS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * k * Math.sin(k * OrbitalSolver.thetaMap[t])
                        );
                ydotdot[i][t] -= (
                        paramArray[OrbitalSolver.BC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                        * k * k * Math.cos(k * OrbitalSolver.thetaMap[t])
                        );
            }
        }
    }
    return [xdotdot, ydotdot];
};


OrbitalSolver.calculateActionGradient = function (paramArray) {
    var mu = [];
    var kappa = [];
    var q, qdot, qdotdot;
    var modQDot, modQDotDot;
    var actionGradient = 0.0;
    var x, y, xdot, ydot, xdotdot, ydotdot;

    q = OrbitalSolver.calculateQRegular(paramArray);
    qdot = OrbitalSolver.calculateQDot(paramArray);
    qdotdot = OrbitalSolver.calculateQDotDot(paramArray);

    x = q[0];
    y = q[1];

    xdot = qdot[0];
    ydot = qdot[1];

    xdotdot = qdotdot[0];
    ydotdot = qdotdot[1];

    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        kappa[t] = 0.0;
        mu[t] = 0.0;

        for (var i = 0; i < OrbitalSolver.nBodies; i++) {
            modQDot = Math.sqrt((xdot[i][t] * xdot[i][t]) + (ydot[i][t] * ydot[i][t]));
            modQDotDot = Math.sqrt((xdotdot[i][t] * xdotdot[i][t]) + (ydotdot[i][t] * ydotdot[i][t]));
            kappa[t] += (modQDot * modQDotDot);

            for (var j = (i + 1); j < OrbitalSolver.nBodies; j++) {
                var xSingle = (x[i][t] - x[j][t]);
                var ySingle = (y[i][t] - y[j][t]);

                var sum = (xSingle * xSingle) + (ySingle * ySingle);
                mu[t] = (1.0 / (sum));
            }
        }
    }

    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        actionGradient += ((kappa[t] - mu[t]) * OrbitalSolver.dt);
    }

    var actionGradientVector = new Array(1);
    actionGradientVector[0] = actionGradient;
    //console.log("Action Gradient :: " + actionGradient);
    return actionGradientVector;
};

OrbitalSolver.calculateActionFunction = function (paramArray) {
    var actionFunction = 0.0;
    var x, y, xdot, ydot;
    var potential = [];
    var kinetic = [];
    var q, qdot;

    q = OrbitalSolver.calculateQRegular(paramArray);
    qdot = OrbitalSolver.calculateQDot(paramArray);

    x = q[0];
    y = q[1];
    xdot = qdot[0];
    ydot = qdot[1];

    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        kinetic[t] = 0.0;
        potential[t] = 0.0;

        for (var i = 0; i < OrbitalSolver.nBodies; i++) {
            kinetic[t] += (xdot[i][t] * xdot[i][t]);
            kinetic[t] += (ydot[i][t] * ydot[i][t]);
            kinetic[t] *= (1.0 / 2.0);

            for (var j = (i + 1); j < OrbitalSolver.nBodies; j++) {
                var xSingle = (x[i][t] - x[j][t]);
                var ySingle = (y[i][t] - y[j][t]);

                var sum = (xSingle * xSingle) + (ySingle * ySingle);
                potential[t] = (1.0 / Math.sqrt(sum));
            }
        }
    }

    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        actionFunction += ((kinetic[t] - potential[t]) * OrbitalSolver.dt);
    }
    //console.log("Action Function :: " + actionFunction);
    return actionFunction;
};

OrbitalSolver.selectParams = function () {
    OrbitalSolver.log("Selecting initial parameters.");

    var paramSet;
    /*
     paramSet = [
     1, 1.2, 0.5, 1.3, 1, 1.2, //as
     1, 1.5, 1, 1.7, 1, 1.2, //ac,
     1, 1.7, 1, 1.2, 1, 1.3, //bs
     1, 1.8, 1, 1.4, 1, 1.9  //bc       
     ];
     */
    var results;
    var msgArr = [];
    var callbackFunction = function (i, x, f, g, H) {
        msgArr.push({i: i, x: x, f: f, g: g, H: H});
    };
    for (var i = 0; i < 1; i++) {
        paramSet = OrbitalSolver.findRandomizedParamSet();
        try {
            msgArr = [];
            results = numeric.uncmin(
                    OrbitalSolver.calculateActionFunction,
                    paramSet,
                    1e-10,
                    OrbitalSolver.calculateActionGradient,
                    1e10, callbackFunction
                    );//.solution;
            OrbitalSolver.log("Found initial condition set.");

            var initialPos = OrbitalSolver.findInitialPosition(results.solution);
            var initialVel = OrbitalSolver.findInitialVelocity(results.solution);

            var initialString = "";
            for (var n = 0; n < OrbitalSolver.nBodies; n++) {
                initialString = "Body :: " + n + "<br>";
                initialString += "Xo :: " + initialPos[0][n] + "<br>";
                initialString += "Yo :: " + initialPos[1][n] + "<br>";
                initialString += "VXo : " + initialVel[0][n] + "<br>";
                initialString += "VYo : " + initialVel[1][n];

                OrbitalSolver.log(initialString);
            }
        } catch (err) {
            OrbitalSolver.log("Error :: " + err);
        }
    }
    OrbitalSolver.log("Done searching for solutions.");
};

OrbitalSolver.findInitialPosition = function (resultArray) {
    var x = new Array(OrbitalSolver.nBodies);
    var y = new Array(OrbitalSolver.nBodies);

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        x[i] = OrbitalSolver.aNot[i];
        y[i] = OrbitalSolver.bNot[i];
        for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {

            x[i] += (
                    resultArray[OrbitalSolver.AC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                    );

            y[i] += (
                    resultArray[OrbitalSolver.BC_OFFSET + (i * OrbitalSolver.fourierPrecision) + k]
                    );
        }
    }
    return [x, y];
};

OrbitalSolver.findInitialVelocity = function (resultArray) {
    var vx = new Array(OrbitalSolver.nBodies);
    var vy = new Array(OrbitalSolver.nBodies);

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        vx[i] = 0;
        vy[i] = 0;

        for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {
            vx[i] += (
                    resultArray[OrbitalSolver.AS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k] * k
                    );
            vy[i] += (
                    resultArray[OrbitalSolver.BS_OFFSET + (i * OrbitalSolver.fourierPrecision) + k] * k
                    );
        }
    }
    return [vx, vy];
};

OrbitalSolver.findRandomizedParamSet = function () {
    var required = (4 * OrbitalSolver.nBodies * OrbitalSolver.fourierPrecision);
    var aParams = numeric.random([1, required / 2])[0];
    var bParams = numeric.random([1, required / 2])[0];

    aParams = numeric.sub(aParams, 0.5);
    aParams = numeric.mul(1.0, aParams);

    bParams = numeric.sub(bParams, 0.5);
    bParams = numeric.mul(0.01, bParams);


    return aParams.concat(bParams);
};


OrbitalSolver.endSolver = function () {
    OrbitalSolver.log("Ending Solver...");
    OrbitalSolver.log("Found :: " + OrbitalSolver.solvedOrbits + " solutions.");
};
