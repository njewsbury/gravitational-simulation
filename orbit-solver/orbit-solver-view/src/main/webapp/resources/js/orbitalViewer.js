
var OrbitalViewer = new Object();


OrbitalViewer.initialize = function (container, engine) {
    this.canvasName = "draw-canvas";
    this.enabled = false;
    this.redraw = true;
    this.context = null;
    this.canvas = null;

    this.globalScale = 100;
    this.currentScale = [this.globalScale, -this.globalScale];

    this.axisStyle = "#FF0101";
    this.axisWidth = 1;

    this.repaintInterval = 30;
    this.moveInterval = 60;
    
    this.rootOrigin = [0, 0];

    this.simulationEngine = engine;

    this.createCanvas(container);
    if (this.enabled) {
        this.resize();
        this.rootOrigin = [ this.canvas.width/2.0, this.canvas.height/2.0];
    }

    window.addEventListener('resize', this.resize, false);
    this.intrvl = setInterval(function () {
        OrbitalViewer.repaint();
    }, OrbitalViewer.repaintInterval);
};

OrbitalViewer.initializeDisplay = function () {
    if (this.enabled) {
        this.repaint();
        console.log("Display Initialized!");
    }
};

OrbitalViewer.startSimulation = function () {
    if (this.enabled) {

        this.moveIntrvl = setInterval(function () {
            OrbitalViewer.simulationEngine.moveAllObjects();
            OrbitalViewer.redraw = true;
        }, OrbitalViewer.moveInterval);
    } else {
        alert("Unable to start simulation due to errors!");
    }
};

OrbitalViewer.stop = function () {
    this.redraw = false;
    clearInterval(this.moveIntrvl);
    clearInterval(this.intrvl);
    this.clearCanvas();

};

OrbitalViewer.insertObject = function (spaceObject) {
    this.simulationEngine.insertOrbital(spaceObject);
    this.redraw = true;
};

OrbitalViewer.clearCanvas = function () {

    if (this.context !== undefined) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

OrbitalViewer.createCanvas = function (container) {
    var element = $("<canvas></canvas>");
    $(element).prop('id', this.canvasName);

    $(container).append(element);
    this.canvas = $("#" + this.canvasName)[0];
    if (this.canvas !== undefined && this.canvas !== null) {
        this.context = this.canvas.getContext('2d');
        if (this.context !== undefined && this.context !== null) {
            this.enabled = true;
            this.redraw = true;
        } else {
            console.log("Unable to get 2DContext from canvas.");
        }
    } else {
        console.log("Unable to initialize canvas element.");
    }
};

OrbitalViewer.resize = function () {
    OrbitalViewer.canvas.width = window.innerWidth;
    OrbitalViewer.canvas.height = window.innerHeight;
    OrbitalViewer.redraw = true;
};

OrbitalViewer.repaintAxes = function (context, canvas, com) {
    var oldStyle, oldWidth, oldOpacity;
    var widthLimit, heightLimit;
    oldStyle = context.strokeStyle;
    oldWidth = context.lineWidth;
    oldOpacity = context.globalAlpha;

    context.strokeStyle = OrbitalViewer.axisStyle;
    context.lineWidth = OrbitalViewer.axisWidth / OrbitalViewer.currentScale[0];
    context.globalAlpha = 0.5;
    //com = numeric.mul(OrbitalViewer.currentScale[0], com);
    widthLimit = (canvas.width + com[0]) / 2.0;
    heightLimit = (canvas.height + com[1]) / 2.0;

    context.beginPath();
    context.moveTo(-widthLimit, 0);
    context.lineTo(widthLimit, 0);
    context.stroke();

    context.beginPath();
    context.moveTo(0, -heightLimit);
    context.lineTo(0, heightLimit);
    context.stroke();

    context.strokeStyle = oldStyle;
    context.lineWidth = oldWidth;
    context.globalAlpha = oldOpacity;
};

OrbitalViewer.repaint = function () {
    var context = OrbitalViewer.context;
    var canvas = OrbitalViewer.canvas;
    var objList;
    var com = [0, 0];
    var widthLimit, heightLimit;
    // LOW LAYER
    if (OrbitalViewer.redraw) {
        com = OrbitalViewer.simulationEngine.getCenterOfMass();
        if (com === undefined) {
            com = [0, 0];
        }
        //com = numeric.mul(OrbitalViewer.currentScale[0], com);

        console.log("COM :: " + com[0] + ", " + com[1]);
        widthLimit = (canvas.width + com[0]) / 2.0;
        heightLimit = (canvas.height + com[1]) / 2.0;
        console.log("WL : " + widthLimit + " HL: " + heightLimit);

        // LOWER LAYER
        context.setTransform(1, 0, 0, 1, 0, 0);
        OrbitalViewer.clearCanvas();
        context.translate(widthLimit, heightLimit);
        this.context.scale(OrbitalViewer.currentScale[0], OrbitalViewer.currentScale[1]);

        // MEDIUM LAYER

        // OBJECT LAYER

        objList = OrbitalViewer.simulationEngine.objectList;
        if (objList !== null && objList !== undefined) {
            $.each(objList, function (index, element) {
                element.draw(context, OrbitalViewer.currentScale, com, OrbitalViewer.rootOrigin);
            });
        }
        OrbitalViewer.repaintAxes(context, canvas, com);

        OrbitalViewer.redraw = false;
    }
};
