import asyncHandler from "../middleware/async";
import ErrorResponse from "../utilities/errorResponse";
import Bootcamp from "../models/bootcamp";
import Review from "../models/review";
import { RequestWithUser } from "../types/user";

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    const errorMessage = `No review found with the id of ${req.params.id}`;
    return next(new ErrorResponse(errorMessage, 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
export const addReview = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user?.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      const errorMessage = `No bootcamp with the id of ${req.params.bootcampId}`;
      return next(new ErrorResponse(errorMessage, 404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
      const errorMessage = `No review with the id of ${req.params.id}.`;
      return next(new ErrorResponse(errorMessage, 404));
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      const errorMessage = `Not authorized to update review.`;
      return next(new ErrorResponse(errorMessage, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await review?.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  }
);

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      const errorMessage = `No review with the id of ${req.params.id}.`;
      return next(new ErrorResponse(errorMessage, 404));
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      const errorMessage = `Not authorized to update review.`;
      return next(new ErrorResponse(errorMessage, 401));
    }

    // Save the bootcampId before deleting the review
    const bootcampId = review.bootcamp.toString();

    await review.deleteOne();

    // Calculate the new average after the review is deleted
    await Review.getAverageRating(bootcampId);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
