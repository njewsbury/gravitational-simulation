/* global alertify, numeric */

var PreviewPage = new Object();

PreviewPage.initialize = function () {
    PreviewPage.initialized = true;
    PreviewPage.orbitCanvas = $("#preview-canvas")[0];
    PreviewPage.actionCanvas = $("#action-canvas")[0];

    if (typeof PreviewPage.orbitCanvas !== "undefined"
            && typeof PreviewPage.actionCanvas !== "undefined") {
        PreviewPage.initialized = true;
    }

    PreviewPage.currentSettings = new OrbitalParams({
        "nBodies": 3,
        "timePrecision": 100,
        "fourierPrecision": 15,
        "equalMasses": true,
        "maximumMass": 1,
        "maximumTime": 100,
        "solutionSeed": "${THREE}"
    });

    window.addEventListener('resize', PreviewPage.resize, false);
    $("#preview-tabs").tabs({
        heightStyle: "fill"
    });

    $("button").button();
    //$("#preview-tabs").tabs("disable", 1);
    PreviewPage.resize();
    $("#preview-tabs").tabs({active: 1});
    
    $("#preview-context-button").on('click', PreviewPage.solveChoreography);
};

PreviewPage.resize = function () {
    var canvasWidth, canvasHeight;

    if (PreviewPage.initialized) {
        canvasWidth = $("#orbit-preview").innerWidth();
        canvasHeight = $("#orbit-preview").innerHeight();

        PreviewPage.orbitCanvas.width = canvasWidth;
        PreviewPage.orbitCanvas.height = canvasHeight;

        PreviewPage.actionCanvas.width = canvasWidth;
        PreviewPage.actionCanvas.height = canvasHeight;
        $("#preview-tabs").tabs("refresh");
        $("#orbit-preview").css("overflow", "hidden");
        $("#orbit-action").css("overflow", "hidden");

        PreviewPage.redrawCanvasElements();

    }
};

PreviewPage.createSettingsDialog = function (defaultValues) {
    $("#preview-settings-dialog").dialog({
        autoOpen: false,
        buttons: [
            {
                text: "Apply",
                click: function () {
                    PreviewPage.applySettings();
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
        $("input#solution-seed").val(defaultValues.getSolutionSeed());
    }
};

PreviewPage.solveChoreography = function () {
    if (typeof PreviewPage.currentSettings !== "undefined"
            && PreviewPage.currentSettings !== null) {
        var orbitalSolver = new OrbitalSolver(PreviewPage.currentSettings);
        
        if( orbitalSolver.isReady() ) {
            var success = orbitalSolver.findSolutions();
            if( success > 0 ) {
                alertify.success("Solved!");
            } else {
                alertify.error(orbitalSolver.getErrorMessage());
            }
        }
    } else {
        alertify.error("Unable to solve for choreography!");
    }
};

PreviewPage.applySettings = function () {
    console.log("Aww Yea.");
};

/* **************
 * RENDERING FUNCTIONS
 */
PreviewPage.redrawCanvasElements = function () {
    var canvasExtent = numeric.div([
        PreviewPage.orbitCanvas.width,
        PreviewPage.orbitCanvas.height
    ], 2);
};