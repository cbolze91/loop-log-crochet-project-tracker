/***********************************************************/
// Required Modules (importing tools we need)
/***********************************************************/

// Import Express (framework to build our server)
const express = require('express');
// Import dotenv (lets us use environment variables form .env file)
const dotenv = require('dotenv');
// Import mongoose (used to connect and interact with ManogoDB)
const mongoose = require('mongoose');
// Importmethod-override (lets us use PUT and DELETE in forms)
const methodOverride = require('method-override');
// Import session (stores login data like user sessions)
const session = require('express-session');
// Import MongoStore (stores session data in MongoDB instead of memory)
const MongoStore = require('connect-mongo');

/***********************************************************/
// App Configuration (setup basic app + environment)
/***********************************************************/

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

/***********************************************************/
// MongoDB Connection
/***********************************************************/

// Connect to MongoDB using the URI from .env
mongoose.connect(process.env.MONGODB_URI);

// When successfully connected to MongoDB
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// If there is an error connecting to MongoDB
mongoose.connection.on('error', (error) => {
    console.log('MongoDB connection error:', error);
});

/***********************************************************/
// Middleware (runs before routes)
/***********************************************************/

// Parses form data and makes it available on req.body
app.use(express.urlencoded({ extended: false }));

// Allows us to use PUT and DELETE in forms (since HTML only supports GET/POST)
// Example: ?_method=PUT
app.use(methodOverride('_method'));

// Serve static files from "public" folder (CSS, images, JS)
// Example: /css/style.css
app.use(express.static('public'));

/***********************************************************/
// Session Configuration (login system)
/***********************************************************/

app.use(
    session({
        // Secret key used to sign session cookies (from .env)
        secret: process.env.SESSION_SECRET,
        // Do not save session if nothing changed
        resave: false,
        // Do not create empty sessions
        saveUninitialized: false,
        // Store sessions in MongoDB instead of memory
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    })
);

/***********************************************************/
// Global Variables Middleware
/***********************************************************/

// Makes the logged in user available to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

/***********************************************************/
// Controllers (Import route files)
/***********************************************************/

const authController = require('./controllers/auth');
const projectsController = require('./controllers/projects');

/***********************************************************/
// Routes
/***********************************************************/

// Auth
app.use('/auth', authController);
// Crochet Projects
app.use('/projects', projectsController);

// Home Page
app.get('/', (req, res) => {
    res.render('index.ejs');
});

/***********************************************************/
// 404 Handler (Page not found ex: http://localhost:3000/banana)
/***********************************************************/

// Runs if NO routes above matched
app.use((req,res) => {
    res.status(404).render('error.ejs', {
        error: 'Page not found.',
    });
});

/***********************************************************/
// Error Handler (server errors)
/***********************************************************/

// Runs when an error happens in the app
app.use((err, req, res, next) => {
    console.log(err);  // log real error in terminal
    res.status(500).render('error.ejs', {
        error: 'Something unexpected went wrong.',
    });
})

/***********************************************************/
// Server Start
/***********************************************************/

// Use PORT from .env OR default to 3000
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));