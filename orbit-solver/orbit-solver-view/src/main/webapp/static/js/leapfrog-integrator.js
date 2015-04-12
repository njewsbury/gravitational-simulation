/*global numeric */

var LeapFrogIntegrator = function (parent) {
    this.parent = parent;
    this.timestep = this.parent.getTimeStep();

};

LeapFrogIntegrator.prototype.moveAllObjects = function () {
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
            _this.checkCollisions(_this, obj);
        });
        success = true;
    }
    return success;
};

LeapFrogIntegrator.prototype.stageZeroMotion = function (_this, active) {
    //Updates everyones current acceleration.
    var gravConst = _this.parent.getGravitationalConstant();
    var othersList = _this.parent.getObjectList();
    var currentForce = active.calculateGravitationalForce(gravConst, othersList);

    if (typeof currentForce !== "undefined") {
        active.setAcceleration(numeric.div(currentForce, active.getMass()));
    }
};

LeapFrogIntegrator.prototype.stageOneMotion = function (_this, active) {
    var vAddition = active.getVelocity();
    var aAddition = active.getAcceleration();
    var add;

    vAddition = numeric.mul(vAddition, _this.timestep);
    aAddition = numeric.mul(aAddition, (_this.timestep * _this.timestep) / 2.0);
    add = numeric.add(vAddition, aAddition);

    active.addPosition(add);
};

LeapFrogIntegrator.prototype.stageTwoMotion = function (_this, active) {
    var gravConst = _this.parent.getGravitationalConstant();
    var othersList = _this.parent.getObjectList();
    var accPrime = active.calculateGravitationalForce(gravConst, othersList);
    var stdAcc = active.getAcceleration();
    var avg;
    
    
    avg = numeric.add( stdAcc, accPrime);
    avg = numeric.mul( avg, (_this.timestep/2.0));
    
    active.addVelocity(avg);    
};

LeapFrogIntegrator.prototype.checkCollisions = function (_this, active) {
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