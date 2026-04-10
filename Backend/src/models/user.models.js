import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      //   required: [true, "Email Is Required"],
      // unique: true,
    },

    password: {
      type: String,
      //   required: [true, "Password Is Required"],
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "user",
    },
   
  },
  { timestamps: true }
);

userSchema.index({location: "2dsphere"})

export const User = mongoose.model("User", userSchema);
