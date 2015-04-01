var OrbitalEngine = function (simId, config) {
    this.id = simId;
    this.dt = config.timeStep;
    this.gravConstant = config.gravConstant;
    this.maximumTime = config.maxTime;
    this.recordStep = config.recordStep;

    this.objectList = [];

    this.totalMass = 0.0;
    this.bodyCount = 0;

    this.elapsedTime = 0.0;
    this.loopCount = 0;

    this.recordEveryNSteps = (this.recordStep / this.dt);
    this.totalRecordCount = this.maximumTime / this.recordStep;

    this.currentRecord = 0;
    this.kineticMap = Array.apply(null,
            new Array(this.totalRecordCount))
            .map(Number.prototype.valueOf, 0);

    this.potentialMap = Array.apply(null,
            new Array(this.totalRecordCount))
            .map(Number.prototype.valueOf, 0);

    this.initialized = false;

    this.simulationComplete = false;
    //this.integrator = new LeapFrogIntegrator(this);
    this.integrator = new SymplecticIntegrator(this);
};

OrbitalEngine.prototype.initialize = function () {
    this.updateEnergyMaps();
    this.initialized = true;
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
    if (!this.simulationComplete && (this.elapsedTime < (this.maximumTime))) {
        var success = this.integrator.moveAllObjects();
        this.elapsedTime += this.dt;

        if (!success) {
            this.simulationComplete = true;
            console.log("Unable to move objects...");
        } else {
            if (this.loopCount % this.recordEveryNSteps === 0) {
                this.updateEnergyMaps();
            }
            this.loopCount = (this.loopCount + 1) % this.recordEveryNSteps;
        }
    } else {
        this.simulationComplete = true;
    }
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

OrbitalEngine.prototype.updateEnergyMaps = function () {

    this.kineticMap[ this.currentRecord ] = this.getKineticEnergySum();
    this.potentialMap[ this.currentRecord ] = this.getPotentialEnergySum();

    this.currentRecord += 1;
};

OrbitalEngine.prototype.getKineticEnergySum = function () {
    var totalKinetic = 0.0;
    var _this = this;

    $.each(this.objectList, function (index, element) {
        totalKinetic += _this.getSingleKinetic(element);
    });

    return totalKinetic;
};
OrbitalEngine.prototype.getSingleKinetic = function (active) {
    var velocity = numeric.clone(active.velocity);
    var kinetic = 0.0;
    velocity = numeric.norm2Squared(velocity); // |v|^2
    kinetic = (1.0 / 2.0) * active.mass * velocity;
    return kinetic;
};

OrbitalEngine.prototype.getPotentialEnergySum = function () {
    var totalPotential = 0.0;
    var singlePotential;
    var active, reference;
    var distance;

    for (var i = 0; i < this.objectList.length; i++) {
        singlePotential = 0.0;
        active = this.objectList[i];
        //if ((i + 1) < this.objectList.length) {
        for (var j = 0; j < this.objectList.length; j++) {
            reference = this.objectList[j];
            distance = this.getDistance(active, reference);
            if (Math.abs(distance) > 0) {
                singlePotential += (reference.mass / distance);
            }
        }
        singlePotential = (-this.gravConstant * active.mass * singlePotential);
        //}
        totalPotential += singlePotential;
    }
    return totalPotential;
};

OrbitalEngine.prototype.getCurrentEnergies = function () {
    return [
        this.kineticMap[ this.currentRecord - 1 ],
        this.potentialMap[ this.currentRecord - 1]
    ];
};

OrbitalEngine.prototype.getLastEnergies = function () {
    var lastEnergies = [0, 0];
    if (this.currentRecord >= 2) {
        lastEnergies[0] = this.kineticMap[ this.currentRecord - 2 ];
        lastEnergies[1] = this.potentialMap[ this.currentRecord - 2 ];
    }
    return lastEnergies;
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

/* *************************************************** */

/**
 * Get the acceleration for a single body.
 * @param {SpaceObject} active - determine force for this object.
 * @returns {Number}
 */
OrbitalEngine.prototype.getSingleAcceleration = function (active, primeCount) {
    var totalAcceleration;
    var _this = this;

    totalAcceleration = [0, 0];
    $.each(_this.objectList, function (index, reference) {
        var singleAcceleration = [0, 0];
        var singleMagnitude = 0;
        //
        if (reference.orbitalId !== active.orbitalId) {
            var directionVector = numeric.sub(reference.getPosition(primeCount), active.getPosition(primeCount)); //(R2-R1)
            var distance = numeric.norm2(directionVector); // |R2-R1|
            directionVector = numeric.div(directionVector, distance); // R-hat
            //
            if (Math.abs(distance) > 0) {
                singleMagnitude = (_this.gravConstant * reference.mass) / (distance * distance); // Gm/(r^2)
            }
            singleAcceleration = numeric.mul(directionVector, singleMagnitude); // |a| * R-hat
        }
        totalAcceleration = numeric.add(totalAcceleration, singleAcceleration);  // Sum A
    });

    return totalAcceleration;
};