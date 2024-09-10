const express = require("express");

const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

// post route to add a person

router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //aassuming the  request body contains the user data
    
     // Check if the role is 'admin'
     if (data.role === 'admin') {
      // Look for an existing admin
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ error: 'An admin already exists. Only one admin is allowed.' });
      }
    }
    
    //create a  new user document using a mongoose model
    const newUser = new User(data);
    //save the new user to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is:", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login route

router.post("/login", async (req, res) => {
  try {
    // Extract aadharcardnumber and password from the request body
    const { aadharCardNumber, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload); // Corrected this line

    // Return token as response
    res.json({ token }); // Moved this line outside of generateToken block
  } catch (error) {
    // Handle any other errors
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;

    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //extract the id from the token

    const {currentPassword,newPassword} = req.body //extrct current and new password from the req body
//find  the user bu userId
    const user =await User.findById(userId)
    //if password does not matach return  error

    if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      //update the user password
      user.password = newPassword;
      await user.save();
      console.log("password updated")
      res.status(200).json({message:"Password Updated"})

   
    
    
      
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
