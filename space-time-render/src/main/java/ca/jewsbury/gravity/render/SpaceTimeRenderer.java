package ca.jewsbury.gravity.render;

import java.awt.Dimension;

/**
 *  Space Time Renderer
 * 
 * Root class for opening the render display.  Reads in local simulation initial
 * conditions and allows the user to play/pause the defined orbit.
 * 
 * 
 * @author Nathan Jewsbury
 */
public class SpaceTimeRenderer {
    private static final Dimension minimum = new Dimension(800, 600);

    public static void main(String[] args) {
        
        /*
            In theory, the main program could reach out to
            the central server to collect JSON points
            and convert them into simulation sets
            prior to opening the renderer.
        */
        RenderFrame rFrame = new RenderFrame( minimum, null );        
        rFrame.display();
    }
}
