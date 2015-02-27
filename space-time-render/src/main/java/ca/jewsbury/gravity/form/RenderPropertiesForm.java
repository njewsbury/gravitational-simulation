package ca.jewsbury.gravity.form;

import ca.jewsbury.gravity.render.engine.DefaultSimulationSet;
import ca.jewsbury.gravity.render.engine.SimulationSet;
import ca.jewsbury.gravity.render.panel.ConfigPanel;
import ca.jewsbury.gravity.spacetime.SpaceTimeException;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RenderPropertiesForm.class
 *
 * Class dedicated to storing data input from the user through the config panel.
 *
 * 14-Feb-2015
 *
 * @author Nathan
 */
public class RenderPropertiesForm {

    private final Logger logger = LoggerFactory.getLogger(RenderPropertiesForm.class);

    private double displayScale;
    private long timeoutMilliseconds;
    private int frameRate;
    private boolean traceOrbits;
    private SimulationSet simulationSet;

    public void gatherProperties(ConfigPanel config, Map<String, SimulationSet> simulationSet) throws SpaceTimeException {
        if (config != null) {
            if (config.getScaleInput() != null) {
                setDisplayScale(config.getScaleInput().getValue());
            }
            if (config.getTimeoutInput() != null) {
                setTimeoutMillis(config.getTimeoutInput().getValue());
            }
            if (config.getShouldTrace() != null) {
                traceOrbits = config.getShouldTrace().isSelected();
            }
            if (config.getFrameRateInput() != null) {
                setFrameRate(config.getFrameRateInput().getValue());
            }
            if (config.getSimulationSelector() != null) {
                findSimulationSet(config.getSimulationSelector().getSelectedItem(), simulationSet);
            }
        } else {
            throw new SpaceTimeException("Contact Developer. 'ConfigPanel' is null.");
        }
    }

    public boolean isValid() throws SpaceTimeException {
        boolean valid = true;
        StringBuilder builder = new StringBuilder();

        if (this.displayScale <= 0.0 || this.displayScale >= 10.0) {
            this.displayScale = 1.0;
            builder.append("Display scale must be between [0-10]\n");
            valid = false;
        }

        if (this.timeoutMilliseconds < 0 || this.timeoutMilliseconds > 1000) {
            this.timeoutMilliseconds = 1;
            builder.append("Timeout delay must be [0-1000]\n");
            valid = false;
        }

        if (this.simulationSet == null) {
            builder.append("The selected simulation was null. (?)\n");
            valid = false;
        }

        if (!valid) {
            throw new SpaceTimeException(builder.toString());
        }
        return valid;
    }

    /**
     * Determine the user set display scale (pixels to simulation coordinates)
     *
     * @param doubleVal
     * @throws SpaceTimeException
     */
    private void setDisplayScale(Object doubleVal) throws SpaceTimeException {
        int tempInteger;
        long tempLong;

        if (doubleVal != null) {
            logger.trace("Display Scale Input Class : " + doubleVal.getClass());
            if (doubleVal instanceof Double) {
                this.displayScale = (Double) doubleVal;
            } else if (doubleVal instanceof Integer) {
                tempInteger = (Integer) doubleVal;
                this.displayScale = (double) tempInteger;
            } else if (doubleVal instanceof Long) {
                tempLong = (Long) doubleVal;
                this.displayScale = (double) tempLong;
            } else {
                throw new SpaceTimeException("Invalid display scale. Must be a double");
            }
        }
    }

    /**
     * Determine the user set millisecond timeout.
     *
     * @param longValue
     * @throws SpaceTimeException
     */
    private void setTimeoutMillis(Object longValue) throws SpaceTimeException {
        int tempInt;
        double tempDouble;

        if (longValue != null) {
            logger.trace("Timeout milli input class : " + longValue.getClass());

            if (longValue instanceof Long) {
                this.timeoutMilliseconds = (Long) longValue;
            } else if (longValue instanceof Integer) {
                tempInt = (Integer) longValue;
                this.timeoutMilliseconds = (long) tempInt;
            } else if (longValue instanceof Double) {
                tempDouble = (Double) longValue;
                this.timeoutMilliseconds = (long) tempDouble;
            } else {
                throw new SpaceTimeException("Invalid timeout value. Must be integer/long");
            }
        }
    }

    /**
     * Locate the user selected simulation set to run.
     *
     * @param selectedValue
     * @param setMap
     * @throws SpaceTimeException
     */
    private void findSimulationSet(Object selectedValue, Map<String, SimulationSet> setMap)
            throws SpaceTimeException {
        String selected = null;
        if (selectedValue != null) {
            logger.trace("Class of selectedValue '" + selectedValue.getClass());
            if (selectedValue instanceof String) {
                selected = (String) selectedValue;
            } else {
                selected = null;
            }
        } else {
            logger.error("SelectedValue from configPanel was null.");
        }
        if (selected != null) {
            if (setMap != null) {
                if (setMap.containsKey(selected)) {
                    this.simulationSet = setMap.get(selected);
                } else {
                    throw new SpaceTimeException("Unable to locate selected simulation set (?)");
                }
            }
        } else {
            throw new SpaceTimeException("The selected simulation ID was null (?)");
        }
    }

    private void setFrameRate(Object intValue) throws SpaceTimeException {
        long tempLong;
        double tempDouble;

        if (intValue != null) {
            logger.trace("Timeout milli input class : " + intValue.getClass());
            if (intValue instanceof Long) {
                tempLong = (Long) intValue;
                this.frameRate = (int) tempLong;
            } else if (intValue instanceof Integer) {
                this.frameRate = (Integer) intValue;
            } else if (intValue instanceof Double) {
                tempDouble = (Double) intValue;
                this.frameRate = (int) tempDouble;
            } else {
                throw new SpaceTimeException("Invalid timeout value. Must be integer/long");
            }
        }
    }

    public double getDisplayScale() {
        return displayScale;
    }

    public double getTimeoutMilliseconds() {
        return timeoutMilliseconds;
    }

    public boolean isTraceOrbits() {
        return traceOrbits;
    }

    public SimulationSet getSimulationSet() {
        return simulationSet;
    }

    public int getFrameRate() {
        return frameRate;
    }

}
