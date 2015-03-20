
var OrbitalViewer = new Object();

OrbitalViewer.pageInitialization = function (canvasContainer) {
    this.currentOrbit = null;
    this.drawInterval = null;
    this.simInterval = [];
    //
    this.canvasName = "orbital-canvas";
    this.traceName = "trace-canvas";
    this.globalScale = 100;
    this.axisWidth = 1;
    //
    this.totalKineticEnergy = 0.0;
    this.lastTotalKinetic = 0.0;

    this.totalPotentialEnergy = 0.0;
    this.lastPotentialEnergy = 0.0;
    //
    this.drawDelay = 30;
    this.simDelay = 60;
    //
    this.canvas = null;
    this.traceCanvas = null;
    this.graphCanvas = null;
    this.startCount = 0;
    this.energyBuffer = new RingBuffer(100);
    //
    this.initializeCanvas(canvasContainer);
    this.initializeEvents();
    this.resize();
    this.repaint();


    var initialOptions = {
        maintainAspectRatio: true,
        responsive: false,
        pointDot: false,
        datasetFill: false,
        bezierCurve: false
    };

    var labelSet = Array.apply(null, new Array(1))
            .map(String.prototype.valueOf, "");
    var initialData = {
        labels: labelSet,
        datasets: [
            {
                label: "Energies",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            }
        ]
    };
    this.lineChart = new Chart(OrbitalViewer.graphCanvas.getContext('2d')).Line(initialData, initialOptions);
    $("canvas.medium-layer").hide();

    this.drawInterval = setInterval(function () {
        OrbitalViewer.repaint();
    }, OrbitalViewer.drawDelay);

    this.buttonState = 0;
};

OrbitalViewer.updateContextButtontext = function () {
    OrbitalViewer.buttonState = (OrbitalViewer.buttonState + 1) % 3;
    switch (OrbitalViewer.buttonState) {
        case 0 :
        {
            // New Orbit
            $("#orbit-context .ui-button-text").text("New Orbit");
            break;
        }
        case 1 :
        {
            // Start Orbit
            $("#orbit-context .ui-button-text").text("Start Orbit");
            break;
        }
        case 2 :
        {
            // Stop Orbit
            $("#orbit-context .ui-button-text").text("Stop Orbit");
            break;
        }
    }
};

OrbitalViewer.contextButton = function () {
    switch (OrbitalViewer.buttonState) {
        case 0 :
        {
            // New Orbit
            OrbitalViewer.displayNewOrbit();
            break;
        }
        case 1 :
        {
            // Start Orbit
            OrbitalViewer.startOrbit();
            break;
        }
        case 2 :
        {
            // Stop Orbit
            OrbitalViewer.stopOrbit()
            break;
        }
    }
    OrbitalViewer.updateContextButtontext();
};

OrbitalViewer.initializeCanvas = function (canvasContainer) {
    var element = $("<canvas></canvas>");
    $(element).prop('id', this.canvasName);
    $(element).prop('class', 'top-layer');
    $(canvasContainer).append(element);

    OrbitalViewer.canvas = $("#" + this.canvasName)[0];

    element = $("<canvas></canvas>");
    $(element).prop('id', this.traceName);
    $(element).prop('class', 'bottom-layer');
    $(canvasContainer).append(element);
    OrbitalViewer.traceCanvas = $("#" + this.traceName)[0];

    element = $("<canvas></canvas>");
    $(element).prop('id', "graph-canvas");
    $(element).prop('class', 'medium-layer');
    $(canvasContainer).append(element);
    OrbitalViewer.graphCanvas = $("#graph-canvas")[0];

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
        window.innerHeight - (
                $(".ui-widget.ui-toolbar").outerHeight()
                + $(".ui-widget.ui-panel").outerHeight()
                )
    ];
    return pageExtent;
};

OrbitalViewer.resize = function () {
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;
    var pageExtent = OrbitalViewer.getPageExtent();

    $("html").width(winWidth);
    $("html").height(winHeight);

    $("#container-div").height(pageExtent[1]);
    $(".ui-widget.ui-toolbar, .ui-widget.ui-panel").width('100%');

    if (OrbitalViewer.canvas !== null && OrbitalViewer.canvas !== undefined) {
        OrbitalViewer.canvas.width = pageExtent[0];
        OrbitalViewer.canvas.height = pageExtent[1];
        OrbitalViewer.traceCanvas.width = pageExtent[0];
        OrbitalViewer.traceCanvas.height = pageExtent[1];

        OrbitalViewer.graphCanvas.width = (pageExtent[0] / 10);
        OrbitalViewer.graphCanvas.height = (pageExtent[0] / 10);

        $("canvas").css('top', $("#config").outerHeight());

        OrbitalViewer.redraw = true;
    }
};

OrbitalViewer.defaultSimulation = function () {
    OrbitalViewer.updateContextButtontext();
    var defaultSim = {
        "simulationId": "small-binary",
        "nBodies": 2,
        "totalMass": 2,
        "objectList": [
            {
                "objectId": 0,
                "objectName": "obj1",
                "objectMass": 1,
                "objectRadius": 1,
                "position": [-0.99, 0.00],
                "velocity": [0.00, -0.30],
                "render": {
                    "lineWidth": 2,
                    "strokeColour": "#FF9900",
                    "fillColourOne": "black",
                    "fillColourTwo": "#FFFF80"
                }
            },
            {
                "objectId": 1,
                "objectName": "obj2",
                "objectMass": 1,
                "objectRadius": 1,
                "position": [0.99, 0.00],
                "velocity": [0.00, 0.30],
                "render": {
                    "lineWidth": 2,
                    "strokeColour": "#00CCFF",
                    "fillColourOne": "#003300",
                    "fillColourTwo": "#0066FF"
                }
            }
        ]
    };
    this.initializeOrbit(JSON.stringify(defaultSim));
};


OrbitalViewer.displayNewOrbit = function () {
    var nBodies = 3;
    var fourierPrecision = 75;
    var timePrecision = 1000;

    var orbitalSolver = new OrbitalSolver(nBodies, fourierPrecision, timePrecision);
    var orbitDef = orbitalSolver.solve();
    if (orbitDef) {
        if (orbitDef.success) {
            $("#message-output").text("Solved new orbit : " + orbitDef.simulationId);
            OrbitalViewer.initializeOrbit(JSON.stringify(orbitDef));
        } else {
            var errMsg = orbitDef.errMsg || "Unknown Error";
            $("#message-output").text("Error encountered " + errMsg);
        }
    } else {
        $("#message-output").text("Unknown error encountered.");
    }
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

            OrbitalViewer.totalKineticEnergy = OrbitalViewer.orbit.getTotalKineticEnergy();
            OrbitalViewer.lastTotalKinetic = OrbitalViewer.totalKineticEnergy;

            OrbitalViewer.totalPotentialEnergy = OrbitalViewer.orbit.getTotalPotentialEnergy();
            OrbitalViewer.lastPotentialEnergy = OrbitalViewer.totalPotentialEnergy;
            //$("canvas.medium-layer").show();

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

OrbitalViewer.forceOrbit = function () {
    if (OrbitalViewer.buttonState !== 2) {
        OrbitalViewer.buttonState = 1;
        OrbitalViewer.updateContextButtontext();
    }
    OrbitalViewer.startOrbit();
};

OrbitalViewer.startOrbit = function () {
    if (this.orbit !== null) {
        this.simInterval.push(setInterval(function () {
            if (typeof OrbitalViewer.orbit === "undefined" || OrbitalViewer.orbit !== null) {
                OrbitalViewer.orbit.moveAllObjects();

                OrbitalViewer.lastTotalKinetic = OrbitalViewer.totalKineticEnergy;
                OrbitalViewer.totalKineticEnergy = OrbitalViewer.orbit.getTotalKineticEnergy();

                OrbitalViewer.lastPotentialEnergy = OrbitalViewer.totalPotentialEnergy;
                OrbitalViewer.totalPotentialEnergy = OrbitalViewer.orbit.getTotalPotentialEnergy();

                OrbitalViewer.energyBuffer.push(OrbitalViewer.totalKineticEnergy + OrbitalViewer.totalPotentialEnergy);

                OrbitalViewer.redraw = true;
            }
        }, OrbitalViewer.simDelay)
                );
        OrbitalViewer.startCount++;
        $("#start-number").text(OrbitalViewer.startCount);
    }
};

OrbitalViewer.stopOrbit = function () {
    var traceContext;
    var pageExtent = OrbitalViewer.getPageExtent();
    if (OrbitalViewer.orbit !== null) {
        OrbitalViewer.orbit = null;

        if (OrbitalViewer.simInterval !== null) {
            $.each(OrbitalViewer.simInterval, function (index, element) {
                clearInterval(element);
            });
        }
        OrbitalViewer.startCount = 0;
        OrbitalViewer.redraw = true;
        OrbitalViewer.repaint();

        traceContext = OrbitalViewer.traceCanvas.getContext('2d');
        traceContext.clearRect(-pageExtent[0] / 2.0, -pageExtent[1] / 2.0, 2 * pageExtent[0], 2 * pageExtent[1]);

        $("canvas.medium-layer").hide();
        OrbitalViewer.lineChart.datasets[0].data = [];
        OrbitalViewer.lineChart.update();

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

OrbitalViewer.writeSystemProperties = function (context) {
    var pageExtent = OrbitalViewer.getPageExtent();
    var fontSize = 15;
    var horizOffset = 10;
    var linePos = pageExtent[1] - fontSize;
    var decimalPlaces = 3;
    var sum, diff;

    if (context !== undefined && context !== null) {
        pageExtent = numeric.mul(pageExtent, (1.0 / 2.0));
        context.save();

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.font = fontSize + 'px Courier New';
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.lineWidth = 2;

        linePos -= fontSize;
        context.fillText("Force Count : " + OrbitalViewer.startCount, horizOffset, linePos);

        context.beginPath();
        context.moveTo(horizOffset, linePos - fontSize);
        context.lineTo(horizOffset + 160, linePos - fontSize);
        context.stroke();

        linePos -= fontSize + 10;
        context.fillText("Total K.E : " + (this.totalKineticEnergy).toFixed(decimalPlaces), horizOffset, linePos);
        diff = (this.totalKineticEnergy - this.lastTotalKinetic);
        if (diff > 0) {
            context.fillStyle = 'green';
        } else if (diff < 0) {
            context.fillStyle = 'red';
        }
        context.fillText(" [" + diff.toFixed(decimalPlaces) + "] ", horizOffset + 175, linePos);
        context.fillStyle = 'white';

        linePos -= fontSize;
        context.fillText("Total P.E : " + (this.totalPotentialEnergy).toFixed(decimalPlaces), horizOffset, linePos);
        diff = (this.totalPotentialEnergy - this.lastPotentialEnergy);
        if (diff > 0) {
            context.fillStyle = 'green';
        } else if (diff < 0) {
            context.fillStyle = 'red';
        }
        context.fillText(" [" + diff.toFixed(decimalPlaces) + "] ", horizOffset + 175, linePos);
        context.fillStyle = 'white';



        context.beginPath();
        context.moveTo(horizOffset, linePos - fontSize);
        context.lineTo(horizOffset + 160, linePos - fontSize);
        context.stroke();
        linePos -= fontSize + 10;
        sum = (this.totalKineticEnergy + this.totalPotentialEnergy);
        /*
         context.fillText("Avg. ENRG : " + (
         this.energyBuffer.getAverage()
         ).toFixed(decimalPlaces), horizOffset, linePos);
         */
        context.fillText("Total ENRG: " + (
                sum
                ).toFixed(decimalPlaces), horizOffset, linePos);
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
                context.translate(pageExtent[0], pageExtent[1]);
                trace.translate(pageExtent[0], pageExtent[1]);
                context.scale(OrbitalViewer.globalScale, -OrbitalViewer.globalScale);
                trace.scale(OrbitalViewer.globalScale, -OrbitalViewer.globalScale);
                // Axis Setup
                context.clearRect(-pageExtent[0], -pageExtent[1], 2.0 * pageExtent[0], 2.0 * pageExtent[1]);
                OrbitalViewer.drawGridSystem(context);
                OrbitalViewer.writeSystemProperties(context);
                //
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
