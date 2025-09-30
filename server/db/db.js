import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("Using existing connection!");
    return;
  }
  try {
    await mongoose.connect(
      "mongodb+srv://Fifinix:XM441deepCDCg5cU@cluster0.5tubi5j.mongodb.net/maa-tara-traders?retryWrites=true&w=majority&appName=Cluster0"
    );
    isConnected = true;
    console.log("New connection!");
  } catch (error) {
    console.error(error);
    throw error;
  }
}
