
/* global numeric, t */

var ActionFunction = new Object();


ActionFunction.initialize = function (params) {
    ActionFunction.bodyCount = params.bodies || 0;
    ActionFunction.maxTime = params.maxTime || 2.0 * Math.PI;
    ActionFunction.timePrecision = params.timePrec || 1;
    ActionFunction.spacialPrecision = params.spacePrec || 1;
    ActionFunction.gravConstant = params.gravConst || 1;
    ActionFunction.dt = params.dt || 1;
    ActionFunction.massValues = params.massValues || Array.apply(null,
            new Array(ActionFunction.bodyCount))
            .map(Number.prototype.valueOf, 1);
};

ActionFunction.evaluate = function (values) {
    var totalAction = 0;
    var cloned;
    if (typeof values !== "undefined" && values !== null) {
        cloned = numeric.clone(values);
        ActionFunction.as = new Array(ActionFunction.bodyCount);
        ActionFunction.ac = new Array(ActionFunction.bodyCount);
        ActionFunction.bs = new Array(ActionFunction.bodyCount);
        ActionFunction.bc = new Array(ActionFunction.bodyCount);

        for (var n = 0; n < ActionFunction.bodyCount; n++) {
            ActionFunction.as[n] = cloned.splice(0, ActionFunction.spacialPrecision);
            ActionFunction.ac[n] = cloned.splice(0, ActionFunction.spacialPrecision);
            ActionFunction.bs[n] = cloned.splice(0, ActionFunction.spacialPrecision);
            ActionFunction.bc[n] = cloned.splice(0, ActionFunction.spacialPrecision);
        }

        ActionFunction.positionMap = new Array(ActionFunction.bodyCount);
        ActionFunction.velocityMap = new Array(ActionFunction.bodyCount);

        ActionFunction.potentialMap = new Array(ActionFunction.bodyCount);
        ActionFunction.kineticMap = new Array(ActionFunction.bodyCount);
        ActionFunction.actionMap = new Array(ActionFunction.bodyCount);

        ActionFunction.solveSystemDetails();
        ActionFunction.solveSystemEnergy();

        totalAction = ActionFunction.integrate();
    } else {
        console.log( "ERR");
    }
    return totalAction;
};

ActionFunction.integrate = function () {
    var action = 0;
    for (var t = 0; t < ActionFunction.timePrecision; t++) {
        action += (ActionFunction.actionMap[t] * ActionFunction.dt);
    }
    return action;
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


    for (var t = 0; t < ActionFunction.timePrecision; t++) {
        ActionFunction.actionMap[t] = (
                ActionFunction.kineticMap[t] - ActionFunction.potentialMap[t]
                );
    }

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

ActionFunction.calculatePotentialEnergy = function () {
    var potentialMap = Array.apply(null,
            new Array(ActionFunction.timePrecision))
            .map(Number.prototype.valueOf, 0);

    var ax, ay, ox, oy;
    var diffx, diffy;
    var singleTimePotential = 0, singleBodyPotential;
    var dist;
    for (var t = 0; t < ActionFunction.timePrecision; t++) {
        singleTimePotential = 0;
        for (var active = 0; active < ActionFunction.bodyCount; active++) {
            ax = ((ActionFunction.positionMap[active])[0])[t];
            ay = ((ActionFunction.positionMap[active])[1])[t];

            singleBodyPotential = 0;
            for (var other = 0; other < ActionFunction.bodyCount; other++) {
                if (active !== other) {
                    ox = ((ActionFunction.positionMap[other])[0])[t];
                    oy = ((ActionFunction.positionMap[other])[1])[t];

                    diffx = ax - ox;
                    diffy = ay - oy;

                    dist = numeric.norm2([diffx, diffy]);
                    if (Math.abs(dist) > 0) {
                        singleBodyPotential += (ActionFunction.massValues[other] / (dist * dist));
                    }
                }
            }
            singleBodyPotential *= (ActionFunction.gravConstant * ActionFunction.massValues[active]);
            singleTimePotential += singleBodyPotential;
        }
        potentialMap[t] = singleTimePotential;
    }
    ActionFunction.potentialMap = potentialMap;
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
            xPos[t] += ActionFunction.cyclicXFunction(nBody, k, t);
            yPos[t] += ActionFunction.cyclicYFunction(nBody, k, t);

        }
        if (t > 0 && t < (ActionFunction.timePrecision)) {
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

ActionFunction.cyclicXFunction = function (nBody, k, t) {

    var sinPart = (
            ActionFunction.as[ nBody ][k]
            * Math.sin(k * ActionFunction.getThetaValue(t))
            );
    var cosPart = (
            ActionFunction.ac[nBody][k]
            * Math.cos(k * ActionFunction.getThetaValue(t))
            );
    return (sinPart + cosPart);
};

ActionFunction.cyclicYFunction = function (nBody, k, t) {
    var sinPart = (
            ActionFunction.bs[nBody][k]
            * Math.sin(k * ActionFunction.getThetaValue(t))
            );
    var cosPart = (
            ActionFunction.bc[nBody][k]
            * Math.cos(k * ActionFunction.getThetaValue(t))
            );
    return (sinPart + cosPart);
};

/*************************************/

ActionFunction.getPositionMap = function () {
    return ActionFunction.positionMap;
};

ActionFunction.getActionMap = function () {
    return ActionFunction.actionMap;
};