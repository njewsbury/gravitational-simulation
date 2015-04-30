/*global numeric*/

/*
 *  SYMPLECTIC INTEGRATOR JS
 * 
 *  THIRD ORDER Symplectic Integrator for updating 'space-object' positions and
 *  velocities.  Coefficients available through reference papers and wikipedia.
 *  
 *  @author Nathan Jewsbury
 */


var SymplecticIntegrator = function (parent) {
    this.parent = parent;
    this.timestep = this.parent.getTimeStep();

    //constants
    this.params = {
        "c": {
            "one": (7.0 / 24.0),
            "two": (3.0 / 4.0),
            "three": (-1.0 / 24.0)
        },
        "d": {
            "one": (2.0 / 3.0),
            "two": (-2.0 / 3.0),
            "three": 1.0
        }
    };
};

SymplecticIntegrator.prototype.moveAllObjects = function () {
    var _this = this;
    var objects = this.parent.getObjectList();
    var success = false;

    if (typeof objects !== "undefined" && objects.length > 0) {
        $.each(objects, function (i, obj) {
            _this.stageZeroMotion(_this, obj);
        });

        $.each(objects, function (i, obj) {
            _this.stageOneMotion(_this, obj);
        });

        $.each(objects, function (i, obj) {
            _this.stageTwoMotion(_this, obj);
        });

        $.each(objects, function (i, obj) {
            _this.stageThreeMotion(_this, obj);
        });

        $.each(objects, function (i, obj) {
            _this.checkCollisions(_this, obj);
        });
        success = true;
    }

    return success;
};

SymplecticIntegrator.prototype.stageZeroMotion = function (_this, active) {
    //Updates everyones current acceleration.
    var gravConst = _this.parent.getGravitationalConstant();
    var othersList = _this.parent.getObjectList();
    var currentForce = active.calculateGravitationalForce(gravConst, othersList);

    if (typeof currentForce !== "undefined") {
        active.setAcceleration(numeric.div(currentForce, active.getMass()));
    }
};

SymplecticIntegrator.prototype.stageOneMotion = function (_this, active) {
    var intermVelOne = active.getVelocity();
    var intermPosOne = active.getPosition();
    var currAcc = active.getAcceleration();
    var addition;

    currAcc = numeric.mul(currAcc, (_this.params.c.one * _this.timestep)); // (c1*a*dt)
    intermVelOne = numeric.add(intermVelOne, currAcc); // v1 = v + c1*a*dt

    addition = numeric.clone(intermVelOne);
    addition = numeric.mul(addition, (_this.params.d.one * _this.timestep));

    intermPosOne = numeric.add(intermPosOne, addition); //q1 = q + d1*v1*dt

    active.setIntermVelocity(intermVelOne, 1);
    active.setIntermPosition(intermPosOne, 1);
};

SymplecticIntegrator.prototype.stageTwoMotion = function (_this, active) {
    var intermVelTwo = active.getVelocity(1);
    var intermPosTwo = active.getPosition(1);
    var gravConst = _this.parent.getGravitationalConstant();
    var othersList = _this.parent.getObjectList();
    var addition;
    var primeAcc = active.calculateGravitationalForce(gravConst, othersList, 1);

    if (typeof primeAcc !== "undefined") {
        primeAcc = (numeric.div(primeAcc, active.getMass()));
    }


    primeAcc = numeric.mul(primeAcc, (_this.params.c.two * _this.timestep)); //c2*a1*dt
    intermVelTwo = numeric.add(intermVelTwo, primeAcc);//v2 = v1 + c2*a1*dt

    addition = numeric.clone(intermVelTwo);
    addition = numeric.mul(addition, (_this.params.d.two * _this.timestep));

    intermPosTwo = numeric.add(intermPosTwo, addition); //q2 = q1 + d2*v2*dt

    active.setIntermVelocity(intermVelTwo, 2);
    active.setIntermPosition(intermPosTwo, 2);

};

SymplecticIntegrator.prototype.stageThreeMotion = function (_this, active) {
    var intermVel = active.getVelocity(2);
    var intermPos = active.getPosition(2);
    var gravConst = _this.parent.getGravitationalConstant();
    var othersList = _this.parent.getObjectList();
    var addition;
    var doublePrimeAcc = active.calculateGravitationalForce(gravConst, othersList, 2);

    if (typeof doublePrimeAcc !== "undefined") {
        doublePrimeAcc = (numeric.div(doublePrimeAcc, active.getMass()));
    }

    doublePrimeAcc = numeric.mul(doublePrimeAcc, (_this.params.c.three * _this.timestep));
    intermVel = numeric.add(intermVel, doublePrimeAcc);

    addition = numeric.clone(intermVel);
    addition = numeric.mul(addition, (_this.params.d.three * _this.timestep));

    intermPos = numeric.add(intermPos, addition); //q3 = q2+d3*v3*dt

    active.setVelocity(intermVel);
    active.setPosition(intermPos);
};


SymplecticIntegrator.prototype.checkCollisions = function (_this, active) {
    var activeRadius, otherRadius;
    var distance;
    var others = _this.parent.getObjectList();
    var activePos, otherPos;
    var mostMassive = _this.parent.getMostMassive();

    if (typeof active !== "undefined") {
        activeRadius = active.getDrawRadius(mostMassive);
        activePos = active.getPosition();
    } else {
        activeRadius = 0;
        activePos = null;
    }

    if (activePos !== null) {
        $.each(others, function (i, other) {
            if (typeof other !== "undefined" && other.getId() !== active.getId()) {
                otherPos = other.getPosition();
                otherRadius = other.getDrawRadius(mostMassive);
                distance = numeric.sub(activePos, otherPos);
                distance = numeric.norm2(distance);

                if (distance <= (activeRadius + otherRadius)) {
                    //Collision!!
                    _this.parent.handleCollision(active, other);
                }
            }
        });
    }
};