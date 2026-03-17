/***********************************************************/
// Required Modules
/***********************************************************/

// Import Express (framework used to build routes)
const express = require('express');
// Create router
const router = express.Router();

// Import Project model 
const Project = require('../models/project');
// Middleware - only allow signed-in users
const isSignedIn = require('../middleware/is-signed-in');

/***********************************************************/
// CRUD
/***********************************************************/
// Create	POST /projects	Make new project
// Read All	GET /projects	Show all
// Read One	GET /projects/:id	Show one
// Update	PUT /projects/:id	Edit
// Delete	DELETE /projects/:id	Remove

/***********************************************************/
// Index Route
/***********************************************************/

// GET /projects
// Show all projects for the logged-in user
router.get('/', isSignedIn, async (req, res) => {
  try {
    // Find all projects where the owner matches the logged-in user's id
    // Sort them so the newest projects appear first
    const projects = await Project.find({ owner: req.session.user._id }).sort({
      createdAt: -1,
    });

    // Render the index page and send the projects data to the view
    res.render('projects/index.ejs', { projects });
  } catch (error) {
    // Log the real error in the terminal
    console.log(error);
    // Show an error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading your projects.',
    });
  }
});

/***********************************************************/
// New and Create Routes
/***********************************************************/

// GET /projects/new
// Show form to create a new project
router.get('/new', isSignedIn, (req, res) => {
  res.render('projects/new.ejs');
});

// POST /projects
// Create a new project and save it to the database
router.post('/', isSignedIn, async (req, res) => {
  try {
    // Add the logged-in user's id to the form data
    // This makes the current user the owner of the project
    req.body.owner = req.session.user._id;
    // Create a new project in MongoDB using the form data
    await Project.create(req.body);
    // After creating the project, send the user back to the projects list
    res.redirect('/projects');
  } catch (error) {
    // Log the real error in the terminal
    console.log(error);
    // Show a safe error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem creating the project.',
    });
  }
});

/***********************************************************/
// Show Route
/***********************************************************/

// GET /projects/:projectId
// Show one project
router.get('/:projectId', isSignedIn, async (req, res) => {
  try {
    // Find the project by its id from the URL
    const project = await Project.findById(req.params.projectId);

    // If no project was found with that id, show a 404 error page
    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    // Check if the logged-in user owns this project
    // If not, show a 403 unauthorized error page
    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to view this project.',
      });
    }

    // If the project exists and belongs to the user, render the show page
    res.render('projects/show.ejs', { project });
  } catch (error) {
    console.log(error);
    // Show a safe error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading the project.',
    });
  }
});

/***********************************************************/
// Edit and Update Routes
/***********************************************************/

// GET /projects/:projectId/edit
// Show form to edit a project
router.get('/:projectId/edit', isSignedIn, async (req, res) => {
  try {
    // Find the project by its id from the URL
    const project = await Project.findById(req.params.projectId);

    // If no project was found, show a 404 error page
    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    // Check if the logged-in user owns this project
    // If not, they should not be allowed to edit it
    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to edit this project.',
      });
    }

    // If project exists and belongs to the user, render the edit form
    res.render('projects/edit.ejs', { project });
  } catch (error) {
    // Log the real error in the terminal
    console.log(error);
    // Show an error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading the edit form.',
    });
  }
});

// PUT /projects/:projectId
// Update a project
router.put('/:projectId', isSignedIn, async (req, res) => {
  try {
    // Find the project by its id from the URL
    const project = await Project.findById(req.params.projectId);

    // If the project does not exist, show a 404 error page
    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }


    // Make sure the logged-in user owns this project before updating it
    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to update this project.',
      });
    }

    // Update the project with the new form data
    await Project.findByIdAndUpdate(req.params.projectId, req.body);
    // Redirect the user to the updated project's show page
    res.redirect(`/projects/${req.params.projectId}`);
  } catch (error) {
    // Log the real error in the terminal
    console.log(error);
    // Show a safe error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem updating the project.',
    });
  }
});

/***********************************************************/
// Delete Route
/***********************************************************/

// DELETE /projects/:projectId
// Delete a project
router.delete('/:projectId', isSignedIn, async (req, res) => {
  try {
    // Find the project by its id from the URL
    const project = await Project.findById(req.params.projectId);

    // If the project does not exist, show a 404 error page
    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    // Make sure the logged-in user owns this project before deleting it
    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to delete this project.',
      });
    }

    // Delete the project from MongoDB
    await Project.findByIdAndDelete(req.params.projectId);
    // Redirect the user back to the projects list
    res.redirect('/projects');
  } catch (error) {
    // Log the real error in the terminal
    console.log(error);
    // Show a safe error message to the user
    res.status(500).render('error.ejs', {
      error: 'There was a problem deleting the project.',
    });
  }
});

// Export the router so server.js can use these routes
module.exports = router;