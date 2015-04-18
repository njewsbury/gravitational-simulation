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
    //$("#preview-tabs").tabs({active: 1});
    $("#preview-tabs").tabs({
        activate: function (event, ui) {
            if (ui.newPanel.selector === "#orbit-action") {
                PreviewPage.redrawActionPanel();
            } else if (ui.newPanel.selector === "#orbit-preview") {
                PreviewPage.redrawPreviewPanel();
            }
        }
    });

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
            "nBodies": 3,
            "precision": [
                1, 100
            ],
            "equalMasses": true,
            "maximumMass": 1,
            "gravConst": 1,
            "seedValue": "${THREE}"
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

PreviewPage.solvedChoreography = function () {
    var solution = SolverUtil.solution;
    var actionMap, kineticMap, potentialMap;
    var positionMap;

    if (typeof solution !== "undefined") {
        SolverUtil.solveActionFunction(solution);
        actionMap = SolverUtil.actionMap;
        kineticMap = SolverUtil.getKineticEnergy(solution);
        potentialMap = SolverUtil.getPotentialEnergy(solution);
        positionMap = SolverUtil.getPositionMap(solution);
        alertify.success("Minimized in " + SolverUtil.solutionSet.iterations + " iterations.");

        //console.log( actionMap );
        //console.log( kineticMap );
        //console.log( potentialMap );
        if (typeof actionMap !== "undefined") {
            var labels = [];
            for (var i = 0, sz = actionMap.length; i < sz; i++) {
                labels.push("");
            }
            var actionDataset = {
                label: "Action Map",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: actionMap
            };
            var kineticDataset = {
                label: "Kinetic Energy",
                fillColor: "rgba(255,51,0,0.2)",
                strokeColor: "rgba(255,51,0,1)",
                pointColor: "rgba(255,51,0,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255,51,0,1)",
                data: kineticMap
            };
            var potentialDataset = {
                label: "Potential Energy",
                fillColor: "rgba(102,255,255,0.2)",
                strokeColor: "rgba(102,255,255,1)",
                pointColor: "rgba(102,255,255,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(102,255,255,1)",
                data: potentialMap
            };

            PreviewPage.actionReport = {
                labels: labels,
                datasets: [
                    kineticDataset,
                    actionDataset,
                    potentialDataset
                ]
            };

            PreviewPage.lastSolved = (positionMap);
            $("#preview-tabs").tabs({active: 0});
            PreviewPage.redrawPreviewPanel();
        }
    }
};
PreviewPage.applySettings = function () {
    console.log("Aww Yea.");
};
/* **************
 * RENDERING FUNCTIONS
 */

PreviewPage.redrawActionPanel = function () {
    if (typeof PreviewPage.actionReport !== "undefined"
            && PreviewPage.actionReport !== null) {
        PreviewPage.drawActionReport(PreviewPage.actionReport);
    }
};

PreviewPage.redrawPreviewPanel = function () {
    if (typeof PreviewPage.lastSolved !== "undefined"
            && PreviewPage.lastSolved !== null) {

        PreviewPage.drawChoreograph(PreviewPage.lastSolved);
    }
};

PreviewPage.drawChoreograph = function (positionMap) {
    var canvasExtent = numeric.div([
        PreviewPage.orbitCanvas.width,
        PreviewPage.orbitCanvas.height
    ], 2);
    var cntx = PreviewPage.orbitCanvas.getContext('2d');

    if (typeof cntx !== "undefined") {

        cntx.save();

        cntx.setTransform(1, 0, 0, 1, 0, 0);
        //
        cntx.translate(canvasExtent[0], canvasExtent[1]);
        //
        cntx.scale(100,
                -100);

        cntx.clearRect(-canvasExtent[0], -canvasExtent[1],
                2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);

        PreviewPage.redrawCoordinateAxis(cntx, canvasExtent);

        for( var n = 0; n < positionMap.length; n++ ) {
            var xPos = ((positionMap[n])[0]);
            var yPos = ((positionMap[n])[1]);
            
            for( var t = 1, all=xPos.length; t < all; t++ ) {
                cntx.beginPath();
                cntx.moveTo( xPos[t-1], yPos[t-1]);
                cntx.lineTo( xPos[t], yPos[t]);
                cntx.strokeStyle = 'white';
                cntx.lineWidth = 1/100;
                cntx.stroke();
            }
        }


        cntx.restore();
    }
};

PreviewPage.redrawCoordinateAxis = function (context, extent) {

    if (typeof context !== "undefined"
            && typeof extent !== "undefined") {

        context.save();
        //
        context.strokeStyle = '#FF6600';
        context.lineWidth = (1 / 100);

        //Horizontal Axis
        context.beginPath();
        context.moveTo(-extent[0], 0);
        context.lineTo(extent[0], 0);
        context.stroke();

        context.lineWidth = (1 / 100);
        context.beginPath();
        context.moveTo(0, -extent[1]);
        context.lineTo(0, extent[1]);
        context.stroke();
        //
        context.restore();
    }

};

PreviewPage.drawActionReport = function (dataset) {
    var fontSize = 13;
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
    cntx.font = fontSize + "px Courier New";
    cntx.fillStyle = 'white';
    cntx.lineWidth = 2;

    cntx.beginPath();
    cntx.rect(50, 20, 16, 16);
    cntx.fillStyle = 'rgba(255,51,0,0.2)';
    cntx.strokeStyle = 'rgba(255,51,0,1)';
    cntx.fill();
    cntx.stroke();
    cntx.fillStyle = 'white';
    cntx.fillText("Kinetic", 130, 30);

    cntx.beginPath();
    cntx.rect(50, 50, 16, 16);
    cntx.fillStyle = 'rgba(102,255,255,0.2)';
    cntx.strokeStyle = 'rgba(102,255,255,1)';
    cntx.fill();
    cntx.stroke();
    cntx.fillStyle = 'white';
    cntx.fillText("Potential", 145, 60);

    cntx.beginPath();
    cntx.rect(50, 80, 16, 16);
    cntx.fillStyle = 'rgba(220,220,220,0.2)';
    cntx.strokeStyle = 'rgba(220,220,220,1)';
    cntx.fill();
    cntx.stroke();
    cntx.fillStyle = 'white';
    cntx.fillText("Action", 115, 90);
    //
    cntx.restore();
};