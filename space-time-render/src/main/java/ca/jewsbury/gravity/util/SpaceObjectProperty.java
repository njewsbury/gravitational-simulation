package ca.jewsbury.gravity.util;

/**
 *
 * @author Nathan
 */
public enum SpaceObjectProperty {

    OBJECT_ID("objectName"),
    OBJECT_MASS("objectMass"),
    OBJECT_RADIUS("objectRadius"),
    IS_STATIC("isStatic"),
    INITIAL_X("initialX"),
    INITIAL_Y("initialY"),
    INITIAL_Z("initialZ"),
    INITIAL_VX("initialVX"),
    INITIAL_VY("initialVY"), 
    INITIAL_VZ("initialVZ");
    
    private final String jsonProperty;
    private SpaceObjectProperty(String jsonProp) {
        this.jsonProperty = jsonProp;
    }
    public String getJsonProperty() {
        return this.jsonProperty;
    }
}
