package ca.jewsbury.gravity.spacetime;

import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import ca.jewsbury.gravity.spacetime.properties.SpaceTimeConstants;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.collections.buffer.CircularFifoBuffer;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * SpaceContainer.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public class SpaceContainer {

    private final Logger logger = LoggerFactory.getLogger(SpaceContainer.class);

    private final Map<String, Orbital> objectMap;
    private final CircularFifoBuffer totalEnergyBuffer;

    public static enum energy {

        KINETIC, POTENTIAL;
    }

    /**
     */
    public SpaceContainer() {
        objectMap = new HashMap< String, Orbital>();
        totalEnergyBuffer = new CircularFifoBuffer(200);
    }

    /*
     * ACCESSORS & MUTATORS
     */
    public Map<String, Orbital> getObjectMap() {
        return objectMap;
    }

    public Orbital getSpaceObject(String name) {
        return objectMap.get(name);
    }

    public boolean containsObject(String name) {
        return objectMap.containsKey(name);
    }

    public Orbital[] getOrbitalArray() {
        Orbital[] orbitalArray = null;
        if (objectMap != null && !objectMap.isEmpty()) {
            orbitalArray = new Orbital[objectMap.size()];
            objectMap.values().toArray(orbitalArray);
        }
        return orbitalArray;
    }

    public int getOrbitalCount() {
        int totalObjects = 0;
        if (objectMap != null) {
            totalObjects = objectMap.size();
        }
        return totalObjects;
    }

    /**
     * Inserts a unique space object into the map of space objects.
     *
     * @param spaceObject
     * @return TRUE if insert operation worked. FALSE if non-unique.
     */
    public boolean insertOrbital(Orbital spaceObject) {
        boolean insert = false;
        String idName;
        if (spaceObject != null) {
            idName = spaceObject.getIdName();
            if (StringUtils.isNotBlank(idName)) {
                if (!objectMap.containsKey(idName)) {
                    objectMap.put(idName, spaceObject);
                    insert = true;
                }
            }
        }
        return insert;
    }

    /**
     * Take the total sum of the KINETIC ENERGY and POTENTIAL ENERGY of all
     * space objects.
     *
     * @return double[] { KINETIC ENERGY, POTENTIAL ENERGY }
     */
    public double[] getTotalEnergy() {
        double[] energies = null;
        Orbital[] arr = getOrbitalArray();

        if (arr != null) {
            energies = new double[2];
            for (Orbital orbital : arr) {
                energies[energy.KINETIC.ordinal()] += orbital.getKineticEnergy();
                energies[energy.POTENTIAL.ordinal()] += orbital.getPotentialEnergy();
            }
            totalEnergyBuffer.add(energies[0] + energies[1]);
        }
        return energies;
    }
    
    public CircularFifoBuffer getTotalEnergyBuffer() {
        return totalEnergyBuffer;
    }

    public void refreshEnergyValues() {
        Orbital[] arr = getOrbitalArray();
        double potential;

        if (arr != null) {
            for (Orbital orbital : arr) {
                if (!orbital.isStatic()) {
                    potential = getPotentialEnergy(orbital);
                    orbital.setPotentialEnergy(potential);
                }
            }
        }
    }

    public double getPotentialEnergy(Orbital active) {
        double potential = 0.0;
        Orbital[] arr = getOrbitalArray();

        if (arr != null) {
            for (Orbital orbital : arr) {
                if (!active.equals(orbital)) {
                    potential += getPotentialBetweenObjects(orbital, active);
                }
            }
        }
        return potential;
    }

    public double getPotentialBetweenObjects(Orbital reference, Orbital active) {
        double potential = 0.0;
        double distance;

        if (reference != null && active != null) {
            distance = active.distanceToOther(reference);
            if (Math.abs(distance) > 0) {
                potential = (-SpaceTimeConstants.GRAVITATIONAL_CONSTANT) * reference.getMass() * active.getMass();
                potential = (potential / distance);
            }
        }
        return potential;
    }

    public SpaceTimeVector getNetForce(Orbital active) {
        SpaceTimeVector netForce, singleForce;
        Orbital[] arr = getOrbitalArray();
        double distance, potential;

        netForce = new SpaceTimeVector();
        if (arr != null && arr.length > 0) {
            for (Orbital orbital : arr) {
                if (!active.equals(orbital)) {
                    potential = Math.abs(getPotentialBetweenObjects(orbital, active));
                    distance = active.distanceToOther(orbital);
                    singleForce = active.getUnitVectorFacingOther(orbital);
                    singleForce.transform((potential / distance));
                    netForce.translate(singleForce);
                }
            }
        }
        return netForce;
    }

    public boolean objectCollision(Orbital first, Orbital second) {
        boolean removed = false;

        if (first != null && second != null) {
            if (!first.equals(second)) {
                if (this.containsObject(first.getIdName()) && this.containsObject(second.getIdName())) {
                    if (first.getMass() >= second.getMass()) {
                        this.objectMap.remove(second.getIdName());
                    } else if (first.getMass() < second.getMass()) {
                        this.objectMap.remove(first.getIdName());
                    }
                }
            }
        }
        return removed;
    }
}
