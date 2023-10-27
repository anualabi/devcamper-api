import config from "config";
import path from "path";

import asyncHandler from "../middleware/async";
import Bootcamp from "../models/bootcamp";
import geocoder from "../utilities/geocoder";
import ErrorResponse from "../utilities/errorResponse";
import { RequestWithUser } from "../types/user";

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
export const getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    const errorMessage = `Bootcamp not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errorMessage, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
export const createBootcamp = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    // Add user to req.body
    req.body.user = req.user?.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user?.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user?.role !== "admin") {
      const errorMessage = `The user with ID ${req.user?.id} has already published a bootcamp`;
      return next(new ErrorResponse(errorMessage, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
  }
);

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
export const updateBootcamp = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: bootcamp });
  }
);

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
export const deleteBootcamp = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    await bootcamp?.deleteOne();
    res.status(200).json({ success: true, data: {} });
  }
);

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
export const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Convert distance to number type
  const distanceInMiles = Number(distance);

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distanceInMiles / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
export const bootcampPhotoUpload = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    const fileUploadPath = config.get<string>("fileUploadPath");
    const maxFileUpload = config.get<number>("maxFileUpload");

    if (!req.files) {
      return next(new ErrorResponse("Please upload a file", 400));
    }

    const file = req.files.file as any;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse("Please upload an image file", 400));
    }

    // Check filesize
    if (file.size > maxFileUpload) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${maxFileUpload}`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `photo_${bootcamp?._id}${path.parse(file.name).ext}`;
    file.mv(`${fileUploadPath}/${file.name}`, async (err: any) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse("Problem with file upload", 500));
      }
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
      res.status(200).json({ success: true, data: file.name });
    });
  }
);
