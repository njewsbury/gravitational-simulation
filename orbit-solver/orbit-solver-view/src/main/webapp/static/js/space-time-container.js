/* global alertify, numeric */
var SpaceTimeContainer = function (jsonDef) {
    this.timeStep = 0.001;
    this.gravConstant = 1;
    this.maximumTime = -1;
    this.jsonObjList = [];
    this.useSymplectic = true;
    //
    this.spaceObjList = [];
    this.elapsedTime = 0;
    this.stepsTaken = 0;
    this.continueSimulation = true;
    this.mostMassive = 0;
    this.currentEnergy = 0;
    //
    this.pushEnergyValues = false;
    //
    this.integrator = null;
    if (typeof jsonDef !== "undefined") {
        this.timeStep = jsonDef.timeStep || this.timeStep;
        this.gravConstant = jsonDef.gravConstant || this.gravConstant;
        this.jsonObjList = jsonDef.objectList;
        this.maximumTime = jsonDef.maximumTime || this.maximumTime;
        if (typeof jsonDef.useSymplectic !== "undefined") {
            this.useSymplectic = jsonDef.useSymplectic;
        }
    } else {
        alertify.error("No defined JSON to build SpaceTimeContainer");
    }

    this.pushEnergyValues = (this.maximumTime > 0 &&
            (this.maximumTime / this.timeStep) < 100000);
    if (!this.pushEnergyValues) {
        alertify.log("Won't be recording energy states.");
    }
    this.kineticArray = [];
    this.potentialArray = [];
    this.energyArray = [];

    if (this.jsonObjList.length > 0) {
        var tempSpaceObj;
        for (var i = 0, sz = this.jsonObjList.length; i < sz; i++) {
            tempSpaceObj = new SpaceObject(this.jsonObjList[i], this);
            this.spaceObjList.push(tempSpaceObj);
            if (tempSpaceObj.getMass() > this.mostMassive) {
                this.mostMassive = tempSpaceObj.getMass();
            }
        }
    } else {
        alertify.error("No provided objects");
    }
    this.integrator = (this.useSymplectic)
            ? new SymplecticIntegrator(this)
            : new LeapFrogIntegrator(this);
};

SpaceTimeContainer.prototype.doTimeStep = function (direction) {
    var success = false;
    if (this.maximumTime < 0 || (this.elapsedTime < this.maximumTime)) {
        if (typeof this.integrator !== "undefined") {
            this.integrator.moveAllObjects();
            this.elapsedTime += this.timeStep;
            this.stepsTaken++;

            this.recordEnergyState();
            success = true;
        }
    }
    return success;
};

SpaceTimeContainer.prototype.recordEnergyState = function () {
    var totalEnergy = 0;
    var kinetic = 0, potential = 0;
    var _this = this;
    var active, other;
    if (typeof this.spaceObjList !== "undefined") {
        for (var i = 0, size = this.spaceObjList.length; i < size; i++) {
            active = this.spaceObjList[i];
            kinetic += active.calculateKineticEnergy();

            for (var j = 0; j < size; j++) {
                other = this.spaceObjList[j];
                potential += active.calculateGravitationalPotential(_this.gravConstant, other);
            }
        }
        //console.log("Total K :: " + kinetic );
        totalEnergy = (kinetic + potential);
        this.currentEnergy = totalEnergy;
        if (this.pushEnergyValues) {
            this.kineticArray.push(kinetic);
            this.potentialArray.push(potential);
            this.energyArray.push(totalEnergy);

        }
    }
};

SpaceTimeContainer.prototype.renderSpace = function (context, trace, extent) {
    var currentCenterOfMass = [0, 0];
    var maxMass = this.mostMassive;
    if (typeof this.spaceObjList !== "undefined" && this.spaceObjList.length > 0) {
        currentCenterOfMass = this.calculateCenterOfMass();
        $.each(this.spaceObjList, function (i, obj) {
            obj.drawObject(context, trace, currentCenterOfMass, maxMass);
        });
    }
};

SpaceTimeContainer.prototype.handleCollision = function (first, second) {
    var firstMass, secondMass;
    var explodeId;


    if (true && typeof first !== "undefined" && typeof second !== "undefined") {
        explodeId = second.getId();
        firstMass = first.getMass();
        secondMass = second.getMass();

        if (firstMass > secondMass) {
            first.addMass(secondMass);
            //first.addVelocity( numeric.div(second.getVelocity(), secondMass));
        } else if (firstMass < secondMass) {
            second.addMass(firstMass);
            //second.addVelocity(numeric.div(first.getVelocity(), firstMass ));
            explodeId = first.getId();
        } else {
            //theyre equal
            first.addMass(secondMass);
        }
        this.spaceObjList.splice(explodeId, 1);
    }
};

SpaceTimeContainer.prototype.calculateCenterOfMass = function () {
    var com = [0, 0];
    var totalMass = 0;
    var singleSet;

    if (typeof this.spaceObjList !== "undefined" && this.spaceObjList.length > 0) {
        $.each(this.spaceObjList, function (i, obj) {
            singleSet = numeric.mul(obj.getPosition(), obj.getMass());
            com = numeric.add(com, singleSet);
            totalMass += obj.getMass();
        });
        com = numeric.div(com, totalMass);
    }
    return com;
};

SpaceTimeContainer.prototype.getBodyCount = function () {
    var size = 0;
    if (typeof this.spaceObjList !== "undefined"
            && this.spaceObjList !== null) {
        size = this.spaceObjList.length;
    }
    return size;
};

SpaceTimeContainer.prototype.getObjectList = function () {
    return this.spaceObjList;
};
SpaceTimeContainer.prototype.getTimeStep = function () {
    return this.timeStep;
};

SpaceTimeContainer.prototype.getElapsedTime = function () {
    return this.elapsedTime;
};

SpaceTimeContainer.prototype.getTotalEnergy = function () {
    return this.currentEnergy;
};

SpaceTimeContainer.prototype.getMostMassive = function () {
    return this.mostMassive;
};

SpaceTimeContainer.prototype.getGravitationalConstant = function () {
    return this.gravConstant;
};

SpaceTimeContainer.prototype.getEnergyArray = function (which) {
    var arr = this.energyArray;
    if (typeof which !== "undefined") {
        if (which === "KINETIC") {
            arr = this.kineticArray;
        } else if (which === "POTENTIAL") {
            arr = this.potentialArray;
        } else if (which === "SMOOTHED") {
            arr = this.smoothedEnergy;
        }
    }
    return arr;
};