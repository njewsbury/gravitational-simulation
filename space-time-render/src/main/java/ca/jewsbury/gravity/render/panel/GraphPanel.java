package ca.jewsbury.gravity.render.panel;

import ca.jewsbury.gravity.render.RenderFrame;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import javax.swing.JPanel;
import javax.swing.border.BevelBorder;

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
    
    private final Dimension graphSize;
    private String totalEnergyString;
    private double totalEnergy;

    public GraphPanel(Dimension size) {
        graphSize = size;
        totalEnergy = 0.0;
        this.setBackground(Color.white);

        setPreferredSize(graphSize);
        setMaximumSize(graphSize);
        setSize(graphSize);

        setBorder(new BevelBorder(BevelBorder.LOWERED, Color.lightGray, Color.black));
        totalEnergyString = String.format(TOTAL_ENERGY_STRING_TEMPLATE, totalEnergy);
    }
    
    public void setTotalEnergy(double totalEnergy) {
        this.totalEnergy = totalEnergy;
        totalEnergyString = String.format(TOTAL_ENERGY_STRING_TEMPLATE, totalEnergy);
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D gfx;

        gfx = (Graphics2D) g;

        gfx.setColor(Color.black);
        gfx.setFont(RenderFrame.DISPLAY_FONT);
        gfx.drawString(totalEnergyString, 5, 15);

    }

    @Override
    public void setNewSize(Dimension newDimension) {
        //Constant Size
    }

}
