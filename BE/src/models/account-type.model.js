import mongoose from "mongoose";

const { Schema } = mongoose;
const accountTypeSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

accountTypeSchema.index({ isActive: 1 });

export const AccountType = mongoose.model("AccountType", accountTypeSchema);
