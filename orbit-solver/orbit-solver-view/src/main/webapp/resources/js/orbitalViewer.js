
var OrbitalViewer = new Object();


OrbitalViewer.initialize = function (container, engine) {
    this.secretValue = 10;
    this.canvasName = "draw-canvas";
    this.enabled = false;
    this.redraw = true;
    this.context = null;
    this.canvas = null;
    
    this.currentScale = [100, 100];

    this.axisStyle = "#FF0101";
    this.axisWidth = 1;

    this.repaintInterval = 300;

    this.simulationEngine = engine;

    this.createCanvas(container);
    if (this.enabled) {
        this.resize();
    }

    window.addEventListener('resize', this.resize, false);
    this.intrvl = setInterval(function () {
        OrbitalViewer.repaint();
    }, OrbitalViewer.repaintInterval);
    
    this.moveIntrvl = setInterval( function() {
        console.log("Moving objects.");
        OrbitalViewer.simulationEngine.moveAllObjects();
        OrbitalViewer.redraw=true;
    }, 600);

};

OrbitalViewer.insertObject = function (spaceObject) {
    this.simulationEngine.insertOrbital(spaceObject);
    this.redraw = true;
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
    OrbitalViewer.context.translate(OrbitalViewer.canvas.width / 2.0, OrbitalViewer.canvas.height / 2.0);
    OrbitalViewer.redraw = true;
};

OrbitalViewer.repaintAxes = function (context, canvas) {
    var oldStyle, oldWidth, oldOpacity;

    oldStyle = context.strokeStyle;
    oldWidth = context.lineWidth;
    oldOpacity = context.globalAlpha;
    
    context.strokeStyle = OrbitalViewer.axisStyle;
    context.lineWidth = OrbitalViewer.axisWidth;
    context.globalAlpha = 0.5;

    context.beginPath();
    context.moveTo(-canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, 0);
    context.stroke();

    context.beginPath();
    context.moveTo(0, -canvas.height / 2.0);
    context.lineTo(0, canvas.height / 2.0);
    context.stroke();

    context.strokeStyle = oldStyle;
    context.lineWidth = oldWidth;
    context.globalAlpha = oldOpacity;
};

OrbitalViewer.repaint = function () {
    var context = OrbitalViewer.context;
    var canvas = OrbitalViewer.canvas;
    var objList;

    // LOW LAYER
    if (OrbitalViewer.redraw) {
        context.clearRect(-(canvas.width/2), -(canvas.height/2), canvas.width, canvas.height);
        
        OrbitalViewer.repaintAxes(context, canvas);
        // MEDIUM LAYER

        // OBJECT LAYER

        objList = OrbitalViewer.simulationEngine.objectList;
        if (objList !== null && objList !== undefined) {
            $.each(objList, function (index, element) {
                element.draw(context, OrbitalViewer.currentScale);
            });
        }
        OrbitalViewer.redraw = false;
    }
};

OrbitalViewer.getSecret = function () {
    return this.secretValue;
};