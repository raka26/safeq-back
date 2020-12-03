const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');


exports.authUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
        let user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({msg: "User is not valid"});
        }

        const rigthPassword = await bcryptjs.compare(password, user.password);
        if(!rigthPassword){
            return res.status(400).json({msg: "Incorrect password"});
        }

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

    } catch (error) {
        console.log(error);
    }

}

//Obtain authenticated user
exports.authenticatedUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "There was an error"});
    }
}