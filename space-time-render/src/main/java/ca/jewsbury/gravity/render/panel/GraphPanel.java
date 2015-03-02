package ca.jewsbury.gravity.render.panel;

import ca.jewsbury.gravity.render.RenderFrame;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.util.Iterator;
import java.util.NoSuchElementException;
import javax.swing.JPanel;
import javax.swing.border.BevelBorder;
import org.apache.commons.collections.buffer.CircularFifoBuffer;

/**
 * GraphPanel.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class GraphPanel extends JPanel implements RenderResizable {

    private final String TOTAL_ENERGY_STRING_TEMPLATE = "Total E. [%010.3f]";
    private final String TOTAL_KINETIC_STRING_TEMPLATE = "Total K. [%010.3f]";
    private final String TOTAL_POTNL_STRING_TEMPLATE = "Total U. [%010.3f]";

    private final Dimension graphSize;
    private String totalEnergyString;
    private String totalKinectString;
    private String totalPotentialString;
    private double[] totalEnergy;
    
    private CircularFifoBuffer energyBuffer;

    public GraphPanel(Dimension size) {
        graphSize = size;
        this.setBackground(Color.white);

        setPreferredSize(graphSize);
        setMaximumSize(graphSize);
        setSize(graphSize);

        setBorder(new BevelBorder(BevelBorder.LOWERED, Color.lightGray, Color.black));
        this.totalEnergy = new double[2];
        setEnergyStrings();
    }

    public void setEnergyBuffer(CircularFifoBuffer energyBuffer) {
        this.energyBuffer = energyBuffer;
    }

    private void setEnergyStrings() {
        totalEnergyString = String.format(TOTAL_ENERGY_STRING_TEMPLATE, totalEnergy[0] + totalEnergy[1]);
        totalKinectString = String.format(TOTAL_KINETIC_STRING_TEMPLATE, totalEnergy[0]);
        totalPotentialString = String.format(TOTAL_POTNL_STRING_TEMPLATE, totalEnergy[1]);
    }

    public void setTotalEnergy(double[] totalEnergy) {
        this.totalEnergy = totalEnergy;
        setEnergyStrings();
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D gfx;

        gfx = (Graphics2D) g;

        gfx.setColor(Color.black);
        gfx.setFont(RenderFrame.DISPLAY_FONT);
        gfx.drawString(totalEnergyString, 5, 15);
        gfx.drawString(totalKinectString, 5, 30);
        gfx.drawString(totalPotentialString, 5, 45);

        visualizeBuffer(gfx);
    }

    private void visualizeBuffer(Graphics2D gfx) {
        Iterator<Double> iterator;
        Double energyVal = 0.0;
        double lastVal;
        Color oldColor;
        int index = 0;
        if (this.energyBuffer != null) {
            iterator = energyBuffer.iterator();
            oldColor = gfx.getColor();
            gfx.setColor(Color.red);
            while (iterator.hasNext()) {
                if (index == 0) {
                    energyVal = iterator.next();
                } else {
                    lastVal = energyVal;
                    try {
                    if ((energyVal = iterator.next()) != null) {
                        gfx.drawLine(index - 1, (this.getHeight() - (int) Math.abs(lastVal)), index, (this.getHeight() - (int) Math.abs(energyVal)));
                    }
                    } catch(NoSuchElementException e ) {
                        //
                    }
                }
                index++;
            }
            gfx.setColor(oldColor);
        }

    }

    @Override
    public void setNewSize(Dimension newDimension) {
        //Constant Size
    }

}
