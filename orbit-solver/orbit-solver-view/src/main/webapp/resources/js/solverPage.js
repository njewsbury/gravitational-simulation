var SolverPage = new Object();

SolverPage.initialize = function () {
    this.default_n_bodies = 3;
    this.default_fourier_precision = 1;
    this.default_time_precision = 20;
    this.default_max_mass = 10;

    this.resultCanvas = $("#orbit-display")[0];


    window.addEventListener('resize', SolverPage.resize, false);
    SolverPage.resize();

    /**/
};

SolverPage.resize = function () {
    var styleOffset = 2 * 51;

    SolverPage.resultCanvas.width = ($("#result-layout").width() - styleOffset);
    SolverPage.resultCanvas.height = ($("#result-layout").height() - styleOffset);
};

SolverPage.testSolver = function () {

    var solverConfig = {
        "nBodies": SolverPage.default_n_bodies,
        "precision": [
            SolverPage.default_fourier_precision,
            SolverPage.default_time_precision
        ],
        "equalMasses": false,
        "maximumMass": SolverPage.default_max_mass,
        "gravConst": 1.0,
        //"seedValue": "GammaFunction" + 0
    };

    var solverParams = new SolverParams(
            solverConfig
            );
    SolverUtil.setParams(solverParams);
    var result = SolverUtil.minimizeFunction();
    if (result) {
        SolverPage.displayOrbit(SolverUtil);
    } else {
        console.log("No.");
    }
};

SolverPage.getPastelColour = function () {
    var r = (Math.round(Math.random() * 127) + 127).toString(16);
    var g = (Math.round(Math.random() * 127) + 127).toString(16);
    var b = (Math.round(Math.random() * 127) + 127).toString(16);
    return '#' + r + g + b;
};


SolverPage.displayOrbit = function (solverUtil) {

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

                var colour = SolverPage.getPastelColour();
                canvasContext.save();

                canvasContext.translate($("canvas").width() / 2, $("canvas").height() / 2);
                canvasContext.scale(75, -75);
                canvasContext.strokeStyle = colour;
                canvasContext.lineWidth = 1 / 200;

                var radius = (1 / 75) * (solverUtil.paramSet.massValues[n]);


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

};

SolverPage.changeSettings = function () {

};