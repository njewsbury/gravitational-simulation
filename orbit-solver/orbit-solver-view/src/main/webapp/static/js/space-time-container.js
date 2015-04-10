
var SpaceTimeContainer = function (jsonDef) {
    this.timeStep = 0.001;
    this.gravConstant = 1;
    this.maximumTime = -1;
    this.jsonObjList = [];
    //
    this.spaceObjList = [];
    this.elapsedTime = 0;
    this.stepsTaken = 0;
    this.continueSimulation = true;
    this.mostMassive = 0;
    //
    this.integrator = new SymplecticIntegrator(this);

    if (typeof jsonDef !== "undefined") {
        this.timeStep = jsonDef.timeStep || this.timeStep;
        this.gravConstant = jsonDef.gravConstant || this.gravConstant;
        this.jsonObjList = jsonDef.objectList;
        this.maximumTime = jsonDef.maximumTime || this.maximumTime;
    } else {
        console.log("Error :: No defined JSON to build SpaceTimeContainer");
    }

    if (this.jsonObjList.length > 0) {
        var tempSpaceObj;
        for (var i = 0, sz = this.jsonObjList.length; i < sz; i++) {
            tempSpaceObj = new SpaceObject(this.jsonObjList[i], this);
            this.spaceObjList.push(tempSpaceObj);
            if( tempSpaceObj.getMass() > this.mostMassive ) {
                this.mostMassive = tempSpaceObj.getMass();
            }
        }
    } else {
        console.log("Error :: No provided objects");
    }
};

SpaceTimeContainer.prototype.doTimeStep = function (direction) {
    var success = false;
    if (typeof this.integrator !== "undefined") {
        this.integrator.moveAllObjects();
        this.elapsedTime += this.timeStep;
        this.stepsTaken++;
        success = true;
    }
    return success;
};

SpaceTimeContainer.prototype.renderSpace = function (context, trace, extent) {
    var currentCenterOfMass = [0, 0];
    var maxMass = this.mostMassive;
    if (typeof this.spaceObjList !== "undefined" && this.spaceObjList.length > 0) {
        
        $.each( this.spaceObjList, function(i, obj) {
            obj.drawObject(context, trace, currentCenterOfMass, maxMass);
        });
    }
};

SpaceTimeContainer.prototype.handleCollision = function( first, second ) {
    var firstMass, secondMass;
    var explodeId = second.getId();
    
    
    if( typeof first !== "undefined" && typeof second !== "undefined" ) {
        firstMass = first.getMass();
        secondMass = second.getMass();
        
        if( firstMass > secondMass ) {
            first.addMass( secondMass );
        } else if( firstMass < secondMass ) {
            second.addMass( firstMass );
            explodeId = first.getId();
        } else {
            //theyre equal
            first.addMass( secondMass );
        }
        this.spaceObjList.splice( explodeId, 1);
    }
};

SpaceTimeContainer.prototype.getObjectList = function () {
    return this.spaceObjList;
};
SpaceTimeContainer.prototype.getTimeStep = function() {
    return this.timeStep;
};

SpaceTimeContainer.prototype.getElapsedTime = function() {
    return this.elapsedTime;
};

SpaceTimeContainer.prototype.getTotalEnergy = function() {
    return 501;
};

SpaceTimeContainer.prototype.getMostMassive = function() {
    return this.mostMassive;
};