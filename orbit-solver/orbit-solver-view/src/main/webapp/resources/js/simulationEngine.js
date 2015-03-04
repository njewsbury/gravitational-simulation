var SimulationEngine = function( identifier ) {
    this.id = identifier;
    this.objectList = [];    
};

SimulationEngine.prototype.insertOrbital = function( spaceObject ) {
    this.objectList.push(spaceObject);
};

SimulationEngine.prototype.getOrbitalList = function() {
    return this.objectList;
};

SimulationEngine.prototype.moveAllObjects = function() {
    $.each( this.objectList, function(index, element) {
        console.log("Moving :: " + element.id );
        element.translate([1, 0]);      
    });
    
};