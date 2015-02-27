package ca.jewsbury.gravity.render.engine;

import ca.jewsbury.gravity.form.RenderPropertiesForm;
import ca.jewsbury.gravity.model.VisibleSpaceObject;
import ca.jewsbury.gravity.render.RenderFrame;
import ca.jewsbury.gravity.util.enumerated.SimulationEngineSignal;
import ca.jewsbury.gravity.render.panel.GraphPanel;
import ca.jewsbury.gravity.spacetime.Dimensional;
import ca.jewsbury.gravity.spacetime.SpaceContainer;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.model.IntegrationModel;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.integration.EulerModel;
import ca.jewsbury.gravity.util.factory.SpaceObjectFactory;
import javax.swing.SwingUtilities;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simulation Engine
 * 
 * Runnable class that progresses the simulation forward in time.  This is runnable
 * so that while it's active the GUI is still interactive.
 * 
 * @author Nathan
 */
public class SimulationEngine implements Runnable {

    private final Logger logger = LoggerFactory.getLogger(SimulationEngine.class);
    private final int SECOND_TO_MILLISECOND = 1000;

    private final SpaceContainer container;
    private final IntegrationModel integrator;
    private final GraphPanel graphPanel;
    private final RenderFrame parentFrame;

    private RenderPropertiesForm properties;
    private boolean runThread = true;
    private long timeDelayMillis;
    private int framesPerSecond;

    public SimulationEngine(RenderFrame parentFrame) throws SpaceTimeException {
        this.parentFrame = parentFrame;
        if (this.parentFrame == null) {
            throw new SpaceTimeException("Unable to locate parent frame.");
        }
        this.container = new SpaceContainer((long) 10, Dimensional.TwoD);
        this.integrator = new EulerModel();

        this.graphPanel = this.parentFrame.getGraphPanel();
        if (this.graphPanel == null) {
            throw new SpaceTimeException("Unable to locate graph panel.");
        }
    }

    public void setProperties(RenderPropertiesForm properties) {
        this.properties = properties;
    }

    public boolean initializeSimulation() {
        SimulationSet simulation;
        boolean initialized = false;

        if (parentFrame != null && properties != null) {
            framesPerSecond = properties.getFrameRate();
            timeDelayMillis = (long) (SECOND_TO_MILLISECOND / framesPerSecond);

            simulation = properties.getSimulationSet();
            if (simulation != null) {
                try {
                    displayInitialSimulation(simulation);
                    initialized = true;
                } catch (SpaceTimeException e) {
                    logger.error(e.getMessage());
                }
            }
        }
        return initialized;
    }

    private void displayInitialSimulation(SimulationSet set) throws SpaceTimeException {
        JSONArray objArr;
        JSONObject singleObject;
        Orbital orbital;

        if (set != null && set.getSimulationDefinition() != null) {
            try {
                objArr = set.getSimulationDefinition().getJSONArray("objectList");
                if (objArr != null && objArr.length() > 0) {
                    for (int i = 0; i < objArr.length(); i++) {
                        singleObject = objArr.getJSONObject(i);

                        if (singleObject != null) {
                            orbital = SpaceObjectFactory.generateSpaceObject(singleObject);
                            if (orbital != null) {
                                logger.info("Inserting orbital object '" + orbital.getIdName() + "'");
                                insertOrbital(orbital);
                            } else {
                                logger.warn("Orbital object was null.");
                            }
                        } else {
                            logger.warn("JSON single object was null.");
                        }
                    }
                    parentFrame.getUniversePanel().repaint();
                }
            } catch (JSONException e) {
                throw new SpaceTimeException(e.getMessage());
            }
        }
    }

    private void insertOrbital(Orbital orbital) {
        VisibleSpaceObject visible;
        if (container != null && orbital != null) {
            visible = new VisibleSpaceObject(orbital);
            if (container.insertOrbital(orbital)) {
                if (parentFrame.getUniversePanel() != null) {
                    parentFrame.getUniversePanel().insertVisibleObject(visible);
                }
            }
        }
    }

    public synchronized void sendSignal(SimulationEngineSignal signal) {

        switch (signal) {
            case RESUME: {
                if (!runThread) {
                    runThread = true;
                }
                break;
            }
            case PAUSE:
            case STOP: {
                if (runThread) {
                    runThread = false;
                }
                break;
            }
        }
    }

    @Override
    public void run() {
        logger.trace("Starting simulation engine.");
        long start, sleepTime;

        while (runThread) {
            start = System.currentTimeMillis();
            sleepTime = timeDelayMillis - (System.currentTimeMillis() - start);
            // UPDATE SIMULATION
            this.integrator.moveUniverseObjects(container);
            updateGraphPanel();
            // DRAW SIMULATION
            try {
                SwingUtilities.invokeLater(new Runnable() {
                    @Override
                    public void run() {
                        parentFrame.repaint();
                    }
                });
                Thread.sleep(sleepTime);
            } catch (InterruptedException e) {
                //
            }
        }
    }

    private void updateGraphPanel() {
        double[] totalEnergy;
        if (this.graphPanel != null) {
            totalEnergy = container.getTotalEnergy();
            if (totalEnergy != null) {
                this.graphPanel.setTotalEnergy(totalEnergy);
            }
        }
    }
}
