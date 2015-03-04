package ca.jewsbury.gravity.spacetime.model;

import java.io.Serializable;
import javax.annotation.Generated;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * SimulationDefinition.class
 *
 *
 *
 * 3-Mar-2015
 *
 * @author Nathan
 */
@Entity
@Table(name = "simulation_collector", catalog = "school_schema")
public class SimulationDefinition implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private long id;

    @Column(name = "setName")
    private String setName;

    @Column(name = "setFinder")
    private String setFinder;

    @Column(name = "setDefinition")
    private String setDefinition;

    public String getSetName() {
        return setName;
    }

    public void setSetName(String setName) {
        this.setName = setName;
    }

    public String getSetFinder() {
        return setFinder;
    }

    public void setSetFinder(String setFinder) {
        this.setFinder = setFinder;
    }

    public String getSetDefinition() {
        return setDefinition;
    }

    public void setSetDefinition(String setDefinition) {
        this.setDefinition = setDefinition;
    }

}
