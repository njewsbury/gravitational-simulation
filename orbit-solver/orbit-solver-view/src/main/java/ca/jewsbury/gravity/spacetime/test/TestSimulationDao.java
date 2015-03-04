package ca.jewsbury.gravity.spacetime.test;

import ca.jewsbury.gravity.spacetime.dao.SimulationDefinitionDAO;
import ca.jewsbury.gravity.spacetime.model.SimulationDefinition;
import ca.jewsbury.gravity.spacetime.servlet.CollectorServlet;
import java.io.IOException;
import javax.ejb.EJB;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * TestSimulationDao.class
 *
 * 
 *
 * 3-Mar-2015
 * @author Nathan
 */
@WebServlet(name = "TestDAO",
        displayName = "Test DAO",
        urlPatterns = {"/servlet/TestDAO"}, loadOnStartup = 0)
public class TestSimulationDao extends CollectorServlet {

    @EJB
    private SimulationDefinitionDAO simDefDAO;
    
    @Override
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
    }

    @Override
    protected void writeResponse(Object objResponse, HttpServletResponse response) throws IOException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
