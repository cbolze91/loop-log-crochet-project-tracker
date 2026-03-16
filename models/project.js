const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        yarn: {
            type: String,
        },
        hookSize: {
            type: String,
        },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Finished'],
            default: 'Not Started',
        },
        imageUrl: {
            type: String,
        },
        pattern: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
    },
    },
    { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;