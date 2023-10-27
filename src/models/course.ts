import mongoose, { Document, Model, Schema } from "mongoose";

interface CourseDocument extends Document {
  title: string;
  description: string;
  weeks: string;
  tuition: number;
  minimumSkill: "beginner" | "intermediate" | "advanced";
  scholarshipAvailable: boolean;
  bootcamp: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface CourseModel extends Model<CourseDocument> {
  getAverageCost: (bootcampId: string) => Promise<void>;
}

const courseSchema = new Schema<CourseDocument, CourseModel>(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Course title is required."],
    },
    description: {
      type: String,
      required: [true, "Course description is required."],
    },
    weeks: {
      type: String,
      required: [true, "Number of weeks is required."],
    },
    tuition: {
      type: Number,
      required: [true, "Tuition cost is required."],
      min: [0, "Tuition cost cannot be negative."],
    },
    minimumSkill: {
      type: String,
      required: [true, "Minimum skill level is required."],
      enum: ["beginner", "intermediate", "advanced"],
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Static method to get avg of course tuitions
courseSchema.statics.getAverageCost = async function (bootcampId: string) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: new mongoose.Types.ObjectId(bootcampId) },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    const Bootcamp = mongoose.model("Bootcamp");
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
courseSchema.post<CourseDocument>("save", async function () {
  const bootcampId = this.bootcamp.toString();
  await (this.constructor as CourseModel).getAverageCost(bootcampId);
});

// Call getAverageCost after remove
courseSchema.post<CourseDocument>("deleteOne", async function () {
  const bootcampId = this.bootcamp.toString();
  await (this.constructor as CourseModel).getAverageCost(bootcampId);
});

export default mongoose.model<CourseDocument, CourseModel>(
  "Course",
  courseSchema
);
