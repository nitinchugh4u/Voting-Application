const express = require("express");

const router = express.Router();
const User = require("../models/user");

const Candidate = require("../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};

// post route to add a candidate

router.post("/",jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.user.id)) {
        return res.status(403).json({ message: "user does not have  admin role" });
      }
    const data = req.body; //aassuming the  request body contains the candidate Data
    //create a  new user document using a mongoose model
    const newCandidate = new Candidate(data);
    //save the new user to the database
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.put("/:candidateID",jwtAuthMiddleware,async (req, res) => {
  try {

    if (!checkAdminRole(req.user.id)) {
        return res.status(403).json({ message: "user does not have  admin role" });
      }
    const candidateID = req.params.candidateID; //extract the id from the URL parameter
    const updatedCandidateData = req.body //updated data for the person


    //find  the user bu userId
    const response = await Person.findByIdAndUpdate(candidateID,updatedCandidateData,{
        new:true,
        runValidators:true
    });
    
    if(!response){
        return res.status(404).json({error:"candidate not found"})
    }


    console.log("candidate date saved");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



    
router.delete('/:candidateID', jwtAuthMiddleware, async(req,res)=>{
    try{

        if (!checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user does not have  admin role" });
          }
    
        const candidateID = req.params.candidateID  //extract the id feom the url paramter
    

        const response = await Person.findByIdAndDelete(candidateID)
    
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
          }
          console.log("data delete")
          res.status(200).json({error:"Candidate not found"})
          console.log("candidate deleted")
    
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Internal server error" });
          }
    
      })


      router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
        //no admin can vote
        //user can only vote once

       candidateID = req.params.candidateID
       userId= req.user.id

       try{

    
       //find the candidate  documenet with the specified candidate id
       const candidate = await Candidate.findById(candidateID)

       if(!candidate){
        return res.status(404).json({message:"candidate note found"})
    }

    const user = await User.findById(userId)
    if(!user){
        return res.status(404).json({message:"user not found"})
    }

    if(user.role=="admin"){
      return res.status(403).json({message:"admin is not allowed"})
  }
    if(user.isVoted){
        return res.status(400).json({message:"you have already voted"})
    }
   
    


     // Update the Candidate document to record the vote
     candidate.votes.push({user: userId})
     candidate.voteCount++;
     await candidate.save();

     // update the user document
     user.isVoted = true
     await user.save();

     return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
  
  })



  // vote count 
router.get('/vote/count', async (req, res) => {
  try{
      // Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // Map the candidates to only return their name and voteCount
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });

      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});




// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
  try {
      // Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


      
      
    
    

module.exports = router;
