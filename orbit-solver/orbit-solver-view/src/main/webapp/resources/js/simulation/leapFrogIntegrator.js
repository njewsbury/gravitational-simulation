var LeapFrogIntegrator = function (parent) {
    this.parent = parent;


};

LeapFrogIntegrator.prototype.moveAllObjects = function () {
    var _this = this;
    var objects = this.parent.objectList;
    var success = true;

    $.each(objects, function (index, element) {
        _this.stageOneMotion(_this, element);
    });
    $.each(objects, function (index, element) {
        _this.stageTwoMotion(_this, element);
    });

    return success;
};

LeapFrogIntegrator.prototype.stageOneMotion = function (integrator, activeObject) {
    var currentAcc, displacement;

    currentAcc = integrator.parent.getSingleAcceleration(activeObject, 0);
    activeObject.acceleration = numeric.clone(currentAcc);

    displacement = activeObject.getVelocity();
    currentAcc = numeric.mul(currentAcc, (integrator.parent.dt / 2.0));
    displacement = numeric.add(displacement, currentAcc);

    activeObject.translatePosition(numeric.mul(displacement, integrator.parent.dt));
};

LeapFrogIntegrator.prototype.stageTwoMotion = function (integrator, activeObject) {
    var currentAcc;
    var lastAcceleration;

    currentAcc = integrator.parent.getSingleAcceleration(activeObject, 0);
    
    lastAcceleration = activeObject.acceleration;

    currentAcc = numeric.add(currentAcc, lastAcceleration);
    currentAcc = numeric.mul(currentAcc, (integrator.parent.dt / 2.0));

    activeObject.translateVelocity(currentAcc);

};