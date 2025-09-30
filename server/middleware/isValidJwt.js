import jwt from "jsonwebtoken";

export default function isValidJwt(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No/invalid token provided." });
  }
  try {
    const validJwt = jwt.verify(token, "topsecretkey");
    req.user = {
      email: validJwt.email,
      name: validJwt.name,
      _id: validJwt._id,
      role: validJwt.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "No/invalid token provided." });
  }
}
