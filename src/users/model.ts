import { UserType } from "../shared/types/user.types.ts";
import { mongoose } from "../utils/db.utils.ts";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      minlength: 2,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      minlength: 2,
      maxlength: 20,
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required."],
      minlength: 3,
      maxlength: 8,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
      maxlength: 15,
    },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    verificationToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as mongoose.UpdateQuery<UserType>;

  if (!update || !update.$set) return next();

  const fieldsToHash: (keyof UserType)[] = [
    "password",
    "refreshToken",
    "resetPasswordToken",
    "verificationToken",
  ];

  for (const field of fieldsToHash) {
    const value = update.$set[field];

    if (typeof value === "string") {
      update.$set[field] = await bcrypt.hash(value, 10);
    }
  }

  next();
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
