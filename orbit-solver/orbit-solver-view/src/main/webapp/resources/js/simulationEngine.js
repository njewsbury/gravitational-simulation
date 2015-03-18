var SimulationEngine = function (identifier, bodyCount, totalMass) {
    this.id = identifier;
    this.bodyCount = bodyCount;
    this.totalMass = totalMass;
    this.objectList = [];
};

SimulationEngine.prototype.insertOrbital = function (spaceObject) {
    this.objectList.push(spaceObject);
};

SimulationEngine.prototype.getOrbitalList = function () {
    return this.objectList;
};

/**
 *  Implementation of the verlet velocity 
 *
 */
SimulationEngine.prototype.moveAllObjects = function () {
    var _this = this;
    $.each(this.objectList, function (index, element) {
        _this.moveSingleObject(element);
    });


    $.each(this.objectList, function (index, element) {
        _this.updateObjectProperties(element);
    });

};

SimulationEngine.prototype.getTotalKineticEnergy = function () {
    var totalKinetic = 0.0;
    $.each(this.objectList, function (index, element) {
        totalKinetic += (0.5 * element.mass * (numeric.norm2Squared(element.velocity)));
    });
    return totalKinetic;
};

SimulationEngine.prototype.getTotalPotentialEnergy = function () {
    var totalPotential = 0.0;
    var distance;
    var _this = this;

    $.each(this.objectList, function (index, active) {

        $.each(_this.objectList, function (ind, reference) {
            if (ind !== index) {
                distance = _this.distance(active.position, reference.position);
                totalPotential += (
                        _this.getGravityPotential(active, reference) / distance
                        );
            }
        });
    });
    return totalPotential;
};

SimulationEngine.prototype.distance = function (r1, r2) {
    var dist = [0, 0];
    var distance = 0.0;
    //Distance Formula { (x2-x1)^2 + (y2-y1)^2 }^1/2
    dist[0] = r2[0] - r1[0];
    dist[1] = r2[1] - r1[1];

    //dist = ( [x2-x1], [y2-y1] )
    distance = numeric.norm2(dist);

    return distance;
};

/**
 * Get the gravitational potential between two objects.
 * U = -G*m1*m2/(|r2-r1|)
 * @param {type} active - the currently active object
 * @param {type} reference - the object finding the potential too
 * @returns {Number} Gravitational Potential between the two objects.
 */
SimulationEngine.prototype.getGravityPotential = function (active, reference) {
    var potential, distance;

    potential = 0.0;
    if (reference !== undefined && active !== undefined) {
        distance = this.distance(active.position, reference.position);
        if (Math.abs(distance) > 0.0) {
            potential = 1.1 * (-active.mass * reference.mass) / distance; //Big G is normalized to 1 for now.
        }
    }
    return potential;
};

/**
 * Get a unit vector pointing FROM reference TO active.
 * @param {SpaceObject} active
 * @param {SpaceObject} reference
 * @returns {Array} Unit vector pointing to active.
 */
SimulationEngine.prototype.getUnitVector = function (active, reference) {
    var unitVector = [0, 0];
    var magnitude = 1.0;

    unitVector[0] = (active.position[0] - reference.position[0]);
    unitVector[1] = (active.position[1] - reference.position[1]);

    magnitude = numeric.norm2(unitVector);
    unitVector = numeric.mul(unitVector, (1.0 / magnitude));

    return unitVector;
};

SimulationEngine.prototype.getNetForce = function (activeObject) {
    var netForce = [0, 0];
    var unitVector, singleForce;
    var distance, potential;

    var _this = this;
    $.each(this.objectList, function (index, element) {
        netForce = [0, 0];
        if (element.orbitalId !== activeObject.orbitalId) {
            singleForce = [0, 0];
            unitVector = _this.getUnitVector(activeObject, element);
            distance = _this.distance(activeObject.position, element.position);
            potential = _this.getGravityPotential(activeObject, element);

            singleForce = numeric.mul(unitVector, (potential / distance));
            netForce = numeric.add(netForce, singleForce);
        } // else they are the same object.
    });
    return netForce;
};

SimulationEngine.prototype.moveSingleObject = function (activeObject) {
    var currentForce, displacement;

    currentForce = this.getNetForce(activeObject);
    currentForce = numeric.mul((1.0 / activeObject.mass), currentForce);
    activeObject.setAcceleration(currentForce);

    displacement = activeObject.getVelocity();
    currentForce = numeric.mul(currentForce, (1.0 / 2.0));
    displacement = numeric.add(displacement, currentForce);

    activeObject.translate(displacement);
};

SimulationEngine.prototype.updateObjectProperties = function (activeObject) {
    var currentForce;
    var lastAcceleration;

    currentForce = this.getNetForce(activeObject);
    currentForce = numeric.mul(currentForce, (1.0 / activeObject.mass));

    lastAcceleration = activeObject.getAcceleration();
    activeObject.setAcceleration(currentForce);

    currentForce = numeric.add(currentForce, lastAcceleration);
    currentForce = numeric.mul(currentForce, (1.0 / 2.0));

    activeObject.changeVelocity(currentForce);

};

SimulationEngine.prototype.getCenterOfMass = function () {
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
    com = numeric.mul(com, (1.0 / totalMass));
    return com;
};