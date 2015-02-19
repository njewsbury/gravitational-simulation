package ca.jewsbury.gravity.render.panel;

import ca.jewsbury.gravity.render.RenderFrame;
import ca.jewsbury.gravity.render.engine.DefaultSimulationSet;
import ca.jewsbury.gravity.render.engine.SimulationSet;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;
import javax.swing.Box;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFormattedTextField;
import javax.swing.JLabel;
import javax.swing.JPanel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RenderProperties.class
 *
 *
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class ConfigPanel extends JPanel implements RenderResizable {

    private final Logger logger = LoggerFactory.getLogger(ConfigPanel.class);
    private final RenderFrame parentFrame;
    private final Map<String, SimulationSet> simulationSet;

    private JFormattedTextField scaleInput, timestepInput, frameRateInput;
    private JCheckBox shouldTrace;
    private JComboBox simulationSelector;
    private JButton newSim, playSim, pauseSim, stopSim;

    public ConfigPanel(RenderFrame parentFrame) {
        GridBagConstraints grid = new GridBagConstraints();

        this.parentFrame = parentFrame;

        if (parentFrame != null) {
            this.simulationSet = parentFrame.getSimulationSet();

            this.setLayout(new GridBagLayout());

            grid.anchor = GridBagConstraints.NORTHWEST;
            grid.fill = GridBagConstraints.HORIZONTAL;
            grid.insets = new Insets(0, 0, 5, 0);
            grid.weighty = 0;

            this.add(Box.createVerticalStrut(15), grid);
            grid.gridy++;
            initializeComponents(grid);
        } else {
            this.simulationSet = null;
            logger.error("Parent frame is null.");
        }
    }

    private void initializeComponents(GridBagConstraints grid) {
        logger.info("Initializing Config Panel.");
        grid.gridx = 0;
        grid.gridy = 0;

        addInputDisplayScale(grid);
        addInputFrameRate(grid);
        addInputTimestep(grid);
        addTraceCheckbox(grid);

        // Create a spacer inbetween inputs & buttons.
        grid.weighty = 1;
        grid.gridy++;
        this.add(Box.createGlue(), grid);
        grid.weighty = 0;

        addSimulationSelector(grid);
        initializeButtons(grid);
    }

    private void addInputDisplayScale(GridBagConstraints grid) {
        JLabel textLabel;

        scaleInput = new JFormattedTextField((DecimalFormat) NumberFormat.getNumberInstance(Locale.ENGLISH));
        scaleInput.setColumns(15);
        scaleInput.setValue(0.5);

        textLabel = new JLabel("Display scale");
        textLabel.setForeground(Color.white);
        textLabel.setFont(RenderFrame.DISPLAY_FONT);
        textLabel.setLabelFor(scaleInput);

        grid.gridy++;
        this.add(textLabel, grid);

        grid.gridy++;
        this.add(scaleInput, grid);
    }
    
    private void addInputFrameRate(GridBagConstraints grid ) {
        JLabel textLabel;
        
        frameRateInput = new JFormattedTextField((DecimalFormat) NumberFormat.getNumberInstance(Locale.ENGLISH));
        frameRateInput.setColumns(15);
        frameRateInput.setValue(60);
        
        textLabel = new JLabel("Frame rate (fps)");
        textLabel.setForeground(Color.white);
        textLabel.setFont(RenderFrame.DISPLAY_FONT);
        textLabel.setLabelFor(frameRateInput);

        grid.gridy++;
        this.add(textLabel, grid);

        grid.gridy++;
        this.add(frameRateInput, grid);
    }

    private void addInputTimestep(GridBagConstraints grid) {
        JLabel textLabel;

        timestepInput = new JFormattedTextField((DecimalFormat) NumberFormat.getNumberInstance(Locale.ENGLISH));
        timestepInput.setColumns(15);
        timestepInput.setValue(0);

        textLabel = new JLabel("Render timeout (ms)");
        textLabel.setForeground(Color.white);
        textLabel.setFont(RenderFrame.DISPLAY_FONT);
        textLabel.setLabelFor(timestepInput);

        grid.gridy++;
        this.add(textLabel, grid);

        grid.gridy++;
        this.add(timestepInput, grid);
    }

    private void addTraceCheckbox(GridBagConstraints grid) {

        shouldTrace = new JCheckBox("Trace Orbits");
        shouldTrace.setForeground(Color.white);
        shouldTrace.setFont(RenderFrame.DISPLAY_FONT);
        shouldTrace.setContentAreaFilled(false);

        shouldTrace.setSelected(true);
        grid.gridy++;
        this.add(shouldTrace, grid);
    }

    private void addSimulationSelector(GridBagConstraints grid) {
        JLabel textLabel;

        simulationSelector = new JComboBox();
        simulationSelector.addItem(DefaultSimulationSet.DEFAULT_IDENTIFIER);

        if (simulationSet != null && simulationSet.size() > 0) {
            for (SimulationSet simulation : simulationSet.values()) {
                simulationSelector.addItem(simulation.getDisplayName());
            }
        }

        textLabel = new JLabel("Simulation Selection");
        textLabel.setForeground(Color.white);
        textLabel.setFont(RenderFrame.DISPLAY_FONT);
        textLabel.setLabelFor(simulationSelector);

        grid.gridy++;
        this.add(textLabel, grid);
        grid.gridy++;
        this.add(simulationSelector, grid);
    }

    private void initializeButtons(GridBagConstraints grid) {
        grid.anchor = GridBagConstraints.PAGE_END;

        newSim = new JButton();
        addSingleButton(newSim, "New Simulation", "NEW", grid);
        grid.gridy++;
        this.add(Box.createVerticalStrut(10), grid);
        
        pauseSim = new JButton();
        addSingleButton(pauseSim, "Pause Simulation", "PAUSE", grid);
        pauseSim.setEnabled(false);
        
        playSim = new JButton();
        addSingleButton(playSim, "Play Simulation", "PLAY", grid);
        playSim.setEnabled(false);
        
        stopSim = new JButton();
        addSingleButton(stopSim, "Stop Simulation", "STOP", grid);
        stopSim.setEnabled(false);
    }

    private void addSingleButton(JButton panelButton, String buttonText, String actionCmd, GridBagConstraints grid) {
        grid.gridy++;
        panelButton.setText(buttonText);
        panelButton.setActionCommand(actionCmd);
        panelButton.addActionListener(parentFrame);
        this.add(panelButton, grid);
    }

    @Override
    public void setNewSize(Dimension newDimension) {
        this.setPreferredSize(newDimension);
        this.setSize(newDimension);
    }

    public JFormattedTextField getScaleInput() {
        return scaleInput;
    }

    public JFormattedTextField getTimeoutInput() {
        return timestepInput;
    }
    
    public JFormattedTextField getFrameRateInput() {
        return frameRateInput;
    }

    public JCheckBox getShouldTrace() {
        return shouldTrace;
    }

    public JComboBox getSimulationSelector() {
        return simulationSelector;
    }

    public JButton getNewSim() {
        return newSim;
    }

    public JButton getPlaySim() {
        return playSim;
    }

    public JButton getPauseSim() {
        return pauseSim;
    }

    public JButton getStopSim() {
        return stopSim;
    }

}
