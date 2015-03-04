function SimulationEngine( identifier ) {
    this.id = identifier;
    this.objectList = [];
    
}

SimulationEngine.insertOrbital = function( spaceObject ) {
    this.objectList.push(spaceObject);
}