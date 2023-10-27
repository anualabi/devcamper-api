import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";

import geocoder from "../utilities/geocoder";

interface BootcampDocument extends Document {
  name: string;
  slug: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address?: string;
  location: {
    type: string;
    coordinates: [number | undefined, number | undefined];
    formattedAddress: string | undefined;
    street: string | undefined;
    city: string | undefined;
    state: string | undefined;
    zipcode: string | undefined;
    country: string | undefined;
  };
  careers: string[];
  averageRating: number;
  averageCost: number;
  photo: string;
  housing: boolean;
  jobAssistance: boolean;
  jobGuarantee: boolean;
  acceptGi: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId;
}

const bootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Create bootcamp slug from the name
bootcampSchema.pre<BootcampDocument>("save", function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// Geocode & create location field
bootcampSchema.pre<BootcampDocument>("save", async function (next) {
  if (!this.address) {
    throw new Error("Address is required for geocoding.");
  }

  const loc = await geocoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted
bootcampSchema.pre<BootcampDocument>(
  "deleteOne",
  { document: true, query: false },
  async function (next: () => void) {
    await this.$model("Course").deleteMany({ bootcamp: this._id });
    await this.$model("Review").deleteMany({ bootcamp: this._id });
    next();
  }
);

// Reverse populate with virtuals
bootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

export default mongoose.model<BootcampDocument>("Bootcamp", bootcampSchema);
