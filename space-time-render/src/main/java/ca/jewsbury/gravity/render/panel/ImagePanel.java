package ca.jewsbury.gravity.render.panel;

import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Image;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import javax.swing.JPanel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ImagePanel.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class ImagePanel extends JPanel implements RenderResizable {

    private final Logger logger = LoggerFactory.getLogger(ImagePanel.class);

    private Image backgroundImage;

    public ImagePanel(String img, Dimension size) {
        Image bgImage;

        try {
            bgImage = ImageIO.read(new File(img));
            if (bgImage != null) {
                this.backgroundImage = bgImage;
            }
        } catch (IOException e) {
            logger.error("Unable to locate background file '" + img + "'");
        }
        setPanelProperties(size);
    }

    private void setPanelProperties(Dimension size) {
        this.setPreferredSize(size);
        this.setMinimumSize(size);
        this.setSize(size);
        setLayout(null);
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        //logger.info("Painting new Image Panel. >> " + (this.getWidth() + ", " + this.getHeight()));
        g.drawImage(backgroundImage, 0, 0, this.getWidth(), this.getHeight(), null);
    }

    @Override
    public void setNewSize(Dimension newDimension) {
        this.setPreferredSize(newDimension);
        this.setSize(newDimension);
        repaint();
    }
}
