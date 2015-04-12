
/* global numeric */

var ActionFunction = new Object();


ActionFunction.initialize = function (params) {
    ActionFunction.bodyCount = params.bodies || 0;
    ActionFunction.maxTime = params.maxTime || 2.0 * Math.PI;
    ActionFunction.timePrecision = params.timePrec || 1;
    ActionFunction.spacialPrecision = params.spacePrec || 1;
    ActionFunction.dt = params.dt || 1;
    ActionFunction.massValues = params.massValues || Array.apply(null,
            new Array(ActionFunction.bodyCount))
            .map(Number.prototype.valueOf, 1);
};

ActionFunction.evaluate = function (values) {
    ActionFunction.as = values.as || null;
    ActionFunction.ac = values.ac || null;
    ActionFunction.bs = values.bs || null;
    ActionFunction.bc = values.bc || null;

    ActionFunction.positionMap = new Array(ActionFunction.bodyCount);
    ActionFunction.velocityMap = new Array(ActionFunction.bodyCount);

    ActionFunction.potentialMap = new Array(ActionFunction.bodyCount);
    ActionFunction.kineticMap = new Array(ActionFunction.bodyCount);

    ActionFunction.solveSystemDetails();
    ActionFunction.solveSystemEnergy();

    return 1;
};

ActionFunction.getThetaValue = function (atTime) {
    return (ActionFunction.maxTime) * (atTime / ActionFunction.timePrecision);
};

ActionFunction.solveSystemDetails = function () {
    for (var n = 0; n < ActionFunction.bodyCount; n++) {
        ActionFunction.calculateBodyDetails(n);
    }
};

ActionFunction.solveSystemEnergy = function () {
    ActionFunction.calculateKineticEnergy();
    ActionFunction.calculatePotentialEnergy();
    
};

ActionFunction.calculateKineticEnergy = function () {
    var kineticMap = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var velocity = ActionFunction.velocityMap;
    var singleTimeKinetic, singleBodyKinetic;
    var dxt, dyt;
    var speed;

    for (var t = 0; t < ActionFunction.timePrecision; t++) {
        singleTimeKinetic = 0.0;

        for (var n = 0; n < ActionFunction.bodyCount; n++) {
            dxt = ((velocity[n])[0])[t];
            dyt = ((velocity[n])[1])[t];
            speed = numeric.norm2Squared([dxt, dyt]);
            singleBodyKinetic = (1.0 / 2.0) * ActionFunction.massValues[n] * speed;
            singleTimeKinetic += singleBodyKinetic;
        }
        kineticMap[t] = singleTimeKinetic;
    }
    ActionFunction.kineticMap = kineticMap;
};

ActionFunction.calculatePotentialEnergy = function() {
    
};

ActionFunction.calculateBodyDetails = function (nBody) {
    var xPos = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var yPos = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var dxPos = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);
    var dyPos = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);


    for (var t = 0; t < ActionFunction.timePrecision; t++) {
        for (var k = 1; k < ActionFunction.spacialPrecision; k++) {
            xPos[t] += (
                    ActionFunction.as[ nBody ][k]
                    * Math.sin(k * ActionFunction.getTheta(t))
                    );
            xPos[t] += (
                    ActionFunction.ac[nBody][k]
                    * Math.cos(k * ActionFunction.getTheta(t))
                    );
            yPos[t] += (
                    ActionFunction.bs[nBody][k]
                    * Math.sin(k * ActionFunction.getTheta(t))
                    );
            yPos[t] += (
                    ActionFunction.bc[nBody][k]
                    * Math.cos(k * ActionFunction.getTheta(t))
                    );

        }
        if (t > 0 && t < (ActionFunction.timePrecision - 1)) {
            dxPos[t - 1] = (xPos[t] - xPos[t - 1]) / ActionFunction.dt;
            dyPos[t - 1] = (yPos[t] - yPos[t - 1]) / ActionFunction.dt;
        }
        if (t === ActionFunction.timePrecision - 1) {
            dxPos[ActionFunction.timePrecision - 1] =
                    (xPos[0] - xPos[ActionFunction.timePrecision - 1]) / ActionFunction.dt;
            dyPos[ActionFunction.timePrecision - 1] =
                    (yPos[0] - yPos[ActionFunction.timePrecision - 1]) / ActionFunction.dt;
        }
    }
    ActionFunction.positionMap[nBody] = [xPos, yPos];
    ActionFunction.velocityMap[nBody] = [dxPos, dyPos];
};


/*************************************/

ActionFunction.getPositionMap = function () {
    return ActionFunction.positionMap;
};