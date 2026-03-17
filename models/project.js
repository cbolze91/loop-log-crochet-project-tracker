/***********************************************************/
// REQUIRED MODULES
/***********************************************************/

// Import mongoose (used to create schema and interact with MongoDB)
const mongoose = require('mongoose');


/***********************************************************/
// PROJECT SCHEMA (structure of a project in the database)
/***********************************************************/

// Defines what a Project document should look like in MongoDB
const projectSchema = new mongoose.Schema(
    {
        /***********************/
        // PROJECT TITLE
        /***********************/

        // Title of the project (required field)
        title: {
            type: String,       // must be a string
            required: true,     // user MUST provide this
        },


        /***********************/
        // MATERIAL DETAILS
        /***********************/

        // Type of yarn used
        yarn: {
            type: String,
        },

        // Hook size used for the project
        hookSize: {
            type: String,
        },


        /***********************/
        // DIFFICULTY LEVEL
        /***********************/

        // Difficulty of the project
        difficulty: {
            type: String,

            // Only allow these specific values
            enum: ['Beginner', 'Intermediate', 'Advanced'],

            // Default value if user does not choose one
            default: 'Beginner',
        },


        /***********************/
        // PROJECT STATUS
        /***********************/

        // Tracks progress of the project
        status: {
            type: String,

            // Only allow these values
            enum: ['Not Started', 'In Progress', 'Finished'],

            // Default value when project is created
            default: 'Not Started',
        },


        /***********************/
        // OPTIONAL FIELDS
        /***********************/

        // URL for an image of the project
        imageUrl: {
            type: String,
        },

        // Pattern or instructions for the project
        pattern: {
            type: String,
        },


        /***********************/
        // OWNER (RELATIONSHIP)
        /***********************/

        // Links this project to a specific user
        owner: {
            type: mongoose.Schema.Types.ObjectId, // stores a MongoDB ObjectId

            ref: 'User', // references the User model (creates a relationship)

            required: true, // every project MUST belong to a user
        },
    },


    /***********************************************************/
    // SCHEMA OPTIONS
    /***********************************************************/

    {
        // Automatically adds:
        // createdAt → when project was created
        // updatedAt → when project was last updated
        timestamps: true,
    }
);


/***********************************************************/
// MODEL CREATION
/***********************************************************/

// Create the Project model from the schema
// This allows methods like:
// Project.find(), Project.create(), Project.findById(), etc.
const Project = mongoose.model('Project', projectSchema);


/***********************************************************/
// EXPORT MODEL
/***********************************************************/

// Make this model usable in other files (like controllers)
module.exports = Project;