const mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },

});

exports.Todo = mongoose.model('Todo', todoSchema);