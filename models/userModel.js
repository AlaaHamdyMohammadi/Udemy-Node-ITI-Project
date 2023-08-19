const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, "Username is required!"] },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, "Please write a valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user", 
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minlength: 5,
    select: false, //To hidden password on the output
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      //Work on create user and save
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  //Encrypt password if password field is updated
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  //After check delete passwordConfirm from db
  this.passwordConfirm = undefined;
  next();
});

//To check if the given password is the same as the one stored in the document
    //Instance method is available on all documents of the collection
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  
  //Compare method: return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
}   

userSchema.methods.changedPasswordAfter = function(jwtTimestamp){
  
  if (this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(this.passwordChangedAt, jwtTimestamp);
    return jwtTimestamp < changedTimestamp;
  }
    //By default the user not changed his password
    return false;
};



const User = mongoose.model("User", userSchema);

module.exports = User;
