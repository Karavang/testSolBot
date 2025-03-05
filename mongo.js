import mongoose, { connect } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
});

const WalletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  history: [
    {
      date: { type: Date },
      balance: { type: String },
    },
  ],
});
export const mongoConnect = async () => {
  try {
    await connect(process.env.MONGO);
    console.log("Mongo connected");
  } catch (error) {
    console.log(`We has any problems with connection to db. Error:${error}`);
  }
};
export const User = mongoose.model("User", UserSchema);
export const Wallet = mongoose.model("Wallet", WalletSchema);
