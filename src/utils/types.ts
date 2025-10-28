import mongoose, { ObjectId } from "mongoose";

export interface userInterface extends mongoose.Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  first_name: string;
  last_name: string;
}
