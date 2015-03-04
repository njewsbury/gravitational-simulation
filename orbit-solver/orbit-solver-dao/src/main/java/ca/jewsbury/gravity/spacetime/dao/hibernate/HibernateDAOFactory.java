package ca.jewsbury.gravity.spacetime.dao.hibernate;

import ca.jewsbury.gravity.spacetime.dao.DAOFactory;
import ca.jewsbury.gravity.spacetime.dao.SimulationDefinitionDAO;
import com.arcanix.webapp.global.util.hibernate.HibernateUtil;
import org.hibernate.Session;

/**
 * HibernateDAOFactory.class
 *
 *
 *
 * 3-Mar-2015
 *
 * @author Nathan
 */
public class HibernateDAOFactory extends DAOFactory {

    // You could override this if you don't want HibernateUtil for lookup
    protected Session getCurrentSession() {
        return HibernateUtil.getSessionFactory().getCurrentSession();
    }

    @Override
    public SimulationDefinitionDAO getSimulationDefinitionDAO() {
        return new SimulationDefinitionHibernateDAO( getCurrentSession() );
    }

    

}
