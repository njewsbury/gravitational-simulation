
var SymplecticIntegrator = function (parent) {
    this.parent = parent;
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
    var objects = this.parent.objectList;
    var success = false;
    var stageCount = 0;
    if (typeof objects !== "undefined") {
        $.each(objects, function (index, element) {
            stageCount += _this.stageOneMotion(_this, element);
        });
        $.each(objects, function (index, element) {
            stageCount += _this.stageTwoMotion(_this, element);
        });
        $.each(objects, function (index, element) {
            stageCount += _this.stageThreeMotion(_this, element);
        });

        success = (stageCount === (_this.parent.bodyCount * 3));
    }

    return success;
};

SymplecticIntegrator.prototype.stageOneMotion = function (_this, active) {
    var velPrime = numeric.clone(active.getVelocity(0));
    var qPrime = numeric.clone(active.getPosition(0));

    var acc = _this.parent.getSingleAcceleration(active, 0);
    var multiplier = (_this.params.c.one * _this.parent.dt);

    acc = numeric.mul(acc, multiplier); // C1 * a * dt
    velPrime = numeric.add(velPrime, acc); //V1 = V(t) + C1*a*dt
    active.velocityPrime = numeric.clone(velPrime);
    //
    multiplier = (_this.params.d.one * _this.parent.dt);
    velPrime = numeric.mul(velPrime, multiplier); // D1*v`*dt
    qPrime = numeric.add(qPrime, velPrime); // Q1 = Q(t) + D1*v`*dt
    active.positionPrime = numeric.clone(qPrime);
    return 1;
};

SymplecticIntegrator.prototype.stageTwoMotion = function (_this, active) {
    var vel2Prime = numeric.clone(active.getVelocity(1)); //gets velPrime
    var q2Prime = numeric.clone(active.getPosition(1)); // gets qPrime

    var acc = _this.parent.getSingleAcceleration(active, 1); //AccPrime
    
    var multiplier = (_this.params.c.two * _this.parent.dt);

    acc = numeric.mul(acc, multiplier); // C2 * a` * dt
    vel2Prime = numeric.add(vel2Prime, acc); //V2 = V1(t) + C2*a`*dt
    active.velocityDoublePrime = numeric.clone(vel2Prime);
    //
    multiplier = (_this.params.d.two * _this.parent.dt);
    vel2Prime = numeric.mul(vel2Prime, multiplier); // D2*v``*dt
    q2Prime = numeric.add(q2Prime, vel2Prime); // Q2 = Q1(t) + D2*v``*dt
    active.positionDoublePrime = numeric.clone(q2Prime);
    
    return 1;
};

SymplecticIntegrator.prototype.stageThreeMotion = function (_this, active) {
    var velNew = numeric.clone(active.getVelocity(2)); //gets vel2Prime
    var qNew = numeric.clone(active.getPosition(2)); // gets q2Prime

    var acc = _this.parent.getSingleAcceleration(active, 2); //Acc2Prime
    var multiplier = (_this.params.c.three * _this.parent.dt);

    acc = numeric.mul(acc, multiplier); // C3 * a`` * dt
    velNew = numeric.add(velNew, acc); //VNew = V2(t) + C3*a``*dt
    active.velocity = numeric.clone(velNew);
    //
    multiplier = (_this.params.d.three * _this.parent.dt);
    velNew = numeric.mul(velNew, multiplier); // D3*vNew*dt
    qNew = numeric.add(qNew, velNew); // QNew = Q2(t) + D3*vNew*dt
    
    active.position = numeric.clone(qNew);
    return 1;
};


