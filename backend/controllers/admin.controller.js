
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from "zod";
import config from "../config.js";
import { Admin } from '../models/admin.model.js';

 
 export const signup =async (req, res)=>{
const {firstName,lastName, email, password} = req.body;

const adminSchema=z.object({
    firstName: z.string().min(3, {message:"firstName must be at least 3 characters long"}),
    lastName: z.string().min(3, {message:"lastName must be at least 3 characters long"}),
     email: z.string().email(),
      password: z.string().min(6, {message:"password must be at least 6 characters long"}),
})

const validateData= adminSchema.safeParse(req.body);
if (!validateData.success) {
    return res.status(400).json({errors:validateData.error.issues.map(err =>err.message)});
}

const hashedPassword=await bcrypt.hash(password,10);

try {
    const existingAdmin = await Admin.findOne({email: email});
if(existingAdmin){
    return res.status(400).json({errors: "Admin already exists"});
}
const newAdmin=new Admin({firstName,lastName,email,password: hashedPassword});
await newAdmin.save();
res.status(201).json({message: "Admin created successfully",newAdmin});
} catch (error) {
    res.status(500).json({errors: "Error in signup"});
    console.log("error in signup",error);
}

};

export const login =async (req, res)=>{
    const {email, password} = req.body;
try {
    const admin=await Admin.findOne({email:email});
    const isPasswordCorrect=await bcrypt.compare(password,admin.password);
    if(!isPasswordCorrect || !admin){
        return res.status(403).json({errors: "Invalid email or password"});
    }

//jwt code
const token = jwt.sign(
    { id: admin._id,
 },
 config.JWT_ADMIN_PASSWORD,
 { expiresIn: '1d' }
);
const cookieOptions={
expires: new Date(Date.now()+ 24*60*60*1000),
httpOnly:true,
secure: process.env.NODE_ENV ==="production",
sameSite: "strict"
};
res.cookie("jwt",token,cookieOptions);
    res.status(201).json({message: "Admin logged in successfully", admin,token});
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