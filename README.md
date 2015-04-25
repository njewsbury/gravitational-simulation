#The Stability of n-Body Choreographed Orbits
####PHYS 4250 Project by Nathan Jewsbury and Scott Osadchuk

This project was created to solve and classify a series of n-body choreographies while investigateing their stability.  HTML and JavaScript was chosen as a chance to explore modern browsers as computation/simulation sources and due to trivial visualization options.  

###Choreograph Orbit Solver
The choreograph solver is the root portion of this project.  Through the use of numeric.js the 'Action Function', which is defined as the total energy of the system over a single period, will be minimized to give initial conditions for a choreography.  The solver utility will return a JSON object outlining the solved choreograph for rendering and simulation.

###Choreograph Orbit Simulation
Simulating the solved choreography will provide a better understanding of the interaction between all present bodies and the stability of the choreograph.  After receiving the JSON initial conditions from the solver utility the simulation engine will use the selected integrator (Second or third order Symplectic) calculate updated positions for each body.  After reaching the maximum time (or being stopped) a report of the energy over the time range will be displayed.

##Project Use

* Each page has a settings dialog available (Gear button at the bottom of the page) that allows changing the solver parameters.  
* Once a choreograph is solved the seed value used is available in the bottom right side (unless on mobile).  This seed value can be recorded allowing a specific choreograph to be recreated.
  * The choreograph preview page seed value includes a link to the simulation page with the proper n-body value and seed set.
* Images can be downloaded by clicking the 'download' icon on each page.
* The orbital trace can be cleared on the simulation page by clicking the 'eraser' button.


##Project Dependencies

1. NumericJS - http://numericjs.com
2. ChartJS - http://www.chartjs.org
3. Alertify - http://fabien-d.github.io/alertify.js
4. jQuery, jQueryUI - http://www.jquery.com

##Project References

Casselman, Bill. "A New Solution to the Three Body Problem." Feature Column from the AMS. American Mathematical Society, n.d. Web. 21 Feb. 2015. <http://www.ams.org/samplings/feature-column/fcarc-orbits5>.

Simo, Carles. "New Families of Solutions in N-Body Problems." Progress in Mathematics 201 (2001): 101-15. Web.

Sowinski, Arthur. A Study of Symplectic Integrators. Physics 4250 - Computational Physics. University of Manitoba, n.d.
