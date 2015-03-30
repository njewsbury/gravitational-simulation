var OrbitalEngine = function (simId, config) {
    this.id = simId;
    this.dt = config.timeStep;
    this.gravConstant = config.gravConstant;

    this.objectList = [];
    this.totalMass = 0.0;
    this.bodyCount = 0;

    this.elapsedTime = 0.0;

    //this.integrator = new LeapFrogIntegrator(this);
    this.integrator = new SymplecticIntegrator(this);
};

OrbitalEngine.prototype.insertOrbital = function (spaceObject) {
    if (typeof spaceObject !== "undefined") {
        this.objectList.push(spaceObject);
        this.bodyCount++;
        this.totalMass += (spaceObject.mass);
    }
};

OrbitalEngine.prototype.getOrbitalList = function () {
    return this.objectList;
};

OrbitalEngine.prototype.moveAllObjects = function () {
    this.elapsedTime += this.dt;
    var success = this.integrator.moveAllObjects();
    if (!success) {
        console.log("Unable to move objects...");
    }
};

/**
 * Get the distance between the two given objects.
 * @param {type} objOne
 * @param {type} objTwo
 * @returns {Number}
 */
OrbitalEngine.prototype.getDistance = function (objOne, objTwo) {
    var onePos, twoPos;
    var rawDist;

    onePos = numeric.clone(objOne.position);
    twoPos = numeric.clone(objTwo.position);

    rawDist = numeric.sub(onePos, twoPos);
    return numeric.norm2(rawDist); // |r1 - r2|

};

/**
 * Get a unit vector from objOne pointing towards objTwo.
 * @param {SpaceObject} objOne
 * @param {SpaceObject} objTwo
 * @returns {Arr[Number]} Unit vector pointing TOWARDS objTwo.
 */
OrbitalEngine.prototype.getDirection = function (objOne, objTwo) {
    var onePos, twoPos;
    var rawDist;
    var distance;

    onePos = numeric.clone(objOne.position);
    twoPos = numeric.clone(objTwo.position);

    rawDist = numeric.sub(twoPos, onePos);
    distance = this.getDistance(objOne, objTwo);

    return numeric.div(rawDist, distance);
};

/**
 * Get the acceleration for a single body.
 * @param {SpaceObject} active - determine force for this object.
 * @returns {Number}
 */
OrbitalEngine.prototype.getSingleAcceleration = function (active, primeCount) {
    var totalAcc, singleAcc;
    var _this = this;
    var distance, scalar;
    var tempVal;

    totalAcc = [0, 0];
    $.each(this.objectList, function (index, reference) {
        distance = numeric.sub(reference.getPosition(primeCount), active.getPosition(primeCount));
        scalar = numeric.norm2(distance);
        //direction points FROM active TO reference.
        tempVal = 0.0;
        if (Math.abs(scalar) > 0) {
            tempVal = (reference.mass) / (numeric.norm2Squared(distance));
        }
        singleAcc = numeric.mul(distance, tempVal);
        totalAcc = numeric.add(totalAcc, singleAcc);

    });
    tempVal = (this.gravConstant);
    totalAcc = numeric.mul(totalAcc, tempVal);
    return totalAcc;
};

/**
 * Get the potential energy associated with the given object
 * @param {SpaceObject} active
 * @returns {Number}
 */
OrbitalEngine.prototype.getSingleTotalPotential = function (active) {
    var totalPotential = 0.0;
    var _this = this;
    var distance;

    $.each(this.objectList, function (index, reference) {
        distance = _this.getDistance(active, reference);
        if (Math.abs(distance) > 0) {
            totalPotential += (reference.mass / distance);
        }

    });

    totalPotential = totalPotential * (-this.gravConstant);

    return totalPotential;
};

OrbitalEngine.prototype.getSingleKinetic = function (active) {
    var velocity = numeric.clone(active.velocity);
    var kinetic = 0.0;

    velocity = numeric.norm2Squared(velocity); // |v|^2
    kinetic = (1.0 / 2.0) * active.mass * velocity;

    return kinetic;
};

OrbitalEngine.prototype.getCenterOfMass = function () {
    var com = [0, 0];
    var xCom, yCom;
    var totalMass;

    xCom = 0.0;
    yCom = 0.0;
    totalMass = 0;
    $.each(this.objectList, function (index, element) {
        xCom += element.position[0] * element.mass;
        yCom += element.position[1] * element.mass;
        totalMass += element.mass;
    });
    com = [xCom, yCom];
    com = numeric.div(com, totalMass);
    return com;
};

OrbitalEngine.prototype.getTotalKineticEnergy = function () {
    var totalKinetic = 0.0;
    var _this = this;

    $.each(this.objectList, function (index, element) {
        totalKinetic += _this.getSingleKinetic(element);
    });

    return totalKinetic;
};

OrbitalEngine.prototype.getTotalPotentialEnergy = function () {
    var totalPotential = 0.0;
    var _this = this;

    $.each(this.objectList, function (index, element) {
        totalPotential += (element.mass * _this.getSingleTotalPotential(element));
    });

    return totalPotential;
};

