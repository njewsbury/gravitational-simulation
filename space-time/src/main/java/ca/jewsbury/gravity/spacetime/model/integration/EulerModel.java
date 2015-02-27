package ca.jewsbury.gravity.spacetime.model.integration;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * EulerModel.class
 *
 *
 *
 * 16-Feb-2015
 *
 * @author Nathan
 */
public class EulerModel implements Integrator {

    private final Logger logger = LoggerFactory.getLogger(EulerModel.class);
    private final SpaceContainer container;

    public EulerModel(SpaceContainer container) {
        this.container = container;
    }

    @Override
    public void moveContainedObjects(double timeDelta) {
        Orbital[] arr;

        if (this.container != null) {
            arr = this.container.getOrbitalArray();

            if (arr != null && arr.length > 0) {
                for (Orbital orbital : arr) {
                    if (!orbital.isStatic()) {
                        //logger.info("Updating position of :: " + orbital.getIdName());
                        updateSinglePosition(orbital, timeDelta);
                        //logger.info("########### DONE ###############");
                    }
                }

                for (Orbital orbital : arr) {
                    if (!orbital.isStatic()) {
                        //logger.info("~~~~~~~~~ Updating properties of '" + orbital.getIdName() + "' ~~~~~~~~~~~~" );
                        updateOrbitalProperties(orbital, timeDelta);
                        //logger.info(" ################### DONE ###############");
                    }
                }
                this.container.refreshEnergyValues();
            }
        }
    }

    @Override
    public void updateSinglePosition(Orbital orbital, double timeDelta) {
        SpaceTimeVector currentForce;
        SpaceTimeVector displacement;
        if (orbital != null) {
            currentForce = this.container.getNetForce(orbital);
            currentForce.transform((1.0 / orbital.getMass()));

            orbital.setAcceleration(new SpaceTimeVector(currentForce));
            //logger.info("Calculated Acceleration is :: " + currentForce.toString());

            displacement = new SpaceTimeVector(orbital.getVelocity());
            currentForce.transform((timeDelta / 2.0));
            displacement.translate(currentForce);
            displacement.transform(timeDelta);

            //logger.info("Displacement is :: " + displacement.toString());
            //logger.info("Current Position is :: " + orbital.getPosition().toString());
            orbital.moveObject(displacement);
            
            //logger.info("New Position is     :: " + orbital.getPosition().toString());
        }
    }

    @Override
    public void updateOrbitalProperties(Orbital orbital, double timeDelta) {
        SpaceTimeVector currentForce;

        if (orbital != null) {
            currentForce = this.container.getNetForce(orbital); //            
            currentForce.transform((1.0 / orbital.getMass())); //alpha
            //logger.info("Calculated Acceleration is :: " + currentForce.toString());
            //logger.info("Orbital Acceleration is :: " + orbital.getAcceleration());
            
            currentForce.translate(orbital.getAcceleration()); //( a + alpha )
            //logger.info("Velocity Initial is :: " + currentForce.toString());
            
            currentForce.transform((1.0 / 2.0)); //( a + alpha ) / 2.0
            //logger.info("Halved :: " + currentForce.toString() );
            
            currentForce.transform(timeDelta); //dT * (a + alpha ) / 2.0
            //logger.info("New Velocity is :: " + currentForce.toString());
            orbital.increaseVelocity(currentForce);
        }
    }
}
