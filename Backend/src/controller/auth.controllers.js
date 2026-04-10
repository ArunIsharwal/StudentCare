import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generateTokens.js";

const convertPasswordIntoHash = async (plainPassword) => {
  try {
    const hashPassword = await bcrypt.hash(plainPassword, 10);
    return hashPassword;
  } catch (error) {
    console.log("Hash Password Error: ", error);
    throw error;
  }
};

const checkPassword = async (plainPassword, hashPassword) => {
  try {
    const match = await bcrypt.compare(plainPassword, hashPassword);
    return match;
  } catch (error) {
    console.log("Error In Password Comperision: ", error);
    return false;
  }
};

const signUp = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User ALredy Exist" });
    }

    if ([fullname, email, password].some((item) => item.trim() === "")) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const hashPassword = await convertPasswordIntoHash(password);

    const newUser = await User.create({
      fullname,
      email,
      password: hashPassword,
      role,
    });

    const token = await generateTokens(newUser._id);

    const signUpUser = await User.findById(newUser._id).select("-password");

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      // maxAge: 100 * 24 * 60 * 60 * 1000 ,
      httpOnly: true,
    });

    return res.status(200).json(signUpUser);
  } catch (error) {
    console.log("SignUp Error: ", error);
    return res.status(500).json({ message: "Error In SignUp" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((item) => item.trim() === "")) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const match = await checkPassword(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Password Is Incorect" });
    }

    const token = await generateTokens(user._id);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 100 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("login Error:", error);
    return res.status(500).json({ message: "login Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout SuccessFully" });
  } catch (error) {
    console.log("Logout Error: ", error);
    return res.status(500).json({ message: "Logout Error" });
  }
};




const googleAuth = async (req, res) => {
  try {
    const { fullname, email, role } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullname,
        email,
        role,
      });
    }

    const token = await generateTokens(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 100 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("reset Password Error: ", error);
    return res.status(500).json({ message: `Reset Password Error : ${error}` });
  }
};

export { signUp, login, logout,  googleAuth };
