package ca.jewsbury.gravity.spacetime;

import ca.jewsbury.gravity.spacetime.model.Orbital;
import ca.jewsbury.gravity.spacetime.model.SpaceTimeVector;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
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

    private final long containerSize;
    private final Dimensional spaceDimensions;
    private final SpaceTimeVector relativeOrigin;

    private final Map<String, Orbital> objectList;

    /**
     *
     * @param containerSize - cube dimension of the universe.
     * @param dimensions - Number of spacial dimensions
     */
    public SpaceContainer(long containerSize, Dimensional dimensions) {
        double originCoord;
        objectList = new HashMap< String, Orbital>();
        this.spaceDimensions = dimensions;
        if (containerSize > 0) {
            this.containerSize = containerSize;
            originCoord = (this.containerSize / 2);

            this.relativeOrigin = new SpaceTimeVector(originCoord, originCoord, originCoord);
        } else {
            this.containerSize = 0;
            this.relativeOrigin = new SpaceTimeVector(0, 0, 0);
        }
    }

    /*
     * ACCESSORS & MUTATORS
     */
    public long getContainerSize() {
        return containerSize;
    }

    public Dimensional getSpaceDimensions() {
        return spaceDimensions;
    }

    public Map<String, Orbital> getObjectList() {
        return objectList;
    }

    public Orbital getSpaceObject(String name) {
        return objectList.get(name);
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
                if (!objectList.containsKey(idName)) {
                    objectList.put(idName, spaceObject);
                    insert = true;
                }
            }
        }
        return insert;
    }
    
    /**
     * Take the total sum of the KINETIC ENERGY and POTENTIAL ENERGY 
     * of all space objects.
     * @return double[] { KINETIC ENERGY, POTENTIAL ENERGY }
     */
    public double[] getTotalEnergy() {
        double[] totalEnergy = new double[2];
        
        Collection<Orbital> orbitalCollection;
        
        if( objectList != null && objectList.size() > 0 ) {
            orbitalCollection = objectList.values();
            if( orbitalCollection != null && orbitalCollection.size() > 0 ) {
                for( Orbital orbital : orbitalCollection ) {
                    totalEnergy[0] += orbital.getKineticEnergy();
                    //logger.info("'" + orbital.getIdName() + "' potential :: " + orbital.getPotentialEnergy());
                    totalEnergy[1] += orbital.getPotentialEnergy();
                }
            }
        }
        
        
        return totalEnergy;
    }

    /**
     * ASCII printout of the container universe.  Doesn't take into account scale.
     * Mainly for development purposes.
     * @deprecated See project 'space-time-render' which was built to accomplish the same
     * goal as this method.
     */
    @Deprecated
    public void printUniverse() {
        StringBuilder singleRow, universe;
        Orbital spaceObject;
        SpaceTimeVector coord;
        int miny, maxy, minx, maxx;
        
        if (this.spaceDimensions == Dimensional.TwoD) {
            universe = new StringBuilder();
            maxy = (int) this.relativeOrigin.getyCoord() + 1;
            miny = -maxy;
            maxx = (int) this.relativeOrigin.getxCoord() + 1;
            minx = -maxx;
            
            for (int y = miny; y <= maxy; y++) {
                singleRow = new StringBuilder();

                for (int x = minx; x <= maxx; x++) {

                    if (y == miny || y == maxy) {
                        if (x == minx || x == maxx) {
                            singleRow.append(" + ");
                        } else {
                            singleRow.append("---");
                        }
                    } else if (x == minx || x == maxx) {
                        singleRow.append(" | ");
                    } else {
                        coord = new SpaceTimeVector(x, y); //2D coordinate constructor.
                        spaceObject = getObjectAtPosition(coord);

                        if (spaceObject != null) {
                            singleRow.append(spaceObject.getAsciiRender());
                        } else {
                            if (y == 0 && x == 0) {
                                singleRow.append(" o ");
                            } else {
                                singleRow.append(" x ");
                            }
                        }
                    }
                }
                universe.append(singleRow).append("\n");
            }
            logger.info("\n" + universe.toString());
        }
    }

    /**
     * Given a space time vector, returns the orbital object NEAR/AT that position.
     * Runs O(n) time, but has to do a lot of heavy distance calculations.  This is really
     * only meant for development purposes.
     * @param coord SpaceTimeVector
     * @return Orbital
     * @deprecated Ineffiicient CPU intensive method call. Don't use it.  
     */
    @Deprecated
    public Orbital getObjectAtPosition(SpaceTimeVector coord) {
        Orbital temp, rtn = null;
        Iterator<String> iterator;
        double distance;
        String key;

        if (coord != null) {
            iterator = this.objectList.keySet().iterator();
            while (rtn == null && iterator.hasNext()) {
                key = iterator.next();
                temp = objectList.get(key);
                try {
                    distance = temp.getPosition().distanceTo(coord);
                    if ((int) distance == 0) {
                        rtn = temp;
                    }
                } catch (SpaceTimeException e) {
                    logger.warn(e.getMessage());
                }
            }
        }
        return rtn;
    }
}
