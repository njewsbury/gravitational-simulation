/* global alertify, numeric, SolverUtil, Base64 */
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

var PreviewPage = new Object();

PreviewPage.initialize = function () {
    PreviewPage.initialized = true;
    PreviewPage.orbitCanvas = $("#preview-canvas")[0];
    PreviewPage.actionCanvas = $("#action-canvas")[0];

    if (typeof PreviewPage.orbitCanvas !== "undefined"
            && typeof PreviewPage.actionCanvas !== "undefined") {
        PreviewPage.initialized = true;
    }
    PreviewPage.queryParam = $.QueryString["seed"];
    PreviewPage.bodyParam = $.QueryString["bodyCount"];
    PreviewPage.currentSettings = new OrbitalParams({
        "nBodies": PreviewPage.bodyParam || 3,
        "timePrecision": 250,
        "fourierPrecision": 1,
        "equalMasses": true,
        "maximumMass": 1,
        "maximumTime": 100,
        "solutionSeed": PreviewPage.queryParam,
        "gravConstant": 1
    });
    PreviewPage.createSettingsDialog(PreviewPage.currentSettings);

    window.addEventListener('resize', PreviewPage.resize, false);
    $("#preview-tabs").tabs({
        heightStyle: "fill"
    });

    $("button, a.navigation").button();
    $("#preview-settings").on('click', function () {
        $("#preview-settings-dialog").dialog("open");
    });
    PreviewPage.resize();
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
    $("#preview-download").on('click', PreviewPage.downloadImage);

};

PreviewPage.downloadImage = function () {
    var downloadLink = $("#download-image")[0];


    var imgContext = PreviewPage.orbitCanvas.getContext('2d');
    imgContext.rect(0, 0, 0, 0);
    imgContext.fill();

    var img = PreviewPage.orbitCanvas.toDataURL("image/png");
    var currDate = new Date();

    var dateString = currDate.toDateString();
    dateString = dateString.replace(/\s+/g, '-').toLowerCase();
    dateString += ("-" + currDate.getHours() + "-" + currDate.getMinutes() + "-" + currDate.getSeconds());

    downloadLink.href = img;
    downloadLink.download = "SolvedChoreo-" + dateString + ".png";

    downloadLink.click();
    downloadLink.href = "#";

    setInterval(function () {
        PreviewPage.redrawPreviewPanel();
        PreviewPage.redrawActionPanel();

    }, 100);
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
    $("select#n-bodies").val(defaultValues.getBodyParam().toString());
    $("input#time-steps").val(defaultValues.getTimePrecision());
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
        var solutionSeed = PreviewPage.currentSettings.getSolutionSeed();
        var urlParams = {};

        urlParams.bodyCount = PreviewPage.currentSettings.getBodyParam();
        if (typeof solutionSeed !== "undefined" && (solutionSeed.trim()).length > 0) {
            urlParams.seed = solutionSeed;
            solutionSeed = Base64.decode(solutionSeed.replace(/-/g, "="));
        } else {
            solutionSeed = Date.now().toString();
            urlParams.seed = Base64.encode(solutionSeed).replace(/=/g, "-");
        }
        $("#seed-section").text(urlParams.seed);
        $("#seed-section")[0].href = "simulation.html?" + $.param(urlParams);

        var config = {
            "nBodies": PreviewPage.currentSettings.getBodyParam(),
            "precision": [
                1, PreviewPage.currentSettings.getTimePrecision()
            ],
            "equalMasses": PreviewPage.currentSettings.isEqualMass(),
            "maximumMass": PreviewPage.currentSettings.getMaximumMass(),
            "gravConst": 1,
            "seedValue": solutionSeed
        };

        var solverConfig = new SolverParams(config);
        SolverUtil.setParams(solverConfig);
        SolverUtil.minimizeFunction(PreviewPage.solvedChoreography);
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
        kineticMap = numeric.mul(1, SolverUtil.getKineticEnergy(solution));
        potentialMap = SolverUtil.getPotentialEnergy(solution);
        positionMap = SolverUtil.getPositionMap(solution);
        alertify.success("Minimized in " + SolverUtil.solutionSet.iterations + " iterations.");

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
            PreviewPage.colourArray = new Array(PreviewPage.currentSettings.getBodyParam());
            for (var n = 0; n < PreviewPage.currentSettings.getBodyParam(); n++) {
                PreviewPage.colourArray[n] = SolverUtil.getPastelColour();
            }
            PreviewPage.redrawPreviewPanel();
        }
    }
};
PreviewPage.applySettings = function () {
    var solutionSeed = $("#solution-seed").val();
    if (typeof solutionSeed === "undefined" || solutionSeed.trim().length <= 0) {
        solutionSeed = undefined;
    }
    var jsonParams = {
        "nBodies": $("#n-bodies").val(),
        "timePrecision": $("#time-steps").val(),
        "equalMasses": $("#equal-masses").is(":checked"),
        "symplectic": $("#symplectic").is(":checked"),
        "maximumMass": $("#maximum-mass").val(),
        "maximumTime": $("#maximum-time").val(),
        "solutionSeed": solutionSeed
    };

    var orbitalParams = new OrbitalParams(jsonParams);
    if (orbitalParams.validateInput()) {
        PreviewPage.currentSettings = orbitalParams;
    } else {
        $("#error-text").text(orbitalParams.getMessage());
    }
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

        cntx.setTransform(1, 0, 0, 1, 0, 0);         //
        cntx.translate(canvasExtent[0], canvasExtent[1]);
        //
        cntx.scale(100,
                -100);

        cntx.clearRect(-canvasExtent[0], -canvasExtent[1],
                2.0 * canvasExtent[0], 2.0 * canvasExtent[1]);

        PreviewPage.redrawCoordinateAxis(cntx, canvasExtent);

        for (var n = 0; n < positionMap.length; n++) {
            var xPos = ((positionMap[n])[0]);
            var yPos = ((positionMap[n])[1]);
            var colour = PreviewPage.colourArray[n];
            cntx.strokeStyle = colour;
            cntx.lineWidth = 1 / 100;
            for (var t = 1, all = xPos.length; t < all; t++) {
                cntx.beginPath();
                cntx.moveTo(xPos[t - 1], yPos[t - 1]);
                cntx.lineTo(xPos[t], yPos[t]);
                cntx.stroke();
            }
        }

        for (var n = 0; n < positionMap.length; n++) {
            var xPos = ((positionMap[n])[0]);
            var yPos = ((positionMap[n])[1]);
            var colour = PreviewPage.colourArray[n];
            cntx.beginPath();
            cntx.arc(xPos[0], yPos[0], 10 / 100, Math.PI * 2, false);
            cntx.fillStyle = colour;
            cntx.strokeStyle = 'black';
            cntx.lineWidth = 2 / 100;
            cntx.fill();
            cntx.stroke();
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
        scaleShowVerticalLines: true,
        scaleShowLabels: false
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