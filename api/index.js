const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

mongoose
//   .connect("mongodb+srv://mohdfuzail:fuzail@cluster0.92imqor.mongodb.net/")
.connect('mongodb://192.168.1.12:27017/produts')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const User = require("./models/user");
const Order = require("./models/order");

const sendVerificationEmail = async (email, verificationToken) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure the email service or SMTP details here
      service: "gmail",
      auth: {
        user: "fuzailmohd018@gmail.com",
        pass: "ncstrtqsgyabfcmc",
      },
    });
  
    // Compose the email message
    const mailOptions = {
      from: "amazon.com",
      to: email,
      subject: "Email Verification",
      text: `Please click the following link to verify your email: http://192.168.1.12:8000/verify/${verificationToken}`,
    };
  
    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };
  app.get("/", (req, res) => {
    res.send("Hello, this is the server!");
  });
app.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
  
      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Email already registered:", email); // Debugging statement
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // Create a new user
      const newUser = new User({ name, email, password });
  
      // Generate and store the verification token
      newUser.verificationToken = crypto.randomBytes(20).toString("hex");
  
      // Save the user to the database
      await newUser.save();
  
      // Debugging statement to verify data
      console.log("New User Registered:", newUser);
  
      // Send verification email to the user
      // Use your preferred email service or library to send the email
      sendVerificationEmail(newUser.email, newUser.verificationToken);
  
      res.status(201).json({
        message:
          "Registration successful. Please check your email for verification.",
      });
    } catch (error) {
      console.log("Error during registration:", error); // Debugging statement
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app.get('/register', async (req, res) => {
    try {
      
      res.send(name); // Send a response with the saved record
    } catch (e) {
      console.error('Error:', e);
      res.status(400).send(e); // Send an error response with the error message
    }
  });
  //endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
    try {
      const token = req.params.token;
  
      //Find the user witht the given verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }
  
      //Mark the user as verified
      user.verified = true;
      user.verificationToken = undefined;
  
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Email Verificatioion Failed" });
    }
  });
  
const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
  
    return secretKey;
  };
  
  const secretKey = generateSecretKey();
  
  //endpoint to login the user!
  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      //check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      //check if the password is correct
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      //generate a token
      const token = jwt.sign({ userId: user._id }, secretKey);
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Login Failed" });
    }
  });