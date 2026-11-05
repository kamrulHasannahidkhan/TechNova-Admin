import Counter from "@/models/Counter";

export async function nextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TN${1000000 + counter.seq}`;
}
