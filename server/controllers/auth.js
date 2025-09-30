import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { UserModel } from "../model/user.js";

async function Login(req, res, next) {
  try {
    const {email, password} = req.body;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if(!emailRegex.test(email)){
      return res.status(400).json({error: "Invalid email address"})
    }
    const existingUser = await UserModel.findOne({email});
    if(!existingUser){
      return res.status(400).json({message:"Incorrect email or password "});
    }
    const checkPassword = await bcrypt.compare(password, existingUser.password);
    if(!checkPassword){
      return res.status(400).json({message:"Incorrect email or password"});
    }
    const token = jwt.sign(
      {
        _id:existingUser._id,
        email: req.body.email,
        name:existingUser.name,
        role:existingUser.role
      },
      "topsecretkey",
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true, // cannot access via JS
      secure: true, // send only over HTTPS
      sameSite: "strict", // helps prevent CSRF
      maxAge: 3600000, // 1 hour
    });
    return res.status(200).json({ email: req.body.email, name:existingUser.name }); // no need to send token in JSON
  } catch (e) {
    console.error("Server error", e);
  }
}

async function Signout(req, res, next){
  try{
    res.clearCookie("token", {
      httpOnly:true,
      secure:true,
      sameSite:"strict"
    });
    return res.json({message:"Signout successful!"})
  }catch(e){
    console.error("Error while signing out", e);
  }
}

export {Login, Signout };
