package ca.jewsbury.gravity.render.panel;

import ca.jewsbury.gravity.model.VisibleSpaceObject;
import ca.jewsbury.gravity.util.RenderUtils;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Stroke;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JPanel;
import org.apache.commons.collections.buffer.CircularFifoBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Nathan
 */
public class UniversePanel extends JPanel implements RenderResizable {

    private final Logger logger = LoggerFactory.getLogger(UniversePanel.class);
    private final Dimension minimumDimension;

    private double horizontalOrigin;
    private double verticalOrigin;
    private boolean traceOrbits;

    private final List<VisibleSpaceObject> objectList;

    @SuppressWarnings("Convert2Diamond")
    public UniversePanel(Dimension dimension) {
        this.minimumDimension = dimension;
        this.objectList = new ArrayList<VisibleSpaceObject>();
        //
        setOpaque(false);
        this.setPreferredSize(minimumDimension);
        this.setSize(minimumDimension);
        traceOrbits = false;
        //
        horizontalOrigin = (this.getWidth() + 1) / 2.0;
        verticalOrigin = (this.getHeight() + 1) / 2.0;
    }

    public void insertVisibleObject(VisibleSpaceObject spaceObject) {
        if (spaceObject != null) {
            this.objectList.add(spaceObject);
        }
    }

    public void setTraceOrbits(boolean trace) {
        traceOrbits = trace;
    }

    /**
     * The Panel has been resized, things need to be recalculated.
     *
     * @param newDimension
     */
    @Override
    public void setNewSize(Dimension newDimension) {
        this.setPreferredSize(newDimension);
        this.setSize(newDimension);

        horizontalOrigin = (this.getWidth() + 1) / 2.0;
        verticalOrigin = (this.getHeight() + 1) / 2.0;

        RenderUtils.setOrigin(horizontalOrigin, verticalOrigin);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        Graphics2D gfx = (Graphics2D) g.create();
        Stroke defaultStroke = gfx.getStroke();
        int[] currentPosition, lastPosition;

        drawAxis(gfx);
        gfx.setStroke(defaultStroke);

        if (objectList != null && objectList.size() > 0) {
            for (VisibleSpaceObject spaceObject : objectList) {

                if (traceOrbits) {
                    spaceObject.traceLastPositions(gfx);
                }
                spaceObject.paint(gfx);
            }
        }
        gfx.dispose();
    }

    private void drawAxis(Graphics2D gfx) {
        gfx.setColor(new Color(64, 0, 0));
        gfx.setStroke(new BasicStroke(3));
        gfx.drawLine((int) horizontalOrigin, 0, (int) horizontalOrigin, this.getHeight());
        gfx.drawLine(0, (int) verticalOrigin, this.getWidth(), (int) verticalOrigin);
    }

    public void refreshPanel() {
        this.removeAll();
        this.objectList.clear();
        this.repaint();
    }
}
