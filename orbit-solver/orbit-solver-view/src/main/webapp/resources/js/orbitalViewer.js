
var OrbitalViewer = new Object();

OrbitalViewer.pageInitialization = function (canvasContainer) {
    this.currentOrbit = null;
    this.drawInterval = null;
    this.simInterval = null;
    //
    this.canvasName = "orbital-canvas";
    this.traceName = "trace-canvas";
    this.globalScale = 100;
    this.axisWidth = 1;
    //
    this.drawDelay = 30;
    this.simDelay = 60;
    //
    this.canvas = null;
    this.traceCanvas = null;

    this.initializeCanvas(canvasContainer);
    this.initializeEvents();

    this.resize();
    this.repaint();

    this.drawInterval = setInterval(function () {
        OrbitalViewer.repaint();
    }, OrbitalViewer.drawDelay);
};

OrbitalViewer.initializeCanvas = function (canvasContainer) {
    var element = $("<canvas></canvas>");
    $(element).prop('id', this.canvasName);
    $(element).prop('class', 'mid-layer');
    $(canvasContainer).append(element);

    OrbitalViewer.canvas = $("#" + this.canvasName)[0];
    
    element = $("<canvas></canvas>");
    $(element).prop('id', this.traceName);
    $(element).prop('class', 'bottom-layer');
    $(canvasContainer).append(element);
    OrbitalViewer.traceCanvas = $("#" + this.traceName)[0];
    
    if (this.canvas !== undefined && this.canvas !== null) {
        this.redraw = true;
    } else {
        console.log("Unable to initialize canvas element.");
    }
};

OrbitalViewer.initializeEvents = function () {
    window.addEventListener('resize', this.resize, false);
};

OrbitalViewer.getPageExtent = function () {
    var pageExtent = [
        window.innerWidth,
        window.innerHeight - $("#config").outerHeight()
    ];
    return pageExtent;
};

OrbitalViewer.resize = function () {
    var pageExtent = OrbitalViewer.getPageExtent();
    if (OrbitalViewer.canvas !== null && OrbitalViewer.canvas !== undefined) {
        OrbitalViewer.canvas.width = pageExtent[0];
        OrbitalViewer.canvas.height = pageExtent[1];
        OrbitalViewer.traceCanvas.width = pageExtent[0];
        OrbitalViewer.traceCanvas.height = pageExtent[1];
        
        $("canvas").css('top', $("#config").outerHeight());
        
        OrbitalViewer.redraw = true;
    }
};

OrbitalViewer.defaultSimulation = function () {
    var defaultSim = {
        'simulationId': 'default',
        'nBodies': 2,
        'totalMass': 6,
        'objectList': [
            {
                'objectId': 0,
                'objectName': 'sun',
                'objectMass': 5,
                'objectRadius': 5,
                'position': [0.00, 0.00],
                'velocity': [0.00, 0.00],
                'render': {
                    'lineWidth': 2,
                    'strokeColour': '#FF9900',
                    'fillColourOne': 'black',
                    'fillColourTwo': '#FFFF80'
                }
            },
            {
                'objectId': 1,
                'objectName': 'earth',
                'objectMass': 1,
                'objectRadius': 1,
                'position': [0.99, 0.00],
                'velocity': [0.00, 1.00],
                'render': {
                    'lineWidth': 2,
                    'strokeColour': '#00CCFF',
                    'fillColourOne': '#003300',
                    'fillColourTwo': '#0066FF'
                }
            }
        ]
    };
    this.initializeOrbit(JSON.stringify(defaultSim));
};

OrbitalViewer.initializeOrbit = function (simulationJson) {
    var orbitJson;
    var simName, simMass, simBodies;

    if (simulationJson !== undefined) {
        OrbitalViewer.lastSimulation = simulationJson;
        orbitJson = JSON.parse(simulationJson);

        if (orbitJson !== undefined && orbitJson !== null) {
            simName = orbitJson.simulationId;
            simMass = orbitJson.totalMass;
            simBodies = orbitJson.nBodies;

            OrbitalViewer.orbit = new SimulationEngine(simName, simBodies, simMass);
            $.each(orbitJson.objectList, function (index, element) {
                var orbital = new SpaceObject(element.objectId, element);
                if (orbital.validate()) {
                    OrbitalViewer.insertOrbitalObject(orbital);
                } else {
                    console.log("Unable to insert orbital :: ");
                    console.log(element);
                }
            });
            OrbitalViewer.repaint();
        }
    }
};

OrbitalViewer.insertOrbitalObject = function (orbital) {
    if (orbital !== null && orbital !== undefined) {
        if (OrbitalViewer.orbit !== null && OrbitalViewer.orbit !== undefined) {
            OrbitalViewer.orbit.insertOrbital(orbital);
            OrbitalViewer.redraw = true;
        }
    }
};

OrbitalViewer.startOrbit = function () {
    if (this.orbit !== null) {
        this.simInterval = setInterval(function () {
            OrbitalViewer.orbit.moveAllObjects();
            OrbitalViewer.redraw = true;
        }, OrbitalViewer.simDelay);
    }
};

OrbitalViewer.pauseOrbit = function () {
    if (this.orbit !== null) {
        if (this.simInterval !== null) {
            clearInterval(this.simInterval);
        }
    }
};

OrbitalViewer.stopOrbit = function () {
    var traceContext;
    var pageExtent = OrbitalViewer.getPageExtent();
    if (OrbitalViewer.orbit !== null) {
        OrbitalViewer.orbit = null;
        if (OrbitalViewer.simInterval !== null) {
            clearInterval(OrbitalViewer.simInterval);
        }
        OrbitalViewer.redraw = true;
        OrbitalViewer.repaint();
        
        traceContext = OrbitalViewer.traceCanvas.getContext('2d');
        traceContext.clearRect(-pageExtent[0]/2.0, -pageExtent[1]/2.0, 2*pageExtent[0], 2*pageExtent[1]);
    }
};

OrbitalViewer.restartLastOrbit = function () {
    if (OrbitalViewer.lastSimulation !== null) {
        OrbitalViewer.stopOrbit();
        OrbitalViewer.initializeOrbit(OrbitalViewer.lastSimulation);
    }
};

OrbitalViewer.drawGridSystem = function (context) {
    var pageExtent = OrbitalViewer.getPageExtent();

    if (context !== undefined && context !== null) {
        pageExtent = numeric.mul(pageExtent, (1.0 / 2.0));
        context.save();

        context.strokeStyle = 'red';
        context.lineWidth = (OrbitalViewer.axisWidth / OrbitalViewer.globalScale);

        context.beginPath();
        context.moveTo(-pageExtent[0], 0);
        context.lineTo(pageExtent[0], 0);
        context.stroke();

        context.beginPath();
        context.moveTo(0, -pageExtent[1]);
        context.lineTo(0, pageExtent[1]);
        context.stroke();

        context.restore();
    }
};

OrbitalViewer.repaint = function () {
    var centerOfMass = [0, 0];
    var context, trace;

    var pageExtent = OrbitalViewer.getPageExtent();
    pageExtent = numeric.mul(pageExtent, (1.0 / 2.0));
    if (OrbitalViewer.canvas !== null) {
        context = OrbitalViewer.canvas.getContext('2d');
        trace = OrbitalViewer.traceCanvas.getContext('2d');
        
        if (context !== undefined && context !== null) {
            if (OrbitalViewer.redraw === true) {
                if (OrbitalViewer.orbit !== null && OrbitalViewer.orbit !== undefined) {
                    centerOfMass = OrbitalViewer.orbit.getCenterOfMass();
                }
                // Context setup
                context.save();
                trace.save();
                
                context.setTransform(1, 0, 0, 1, 0, 0);
                trace.setTransform(1, 0, 0, 1, 0, 0);
                
                //
                //pageExtent = numeric.sub(pageExtent, centerOfMass);
                context.translate(pageExtent[0], pageExtent[1]);
                trace.translate(pageExtent[0], pageExtent[1]);
                
                context.scale(OrbitalViewer.globalScale, -OrbitalViewer.globalScale);
                trace.scale(OrbitalViewer.globalScale, -OrbitalViewer.globalScale);
                
                // Axis Setup
                context.clearRect(-pageExtent[0], -pageExtent[1], 2.0 * pageExtent[0], 2.0 * pageExtent[1]);
                //trace.clearRect(-pageExtent[0], -pageExtent[1], 2.0 * pageExtent[0], 2.0 * pageExtent[1]);
                
                OrbitalViewer.drawGridSystem(context);

                if (OrbitalViewer.orbit !== null && OrbitalViewer.orbit !== undefined) {
                    // Orbital Object Draw
                    $.each(OrbitalViewer.orbit.getOrbitalList(), function (index, element) {
                        element.draw(context, trace, OrbitalViewer.globalScale, pageExtent, centerOfMass);
                    });
                }

                context.restore();
                OrbitalViewer.redraw = false;
            }
        }
    }
};




/*
 OrbitalViewer.initialize = function (container) {
 this.canvasName = "draw-canvas";
 this.enabled = false;
 this.redraw = true;
 this.context = null;
 this.canvas = null;
 
 this.globalScale = 100;
 this.currentScale = [this.globalScale, -this.globalScale];
 
 this.axisStyle = "#FF0101";
 this.axisWidth = 1;
 
 this.repaintInterval = 300;
 this.moveInterval = 600;
 
 this.rootOrigin = [0, 0];
 
 this.simulationEngine = engine;
 
 this.createCanvas(container);
 if (this.enabled) {
 this.resize();
 }
 window.addEventListener('resize', this.resize, false);
 };
 
 OrbitalViewer.initializeDisplay = function () {
 if (this.enabled) {
 this.repaint();
 console.log("Display Initialized!");
 }
 };
 
 OrbitalViewer.startSimulation = function () {
 if (this.enabled) {
 this.intrvl = setInterval(function () {
 OrbitalViewer.repaint();
 }, OrbitalViewer.repaintInterval);
 
 this.moveIntrvl = setInterval(function () {
 OrbitalViewer.simulationEngine.moveAllObjects();
 OrbitalViewer.redraw = true;
 }, OrbitalViewer.moveInterval);
 } else {
 alert("Unable to start simulation due to errors!");
 }
 };
 
 OrbitalViewer.stop = function () {
 this.redraw = false;
 clearInterval(this.moveIntrvl);
 clearInterval(this.intrvl);
 this.clearCanvas();
 
 };
 
 OrbitalViewer.insertObject = function (spaceObject) {
 this.simulationEngine.insertOrbital(spaceObject);
 this.redraw = true;
 };
 
 OrbitalViewer.clearCanvas = function () {
 
 if (this.context !== undefined) {
 this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
 }
 };
 
 OrbitalViewer.createCanvas = function (container) {
 var element = $("<canvas></canvas>");
 $(element).prop('id', this.canvasName);
 
 $(container).append(element);
 this.canvas = $("#" + this.canvasName)[0];
 if (this.canvas !== undefined && this.canvas !== null) {
 this.context = this.canvas.getContext('2d');
 if (this.context !== undefined && this.context !== null) {
 this.enabled = true;
 this.redraw = true;
 } else {
 console.log("Unable to get 2DContext from canvas.");
 }
 } else {
 console.log("Unable to initialize canvas element.");
 }
 };
 
 OrbitalViewer.resize = function () {
 OrbitalViewer.canvas.width = window.innerWidth;
 OrbitalViewer.canvas.height = window.innerHeight - $("#config").outerHeight();
 OrbitalViewer.redraw = true;
 };
 
 OrbitalViewer.repaintAxes = function (context, canvas, com) {
 var oldStyle, oldWidth, oldOpacity;
 var widthLimit, heightLimit;
 oldStyle = context.strokeStyle;
 oldWidth = context.lineWidth;
 oldOpacity = context.globalAlpha;
 
 context.strokeStyle = OrbitalViewer.axisStyle;
 context.lineWidth = OrbitalViewer.axisWidth / OrbitalViewer.currentScale[0];
 context.globalAlpha = 0.5;
 //com = numeric.mul(OrbitalViewer.currentScale[0], com);
 widthLimit = (canvas.width + com[0]) / 2.0;
 heightLimit = (canvas.height + com[1]) / 2.0;
 
 context.beginPath();
 context.moveTo(-widthLimit, 0);
 context.lineTo(widthLimit, 0);
 context.stroke();
 
 context.beginPath();
 context.moveTo(0, -heightLimit);
 context.lineTo(0, heightLimit);
 context.stroke();
 
 context.strokeStyle = oldStyle;
 context.lineWidth = oldWidth;
 context.globalAlpha = oldOpacity;
 };
 
 OrbitalViewer.repaint = function () {
 var context = OrbitalViewer.context;
 var canvas = OrbitalViewer.canvas;
 var objList;
 var com = [0, 0];
 var widthLimit, heightLimit;
 // LOW LAYER
 if (OrbitalViewer.redraw) {
 //com = OrbitalViewer.simulationEngine.getCenterOfMass();
 com = [1, 1];
 if (com === undefined) {
 com = [0, 0];
 }
 //com = numeric.mul(OrbitalViewer.currentScale[0], com);
 
 console.log("COM :: " + com[0] + ", " + com[1]);
 widthLimit = (canvas.width - com[0]) / 2.0;
 heightLimit = (canvas.height - com[1]) / 2.0;
 console.log("WL : " + widthLimit + " HL: " + heightLimit);
 
 // LOWER LAYER
 context.setTransform(1, 0, 0, 1, 0, 0);
 OrbitalViewer.clearCanvas();
 context.translate(widthLimit, heightLimit);
 this.context.scale(OrbitalViewer.currentScale[0], OrbitalViewer.currentScale[1]);
 
 // MEDIUM LAYER
 
 // OBJECT LAYER
 
 objList = OrbitalViewer.simulationEngine.objectList;
 if (objList !== null && objList !== undefined) {
 $.each(objList, function (index, element) {
 element.draw(context, OrbitalViewer.currentScale, com, OrbitalViewer.rootOrigin);
 });
 }
 OrbitalViewer.repaintAxes(context, canvas, com);
 
 context.beginPath();
 context.fillStyle = "#0F00F1";
 context.arc(com[0], com[1], 2 / (OrbitalViewer.globalScale), 2.0 * Math.PI, false);
 context.fill();
 
 OrbitalViewer.redraw = false;
 }
 };
 */