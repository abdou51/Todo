const {Todo} = require('../models/todo');
const userJwt = require('../helpers/userJwt');
const express = require('express');
const router = express.Router();


router.post('/',userJwt, async (req, res) => {

    try {
        const newTodo = new Todo({
            title:req.body.title,
            user: req.user.userId,
        });

        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', userJwt, async (req, res) => {
    try {
        const userId = req.user.userId;
        const todos = await Todo.find({ user: userId }).populate({
            path: 'user',
            select: '_id',
        });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id', userJwt, async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (req.body.title !== undefined) {
            todo.title = req.body.title;
        }

        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }

        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.delete('/:id', userJwt, async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findByIdAndDelete(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




module.exports =router;