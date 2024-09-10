const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },

  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted:{
    type:Boolean,
    default:false
  }
});



userSchema.pre('save',async function (next){
  const person = this;

  // hash the password only if it has been modified (or it  new)
  if(!person.isModified('password'))  return next()
      try{
  //hash passoword generation

  const salt = await bcrypt.genSalt(10);

  //hash password

  const hashedPassword =await  bcrypt.hash(person.password,salt);
  

  person.password = hashedPassword;
  next()


  }
  catch(err){
      return next(err)

  }


})
userSchema.methods.comparePassword= async function(candidatePassword){
  try{
      //use bcrypt to compare the provided password with the hashed passowrd
const isMatch = await bcrypt.compare(candidatePassword,this.password)
return isMatch
  }
  catch(err){
      throw err;

  }

}






const User = mongoose.model("User", userSchema);
module.exports = User;



