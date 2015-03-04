package ca.jewsbury.gravity.spacetime.dao.hibernate;

import ca.jewsbury.gravity.spacetime.dao.SimulationDefinitionDAO;
import ca.jewsbury.gravity.spacetime.model.SimulationDefinition;
import com.arcanix.webapp.global.util.generic.dao.GenericHibernateDAO;
import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

/**
 * SimulationDefinitionHibernateDA.class
 *
 *
 *
 * 3-Mar-2015
 *
 * @author Nathan
 */
@Stateless
public class SimulationDefinitionHibernateDAO extends GenericHibernateDAO<SimulationDefinition, Long> implements SimulationDefinitionDAO {

    public SimulationDefinitionHibernateDAO() {
        super(SimulationDefinition.class);
    }

    public SimulationDefinitionHibernateDAO(Session session) {
        super(SimulationDefinition.class, session);
    }

    public SimulationDefinitionHibernateDAO(EntityManager em) {
        super(SimulationDefinition.class, em);
    }

    @Override
    public SimulationDefinition findById(Long id) {
        Criteria criteria = getSession().createCriteria(persistentClass);
        
        criteria.add(Restrictions.eq("id", id));
        criteria.setMaxResults(1);
        
        return (SimulationDefinition) criteria.uniqueResult();
    }

    @Override
    public List<SimulationDefinition> listSimulationDefinitions(int nBodies) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
