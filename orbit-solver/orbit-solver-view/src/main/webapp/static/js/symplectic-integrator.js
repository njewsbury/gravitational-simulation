

var SymplecticIntegrator = function (parent) {
    this.parent = parent;

    this.timestep = this.parent.getTimeStep();
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
            _this.checkCollisions(_this, obj);
        });
        success = true;
    }

    return success;
};

SymplecticIntegrator.prototype.stageZeroMotion = function (_this, active) {
    //Updates everyones current acceleration.
    var objStepCount = active.getTotalStepCount();
    var deltaX = Math.cos(2.0 * Math.PI / (objStepCount + (active.getId() * 1.25)));
    var deltaY = Math.sin(2.0 * Math.PI / (objStepCount - (active.getId() * 1.25)));

    active.increaseStepCount(_this.timestep);
    active.setPosition([deltaX, deltaY]);
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
            if (other.getId() !== active.getId()) {
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