/* global alertify, numeric, SolverUtil */

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
        "fourierPrecision": 1,
        "equalMasses": true,
        "maximumMass": 1,
        "maximumTime": 100,
        //"solutionSeed": "${THREE}",
        "gravConstant": 1
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
    $("#back-home").on('click', function () {
        window.location = "/orbit-solver-view";
    });
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
        var config = {
            "nBodies" : 3,
            "precision" : [
                1, 100
            ],
            "equalMasses" : true,
            "maximumMass" : 1,
            "gravConst" : 1,
            "seedValue" : "${THREE}"
        };
        
        var solverConfig = new SolverParams(config);
        SolverUtil.setParams(solverConfig);
        SolverUtil.minimizeFunction(PreviewPage.solvedChoreography);
        /*
         var orbitalSolver = new OrbitalSolver(PreviewPage.currentSettings);
         
         if (orbitalSolver.isReady()) {
         var success = orbitalSolver.findSolutions();
         if (typeof success !== "undefined" && success !== null) {
         var labels = [];
         for (var i = 0, sz = success.length; i < sz; i++) {
         labels.push("");
         }
         var actionDataset = {
         label: "Total Energy",
         fillColor: "rgba(220,220,220,0.2)",
         strokeColor: "rgba(220,220,220,1)",
         pointColor: "rgba(220,220,220,1)",
         pointStrokeColor: "#fff",
         pointHighlightFill: "#fff",
         pointHighlightStroke: "rgba(220,220,220,1)",
         data: success
         };
         PreviewPage.drawActionReport({
         labels: labels,
         datasets: [actionDataset]
         });
         alertify.success("Solved!");
         } else {
         alertify.error(orbitalSolver.getErrorMessage());
         }
         }
         */
    } else {
        alertify.error("Unable to solve for choreography!");
    }

};

PreviewPage.solvedChoreography = function() {
    console.log("Heyo!");
};
PreviewPage.applySettings = function () {
    console.log("Aww Yea.");
};
/* **************
 * RENDERING FUNCTIONS
 */
PreviewPage.drawChoreograph = function (positionMap) {
    var canvasExtent = numeric.div([
        PreviewPage.orbitCanvas.width,
        PreviewPage.orbitCanvas.height
    ], 2);
};
PreviewPage.drawActionReport = function (dataset) {
    var cntx = PreviewPage.actionCanvas.getContext('2d');
    cntx.save();
    //
    var chart = new Chart(cntx).Line(dataset, {
        showTooltips: false,
        scaleFontColor: 'white',
        animation: false,
        pointDot: false,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true

    });
    //
    cntx.restore();
};