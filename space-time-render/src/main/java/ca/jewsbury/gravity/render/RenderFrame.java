package ca.jewsbury.gravity.render;

import ca.jewsbury.gravity.form.RenderPropertiesForm;
import ca.jewsbury.gravity.render.engine.SimulationEngine;
import ca.jewsbury.gravity.render.engine.SimulationSet;
import ca.jewsbury.gravity.render.panel.ConfigPanel;
import ca.jewsbury.gravity.render.panel.GraphPanel;
import ca.jewsbury.gravity.render.panel.ImagePanel;
import ca.jewsbury.gravity.render.panel.UniversePanel;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import ca.jewsbury.gravity.spacetime.sim.SpaceTimeSimulation;
import ca.jewsbury.gravity.util.RenderUtils;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.util.Map;
import javax.swing.JFrame;
import javax.swing.JLayeredPane;
import javax.swing.JOptionPane;
import javax.swing.JSplitPane;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RenderFrame.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class RenderFrame extends ComponentAdapter implements ActionListener {

    public static final Font DISPLAY_FONT = new Font("Courier New", Font.BOLD, 12);

    private final Logger logger = LoggerFactory.getLogger(RenderFrame.class);
    private final String SPACE_BG_IMAGE = "space.jpg";
    private final int CONFIG_WIDTH = 200;
    //
    private final Map<String, SimulationSet> simulationSet;
    private SpaceTimeSimulation simulationModel;
    private SimulationEngine currentSimulation;
    private Thread simulationThread;
    private boolean isPaused = false;
    //
    private UniversePanel universePanel;
    private JFrame renderFrame;
    private ConfigPanel configPanel;
    private GraphPanel graphPanel;
    private ImagePanel bgPanel;
    //
    private JSplitPane rootDivider, configDivider;

    private boolean isVisible = false;

    public RenderFrame(Dimension minimum, Map<String, SimulationSet> simulationSet) {
        Dimension panelMinimum = new Dimension((int) minimum.getHeight(), (int) minimum.getHeight());
        this.simulationSet = simulationSet;
        currentSimulation = null;
        //

        //
        initializeJPanels(panelMinimum);

        initializeJFrame(minimum);
    }

    private void initializeJPanels(Dimension minimum) {
        logger.trace("Initializing all JPanel Objects...");

        logger.trace("Initializing JPanel - Background Panel.");
        bgPanel = new ImagePanel(SPACE_BG_IMAGE, minimum);
        logger.trace("Background Panel created - [" + bgPanel.getWidth() + ", " + bgPanel.getHeight() + "]");

        logger.trace("Initializing JPanel - Universe Panel.");
        universePanel = new UniversePanel(minimum);
        logger.trace("Universe Panel created - [" + universePanel.getWidth() + ", " + universePanel.getHeight() + "]");

        logger.trace("Initializing JPanel - Config Panel.");
        configPanel = new ConfigPanel(this);
        configPanel.setBackground(Color.darkGray);
        configPanel.setNewSize(new Dimension(CONFIG_WIDTH, (int) minimum.getHeight() - CONFIG_WIDTH));
        logger.trace("Config Panel created - [" + configPanel.getWidth() + ", " + configPanel.getHeight() + "]");

        logger.trace("Initializing JPanel - Graph Panel.");
        graphPanel = new GraphPanel(new Dimension(CONFIG_WIDTH, CONFIG_WIDTH));
        logger.trace("Graph Panel created - [" + graphPanel.getWidth() + ", " + graphPanel.getHeight() + "]");

    }

    private void initializeJFrame(Dimension minimum) {
        logger.trace("Initializing JFrame.");

        renderFrame = new JFrame("PHYS 4250 Final Project - Gravitational Simulation Render");
        renderFrame.setResizable(true);
        renderFrame.setMinimumSize(minimum);
        renderFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        Toolkit.getDefaultToolkit().setDynamicLayout(false);
        renderFrame.addComponentListener(this);
        logger.trace("JFrame created - [" + renderFrame.getWidth() + ", " + renderFrame.getHeight() + "]");
        addGuiComponents();
    }

    private void addGuiComponents() {
        JLayeredPane displayPane = new JLayeredPane();

        if (renderFrame != null && universePanel != null) {
            configDivider = new JSplitPane(JSplitPane.VERTICAL_SPLIT);
            rootDivider = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);

            displayPane.setPreferredSize(universePanel.getPreferredSize());
            displayPane.setMinimumSize(universePanel.getMinimumSize());

            displayPane.add(bgPanel, new Integer(1));
            displayPane.add(universePanel, new Integer(2));

            configDivider.setTopComponent(configPanel);
            configDivider.setBottomComponent(graphPanel);
            configDivider.setEnabled(false);

            rootDivider.setLeftComponent(displayPane);
            rootDivider.setRightComponent(configDivider);
            rootDivider.setEnabled(false);
            renderFrame.setContentPane(rootDivider);
        }
    }

    public void display() {
        if (renderFrame != null) {
            logger.trace("Displaying RenderFrame.");
            renderFrame.setVisible(true);
            isVisible = true;
        } else {
            logger.error("Attempted to display jFrame before creation.");
        }
    }

    @Override
    public void componentResized(ComponentEvent e) {
        Dimension panelDimension, configDimension;
        int width, height;
        if (isVisible) {
            logger.trace("Redraw event :: " + renderFrame.getWidth() + ", " + renderFrame.getHeight());
            width = renderFrame.getWidth() - CONFIG_WIDTH;
            height = renderFrame.getHeight();

            panelDimension = new Dimension(width, height);
            configDimension = new Dimension(CONFIG_WIDTH, height - CONFIG_WIDTH);

            this.configPanel.setNewSize(configDimension);
            this.bgPanel.setNewSize(panelDimension);
            this.universePanel.setNewSize(panelDimension);

            this.configDivider.setDividerLocation(configPanel.getHeight());
            this.rootDivider.setDividerLocation(universePanel.getWidth());
        }
    }

    private void setupNewSimulation() {
        RenderPropertiesForm propForm;

        logger.info("Starting new simulation!");
        propForm = new RenderPropertiesForm();
        try {
            propForm.gatherProperties(configPanel, simulationSet);
            if (propForm.isValid()) {
                currentSimulation = new SimulationEngine(this);
                currentSimulation.setProperties(propForm);

                renderFrame.validate();
                RenderUtils.setScale(propForm.getDisplayScale());
                if (currentSimulation.initializeSimulation()) {
                    this.universePanel.setTraceOrbits(propForm.isTraceOrbits());
                    simulationThread = new Thread(currentSimulation);
                    logger.info("Simulation thread initialized.");
                } else {
                    JOptionPane.showMessageDialog(renderFrame,
                            "Unable to initialize simulation", "SpaceTime Exception",
                            JOptionPane.WARNING_MESSAGE);
                }
            }
        } catch (SpaceTimeException e) {
            JOptionPane.showMessageDialog(renderFrame,
                    e.getMessage(), "SpaceTime Exception",
                    JOptionPane.WARNING_MESSAGE);
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e != null && e.getActionCommand() != null) {
            switch (e.getActionCommand()) {
                case "NEW": {
                    logger.info("Run New Simulation.");
                    // START NEW SIMULATION
                    setupNewSimulation();
                    //
                    configPanel.getPlaySim().setEnabled(true);
                    configPanel.getPauseSim().setEnabled(false);
                    configPanel.getStopSim().setEnabled(true);
                    configPanel.getNewSim().setEnabled(false);
                    break;
                }
                case "PAUSE": {
                    if (!isPaused) {
                        logger.info("Pause simulation.");
                        // PAUSE SIMULATION
                        if (currentSimulation != null) {
                            currentSimulation.sendSignal("PAUSE");
                            try {
                                simulationThread.join();
                            } catch (InterruptedException ex) {
                                logger.error(ex.getMessage());
                            }
                        }
                        //
                        isPaused = true;
                        configPanel.getPauseSim().setEnabled(false);
                        configPanel.getPlaySim().setEnabled(true);
                        configPanel.getPlaySim().setText("Resume simulation");
                    }
                    break;
                }
                case "PLAY": {
                    if (isPaused) { // Simulation was paused, restart the simulation
                        logger.info("Resume simulation");
                        isPaused = false;

                        if (currentSimulation != null && simulationThread != null) {
                            simulationThread = new Thread(currentSimulation);
                            currentSimulation.sendSignal("RESUME");
                            simulationThread.start();
                        }
                    } else {
                        logger.info("New Simulation.");
                        if (simulationThread != null) {
                            simulationThread.start();
                        }
                    }

                    configPanel.getNewSim().setEnabled(false);
                    configPanel.getPauseSim().setEnabled(true);
                    configPanel.getPlaySim().setEnabled(false);
                    configPanel.getStopSim().setEnabled(true);
                    break;
                }
                case "STOP": {
                    logger.info("Stop Simulation");
                    isPaused = false;

                    if (currentSimulation != null && simulationThread != null) {
                        if (simulationThread.isAlive()) {
                            currentSimulation.sendSignal("STOP");
                            try {
                                simulationThread.join();
                                simulationThread = null;
                                currentSimulation = null;
                                
                            } catch (InterruptedException ex) {
                                logger.error(ex.getMessage());
                            }
                        }
                    }

                    configPanel.getNewSim().setEnabled(true);
                    configPanel.getPauseSim().setEnabled(false);
                    configPanel.getPlaySim().setEnabled(false);
                    configPanel.getStopSim().setEnabled(false);
                    configPanel.getPlaySim().setText("Play simulation");
                    break;
                }
            }
        }
    }

    public Map<String, SimulationSet> getSimulationSet() {
        return simulationSet;
    }

    public UniversePanel getUniversePanel() {
        return universePanel;
    }
    
    public GraphPanel getGraphPanel() {
        return graphPanel;
    }
    
    public void repaint() {
        if( renderFrame != null ) {
            renderFrame.repaint();
        }
    }
}
