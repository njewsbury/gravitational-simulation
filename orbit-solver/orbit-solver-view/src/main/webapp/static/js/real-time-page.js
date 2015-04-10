// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60); //default 60fps
            };
})();

var RealTimePage = new Object();
/* ****************
 * INITIALIZE PARAMS 
 * **************** */
RealTimePage.initialize = function () {
    RealTimePage.preferredResolution = [1920, 1080];
    RealTimePage.renderScale = [100, 100];
    RealTimePage.contextButtonState = 0;
    RealTimePage.canvasOffset = 0;

    // Input Value Ranges
    RealTimePage.currentSettings = new OrbitalParams({
        "nBodies": 3,
        "timeStep": 1,
        "equalMasses": true,
        "maximumMass": 1,
        "maximumTime": -1,
        "solutionSeed": undefined
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
    window.addEventListener('resize', RealTimePage.resize, false);
    $("#simulation-settings").on('click', RealTimePage.showSettings);
    $("#simulation-step-back").on('click', RealTimePage.simulationStepBack);
    $("#simulation-step-forward").on('click', RealTimePage.simulationSingleStep);
    $("#simulation-context-button").on('click', RealTimePage.contextButtonPress);

    $("#simulation-force").on('click', RealTimePage.forceSimulation);

    $("#simulation-download").prop('disabled', true);
    $("#simulation-report").prop('disabled', true);
    $("#simulation-force").prop('disabled', true);
    $("#simulation-step-back").prop('disabled', true);
    $("#simulation-step-forward").prop('disabled', true);

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

    $("input#time-steps").val(defaultValues.getTimeStepParam());
    $("input#equal-masses").prop('checked', defaultValues.isEqualMass());
    $("input#maximum-mass").val(defaultValues.getMaximumMass());
    $("input#maximum-time").val(defaultValues.getMaximumTime());
    if (typeof defaultValues.getSolutionSeed() !== "undefined") {
        $("input#solution-seed").val(defaultValues.getTimeStepParam());
    }
};



RealTimePage.simulationSingleStep = function () {
    RealTimePage.forwardStepCount++;
    RealTimePage.doSingleStep(1);
};

RealTimePage.doSingleStep = function (direction) {
    if (typeof RealTimePage.universe !== "undefined"
            && RealTimePage.universe.doTimeStep(direction)) {
        RealTimePage.redrawCanvasElements();
    } else {
        console.log("Simulation Complete. Report is available for viewing.");
        RealTimePage.simulationRunning = false;
    }
};



RealTimePage.runSimulation = function () {
    RealTimePage.currentTimeoutId = setTimeout(function () {
        if (RealTimePage.simulationRunning) {
            RealTimePage.doSingleStep(1);
            window.requestAnimFrame(RealTimePage.runSimulation);
            RealTimePage.redrawCanvasElements();
        }
    }, (1000 / RealTimePage.fps));
};


RealTimePage.solveNewChoreograph = function () {
    RealTimePage.universe = new SpaceTimeContainer({
        "timeStep": RealTimePage.currentSettings.getTimeStepParam(),
        "gravConstant": 1,
        "maximumTime": RealTimePage.currentSettings.getMaximumTime(),
        "objectList": [
            {
                "id": 1,
                "name": "body-one",
                "initialPos": [1, 0],
                "initialVel": [0, 0],
                "mass": 1,
                "colour": "#FF6600",
                "traceColour": "#FF6600"
            },
            {
                "id" : 2,
                "name" : "body-two",
                "initialPos" : [-1, 0],
                "initialVel" : [0, 0],
                "mass" : 0.75,
                "colour" : "#0A0AFF",
                "traceColour" : "#0B0BFF"
            }
        ]
    });
};


/* ****************
 * PAGE ACTION FUNCTIONS 
 * **************** */
RealTimePage.forceSimulation = function () {


};
RealTimePage.contextButtonPress = function () {
    switch (RealTimePage.contextButtonState) {
        case 0:
            //Button was 'new orbit'
            $("#simulation-step-forward").prop('disabled', false);
            $("#simulation-force").prop('disabled', false);
            $("#simulation-report").prop("disabled", true);
            // Solve for new orbit
            RealTimePage.clearAllCanvas();
            RealTimePage.redrawCanvasElements();
            
            RealTimePage.solveNewChoreograph();
            RealTimePage.redrawCanvasElements();
            //New state is 'Start Orbit'
            RealTimePage.contextButtonState = 1;
            $("button#simulation-context-button span").text("Start Orbit");
            break;
        case 1:
            //Button was 'start orbit'
            $("#simulation-step-forward").prop("disabled", true);
            $("#simulation-step-back").prop("disabled", true);
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
            $("#simulation-force").prop("disabled", true);
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
    var jsonParams = {
        "nBodies": $("#n-bodies").val(),
        "timeStep": $("#time-steps").val(),
        "equalMasses": $("#equal-masses").is(":checked"),
        "maximumMass": $("#maximum-mass").val(),
        "maximumTime": $("#maximum-time").val(),
        "solutionSeed": $("#solution-seed").val()
    };

    var orbitalParams = new OrbitalParams(jsonParams);
    if (orbitalParams.validateInput()) {
        RealTimePage.currentSettings = orbitalParams;
    } else {
        $("#error-text").text(orbitalParams.getMessage());
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

RealTimePage.clearAllCanvas = function () {
    var simContext = RealTimePage.simCanvas.getContext('2d');
    var traceContext = RealTimePage.traceCanvas.getContext('2d');
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
    simContext.clearRect(-canvasExtent[0], -canvasExtent[1],
            2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);
        
    traceContext.clearRect(-canvasExtent[0], -canvasExtent[1],
            2.0 * canvasExtent[0], 2.0*canvasExtent[1]);
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
    var horizontalOffset = 10;
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