var SolverPage = new Object();

SolverPage.initialize = function () {
    this.default_n_bodies = 3;
    this.default_fourier_precision = 5;
    this.default_time_precision = 10;

    this.resultCanvas = $("#orbit-display")[0];

    window.addEventListener('resize', SolverPage.resize, false);
    SolverPage.resize();

};

SolverPage.resize = function () {
    SolverPage.resultCanvas.width = ($("#result-layout").width() - 55);
    SolverPage.resultCanvas.height = ($("#result-layout").height() - 55);
};

SolverPage.testSolver = function () {
    var orbitalSolver = new OrbitalSolver(
            SolverPage.default_n_bodies,
            SolverPage.default_fourier_precision,
            SolverPage.default_time_precision
            );

    var jsonResult = orbitalSolver.solve();
    if (jsonResult.success) {
        var jsonString = JSON.stringify(jsonResult);
        jsonString = jsonString.replace(/,/g, "<br/>");
        $("#message-section").removeClass("error");
        $("#message-section").addClass("success");

        $("#message-section").text("Found solution :: " + jsonResult.simulationId);
        $("#result-section").html(jsonString);
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
};

SolverPage.changeSettings = function () {

};