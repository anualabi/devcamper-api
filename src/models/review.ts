import mongoose, { Document, Model, Schema } from "mongoose";

interface ReviewDocument extends Document {
  title: string;
  text: string;
  rating: number;
  bootcamp: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewModel extends Model<ReviewDocument> {
  getAverageRating: (bootcampId: string) => Promise<void>;
}

const reviewSchema = new Schema<ReviewDocument, ReviewModel>(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Review title is required."],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, "Review text is required."],
      maxlength: 500,
    },
    rating: {
      type: Number,
      required: [true, "Review rating is required."],
      min: 1,
      max: 10,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // createdAt, updatedAt
);

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg of course ratings
reviewSchema.statics.getAverageRating = async function (bootcampId: string) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: new mongoose.Types.ObjectId(bootcampId) },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    const Bootcamp = mongoose.model("Bootcamp");
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageRating: obj.length > 0 ? obj[0].averageRating : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post<ReviewDocument>("save", async function () {
  const bootcampId = this.bootcamp.toString();
  await (this.constructor as ReviewModel).getAverageRating(bootcampId);
});

// Call getAverageRating after delete
reviewSchema.post<ReviewDocument>("deleteOne", async function () {
  const bootcampId = this.bootcamp.toString();
  await (this.constructor as ReviewModel).getAverageRating(bootcampId);
});

export default mongoose.model<ReviewDocument, ReviewModel>(
  "Review",
  reviewSchema
);
