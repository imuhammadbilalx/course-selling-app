import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from "zod";
import config from "../config.js";
import {Purchase} from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";


 export const signup =async (req, res)=>{
const {firstName,lastName, email, password} = req.body;

const userSchema=z.object({
    firstName: z.string().min(3, {message:"firstName must be at least 3 characters long"}),
    lastName: z.string().min(3, {message:"lastName must be at least 3 characters long"}),
     email: z.string().email(),
      password: z.string().min(6, {message:"password must be at least 6 characters long"}),
})

const validateData= userSchema.safeParse(req.body);
if (!validateData.success) {
    return res.status(400).json({errors:validateData.error.issues.map(err =>err.message)});
}

const hashedPassword=await bcrypt.hash(password,10);

try {
    const existingUser = await User.findOne({email: email});
if(existingUser){
    return res.status(400).json({errors: "User already exists"});
}
const newUser=new User({firstName,lastName,email,password: hashedPassword});
await newUser.save();
res.status(201).json({message: "User created successfully",newUser});
} catch (error) {
    res.status(500).json({errors: "Error in signup"});
    console.log("error in signup",error);
}

};

export const login =async (req, res)=>{
    const {email, password} = req.body;
try {
    const user=await User.findOne({email:email});
    const isPasswordCorrect=await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect || !user){
        return res.status(403).json({errors: "Invalid email or password"});
    }

//jwt code
const token = jwt.sign(
    { id: user._id,
 },
 config.JWT_USER_PASSWORD,
 { expiresIn: '1d' }
);
const cookieOptions={
expires: new Date(Date.now()+ 24*60*60*1000),
httpOnly:true,
secure: process.env.NODE_ENV ==="production",
sameSite: "strict"
};
res.cookie("jwt",token,cookieOptions);
    res.status(201).json({message: "User logged in successfully", user,token});
} catch (error) {
    res.status(500).json({errors: "Error in login"});
    console.log("error in login",error);
}
};

export const logout =async (req, res)=>{
try {
    if(!req.cookies.jwt){
        return res.status(401).json({errors: "kindly login first"});
    }
    res.clearCookie("jwt");
res.status(200).json({message: "Admin logged out successfully"});
} catch (error) {
    res.status(500).json({error: "Error in logout"});
    console.log("error in logout",error);
}
};

export const purchases =async (req, res)=>{
const userId=req.userId;

try {
    const purchased=await Purchase.find({userId});

    let purchasedCourseId=[];

    for(let i=0; i<purchased.length;i++){
        purchasedCourseId.push(purchased[i].courseId);
       
    }

     const courseData=await Course.find({
            _id:{$in:purchasedCourseId}
        });

    res.status(200).json({purchased,courseData})
} catch (error) {
    res.status(500).json({errors: "Error in purchases"});
    console.log("error in purchase",error);
}
};