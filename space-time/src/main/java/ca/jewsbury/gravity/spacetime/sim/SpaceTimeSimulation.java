package ca.jewsbury.gravity.spacetime.sim;

import ca.jewsbury.gravity.spacetime.SpaceContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SpaceTimeSimulation.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
@Deprecated
public abstract class SpaceTimeSimulation implements Runnable {

    private final Logger logger = LoggerFactory.getLogger(SpaceTimeSimulation.class);

    protected final SpaceContainer theUniverse;
    protected boolean simulationCondition;
    protected long seconds;

    public SpaceTimeSimulation(SpaceContainer container) {
        this.theUniverse = container;
        this.simulationCondition = true;
        this.seconds = 0;
    }

    /**
     * Runs the simulation to completion.
     */
    @Override
    public void run() {
        logger.info("Starting simulation.");
        try {
            while (simulationCondition) {
                simulationSingleStep();
                //Thread.sleep(0, 100000);
                Thread.sleep(1000);
            }
        } catch (InterruptedException e) {
            logger.error(e.getMessage());
        }
    }

    /**
     * Does a single step in the simulation, useful for testing || streaming.
     * Gives more control to the simulation accessor.
     */
    public void simulationSingleStep() {
        seconds++;
        moveUniverseObjects();
        simulationCondition = checkSimulationConditions();
    }

    public abstract boolean checkSimulationConditions();

    protected abstract void moveUniverseObjects();

    public abstract void simulationInterrupt(SimulationInterrupt interrupt);

    public SpaceContainer getTheUniverse() {
        return theUniverse;
    }

    public long getTime() {
        return seconds;
    }
}
