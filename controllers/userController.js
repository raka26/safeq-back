const User = require('../models/User');
const Shop = require('../models/Shop');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });        
        
        if(user){
            return res.status(400).json({ msg: "User already exist"});
        }

        user = new User(req.body);
        //Hash password
        const salt = await bcryptjs.genSalt(process.env.SALTROUNDS);
        user.password = await bcryptjs.hash(password, salt);
        
        await user.save();
        //Dar el alta al Shop de ese usuario
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.SECRET, {
            expiresIn: 3600 //1hs
        }, (error, token) => {
            if(error) throw error;            
            res.json({ token });
        });

    } catch(error) {
        console.log(error);
        res.status(400).send('There was an error');
    }
}
