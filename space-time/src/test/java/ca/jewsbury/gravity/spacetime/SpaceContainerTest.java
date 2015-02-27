/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.jewsbury.gravity.spacetime;

import ca.jewsbury.gravity.spacetime.model.DynamicObject;
import ca.jewsbury.gravity.spacetime.model.Orbital;
import junit.framework.Assert;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author Nathan
 */
public class SpaceContainerTest {

    private SpaceContainer container;

    @Before
    public void setUp() {
        container = new SpaceContainer();
        Assert.assertNotNull("Space container wasn't built properly", container);
    }

    @Test
    public void testGetOrbitalList() {
        Orbital first, second;
        Orbital[] array;

        first = new DynamicObject("firstObject");
        second = new DynamicObject("secondObject");

        Assert.assertTrue(container.insertOrbital(first));
        Assert.assertTrue(container.insertOrbital(second));

        Assert.assertEquals(2, container.getOrbitalCount());

        array = container.getOrbitalArray();

        Assert.assertNotNull(array);
        Assert.assertEquals(2, array.length);

        for (Orbital a : array) {
            Assert.assertNotNull(a);
        }
    }

    @After
    public void tearDown() {
        container = null;
        Assert.assertNull("TearDown of SpaceContainer not complete", container);
    }

}
