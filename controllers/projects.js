/***********************************************************/
//Required Modules
/***********************************************************/

const express = require('express');
const router = express.Router();

const Project = require('../models/project');
const isSignedIn = require('../middleware/is-signed-in');

/***********************************************************/
//Index Route
/***********************************************************/

//Show all projects for the logged-in user
router.get('/', isSignedIn, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.session.user._id }).sort({
      createdAt: -1,
    });

    res.render('projects/index.ejs', { projects });
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading your projects.',
    });
  }
});

/***********************************************************/
//New and Create Routes
/***********************************************************/

//Show form to create a new project
router.get('/new', isSignedIn, (req, res) => {
  res.render('projects/new.ejs');
});

//Create a new project
router.post('/', isSignedIn, async (req, res) => {
  try {
    req.body.owner = req.session.user._id;
    await Project.create(req.body);
    res.redirect('/projects');
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem creating the project.',
    });
  }
});

/***********************************************************/
//Show Route
/***********************************************************/

//Show one project
router.get('/:projectId', isSignedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to view this project.',
      });
    }

    res.render('projects/show.ejs', { project });
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading the project.',
    });
  }
});

/***********************************************************/
//Edit and Update Routes
/***********************************************************/

//Show form to edit a project
router.get('/:projectId/edit', isSignedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to edit this project.',
      });
    }

    res.render('projects/edit.ejs', { project });
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem loading the edit form.',
    });
  }
});

//Update a project
router.put('/:projectId', isSignedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to update this project.',
      });
    }

    await Project.findByIdAndUpdate(req.params.projectId, req.body);
    res.redirect(`/projects/${req.params.projectId}`);
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem updating the project.',
    });
  }
});

/***********************************************************/
//Delete Route
/***********************************************************/

//Delete a project
router.delete('/:projectId', isSignedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).render('error.ejs', {
        error: 'Project not found.',
      });
    }

    if (!project.owner.equals(req.session.user._id)) {
      return res.status(403).render('error.ejs', {
        error: 'You are not authorized to delete this project.',
      });
    }

    await Project.findByIdAndDelete(req.params.projectId);
    res.redirect('/projects');
  } catch (error) {
    console.log(error);
    res.status(500).render('error.ejs', {
      error: 'There was a problem deleting the project.',
    });
  }
});

module.exports = router;