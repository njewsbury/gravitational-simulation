package ca.jewsbury.gravity.spacetime.dao;

import ca.jewsbury.gravity.spacetime.model.SimulationDefinition;
import com.arcanix.webapp.global.util.generic.dao.GenericDAO;
import java.util.List;

/**
 * SimulationDefinitionDAO.class
 *
 * 
 *
 * 3-Mar-2015
 * @author Nathan
 */
@javax.ejb.Local
public interface SimulationDefinitionDAO extends GenericDAO<SimulationDefinition, Long> {
    
    List<SimulationDefinition> listSimulationDefinitions( int nBodies );
}
