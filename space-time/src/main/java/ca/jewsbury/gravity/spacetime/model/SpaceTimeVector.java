package ca.jewsbury.gravity.spacetime.model;

import ca.jewsbury.gravity.spacetime.SpaceTimeException;

/**
 * SpaceTimeVector.class
 *
 *
 *
 * 3-Feb-2015
 *
 * @author Nathan
 */
public class SpaceTimeVector {

    private double xCoord;
    private double yCoord;
    private double zCoord;

    public SpaceTimeVector() {
        xCoord = yCoord = zCoord = 0.0;
    }

    public SpaceTimeVector(double xC, double yC, double zC) {
        this.xCoord = xC;
        this.yCoord = yC;
        this.zCoord = zC;
    }

    public SpaceTimeVector(double xC, double yC) {
        this(xC, yC, 0.0);
    }

    public SpaceTimeVector(SpaceTimeVector copy) {
        this.xCoord = copy.getxCoord();
        this.yCoord = copy.getyCoord();
        this.zCoord = copy.getzCoord();
    }
    
    public void deepCopy( SpaceTimeVector source ) {
        this.xCoord = source.getxCoord();
        this.yCoord = source.getyCoord();
        this.zCoord = source.getzCoord();
    }

    /**
     * *ADDS* the delta vector to this current vector
     * A = A+B
     * @param delta 
     */
    public void translate(SpaceTimeVector delta) {
        if (delta != null) {
            xCoord += delta.getxCoord();
            yCoord += delta.getyCoord();
            zCoord += delta.getzCoord();
        }
    }
    /**
     * *MULTIPLIES* this vector by the scaleFactor
     * A = A*B
     * @param scaleFactor 
     */
    public void transform(double scaleFactor) {
        xCoord *= scaleFactor;
        yCoord *= scaleFactor;
        zCoord *= scaleFactor;     
    }

    public double getxCoord() {
        return xCoord;
    }

    public void setxCoord(double xCoord) {
        this.xCoord = xCoord;
    }

    /**
     * Translates the X coordinate by an addition with the given DELTA.
     *
     * @param delta
     */
    public void translateXCoord(double delta) {
        this.xCoord += delta;
    }

    public double getyCoord() {
        return yCoord;
    }

    public void setyCoord(double yCoord) {
        this.yCoord = yCoord;
    }

    /**
     * Translates the Y coordinate by an addition with the given DELTA.
     *
     * @param delta
     */
    public void translateYCoord(double delta) {
        this.yCoord += delta;
    }

    public double getzCoord() {
        return zCoord;
    }

    public void setzCoord(double zCoord) {
        this.zCoord = zCoord;
    }

    /**
     * Translates the Z coordinate by an addition with the given DELTA.
     *
     * @param delta
     */
    public void translateZCoord(double delta) {
        this.zCoord += delta;
    }

    /**
     * Distance Formula!
     *
     * @param other - coordinate to return distance to. uses [[ THIS ]] as the
     * "" origin "".
     * @return double
     * @throws SpaceTimeException
     */
    public double distanceTo(SpaceTimeVector other) throws SpaceTimeException {
        double distance = 0;
        double xDist, yDist, zDist;

        if (other != null) {
            xDist = this.getxCoord() - other.getxCoord();
            yDist = this.getyCoord() - other.getyCoord();
            zDist = this.getzCoord() - other.getzCoord();

            distance = (xDist * xDist) + (yDist * yDist) + (zDist * zDist);
            distance = Math.sqrt(distance); // **** THIS IS A BOTTLENECK, IMPLEMENT NEWTONS METHOD
        } else {
            throw new SpaceTimeException("Tried to calculate distance to a null coordinate.");
        }
        return distance;
    }

    /**
     * Creates a unit vector pointing from [[ THIS ]] to << OTHER >>
     *
     * @param other
     * @return
     */
    public SpaceTimeVector getUnitVector(SpaceTimeVector other) {
        SpaceTimeVector unitVector = null;

        if (other != null) {

        }

        return unitVector;
    }
    
    public double getVectorSquared() {
        double x,y,z;
        double val = 0.0;
        
        x = this.xCoord*this.xCoord;
        y = this.yCoord*this.yCoord;
        z = this.zCoord*this.zCoord;
        
        val = Math.sqrt(x+y+z); //Inefficient.
        return val;
    }
    
    public boolean isZero() {
        return (xCoord == 0.0) && (yCoord == 0.0) && (zCoord == 0.0);
    }
    
    @Override
    public boolean equals(Object other) {
        boolean equal = false;
        SpaceTimeVector vector;
        if( other != null && other instanceof SpaceTimeVector ) {
            vector = (SpaceTimeVector) other;
            
            if( vector.getxCoord() == this.xCoord ) {
                if( vector.getyCoord() == this.yCoord ) {
                    if( vector.getzCoord() == this.zCoord ) {
                        equal = true;
                    }
                }
            }
        }
        return equal;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 89 * hash + (int) (Double.doubleToLongBits(this.xCoord) ^ (Double.doubleToLongBits(this.xCoord) >>> 32));
        hash = 89 * hash + (int) (Double.doubleToLongBits(this.yCoord) ^ (Double.doubleToLongBits(this.yCoord) >>> 32));
        hash = 89 * hash + (int) (Double.doubleToLongBits(this.zCoord) ^ (Double.doubleToLongBits(this.zCoord) >>> 32));
        return hash;
    }

    public void parityOperator() {
        xCoord = -xCoord;
        yCoord = -yCoord;
        zCoord = -zCoord;
    }

    @Override
    public String toString() {
        StringBuilder str = new StringBuilder();
        str.append("[[").append(xCoord);
        str.append(",").append(yCoord);
        str.append(",").append(zCoord);
        str.append("]]");

        return str.toString();
    }

}
