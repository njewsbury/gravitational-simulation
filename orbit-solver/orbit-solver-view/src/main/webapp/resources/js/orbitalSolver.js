var OrbitalSolver = new Object();

OrbitalSolver.solvedOrbits = 0;

OrbitalSolver.log = function (str) {
    var newDiv = $("<div class='log-msg'></div>");
    var dateDiv = $("<div class='date-span'></div>");
    var logDiv = $("<div class='log-text'></div>");

    $(dateDiv).text(new Date().toDateString());
    $(logDiv).text(str);

    $(newDiv).append(dateDiv);
    $(newDiv).append(logDiv);

    $("#console-output").append(newDiv);
};


OrbitalSolver.clearLogs = function () {
    $("#console-log").clear();
};


OrbitalSolver.initialize = function () {
    OrbitalSolver.solvedOrbits = 0;

    OrbitalSolver.nBodies = 3;
    OrbitalSolver.fourierPrecision = 2;
    OrbitalSolver.timePrecision = 10;

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


OrbitalSolver.minimizeFunction = function (paramArray) {
    
    var paramDimension = numeric.dim( paramArray );
    console.log( paramDimension );
    
    var as = numeric.clone(paramArray[0]);
    var ac = numeric.clone(paramArray[1]);
    var bs = numeric.clone(paramArray[2]);
    var bc = numeric.clone(paramArray[3]);
    
    
    
    OrbitalSolver.minimizeLoopCount++;
    console.log("Orbital Minimizer Loop Count :: " + OrbitalSolver.minimizeLoopCount);

    var xit = new Array(OrbitalSolver.nBodies);
    var yit = new Array(OrbitalSolver.nBodies);
    var xdot = new Array(OrbitalSolver.nBodies);
    var ydot = new Array(OrbitalSolver.nBodies);

    for (var m = 0; m < OrbitalSolver.nBodies; m++) {
        xit[m] = new Array(OrbitalSolver.timePrecision);
        yit[m] = new Array(OrbitalSolver.timePrecision);
        xdot[m] = new Array(OrbitalSolver.timePrecision);
        ydot[m] = new Array(OrbitalSolver.timePrecision);
    }

    var kinetic = [];
    var potential = [];

    for (var i = 0; i < OrbitalSolver.nBodies; i++) {
        for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
            xit[i][t] = OrbitalSolver.aNot[i];
            yit[i][t] = OrbitalSolver.bNot[i];

            for (var k = 0; k < OrbitalSolver.fourierPrecision; k++) {
                xit[i][t] += (as[i][k] * Math.sin(k * OrbitalSolver.thetaMap[t]));
                xit[i][t] += (ac[i][k] * Math.cos(k * OrbitalSolver.thetaMap[t]));

                yit[i][t] += (bs[i][k] * Math.sin(k * OrbitalSolver.thetaMap[t]));
                yit[i][t] += (bc[i][k] * Math.cos(k * OrbitalSolver.thetaMap[t]));
            }

            if (t > 0) {
                xdot[i][t - 1] = (xit[i][t] - xit[i][t - 1]) / OrbitalSolver.dt;
                ydot[i][t - 1] = (yit[i][t] - yit[i][t - 1]) / OrbitalSolver.dt;
            }
        }
        var endTime = OrbitalSolver.timePrecision - 1;
        xdot[i][endTime] =
                (xit[i][endTime] - xit[i][endTime - 1]) / OrbitalSolver.dt;
        ydot[i][endTime] =
                (yit[i][endTime] - yit[i][endTime - 1]) / OrbitalSolver.dt;

    }

    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        kinetic[t] = 0.0;
        potential[t] = 0.0;

        for (var i = 0; i < OrbitalSolver.nBodies; i++) {
            kinetic[t] += (xdot[i][t] * xdot[i][t]);
            kinetic[t] += (ydot[i][t] * ydot[i][t]);
            kinetic[t] *= (1.0 / 2.0);

            for (var j = (i + 1); j < OrbitalSolver.nBodies; j++) {
                var xSingle = (xit[i][t] - xit[j][t]);
                var ySingle = (yit[i][t] - yit[j][t]);

                var sum = (xSingle * xSingle) + (ySingle * ySingle);
                potential[t] = (1.0 / Math.sqrt(sum));
            }
        }
    }

    var actionFunction = 0.0;
    for (var t = 0; t < OrbitalSolver.timePrecision; t++) {
        actionFunction += (kinetic[t] - potential[t]) * OrbitalSolver.dt;
    }


    return actionFunction;
};

OrbitalSolver.selectParams = function () {
    OrbitalSolver.log("Selecting initial parameters.");

    var paramSet = [];
    // Push AS, a nBodies x fourier Precision array.
    paramSet.push([[1, 1.2], [1, 1.3], [1, 1.2]]);
    // Push AC, a nBodies x fourier Precision array.
    paramSet.push([[1, 1.5], [1, 1.7], [1, 1.2]]);
    // Push BS, a nBodies x fourier Precision array.
    paramSet.push([[1, 1.7], [1, 1.2], [1, 1.3]]);
    // Push BC, a nBodies x fourier Precision array.
    paramSet.push([[1, 1.8], [1, 1.4], [1, 1.9]]);

    var results = numeric.uncmin(OrbitalSolver.minimizeFunction, paramSet).solution;

    console.log(results);

};


OrbitalSolver.endSolver = function () {
    OrbitalSolver.log("Ending Solver...");
    OrbitalSolver.log("Found :: " + OrbitalSolver.solvedOrbits + " solutions.");
};
