package ca.jewsbury.gravity.model;

import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.util.RenderUtils;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.Ellipse2D;
import java.util.Iterator;
import org.apache.commons.collections.buffer.CircularFifoBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Nathan
 */
public class VisibleSpaceObject {

    private final Logger logger = LoggerFactory.getLogger(VisibleSpaceObject.class);

    private Color objectColour;
    private Orbital spaceObject;

    public VisibleSpaceObject(Orbital object) {
        if (object != null) {
            spaceObject = object;
            objectColour = RenderUtils.getRandomColour();
        }
    }

    public Ellipse2D getObjectVisual() {
        int[] position = getCornerCoords();
        Ellipse2D obj;

        obj = new Ellipse2D.Double(
                position[0], position[1],
                (spaceObject.getRadius() * 2 * RenderUtils.getScale()),
                (spaceObject.getRadius() * 2 * RenderUtils.getScale())
        );
        return obj;
    }

    public int[] getCornerCoords() {
        SpaceTimeVector displayLocation = RenderUtils.translateCoordinate(this.spaceObject.getPosition());

        int displayX = (int) ((displayLocation.getxCoord() * RenderUtils.getScale() - spaceObject.getRadius() * RenderUtils.getScale()));
        int displayY = (int) ((displayLocation.getyCoord() * RenderUtils.getScale() - spaceObject.getRadius() * RenderUtils.getScale()));

        return new int[]{displayX, displayY};
    }

    public void paint(Graphics2D gfx) {
        Ellipse2D visual = getObjectVisual();
        int newx, newy;

        newx = (int) ((visual.getCenterX() + (spaceObject.getVelocity().getxCoord() / RenderUtils.getScale())));
        newy = (int) ((visual.getCenterY() + (spaceObject.getVelocity().getyCoord() / RenderUtils.getScale())));

        gfx.setColor(Color.CYAN);
        gfx.setStroke(new BasicStroke(2));
        gfx.drawLine((int) visual.getCenterX(), (int) visual.getCenterY(), newx, newy);
        // Draw the space object
        gfx.setColor(objectColour);
        gfx.fill(visual);
        gfx.setColor(objectColour.brighter());
        gfx.setStroke(new BasicStroke(2));
        gfx.draw(visual);
    }

    public void traceLastPositions(Graphics2D gfx) {
        CircularFifoBuffer buffer = this.spaceObject.getLastPositions();
        SpaceTimeVector currentPosition, lastPosition;
        Iterator<SpaceTimeVector> positionIterator;
        int pos = 0;

        lastPosition = null;
        if (buffer != null && buffer.size() > 1) {
            gfx.setColor(Color.white);
            positionIterator = buffer.iterator();
            while (positionIterator.hasNext()) {
                if (pos > 0) {
                    currentPosition = RenderUtils.translateCoordinate(positionIterator.next());
                    //currentPosition = positionIterator.next();
                    // DRAW LINE
                    if (lastPosition != null) {
                        gfx.drawLine((int) ((currentPosition.getxCoord() )* RenderUtils.getScale()),
                                (int) ((currentPosition.getyCoord() )* RenderUtils.getScale()),
                                (int) ((lastPosition.getxCoord() )* RenderUtils.getScale()),
                                (int) ((lastPosition.getyCoord() )* RenderUtils.getScale())
                        );
                    }
                    //
                    lastPosition = currentPosition;
                } else {
                    lastPosition = RenderUtils.translateCoordinate(positionIterator.next());
                    //lastPosition = positionIterator.next();
                }
                pos++;
            }
        }
    }

    public Orbital getSpaceObject() {
        return spaceObject;
    }
}
