function SpaceObject(identifier, q, p, mass, massDensity ) {
    this.id = identifier;
    this.position = q;
    this.momentum = p;
    
    this.colour = "#04FF04";
}

SpaceObject.draw = function(context) {
    var oldStyle, oldWidth, oldFill;
    
    oldStyle = context.strokeStyle;
    oldWidth = context.lineWidth;
    oldFill = context.fillStyle;
    
    context.fillStyle = this.colour;
    context.beginPath();
    context.arc(this.q[0], this.q[1], 1, 2*Math.PI, false);
    context.fill();
    context.stroke();
    
    context.strokeStyle = oldStyle;
    context.lineWidth = oldWidth;
    context.fillStyle = oldFill;
}