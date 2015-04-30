/*global numeric,alertify,Base64, SolverUtil*/


/*
 *  REAL TIME PAGE JS
 * 
 *  UI Interaction functions and Gravitational simulation
 *  control (and rendering)
 *  
 *  @author Nathan Jewsbury
 */
// shim requestAnimFrame with setTimeout fallback
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60); //default 60fps
            };
})();

/*
 * http://stackoverflow.com/a/3855394
 * jQuery plugin to allow easy query string parsing.
 */
(function ($) {
    $.QueryString = (function (a) {
        if (a === "")
            return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p = a[i].split('=');
            if (p.length !== 2)
                continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
})(jQuery);

var RealTimePage = new Object();
/* ****************
 * INITIALIZE PARAMS 
 * **************** */
RealTimePage.initialize = function () {
    RealTimePage.preferredResolution = [1920, 1080];
    RealTimePage.renderScale = [100, 100];
    RealTimePage.contextButtonState = 0;
    RealTimePage.canvasOffset = 0;

    RealTimePage.queryParam = $.QueryString["seed"];
    RealTimePage.bodyParam = $.QueryString["bodyCount"];

    // Input Value Ranges
    RealTimePage.currentSettings = new OrbitalParams({
        "nBodies": RealTimePage.bodyParam || 3,
        "timeStep": 0.05,
        "timePrecision": 250,
        "equalMasses": true,
        "symplectic": true,
        "maximumMass": 1,
        "maximumTime": 100,
        "solutionSeed": RealTimePage.queryParam
    });

    RealTimePage.fps = 60;
    RealTimePage.currentTimeoutId = null;

    RealTimePage.simCanvas = $("#simulation-canvas")[0];
    RealTimePage.traceCanvas = $("#trace-canvas")[0];
    RealTimePage.initialized = false;
    RealTimePage.universe = null;

    if (typeof RealTimePage.simCanvas !== "undefined"
            && typeof RealTimePage.traceCanvas !== "undefined") {
        RealTimePage.initialized = true;
    }

    //INITIALIZE UI
    RealTimePage.resize();

    RealTimePage.createSettingsDialog(RealTimePage.currentSettings);
    //FUNCTION SETUP
    $("button").button();
    $("a").button();
    window.addEventListener('resize', RealTimePage.resize, false);
    $("#simulation-settings").on('click', RealTimePage.showSettings);
    $("#simulation-clear-trace").on('click', function () {
        RealTimePage.clearAllCanvas(true);
    });
    $("#simulation-step-forward").on('click', RealTimePage.simulationSingleStep);
    $("#simulation-context-button").on('click', RealTimePage.contextButtonPress);

    $("#simulation-report").on('click', RealTimePage.viewReport);
    $("#simulation-download").on('click', RealTimePage.downloadImage);

    $("#simulation-download").prop('disabled', true);
    $("#simulation-report").prop('disabled', true);
    $("#simulation-step-forward").prop('disabled', true);

    //alertify.success( Base64.encode(new Date().toDateString()));

};

/* **************** 
 * PAGE UI FUNCTIONS 
 * **************** */
RealTimePage.resize = function () {
    var viewportWidth = $("body").width();
    var viewportHeight = $("body").height();
    var canvasWidth, canvasHeight;

    if (RealTimePage.initialized) {
        $("#realtime-container").width(viewportWidth);
        $("#realtime-container").height(viewportHeight);

        canvasWidth = $("#simulation-view").width();
        canvasHeight = $("#simulation-view").height();

        RealTimePage.simCanvas.width = canvasWidth;
        RealTimePage.simCanvas.height = canvasHeight;
        RealTimePage.traceCanvas.width = canvasWidth;
        RealTimePage.traceCanvas.height = canvasHeight;

        RealTimePage.redrawCanvasElements();
    }

};
/**
 * 
 * @param {OrbitalParams} defaultValues
 */
RealTimePage.createSettingsDialog = function (defaultValues) {
    $("#simulation-settings-dialog").dialog({
        autoOpen: false,
        buttons: [
            {
                text: "Apply",
                click: function () {
                    RealTimePage.applySettings();
                    $(this).dialog("close");
                }
            },
            {
                text: "Cancel",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ]
    });
    $("select#n-bodies").val(defaultValues.getBodyParam().toString());
    $("input#time-steps").val(defaultValues.getTimeStepParam());
    $("input#equal-masses").prop('checked', defaultValues.isEqualMass());
    $("input#symplectic").prop("checked", defaultValues.isSymplectic());
    $("input#maximum-mass").val(defaultValues.getMaximumMass());
    $("input#maximum-time").val(defaultValues.getMaximumTime());
    $("input#time-precision").val(defaultValues.getTimePrecision());
    if (typeof defaultValues.getSolutionSeed() !== "undefined") {
        $("input#solution-seed").val(defaultValues.getSolutionSeed());
    }
};



RealTimePage.simulationSingleStep = function () {
    RealTimePage.forwardStepCount++;
    RealTimePage.doSingleStep(1);
};

/**
 * Force the simulation to take a single time step.
 */
RealTimePage.doSingleStep = function (direction) {
    if (typeof RealTimePage.universe !== "undefined"
            && RealTimePage.universe.doTimeStep(direction)) {
        RealTimePage.redrawCanvasElements();
    } else {
        alertify.success("Simulation Complete. Report is available for viewing.");
        RealTimePage.simulationRunning = false;
        RealTimePage.contextButtonPress();
    }
};


/**
 * Force the simulation to run at 60fps until the simulation
 * is complete.
 */
RealTimePage.runSimulation = function () {
    RealTimePage.currentTimeoutId = setTimeout(function () {
        if (RealTimePage.simulationRunning) {
            RealTimePage.doSingleStep(1);
            window.requestAnimFrame(RealTimePage.runSimulation);
            RealTimePage.redrawCanvasElements();
        }
    }, (1000 / RealTimePage.fps));
};

/**
 * Using defined properties, solve for a new choreograph, if
 * the user defines a seed matching a predefined one, load up
 * those particular properties.  
 */
RealTimePage.solveNewChoreograph = function () {
    var solutionSeed = RealTimePage.currentSettings.getSolutionSeed();

    if (typeof solutionSeed !== "undefined" && (solutionSeed.trim()).length > 0) {
        if (solutionSeed === "${DEFAULT}") {
            RealTimePage.universe = new SpaceTimeContainer({
                "timeStep": RealTimePage.currentSettings.getTimeStepParam(),
                "gravConstant": 1,
                "maximumTime": RealTimePage.currentSettings.getMaximumTime(),
                "useSymplectic": RealTimePage.currentSettings.isSymplectic(),
                "simulationType": "manual",
                "objectList": [
                    {
                        "id": 1,
                        "name": "body-one",
                        "initialPos": [-1, 0],
                        "initialVel": [0, 2.5],
                        "mass": 1,
                        "colour": "rgba(255,102,0,0.5)",
                        "traceColour": "rgba(255,102,0,1)"
                    },
                    {
                        "id": 2,
                        "name": "body-two",
                        "initialPos": [0.0, 0],
                        "initialVel": [0, 0],
                        "mass": 5,
                        "colour": "#0A0AFF",
                        "traceColour": "#0B0BFF"
                    }
                ]
            });
        } else if (solutionSeed === "${THREE}") {
            RealTimePage.universe = new SpaceTimeContainer({
                "timeStep": RealTimePage.currentSettings.getTimeStepParam(),
                "gravConstant": 1,
                "maximumTime": RealTimePage.currentSettings.getMaximumTime(),
                "useSymplectic": RealTimePage.currentSettings.isSymplectic(),
                "simulationType": "solved",
                "objectList": [
                    {
                        "id": 1,
                        "name": "body-one",
                        "initialPos": [-1.0476468689142076, -0.23909615329193726],
                        "initialVel": [-0.22590654649660127, 1.0505409928011857],
                        "mass": 1,
                        "colour": "rgba(255,102,0,0.3)",
                        "traceColour": "rgba(255,102,0,0.8)"
                    },
                    {
                        "id": 2,
                        "name": "body-two",
                        "initialPos": [0.3167601013003253, 1.0268368721249914],
                        "initialVel": [1.0227484621390825, -0.3296296887855502],
                        "mass": 1,
                        "colour": "rgba(50,10,255,0.3)",
                        "traceColour": "rgba(50,10,255,1)"
                    },
                    {
                        "id": 3,
                        "name": "body-three",
                        "initialPos": [0.7308867739598754, -0.7877407255617989],
                        "initialVel": [-0.7968419174405968, -0.7209113096472372],
                        "mass": 1,
                        "colour": "rgba(10,180,65,0.3)",
                        "traceColour": "rgba(10,180,65,1)"
                    }
                ]
            });
        } else if (solutionSeed === "${FOUR}") {
            RealTimePage.universe = new SpaceTimeContainer({
                "timeStep": RealTimePage.currentSettings.getTimeStepParam(),
                "gravConstant": 1,
                "maximumTime": RealTimePage.currentSettings.getMaximumTime(),
                "useSymplectic": RealTimePage.currentSettings.isSymplectic(),
                "simulationType": "solved",
                "objectList": [
                    {
                        "id": 1,
                        "name": "body-one",
                        "initialPos": [1.382857, 0],
                        "initialVel": [0, 0.584873],
                        "mass": 2.5,
                        "colour": "#FF6600",
                        "traceColour": "#FF6600"
                    },
                    {
                        "id": 2,
                        "name": "body-two",
                        "initialPos": [0.0, 0.157030],
                        "initialVel": [1.871935, 0],
                        "mass": 2.5,
                        "colour": "#0A0AFF",
                        "traceColour": "#0B0BFF"
                    },
                    {
                        "id": 3,
                        "name": "body-three",
                        "initialPos": [-1.382857, 0],
                        "initialVel": [0.0, -0.584873],
                        "mass": 2.5,
                        "colour": "#01AA01",
                        "traceColour": "#01AA01"
                    },
                    {
                        "id": 4,
                        "name": "body-four",
                        "initialPos": [0, -0.157030],
                        "initialVel": [-1.871935, 0.0],
                        "mass": 2.5,
                        "colour": "#01AA01",
                        "traceColour": "#01AA01"
                    }
                ]
            });
        } else {
            RealTimePage.solveChoreography(solutionSeed);
        }
    } else {
        RealTimePage.solveChoreography("");
    }
};

/**
 * Using the given seed value, solve for a new choreograph.
 */
RealTimePage.solveChoreography = function (seedvalue) {
    if (typeof RealTimePage.currentSettings !== "undefined"
            && RealTimePage.currentSettings !== null) {
        var solutionSeed = seedvalue;

        if (typeof solutionSeed !== "undefined" && (solutionSeed.trim()).length > 0) {
            $("#seed-section").text(solutionSeed);
            solutionSeed = Base64.decode(solutionSeed.replace(/-/g, "="));
        } else {
            solutionSeed = Date.now().toString();
            $("#seed-section").text(Base64.encode(solutionSeed).replace(/=/g, "-"));
        }
        var config = {
            "nBodies": RealTimePage.currentSettings.getBodyParam(),
            "precision": [
                1, RealTimePage.currentSettings.getTimePrecision()
            ],
            "equalMasses": RealTimePage.currentSettings.isEqualMass(),
            "maximumMass": RealTimePage.currentSettings.getMaximumMass(),
            "gravConst": 1,
            "seedValue": solutionSeed
        };

        var solverConfig = new SolverParams(config);
        SolverUtil.setParams(solverConfig);
        SolverUtil.minimizeFunction(RealTimePage.solvedChoreography);
    } else {
        alertify.error("Unable to solve for choreography!");
    }
};

/**
 * Callback function, this is called AFTER the solver is done minimizing the action,
 * initializes the simulation properties and creates a new SpaceTimeContainer.
 */
RealTimePage.solvedChoreography = function () {
    var choreographJson = SolverUtil.getOrbitJson();
    choreographJson.timeStep = RealTimePage.currentSettings.getTimeStepParam();
    choreographJson.maximumTime = RealTimePage.currentSettings.getMaximumTime();
    choreographJson.useSymplectic = RealTimePage.currentSettings.isSymplectic();

    RealTimePage.universe = new SpaceTimeContainer(choreographJson);
};
/* ****************
 * PAGE ACTION FUNCTIONS 
 * **************** */
RealTimePage.downloadImage = function () {
    var traceLayer = RealTimePage.traceCanvas;
    var downloadLink = $("#download-image")[0];


    var imgContext = RealTimePage.simCanvas.getContext('2d');

    imgContext.drawImage(traceLayer, 0, 0);

    var img = RealTimePage.simCanvas.toDataURL("image/png");
    var currDate = new Date();

    var dateString = currDate.toDateString();
    dateString = dateString.replace(/\s+/g, '-').toLowerCase();
    dateString += ("-" + currDate.getHours() + "-" + currDate.getMinutes() + "-" + currDate.getSeconds());

    downloadLink.href = img;
    downloadLink.download = "Choreography-" + dateString + ".png";

    downloadLink.click();
    downloadLink.href = "#";
};
RealTimePage.contextButtonPress = function () {
    switch (RealTimePage.contextButtonState) {
        case 0:
            //Button was 'new orbit'
            $("#simulation-step-forward").prop('disabled', false);
            $("#simulation-download").prop('disabled', true);
            $("#simulation-report").prop("disabled", true);
            // Solve for new orbit
            RealTimePage.resize();
            RealTimePage.clearAllCanvas();
            RealTimePage.redrawCanvasElements();
            RealTimePage.solveNewChoreograph();
            RealTimePage.redrawCanvasElements();
            //New state is 'Start Orbit'
            if (RealTimePage.universe !== null) {
                RealTimePage.contextButtonState = 1;
                $("button#simulation-context-button span").text("Start Orbit");
            } else {
                alertify.error("Unable to calculate universe.");
            }
            break;
        case 1:
            //Button was 'start orbit'
            $("#simulation-step-forward").prop("disabled", true);
            // Start the orbit
            RealTimePage.simulationRunning = true;
            RealTimePage.runSimulation();
            //New State is 'Stop Orbit'
            RealTimePage.contextButtonState = 2;
            $("button#simulation-context-button span").text("Stop Orbit");
            break;
        case 2:
            //Button was 'Stop Orbit'
            $("#simulation-report").prop("disabled", false);
            $("#simulation-download").prop('disabled', false);

            //End the orbit
            RealTimePage.simulationRunning = false;
            clearTimeout(RealTimePage.currentTimeoutId);
            //New State is 'New Orbit'
            RealTimePage.contextButtonState = 0;
            $("button#simulation-context-button span").text("New Orbit");
            break;
    }
};


RealTimePage.showSettings = function () {
    $("#simulation-settings-dialog").dialog("open");
};

RealTimePage.applySettings = function () {
    var solutionSeed = $("#solution-seed").val();
    if (typeof solutionSeed === "undefined" || solutionSeed.trim().length <= 0) {
        solutionSeed = undefined;
    }
    var jsonParams = {
        "nBodies": $("#n-bodies").val(),
        "timeStep": $("#time-steps").val(),
        "timePrecision": $("#time-precision").val(),
        "equalMasses": $("#equal-masses").is(":checked"),
        "symplectic": $("#symplectic").is(":checked"),
        "maximumMass": $("#maximum-mass").val(),
        "maximumTime": $("#maximum-time").val(),
        "solutionSeed": solutionSeed
    };

    var orbitalParams = new OrbitalParams(jsonParams);
    if (orbitalParams.validateInput()) {
        RealTimePage.currentSettings = orbitalParams;
    } else {
        $("#error-text").text(orbitalParams.getMessage());
    }
};

/**
 * Loads up the energy report for the last run simulation and displays it
 * using ChartJS
 */
RealTimePage.viewReport = function () {
    var labelArray = [];
    var energyReport, kinetic, potential, smoothed;
    if (RealTimePage.universe !== null) {
        energyReport = RealTimePage.universe.getEnergyArray();
        kinetic = RealTimePage.universe.getEnergyArray("KINETIC");
        potential = RealTimePage.universe.getEnergyArray("POTENTIAL");
        smoothed = RealTimePage.universe.getEnergyArray("SMOOTHED");

        if (typeof energyReport !== "undefined" && energyReport.length > 0) {
            for (var i = 0, sz = energyReport.length, mod = sz * 0.01; i < sz; i++) {
                if (i % (mod) === 0) {
                    labelArray.push(i);
                } else {
                    labelArray.push("");
                }
            }

            var energyDataset = {
                label: "Total Energy",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: energyReport
            };

            var kineticDataset = {
                label: "Kinetic Energy",
                fillColor: "rgba(255,51,0,0.2)",
                strokeColor: "rgba(255,51,0,1)",
                pointColor: "rgba(255,51,0,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255,51,0,1)",
                data: kinetic
            };
            var potentialDataset = {
                label: "Potential Energy",
                fillColor: "rgba(102,255,255,0.2)",
                strokeColor: "rgba(102,255,255,1)",
                pointColor: "rgba(102,255,255,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(102,255,255,1)",
                data: potential
            };


            var reportData = {
                labels: labelArray,
                datasets: [
                    kineticDataset,
                    energyDataset,
                    potentialDataset
                ]
            };

            RealTimePage.renderReport(reportData);
        } else {
            alertify.error("Unable to render report.");
        }
    }
};

/* ****************
 * PAGE RENDERING FUNCTIONS 
 * **************** */

RealTimePage.redrawCanvasElements = function () {
    var canvasExtent = numeric.div([
        RealTimePage.simCanvas.width,
        RealTimePage.simCanvas.height
    ], 2);

    var simContext = RealTimePage.simCanvas.getContext('2d');
    var traceContext = RealTimePage.traceCanvas.getContext('2d');

    simContext.save();
    traceContext.save();
    // ***** //
    simContext.setTransform(1, 0, 0, 1, 0, 0);
    traceContext.setTransform(1, 0, 0, 1, 0, 0);
    //
    simContext.translate(canvasExtent[0], canvasExtent[1]);
    traceContext.translate(canvasExtent[0], canvasExtent[1]);
    //
    simContext.scale(RealTimePage.renderScale[0],
            -RealTimePage.renderScale[1]);
    traceContext.scale(RealTimePage.renderScale[0],
            -RealTimePage.renderScale[1]);

    simContext.clearRect(-canvasExtent[0], -canvasExtent[1],
            2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);

    RealTimePage.redrawCoordinateAxis(simContext, canvasExtent);
    if (typeof RealTimePage.universe !== "undefined" &&
            RealTimePage.universe !== null) {
        RealTimePage.redrawSpace(simContext, traceContext, canvasExtent);
    }
    RealTimePage.redrawDetails(simContext, canvasExtent);

    // ***** //
    traceContext.restore();
    simContext.restore();

};

RealTimePage.clearAllCanvas = function (onlyTrace) {
    var simContext = RealTimePage.simCanvas.getContext('2d');
    var traceContext = RealTimePage.traceCanvas.getContext('2d');
    var clearOnlyTrace = onlyTrace || false;
    var canvasExtent = numeric.div([
        RealTimePage.simCanvas.width,
        RealTimePage.simCanvas.height
    ], 2);

    simContext.save();
    traceContext.save();
    //
    simContext.setTransform(1, 0, 0, 1, 0, 0);
    traceContext.setTransform(1, 0, 0, 1, 0, 0);
    //
    simContext.translate(canvasExtent[0], canvasExtent[1]);
    traceContext.translate(canvasExtent[0], canvasExtent[1]);
    //
    simContext.scale(RealTimePage.renderScale[0],
            -RealTimePage.renderScale[1]);

    traceContext.scale(RealTimePage.renderScale[0],
            -RealTimePage.renderScale[1]);
    //
    if (!clearOnlyTrace) {
        simContext.clearRect(-canvasExtent[0], -canvasExtent[1],
                2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);
    }
    traceContext.clearRect(-canvasExtent[0], -canvasExtent[1],
            2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);
    //            
    simContext.restore();
    traceContext.restore();
};

RealTimePage.redrawCoordinateAxis = function (context, extent) {

    if (typeof context !== "undefined"
            && typeof extent !== "undefined") {

        context.save();
        //
        context.strokeStyle = '#FF6600';
        context.lineWidth = (1 / RealTimePage.renderScale[0]);

        //Horizontal Axis
        context.beginPath();
        context.moveTo(-extent[0], 0);
        context.lineTo(extent[0], 0);
        context.stroke();

        context.lineWidth = (1 / RealTimePage.renderScale[1]);
        context.beginPath();
        context.moveTo(0, -extent[1]);
        context.lineTo(0, extent[1]);
        context.stroke();
        //
        context.restore();
    }

};

RealTimePage.redrawSpace = function (context, trace, extent) {
    if (typeof context !== "undefined"
            && typeof extent !== "undefined") {
        if (typeof trace !== "undefined") {
            context.save();
            trace.save();
            //
            if (typeof RealTimePage.universe !== "undefined" &&
                    RealTimePage.universe !== null) {
                RealTimePage.universe.renderSpace(context, trace, extent);
            }
            //
            trace.restore();
            context.restore();
        }
    }
};

RealTimePage.redrawDetails = function (context, extent) {
    var fontSize = 13;
    var horizontalOffset = 15;
    var textGap = 3;
    var linePosition;
    //
    var elapsedTime = 0;
    var totalEnergy = 0;
    //
    if (typeof context !== "undefined"
            && typeof extent !== "undefined") {
        if (typeof RealTimePage.universe !== "undefined" &&
                RealTimePage.universe !== null) {
            elapsedTime = RealTimePage.universe.getElapsedTime();
            totalEnergy = RealTimePage.universe.getTotalEnergy();
        }

        linePosition = (2.0 * extent[1] - fontSize);
        context.save();
        //
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.font = fontSize + "px Courier New";
        context.fillStyle = 'white';

        context.lineWidth = 2;

        linePosition -= fontSize;
        context.fillText("Time Elapsed : " + elapsedTime.toFixed(4),
                horizontalOffset, linePosition);

        linePosition -= (fontSize + textGap);
        context.fillText("Total Energy : " + totalEnergy.toFixed(4),
                horizontalOffset, linePosition);
        //
        context.restore();
    }
};

RealTimePage.renderReport = function (dataset) {
    var simContext = RealTimePage.simCanvas.getContext('2d');
    var report;
    var fontSize = 13;

    if (typeof simContext !== "undefined") {
        RealTimePage.clearAllCanvas();

        simContext.save();
        simContext.setTransform(1, 0, 0, 1, 0, 0);
        //
        report = new Chart(simContext);
        report.Line(dataset, {
            showTooltips: false,
            scaleFontColor: 'white',
            animation: false,
            pointDot: false,
            scaleShowHorizontalLines: true,
            scaleShowVerticalLines: true
        });
        //
        simContext.font = fontSize + "px Courier New";
        simContext.fillStyle = 'white';
        simContext.lineWidth = 2;

        simContext.beginPath();
        simContext.rect(50, 20, 16, 16);
        simContext.fillStyle = 'rgba(255,51,0,0.2)';
        simContext.strokeStyle = 'rgba(255,51,0,1)';
        simContext.fill();
        simContext.stroke();
        simContext.fillStyle = 'white';
        simContext.fillText("Kinetic", 130, 30);

        simContext.beginPath();
        simContext.rect(50, 50, 16, 16);
        simContext.fillStyle = 'rgba(102,255,255,0.2)';
        simContext.strokeStyle = 'rgba(102,255,255,1)';
        simContext.fill();
        simContext.stroke();
        simContext.fillStyle = 'white';
        simContext.fillText("Potential", 145, 60);

        simContext.beginPath();
        simContext.rect(50, 80, 16, 16);
        simContext.fillStyle = 'rgba(220,220,220,0.2)';
        simContext.strokeStyle = 'rgba(220,220,220,1)';
        simContext.fill();
        simContext.stroke();
        simContext.fillStyle = 'white';
        simContext.fillText("Total", 115, 90);
        //
        simContext.restore();

    }
};