import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Token Not Found" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) {
      return res.status(400).json({ message: "Token Not Valid" });
    }

    // console.log("Decode User", decode);

    req.userId = decode.userId;
    next();
  } catch (error) {
    console.error("isAuth error:", error.message);
    return res.status(500).json({ message: "isAuth Error" });
  }
};

export { isAuth };
