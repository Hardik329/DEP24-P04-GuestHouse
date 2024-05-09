import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, //refers to the collection
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function (name) {
  console.log("Geting the next sequence number for " + name);
  const count = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true }
  );
  return count.seq;
};
const Counter = mongoose.model("Counter", counterSchema);
const initializeCounter = async () => {
  var counter = await Counter.findOne({ _id: "reservation" });
  if (!counter) {
    await Counter.create({ _id: "reservation", seq: 1 });
  }
  counter = await Counter.findOne({ _id: "meal" });
  if (!counter) {
    await Counter.create({ _id: "meal", seq: 1 });
  }
};
// setTimeout(() => {
//     intitializeCounter();
// }, 5000);

initializeCounter();
export default Counter;
