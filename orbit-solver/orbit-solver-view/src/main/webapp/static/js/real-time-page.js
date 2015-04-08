var RealTimePage = new Object();
/* ****************
 * INITIALIZE PARAMS 
 * **************** */
RealTimePage.initialize = function () {
    RealTimePage.preferredResolution = [1920, 1080];
    RealTimePage.contextButtonState = 0;

    // Input Value Ranges
    RealTimePage.currentSettings = new OrbitalParams({
        "nBodies": 3,
        "timeStep": 0.01,
        "equalMasses": true,
        "maximumMass": 1,
        "maximumTime": -1,
        "solutionSeed": undefined
    });
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

    $("#realtime-container").width(viewportWidth);
    $("#realtime-container").height(viewportHeight);
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
            //New state is 'Start Orbit'
            RealTimePage.contextButtonState = 1;
            $("button#simulation-context-button span").text("Start Orbit");
            break;
        case 1:
            //Button was 'start orbit'
            $("#simulation-step-forward").prop("disabled", true);
            $("#simulation-step-back").prop("disabled", true);
            //New State is 'Stop Orbit'
            RealTimePage.contextButtonState = 2;
            $("button#simulation-context-button span").text("Stop Orbit");
            break;
        case 2:
            //Button was 'Stop Orbit'
            $("#simulation-report").prop("disabled", false);
            $("#simulation-force").prop("disabled", true);
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

