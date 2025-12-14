import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import {ENV} from "../lib/env.js";

export const signup = async(req, res) =>{
    const {fullName, email, password} = req.body;

    try{
        if(!fullName || !email || !password)
        {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length<6)
        {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        // check if email is valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Regular expression breakdown: 
        // ^ — start at the start of the string.

        // [^\s@]+ — grab one or more characters that are neither whitespace nor @ (this becomes the local-part). If there are none, fail.

        // @ — now expect the @ character exactly. If there isn’t one right here, fail.

        // [^\s@]+ — grab one or more characters (domain name part) that aren’t whitespace or @.

        // \. — expect a literal dot . next.

        // [^\s@]+ — grab one or more characters (top-level domain) that aren’t whitespace or @.

        // $ — ensure there’s nothing left after this — we’re at the end of the string.


        if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
        }
        const user = await User.findOne({email: email});
        if(user) return res.status(400).json({message: "Email already exists"});

        // now we include password hashing to encrypt password
        // for that we will use bcrypt npm library

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if(newUser)
        {
            const savedUser = await newUser.save();
            generateToken(newUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

            
            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            }
            catch(error)
            {
                console.error("Failed to send welcome email: ", error);
            }
        }
        else
        {
            res.status(400).json({message: "Invalid user data"});
        }
    }
    catch(error)
    {
        console.log("Error in signup controller", error);
        res.status(500).json({message: "Internal server error"});
    }
};


export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password)
    {
        return res.status(400).json({message: "Email and password are required"});
    }

    try{
        const user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({message: "Invalid Credentials"});
            // Best Practice Followed: Never tell the client which one is incorrect: password or username  
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        // user.password is stored in db in hashed form
        // brcypt extracts salt from stored password and then encrypts entered plain text password with same salt and algorithm
        // then compares both hashed values, if equal return true else false
        if(!isPasswordCorrect)
        {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    }
    catch(error)
    {
        console.error("Error in login controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }

};


export const logout = (_, res) => {
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({message: "Logged out successfully"});
};
