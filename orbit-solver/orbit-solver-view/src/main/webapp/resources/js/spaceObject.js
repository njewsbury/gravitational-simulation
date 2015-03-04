var SpaceObject = function(identifier, q, p, mass, massDensity ) {
    this.id = identifier;
    this.position = q;
    this.momentum = p;
    
    this.mass = mass;
    this.massDensity = massDensity;
    
    this.colour = "#04FF04";
};

SpaceObject.prototype.draw = function(context, scale) {
    var oldStyle, oldWidth, oldFill;
    
    oldStyle = context.strokeStyle;
    oldWidth = context.lineWidth;
    oldFill = context.fillStyle;
    
    context.fillStyle = this.colour;
    context.lineWidth = 1/scale[0];
    
    context.beginPath();
    context.arc(this.position[0], this.position[1], 10*(this.mass*this.massDensity)/scale[0], 2*Math.PI, false);
    context.fill();
    context.stroke();
    
    context.strokeStyle = oldStyle;
    context.lineWidth = oldWidth;
    context.fillStyle = oldFill;
};

SpaceObject.prototype.translate = function( delta ) {
  this.position[0] += delta[0];  
};