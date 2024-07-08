const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const saltRounds = 10; // The higher the number, the more secure but slower the hashing process
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
      ...req.body,
      password: hashedPassword, // Store the hashed password
    });
    await newUser.save();

    res.send({
      success: true,
      message: "User registered successfully, Please Login",
    });
  } catch (err) {
    console.log(err);
  }
};

async function hashPassword(password) {
  console.time("time taken");
  const salt = await bcrypt.genSalt(12);
  console.log("salt", salt);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("hashedPassword", hashedPassword);
  console.timeEnd("time taken");
  console.log("***************");
  return hashedPassword;
}

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("token", token);
    if (!user) {
      return res.send({
        success: false,
        message: "User not found. Please register",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const password = "Ayush@123";
    hashPassword(password);

    res.send({
      success: true,
      message: "Login Successful",
      user: user,
      data: token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.body.userId).select("-password");
  console.log("found user", user);
  res.send({
    success: true,
    data: user,
    message: "You are authorized to go the protected route",
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
