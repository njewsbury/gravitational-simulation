/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.jewsbury.gravity.spacetime.model;

import junit.framework.Assert;
import org.junit.Test;

/**
 *
 * @author Nathan
 */
public class SpaceObjectTest {

    @Test
    public void testObjectSpaceComparison() {
        SpaceObject first, second;
        
        first = new DynamicObject("firstObject");
        second = new DynamicObject("secondObject");
        
        Assert.assertFalse(first.equals(second));
        
        second = first;
        Assert.assertTrue(first.equals(second));
        
        second = new DynamicObject("firstObject");
        Assert.assertTrue(first.equals(second));
    }
    
}
