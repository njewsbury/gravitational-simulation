/*global numeric */
var SpaceObject = function (jsonDef, universe) {

    this.id = -1;
    this.name = "Invalid";
    this.initialPos = [0, 0];
    this.initialVel = [0, 0];
    this.mass = 1;
    this.colour = 'black';
    this.traceColour = 'white';

    this.totalStepCount = 0;


    if (typeof jsonDef !== "undefined") {
        this.id = parseInt(jsonDef.id) || this.id;
        this.name = jsonDef.name || this.name;
        this.initialPos = jsonDef.initialPos || this.initialPos;
        this.initialVel = jsonDef.initialVel || this.initialVel;
        this.mass = jsonDef.mass || this.mass;
        this.colour = jsonDef.colour || this.colour;
        this.traceColour = jsonDef.traceColour || this.traceColour;
    }

    this.parent = null;
    if (typeof universe !== "undefined") {
        this.parent = universe;
    }

    this.lastDrawPosition = null;
    //
    this.lastPosition = [this.initialPos[0], this.initialPos[1]];
    this.position = [this.initialPos[0], this.initialPos[1]];
    this.interPosition = [this.position, this.position];
    //
    this.lastVelocity = [this.initialVel[0], this.initialVel[1]];
    this.velocity = [this.initialVel[0], this.initialVel[1]];
    this.interVelocity = [this.velocity, this.velocity];
    //
    this.lastAcceleration = [0, 0];
    this.acceleration = [0, 0];
    this.interAcceleration = [this.acceleration, this.acceleration];

    this.imgIsntLoaded = true;
    this.imgObj = $("#planet-img")[0];
    //this.imgObj.src = 'css/images/orbital-body.png';
};

SpaceObject.prototype.drawObject = function (context, trace, com, maxMass) {
    var _this = this;
    var drawPosition = [0, 0];
    var radius = this.getDrawRadius(maxMass);
    context.save();
    trace.save();
    //
    context.fillStyle = this.colour;
    trace.strokeStyle = this.traceColour;

    drawPosition = numeric.sub(this.position, com);

    context.save();
    
    context.createPattern(this.imgObj, 'no-repeat');
    context.scale(radius / 42.5, radius / 42.5); // image source is 85x85, cue magic math..
    var drawx = (drawPosition[0] * (42.5 / radius)) - radius * 85 * 3.5;
    var drawy = (drawPosition[1] * (42.5 / radius)) - radius * 85 * 3.5;

    context.drawImage(this.imgObj, drawx, drawy);
    context.restore();

    context.beginPath();
    context.arc(drawPosition[0], drawPosition[1], radius, 2.0 * Math.PI, false);
    context.fill();
    context.strokeStyle = '#FF6600';
    context.lineWidth = 2 / 100;
    context.strokeStyle = 'black';
    context.lineWidth = 1 / 100;
    context.stroke();

    //
    // Draw Acceleration, normalized to radius of sphere...
    if (typeof this.parent !== "undefined") {
        var acc = this.calculateGravitationalForce(this.parent.getGravitationalConstant(),
                this.parent.getObjectList());
        acc = numeric.div(acc, this.mass);
        context.beginPath();
        context.moveTo(drawPosition[0], drawPosition[1]);

        var unitDir = numeric.sub(acc, drawPosition);
        var mult = numeric.norm2(acc);
        var mag = this.getDrawRadius(maxMass);
        unitDir = numeric.div(unitDir, numeric.norm2(unitDir));


        if (mult < 1) {
            mag = mag * mult;
        } else {
            //mag = mag * 20;
        }
        unitDir = numeric.mul(unitDir, mag);
        unitDir = numeric.add(drawPosition, unitDir);
        context.lineTo(unitDir[0], unitDir[1]);
        context.strokeStyle = 'white';
        context.stroke();
    }
    if (this.lastDrawPosition !== null) {
        trace.strokeStyle = this.traceColour;
        trace.lineWidth = 1 / 100;
        trace.beginPath();
        trace.moveTo(this.lastDrawPosition[0], this.lastDrawPosition[1]);
        trace.lineTo(drawPosition[0], drawPosition[1]);
        trace.stroke();
    }
    this.lastDrawPosition = numeric.clone(drawPosition);
    //
    context.restore();
    trace.restore();
};

SpaceObject.prototype.getId = function () {
    return this.id - 1;
};

SpaceObject.prototype.increaseStepCount = function (timestep) {
    this.totalStepCount += timestep;
};

SpaceObject.prototype.getTotalStepCount = function () {
    return this.totalStepCount;
};

SpaceObject.prototype.setPosition = function (newPosition) {
    if (typeof newPosition !== "undefined") {
        this.lastPosition = numeric.clone(this.position);
        this.position = numeric.clone(newPosition);
    }
};
SpaceObject.prototype.getPosition = function (prime) {
    var pos = numeric.clone(this.position);

    if (typeof prime !== "undefined") {
        if (prime === 1) {
            pos = numeric.clone(this.interPosition[0]);
        } else if (prime === 2) {
            pos = numeric.clone(this.interPosition[1]);
        } else if (prime === -1) {
            pos = numeric.clone(this.lastPosition);
        }
    }
    return pos;
};

SpaceObject.prototype.addPosition = function (toAdd) {
    if (typeof toAdd !== "undefined") {
        this.lastPosition = numeric.clone(this.position);
        this.position = numeric.add(this.position, toAdd);
    }
};

SpaceObject.prototype.setIntermPosition = function (interm, prime) {
    if (typeof interm !== "undefined"
            && typeof prime !== "undefined") {
        if (prime === 1) {
            this.interPosition[0] = numeric.clone(interm);
        } else if (prime === 2) {
            this.interPosition[1] = numeric.clone(interm);
        }
    }
};

SpaceObject.prototype.getMass = function () {
    return this.mass;
};

SpaceObject.prototype.addMass = function (toAdd) {
    this.mass += toAdd;
};

SpaceObject.prototype.setAcceleration = function (newAcceleration) {
    if (typeof newAcceleration !== "undefined") {
        this.lastAcceleration = numeric.clone(this.acceleration);
        this.acceleration = numeric.clone(newAcceleration);
    }
};

SpaceObject.prototype.getAcceleration = function (prime) {
    var acc = numeric.clone(this.acceleration);

    if (typeof prime !== "undefined") {
        if (prime === 1) {
            acc = numeric.clone(this.interAcceleration[0]);
        } else if (prime === 2) {
            acc = numeric.clone(this.interAcceleration[1]);
        } else if (prime === -1) {
            acc = numeric.clone(this.lastAcceleration);
        }
    }
    return acc;
};

SpaceObject.prototype.addAcceleration = function (toAdd) {
    if (typeof toAdd !== "undefined") {
        this.lastAcceleration = numeric.clone(this.acceleration);
        this.acceleration = numeric.add(this.acceleration, toAdd);
    }
};

SpaceObject.prototype.setIntermAcceleration = function (interm, prime) {
    if (typeof interm !== "undefined"
            && typeof prime !== "undefined") {
        if (prime === 1) {
            this.interAcceleration[0] = numeric.clone(interm);
        } else if (prime === 2) {
            this.interAcceleration[1] = numeric.clone(interm);
        }
    }
};

SpaceObject.prototype.setVelocity = function (newVelocity) {
    if (typeof newVelocity !== "undefined") {
        this.lastVelocity = numeric.clone(this.velocity);
        this.velocity = numeric.clone(newVelocity);
    }
};

SpaceObject.prototype.getVelocity = function (prime) {
    var vel = numeric.clone(this.velocity);

    if (typeof prime !== "undefined") {
        if (prime === 1) {
            vel = numeric.clone(this.interVelocity[0]);
        } else if (prime === 2) {
            vel = numeric.clone(this.interVelocity[1]);
        } else if (prime === -1) {
            vel = numeric.clone(this.lastVelocity);
        }
    }
    return vel;
};

SpaceObject.prototype.addVelocity = function (toAdd) {
    if (typeof toAdd !== "undefined") {
        this.lastVelocity = numeric.clone(this.velocity);
        this.velocity = numeric.add(this.velocity, toAdd);
    }
};

SpaceObject.prototype.setIntermVelocity = function (interm, prime) {
    if (typeof interm !== "undefined"
            && typeof prime !== "undefined") {
        if (prime === 1) {
            this.interVelocity[0] = numeric.clone(interm);
        } else if (prime === 2) {
            this.interVelocity[1] = numeric.clone(interm);
        }
    }
};

SpaceObject.prototype.getDrawRadius = function (maxMass) {
    //A maximum mass obj at 100 scale should be 15 px...    
    var radius = (15 / 100) * (this.mass / maxMass);
    return radius;
};

/* *******************************************************
 * MOTION FUNCTIONS
 ******************************************************* */

SpaceObject.prototype.calculateGravitationalForce = function (gravConst, others, prime) {
    var totalInteraction = [0, 0];
    var singleInteraction;
    var activePosition = this.getPosition(prime);
    var thisActive = this.getId();
    if (typeof others !== "undefined" && others.length > 0) {
        $.each(others, function (i, other) {
            if (other.getId() !== thisActive) {

                singleInteraction = other.getGravitationalField(gravConst, activePosition, prime);
                singleInteraction = numeric.mul(singleInteraction, 1);

                if (typeof singleInteraction !== "undefined") {
                    totalInteraction = numeric.add(totalInteraction, singleInteraction);
                }
            }
        });
        totalInteraction = numeric.mul(totalInteraction, this.mass);
    }
    return totalInteraction;
};


SpaceObject.prototype.calculateKineticEnergy = function () {
    var kineticEnergy = 0;

    var currVel = numeric.norm2Squared(this.getVelocity());
    kineticEnergy = (1.0 / 1.0) * (this.mass) * (currVel);

    //console.log(kineticEnergy);
    return kineticEnergy;
};

SpaceObject.prototype.calculateGravitationalPotential = function (gravConstant, other) {
    var singlePotential = 0;
    var activePosition = this.getPosition();
    var thisActive = this.getId();

    var vector, distance;

    if (typeof other !== "undefined") {
        if (other.getId() !== thisActive) {
            vector = numeric.sub(other.getPosition(), activePosition);
            distance = numeric.norm2(vector);

            singlePotential = (-gravConstant * other.getMass());
            singlePotential = (singlePotential / distance);
        }
    }
    return singlePotential;
};

SpaceObject.prototype.getGravitationalField = function (gravConstant, point, prime) {
    var gravField = (-gravConstant * this.mass);
    var vector, distance;
    var hat;

    vector = [0, 0];
    if (typeof point !== "undefined") {
        //Vector points from THIS to POINT
        vector = numeric.sub(point, this.getPosition(prime));
        //Distance between THIS POSITION and POINT.
        distance = numeric.norm2(vector);
        hat = numeric.div(vector, distance);
        if (this.parent.getBodyCount() <= 2) {
            distance = numeric.norm2Squared(vector);
        }          
        gravField = (gravField / distance ); // |g| = (-GM/(r^2))
        vector = numeric.mul(hat, gravField); // g = (-GM/|r|^2) * r-hat
    }
    return vector;
};