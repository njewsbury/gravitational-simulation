package ca.jewsbury.gravity.render;

import ca.jewsbury.gravity.render.engine.SimulationEngine;
import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.sim.SpaceTimeSimulation;
import java.awt.Dimension;

/**
 *
 * @author Nathan
 */
public class SpaceTimeRenderer {

    
    
    private static final Dimension minimum = new Dimension(800, 600);
    private static final double DISPLAY_WEIGHT = 0.8;

    private static SimulationEngine engine;
    private static SpaceTimeSimulation simulation;
    private static SpaceContainer container;

    private static Orbital earth, comet;

    public static void main(String[] args) {
        
        /*
            In theory, the main program could reach out to
            the central server to collect JSON points
            and convert them into simulation sets
            prior to opening the renderer.
        */
        RenderFrame rFrame = new RenderFrame( minimum, null );        
        rFrame.display();
        
        /*
         container = new SpaceContainer(1, Dimensional.TwoD);
        
        
         simulation = new SimpleSatelliteModel(container);

         earth = new MassiveObject("earth");
         earth.setMass(305E8);

         comet = new DynamicObject("comet");
         comet.setMass(200.0);
         comet.setPosition(new SpaceTimeVector(70.0, 0.0));
         comet.setVelocity(new SpaceTimeVector(0.0, 2.0, 0.0));
        
         if (!container.insertOrbital(earth)) {
         System.out.println("Couldn't insert earth");
         }
         if (!container.insertOrbital(comet)) {
         System.out.println("Couldn't insert comet");
         }
        
         JFrame renderDisplay = initializeJFrame();


         //info.setMinimumSize( new Dimension( (int)(minimum.getWidth() - (minimum.getWidth()*DISPLAY_WEIGHT)), (int)minimum.getHeight()));
         info.setBackground(Color.black);
         setupInformationPanel( info );
         System.out.println(" >> Run the simulation");

         renderDisplay.pack();
         renderDisplay.setVisible(true);
         engine.run();
         */

    }
}
