var SolverPage = new Object();

SolverPage.initialize = function () {
    this.default_n_bodies = 2;
    this.default_fourier_precision = 1;
    this.default_time_precision = 10;

    this.layout = $(PrimeFaces.widgets['pageLayout'])[0];
    this.westHidden = false;
    this.resultCanvas = $("#orbit-display")[0];


    //window.addEventListener('resize', SolverPage.resize, false);
    SolverPage.resize();

    /* Chart JS for debugging */
    var canvasContext = SolverPage.resultCanvas.getContext('2d');
    var chartOptions = {
        maintainAspectRatio: true,
        responsive: false,
        pointDot: false,
        datasetFill: true,
        bezierCurve: true,
        animation: false

    };

    var dataSet = {
        "labels": [],
        "datasets": [
            {
                label: "Kinetic Energy",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            },
            {
                label: "Potential Energy",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: []
            }, {
                label: "Total Action",
                fillColor: "rgba(255,51,51,0.2)",
                strokeColor: "rgba(255,51,51,1)",
                pointColor: "rgba(255,51,51,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255,51,51,1)",
                data: []
            }
        ]
    };

    this.lineChart = new Chart(canvasContext).Line(dataSet, chartOptions);
    /**/



};

SolverPage.resize = function () {
    var styleOffset = 2 * 51;

    SolverPage.resultCanvas.width = ($("#result-layout").width() - styleOffset);
    SolverPage.resultCanvas.height = ($("#result-layout").height() - styleOffset);
    if (typeof SolverPage.lineChart !== "undefined") {
        SolverPage.lineChart.resize();
    }
};

SolverPage.testSolver = function () {

    var actionValues = [];
    var deltaAction = [];
    
    for (var i =-10; i < 10; i++) {
        var solverConfig = {
            "nBodies": SolverPage.default_n_bodies,
            "precision": [
                SolverPage.default_fourier_precision,
                SolverPage.default_time_precision
            ],
            "equalMasses": true,
            "gravConst": 1.0,
            "seedValue" : "GammaFunction" + i
        };

        var orbitalSolver = new NewOrbitalSolver(
                solverConfig
                );
        actionValues.push( orbitalSolver.getActionValue());
    }
    for( var n = 0; n < actionValues.length-1; n++ ) {
        deltaAction[n] = (actionValues[n+1]-actionValues[n])/(2.0*Math.PI/SolverPage.default_time_precision);
    }
    
    for( var n = 0; n < deltaAction.length; n++ ) {
        SolverPage.lineChart.addData([0,0, deltaAction[n]], n);
    }
    
    /*
     var kineticMap = orbitalSolver.getKineticEnergy();
     var potentialMap = orbitalSolver.getPotentialEnergy();
     
     console.log("Kinetic Energy :: ");
     console.log(kineticMap);
     
     console.log("Potential Energy :: ");
     console.log(potentialMap);
     
     var actionValue = 0.0;
     
     for (var i = 0; i < kineticMap.length; i++) {
     actionValue += (kineticMap[i] - potentialMap[i]);
     SolverPage.lineChart.addData([
     kineticMap[i],
     potentialMap[i],
     actionValue
     
     ],
     "" + i);
     }
     */

    /*
     var jsonResult = orbitalSolver.findOrbit();
     if (jsonResult.success) {
     var jsonString = JSON.stringify(jsonResult);
     jsonString = jsonString.replace(/,/g, "<br/>");
     $("#message-section").removeClass("error");
     $("#message-section").addClass("success");
     
     $("#message-section").text("Found solution :: " + jsonResult.simulationId);
     //$("#result-section").html(jsonString);
     
     SolverPage.displayOrbit(orbitalSolver);
     } else {
     $("#message-section").removeClass("success");
     $("#message-section").addClass("error");
     
     var errMsg = jsonResult.errorMsg || "Unknown error";
     $("#message-section").text("Error encountered :: " + errMsg);
     
     }
     $("#message-section").show();
     $("#message-section").animate({
     opacity: 1
     }, 1500);
     */
};

SolverPage.displayOrbit = function (orbitalSolver) {

    var params = orbitalSolver.solution;
    var qRegular = orbitalSolver.calculateQRegular(params);

    var xList, yList;

    var colourList = ['black', 'green', 'blue'];
    var canvasContext;

    if (typeof qRegular !== "undefined" && qRegular.length) {
        xList = qRegular[0];
        yList = qRegular[1];

        canvasContext = $("canvas")[0].getContext('2d');
        if (typeof canvasContext !== "undefined") {
            canvasContext.clearRect(0, 0, $("canvas").width(), $("canvas").height());
            for (var i = 0; i < 3; i++) {
                canvasContext.save();

                canvasContext.translate($("canvas").width() / 2, $("canvas").height() / 2);
                canvasContext.scale(50, -50);
                canvasContext.strokeStyle = colourList[i];
                canvasContext.lineWidth = 1 / 200;

                /*
                 console.log( "----- Orbital ## " + i );
                 console.log(xList[i]);
                 console.log(yList[i]);
                 console.log(" =======================" );
                 */
                for (var r = 1; r < xList[i].length; r++) {
                    canvasContext.beginPath();
                    canvasContext.moveTo(xList[i][r - 1], yList[i][r - 1]);
                    canvasContext.lineTo(xList[i][r], yList[i][r]);
                    canvasContext.stroke();
                }
                canvasContext.restore();
            }
        }
    }

};

SolverPage.changeSettings = function () {

};