import { User } from "../mongo.js";

export const regFunc = async (user) => {
  const { first_name, username } = user.chat;
  return await User({
    name: first_name,
    username: username,
  })
    .save()
    .then(() => {
      return "User saved successfully";
    })
    .catch((err) => {
      if (err.code === 11000) {
        return "User already exists";
      } else {
        return `Error: ${err.message}`;
      }
    });
};
