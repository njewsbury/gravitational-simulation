package ca.jewsbury.gravity.util;

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

    private static double scale;

    public static Color getRandomColour() {
        return new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255));
    }

    public static void setOrigin(double horiz, double vert) {
        horizontalOrigin = horiz;
        verticalOrigin = vert;
    }

    public static void setScale(double scl) {
        scale = scl;
    }

    public static double getScale() {
        return scale;
    }

    public static SpaceTimeVector translateCoordinate(SpaceTimeVector physicalLocation) {
        SpaceTimeVector displayLocation;
        if (physicalLocation != null) {
            displayLocation = new SpaceTimeVector(physicalLocation);

            displayLocation.translate(new SpaceTimeVector(horizontalOrigin / scale, verticalOrigin / scale, 0.0));
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
