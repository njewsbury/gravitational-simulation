
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
    this.startCount = 0;

    //
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
    /*
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
     */
    var defaultSim = {
        'simulationId': 'default',
        'nBodies': 3,
        'totalMass': 3,
        'objectList': [
            {
                'objectId': 1,
                'objectName': 'obj1',
                'objectMass': 1,
                'objectRadius': 1,
                'position': [
                    -0.15925000049173832,
                    -0.009632525925990194
                ],
                'velocity': [
                    0.7812883926089853,
                    0.0014433338772505515
                ],
                'render': {
                    'lineWidth': 2,
                    'strokeColour': '#FF9900',
                    'fillColourOne': 'black',
                    'fillColourTwo': '#FFFF80'
                }
            },
            {
                'objectId': 2,
                'objectName': 'obj2',
                'objectMass': 1,
                'objectRadius': 1,
                'position': [
                    0.3565031820908189,
                    -0.0011078951484523713
                ],
                'velocity': [
                    1.0670570025686175,
                    -0.016867029299028218],
                'render': {
                    'lineWidth': 2,
                    'strokeColour': '#00CCFF',
                    'fillColourOne': '#003300',
                    'fillColourTwo': '#0066FF'
                }
            },
            {
                'objectId': 3,
                'objectName': 'obj3',
                'objectMass': 1,
                'objectRadius': 1,
                'position': [
                    1.5207050838507712,
                    0.007624188070185483
                ],
                'velocity': [
                    1.8437436767853796,
                    0.000756452267523855],
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
/*
 OrbitalViewer.defaultSimulation = function () {
 var defaultSim = {
 'simulationId': 'default',
 'nBodies': 2,
 'totalMass': 6,
 'objectList': [
 {
 'objectId': 1,
 'objectName': 'sun',
 'objectMass': 1,
 'objectRadius': 1,
 'position': [-0.995492, 0.00],
 'velocity': [0.00, 0.00],
 'render': {
 'lineWidth': 2,
 'strokeColour': '#FF9900',
 'fillColourOne': 'black',
 'fillColourTwo': '#FFFF80'
 }
 },
 {
 'objectId': 2,
 'objectName': 'earth',
 'objectMass': 1,
 'objectRadius': 1,
 'position': [0.995492, 0.00],
 'velocity': [0.00, 0.00],
 'render': {
 'lineWidth': 2,
 'strokeColour': '#00CCFF',
 'fillColourOne': '#003300',
 'fillColourTwo': '#0066FF'
 }
 },
 {
 'objectId': 3,
 'objectName': 'comet',
 'objectMass': 1,
 'objectRadius': 1,
 'position': [0.0, 0.00],
 'velocity': [0.695804, 1.067860],
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
 */
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
        OrbitalViewer.startCount++;
        $("#start-number").text(OrbitalViewer.startCount);
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
        traceContext.clearRect(-pageExtent[0] / 2.0, -pageExtent[1] / 2.0, 2 * pageExtent[0], 2 * pageExtent[1]);
    }
};

OrbitalViewer.restartLastOrbit = function () {
    if (OrbitalViewer.lastSimulation !== null) {
        OrbitalViewer.stopOrbit();
        OrbitalViewer.initializeOrbit(OrbitalViewer.lastSimulation);
    }
};

OrbitalViewer.clearTrace = function () {
    var traceContext;
    var pageExtent = OrbitalViewer.getPageExtent();
    pageExtent = numeric.mul(pageExtent, (1.0 / 2.0));

    if (OrbitalViewer.traceCanvas !== null) {
        traceContext = OrbitalViewer.traceCanvas.getContext('2d');

        traceContext.save();
        traceContext.setTransform(1, 0, 0, 1, 0, 0);
        traceContext.translate(pageExtent[0], pageExtent[1]);

        traceContext.clearRect(-pageExtent[0], -pageExtent[1], 2.0 * pageExtent[0], 2.0 * pageExtent[1]);
        traceContext.restore();
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
