package ca.jewsbury.gravity.model;

import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
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
 * Visible Space Object
 *
 * Wrapper class for a Space Object. Defines the objects visible properties ie.
 * it's circle and colour. Required for rendering.
 *
 * @author Nathan
 */
public class VisibleSpaceObject {

    private final Logger logger = LoggerFactory.getLogger(VisibleSpaceObject.class);

    private Color objectColour;
    private Orbital spaceObject;

    protected CircularFifoBuffer lastPositions;
    private int positionRequests;

    public VisibleSpaceObject(Orbital object) {
        if (object != null) {
            spaceObject = object;
            objectColour = RenderUtils.getRandomColour();
        }
        lastPositions = new CircularFifoBuffer(1000);
        positionRequests = 0;
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

        if (positionRequests % 3*SpaceTimeConstants.PUSH_REQUEST_LIMIT == 0) {
            this.lastPositions.add(new SpaceTimeVector(displayX, displayY, 0));
            positionRequests = 0;
        }

        return new int[]{displayX, displayY};
    }

    public void paint(Graphics2D gfx) {
        Ellipse2D visual = getObjectVisual();
        int newx, newy;

        newx = (int) ((visual.getCenterX() + (spaceObject.getVelocity().getxCoord() / RenderUtils.getScale())));
        newy = (int) ((visual.getCenterY() + (spaceObject.getVelocity().getyCoord() / RenderUtils.getScale())));

        //gfx.setColor(Color.CYAN);
        //gfx.setStroke(new BasicStroke(2));
        //gfx.drawLine((int) visual.getCenterX(), (int) visual.getCenterY(), newx, newy);
        // Draw the space object
        gfx.setColor(objectColour);
        gfx.fill(visual);
        gfx.setColor(objectColour.brighter());
        gfx.setStroke(new BasicStroke(2));
        gfx.draw(visual);
    }

    public void traceLastPositions(Graphics2D gfx) {
        SpaceTimeVector currentPosition, lastPosition;
        Iterator<SpaceTimeVector> positionIterator;
        int pos = 0;

        lastPosition = null;
        if (lastPositions != null && lastPositions.size() > 1) {
            gfx.setColor(this.objectColour.brighter().brighter());
            positionIterator = lastPositions.iterator();
            while (positionIterator.hasNext()) {
                if (pos > 0) {
                    currentPosition = positionIterator.next();
                    // DRAW LINE
                    if (lastPosition != null) {
                        gfx.drawLine((int) ((currentPosition.getxCoord() + this.spaceObject.getRadius() )),
                                (int) ((currentPosition.getyCoord() + this.spaceObject.getRadius())),
                                (int) ((lastPosition.getxCoord() + this.spaceObject.getRadius())),
                                (int) ((lastPosition.getyCoord() + this.spaceObject.getRadius()))
                        );
                    }
                    //
                    lastPosition = currentPosition;
                } else {
                    lastPosition = positionIterator.next();
                }
                pos++;
            }
        }
    }

    public Orbital getSpaceObject() {
        return spaceObject;
    }
}
