package ca.jewsbury.gravity.spacetime.dao;

/**
 * DAOFactory.class
 *
 *
 *
 * 3-Mar-2015
 *
 * @author Nathan
 */
public abstract class DAOFactory {

    public static final DAOFactory HIBERNATE
            = new ca.jewsbury.gravity.spacetime.dao.hibernate.HibernateDAOFactory();

    public static final DAOFactory DEFAULT = HIBERNATE;

    public abstract SimulationDefinitionDAO getSimulationDefinitionDAO();
}
