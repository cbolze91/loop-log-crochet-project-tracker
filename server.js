/***********************************************************/
//Required Modules
/***********************************************************/

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');

/***********************************************************/
//App Configuration
/***********************************************************/

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGODB_URI);

/***********************************************************/
//MongoDB Connection
/***********************************************************/

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

mongoose.connection.on('error', (error) => {
    console.log('MongoDB connection error:', error);
});

/***********************************************************/
//Middleware
/***********************************************************/

// Parses form data and makes it available on req.body
app.use(express.urlencoded({ extended: false }));

// Allows PUT and DELETE requests in forms
app.use(methodOverride('_method'));

// Loads CSS and other public files
app.use(express.static('public'));

/***********************************************************/
//Session Configuration
/***********************************************************/

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    })
);

/***********************************************************/
//Global Variables Middleware
/***********************************************************/

//Makes the logged in user available to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

/***********************************************************/
//Controllers
/***********************************************************/

const authController = require('./controllers/auth');
const projectsController = require('./controllers/projects');

/***********************************************************/
//Routes
/***********************************************************/

app.use('/auth', authController);
app.use('/projects', projectsController);

app.get('/', (req, res) => {
    res.render('index.ejs');
});

/***********************************************************/
//404 Handler
/***********************************************************/

app.use((req,res) => {
    res.status(404).render('error.ejs', {
        error: 'Page not found.',
    });
});

/***********************************************************/
//Error Handler
/***********************************************************/

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render('error.ejs', {
        error: 'Something unexpected went wrong.',
    });
})

/***********************************************************/
//Server Start
/***********************************************************/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));