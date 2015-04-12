#The Stability of n-Body Choreographed Orbits
###PHYS 4250 Project Proposal by Nathan Jewsbury and Scott Osadchuk

In an effort to better understand exoctic choreographies of celestial objects, a simulation will be created to find, solve and display various stable orbits with n-bodies.  The proposed project will consist of three parts:


##Choreographed Orbit Renderer 
This will be a very simple project that will take an input set of initial conditions of n-bodies and display them.  Users will be allowed to modify the display to view the selected orbit and various properties of the orbit will be displayed as the simulation is played through.


##Choreographed Orbit Engine
The engine will be the workhorse for the renderer. Once the selected orbit is displayed and the user requests to watch the orbit, the engine steps in to calculate all the required positions of each body. The overall energy of the solution will also be displayed to prove that the given solution conserves energy.  The only set of energies that will be considered are potential energy and kinetic energy.  The engine will have two different integration methods available; Euler steps and Symplectic integration. A comparison of the two methods will be included in the final report, but is not the focus of this study.


##Choreographed Orbit Solver
The solver will be the root part of this project. ~~Through the use of a genetic algorithm a variety of control points will be generated and a cubic spline run through them to create a smooth curve.~~  An attempt will be made to find the minimum action of an n-body system by using numeric optimization. Once a minimum is found a JSON string will be produced to pass off to the render page for viewing.

##Project References

Casselman, Bill. "A New Solution to the Three Body Problem." Feature Column from the AMS. American Mathematical Society, n.d. Web. 21 Feb. 2015. <http://www.ams.org/samplings/feature-column/fcarc-orbits5>.

Simo, Carles. "New Families of Solutions in N-Body Problems." Progress in Mathematics 201 (2001): 101-15. Web.

Sowinski, Arthur. A Study of Symplectic Integrators. Physics 4250 - Computational Physics. University of Manitoba, n.d.
