import { UserModel } from "../model/user.js";

async function Signup(req, res) {
  if(req.user.role !== "admin"){
    return res.status(401).json({message:"Unauthorized"});
  }
  const { name, email, password, role } = req.body;
  if(!name || !email || !password || !role){
    return res.status(400).json({message:"Fields cannot be blank"});
  }
  const existingUser = await UserModel.find({email:email});
    if(existingUser.length > 0){
      return res.status(400).json({message:"User email already exists"})
    }
  const user = new UserModel({ name, email, password, role });
  try {
    await user.save();
    return res.json({message:"User created succesfully"})
  } catch (error) {
    console.log(error);
    return res.status(400).json({message:"User created failed", error:error})
  }
}

async function FetchUsers(req, res, next) {
 const {role } = req.user;
  if(role !== "admin"){
    return res.status(401).json({message:"Unauthorized"});
  }
  try {
    const users = await UserModel.find();
    return res.json({ users: users });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Failed to fetch users" });
  }
}

export { FetchUsers, Signup };
