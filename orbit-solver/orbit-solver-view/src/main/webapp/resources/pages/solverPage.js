var SolverPage = new Object();

SolverPage.initialize = function () {
    //Range format [ MIN, DEFAULT, MAX ]
    SolverPage.N_BODY_RANGE = [1, 3, 8];
    SolverPage.SPACIAL_PRECISION_RANGE = [1, 1, 1];
    SolverPage.TIME_PRECISION_RANGE = [1, 10, 50];
    SolverPage.MAX_MASS_RANGE = [1, 1, 20];

    SolverPage.currentBodyCount = SolverPage.N_BODY_RANGE[1];
    SolverPage.currentTimePrecision = SolverPage.TIME_PRECISION_RANGE[1];
    SolverPage.currentMaxMass = SolverPage.MAX_MASS_RANGE[1];
    SolverPage.currentEqualMass = true;
    SolverPage.solutionSeed = undefined;

    SolverPage.displayScale = 150;

    this.resultCanvas = $("#orbit-display")[0];

    /**/
    window.addEventListener('resize', SolverPage.resize, false);
    SolverPage.resize();
    /**/

    $("#n-body-count").val(SolverPage.currentBodyCount);
    $("#time-steps").val(SolverPage.currentTimePrecision);
    $("#equal-masses").prop("checked", SolverPage.currentEqualMass);
    $("#maximum-mass").val(SolverPage.currentMaxMass);
    $("#canvas-scale").val(SolverPage.displayScale);

};


SolverPage.resize = function () {
    var styleWidth = 66; //padding + padding + border * (east,west)    

    var extent = [$(window).width(), $(window).height()];
    extent[1] = (extent[1] - $("#header-section").height());

    $("#canvas-section").width(extent[0] - 50);
    $("#canvas-section").height(extent[1] - 115);

    SolverPage.resultCanvas.width = ($("#canvas-section").innerWidth() - styleWidth);
    SolverPage.resultCanvas.height = ($("#canvas-section").innerHeight());


};

SolverPage.validateInput = function () {
    var errorMsg = "";

    var nBodies = parseInt($("#n-body-count").val());
    var timeSteps = parseInt($("#time-steps").val());
    var areEqual = $("#equal-masses").is(":checked");
    var maxMass = parseInt($("#maximum-mass").val());

    if (nBodies >= SolverPage.N_BODY_RANGE[0]
            && nBodies <= SolverPage.N_BODY_RANGE[2]) {
        SolverPage.currentBodyCount = nBodies;
    } else {
        errorMsg = "nBodyCount outside range!";
    }

    if (timeSteps >= SolverPage.TIME_PRECISION_RANGE[0]
            && timeSteps <= SolverPage.TIME_PRECISION_RANGE[2]) {
        SolverPage.currentTimePrecision = timeSteps;
    } else {
        errorMsg = "Time step outside range!";
    }

    if (maxMass >= SolverPage.MAX_MASS_RANGE[0]
            && maxMass <= SolverPage.MAX_MASS_RANGE[2]) {
        SolverPage.currentMaxMass = maxMass;
    } else {
        errorMsg = "Maximum mass outside range!";
    }

    if (errorMsg.length === 0) {
        SolverPage.currentEqualMass = areEqual;
        if ($("#solution-seed").val().trim().length > 0) {
            SolverPage.solutionSeed = $("#solution-seed");
        } else {
            SolverPage.solutionSeed = undefined;
        }
    }
    SolverPage.displayScale = parseInt($("#canvas-scale").val());

    return errorMsg;
};

SolverPage.applySettings = function () {
    var err = SolverPage.validateInput();
    if (err.length === 0) {
        PF('settings-dialog').hide();
    } else {
        $("#error-section").text(err);
    }
};


SolverPage.generateOrbit = function () {
    var config = {
        "nBodies": SolverPage.currentBodyCount,
        "precision": [
            SolverPage.SPACIAL_PRECISION_RANGE[1],
            SolverPage.currentTimePrecision
        ],
        "equalMasses": SolverPage.currentEqualMass,
        "maximumMass": SolverPage.currentMaxMass,
        "gravConst": 1.0,
        "seedValue": SolverPage.solutionSeed
    };

    var solverConfig = new SolverParams(config);

    $("#message-section").empty();
    var preloader = $("#bowlG-original").clone();
    $(preloader).prop('id', 'bowlG');
    $(preloader).children("#bowl_ringG-original").prop('id', 'bowl_ringG');

    $("#message-section").prepend($(preloader));
    
    SolverUtil.setParams(solverConfig);
    SolverUtil.minimizeFunction(SolverPage.solvedOrbital);
};

SolverPage.solvedOrbital = function () {
    $("#message-section").empty();
    if (typeof SolverUtil !== "undefined" && SolverUtil.solved) {
        SolverPage.displayOrbit(SolverUtil);
    } else {
        $("#message-section").text("Unable to solve orbit for given settings.");
    }
};



SolverPage.redraw = function () {
    SolverPage.displayOrbit(SolverUtil);
};

SolverPage.displayOrbit = function (solverUtil) {

    if (typeof solverUtil !== "undefined" && typeof solverUtil.paramSet !== "undefined") {
        var positionMap = solverUtil.getPositionMap(solverUtil.solution);
        var xList, yList;
        var canvasContext;

        if (typeof positionMap !== "undefined" && positionMap.length) {

            canvasContext = $("canvas")[0].getContext('2d');
            if (typeof canvasContext !== "undefined") {
                canvasContext.clearRect(0, 0, $("canvas").width(), $("canvas").height());

                for (var n = 0; n < positionMap.length; n++) {
                    xList = (positionMap[n])[0];
                    yList = (positionMap[n])[1];

                    var colour = SolverUtil.getPastelColour();
                    canvasContext.save();

                    canvasContext.translate($("canvas").width() / 2, $("canvas").height() / 2);
                    canvasContext.scale(SolverPage.displayScale, -SolverPage.displayScale);
                    canvasContext.strokeStyle = colour;
                    canvasContext.lineWidth = 1 / SolverPage.displayScale;

                    var radius = (1 / SolverPage.displayScale) * (solverUtil.paramSet.massValues[n]);


                    canvasContext.beginPath();
                    canvasContext.arc(xList[0], yList[0], radius, 0, 2 * Math.PI, false);
                    canvasContext.fillStyle = colour;
                    canvasContext.fill();
                    canvasContext.stroke();

                    for (var r = 1; r < xList.length; r++) {
                        canvasContext.beginPath();
                        canvasContext.moveTo(xList[r - 1], yList[r - 1]);
                        canvasContext.lineTo(xList[r], yList[r]);
                        canvasContext.stroke();
                    }
                    canvasContext.beginPath();
                    canvasContext.moveTo(xList[xList.length - 1], yList[yList.length - 1]);
                    canvasContext.lineTo(xList[0], yList[0]);
                    canvasContext.stroke();
                    canvasContext.restore();
                }

            } else {
                console.log("Context not available.");
            }
        } else {
            console.log("No available position map.");
        }
    }

};
