const {User} = require('../models/user');
const express = require('express');
const jwt = require('jsonwebtoken');
const userJwt = require('../helpers/userJwt');
const router = express.Router();
const bcrypt = require('bcrypt');
const {Todo} = require('../models/todo');



router.get('/:id', userJwt, async (req, res) => {
    const userId = req.params.id;
    console.log(userId);
  
    if (req.user.userId !== userId) {
      return res.status(401).json({ message: 'Authentication failed. User not authorized.' });
    }
  
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
  
    res.status(200).json(user);
  });

router.put('/:id',userJwt,async (req, res)=> {
    const userId = req.params.id;
    if (req.user.userId !== userId) {
        return res.status(401).json({ message: 'Authentication failed. User not authorized.' });
    }


    const userExist = await User.findById(userId);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            email: req.body.email,
            passwordHash: newPassword,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be found!')

    res.send(user);
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id
            },
            secret,
            { expiresIn: '1w' }
        );

        res.setHeader('Authorization', `Bearer ${token}`);

        res.status(200).send('Login successful');
    } else {
        res.status(400).send('password is wrong!');
    }
});

router.post('/register', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('User with given email already exists');
    } 
    if (req.body.email === req.body.password)
            return res.status(400).send('your email cannot be your password')
    else {
        user = new User({
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
        })
        user = await user.save();

        if (!user)
            return res.status(400).send('the user cannot be created!')
        

        res.status(200).send('User registered successfully');
    }
})

router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        await Todo.deleteMany({ user: userId });


        const deletedUser = await User.findByIdAndRemove(userId);

        if (deletedUser) {
            return res.status(200).json({ success: true, message: 'The user and their todos are deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error });
    }
});



module.exports =router;