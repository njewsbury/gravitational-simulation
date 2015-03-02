package ca.jewsbury.gravity.util;

import ca.jewsbury.gravity.model.VisibleSpaceObject;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import java.awt.Color;
import java.util.Random;

/**
 * RenderUtils
 *
 * Utility class to translate simulation coords to render/panel coords.
 *
 * @author Nathan
 */
public abstract class RenderUtils {

    private static final Random random = new Random();

    private static double horizontalOrigin;
    private static double verticalOrigin;

    private static VisibleSpaceObject reference;
    private static SpaceTimeVector centerOfMass;

    private static double scale;

    public static Color getRandomColour() {
        return new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255));
    }

    public static void setOrigin(double horiz, double vert) {
        horizontalOrigin = horiz;
        verticalOrigin = vert;
    }

    public static void setReference(VisibleSpaceObject visible) {
        if (visible != null) {
            reference = visible;
        }
    }

    public static void setCenterOfMass(SpaceTimeVector com) {
        centerOfMass = com;
    }
    public static SpaceTimeVector getCenterofMass() {
        return centerOfMass;
    }

    public static void setScale(double scl) {
        scale = scl;
    }

    public static double getScale() {
        return scale;
    }

    public static SpaceTimeVector translateCoordinate(SpaceTimeVector physicalLocation) {
        SpaceTimeVector displayLocation;
        SpaceTimeVector offset;
        if (physicalLocation != null) {
            displayLocation = new SpaceTimeVector(physicalLocation);
            displayLocation.translate(new SpaceTimeVector((horizontalOrigin) / scale, (verticalOrigin) / scale, 0.0));
            if (reference != null) {
                offset = new SpaceTimeVector(reference.getSpaceObject().getPosition());
            } else if( centerOfMass != null ) {
                offset = new SpaceTimeVector(centerOfMass);
            } else {
                offset = new SpaceTimeVector();
            }
            offset.parityOperator();
            displayLocation.translate(offset);

        } else {
            displayLocation = new SpaceTimeVector();
        }
        return displayLocation;
    }

    public static double getHorizontalOrigin() {
        return horizontalOrigin;
    }

    public static double getVerticalOrigin() {
        return verticalOrigin;
    }
}
