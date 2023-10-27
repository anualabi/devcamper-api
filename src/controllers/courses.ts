import asyncHandler from "../middleware/async";
import ErrorResponse from "../utilities/errorResponse";
import Bootcamp from "../models/bootcamp";
import Course from "../models/course";
import { RequestWithUser } from "../types/user";

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    "bootcamp",
    "name description"
  );
  if (!course) {
    const errorMessage = `No course with the id of ${req.params.id}`;
    return next(new ErrorResponse(errorMessage, 404));
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
export const addCourse = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user?.id;

    if (req.user?.role !== "admin") {
      const bootcamp = await Bootcamp.findById(req.params.bootcampId);

      if (!bootcamp) {
        const errorMessage = `No bootcamp with the id of ${req.params.bootcampId}`;
        return next(new ErrorResponse(errorMessage, 404));
      }

      // Make sure user is bootcamp owner
      if (bootcamp.user.toString() !== req.user?.id) {
        const errorMessage = `User ${req.user?.id} is not authorized to add a course to bootcamp ${bootcamp._id}`;
        return next(new ErrorResponse(errorMessage, 401));
      }
    }

    const course = await Course.create(req.body);

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
export const updateCourse = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    let course = await Course.findById(req.params.id);

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await course?.save();

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
export const deleteCourse = asyncHandler(
  async (req: RequestWithUser, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      const errorMessage = `No course with the id of ${req.params.id}`;
      return next(new ErrorResponse(errorMessage, 404));
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      const errorMessage = `User ${req.user?.id} is not authorized to delete course ${course._id}`;
      return next(new ErrorResponse(errorMessage, 401));
    }

    // Save the bootcampId before deleting the course
    const bootcampId = course.bootcamp.toString();

    await course?.deleteOne();

    // Calculate the average cost of the courses in the bootcamp
    await Course.getAverageCost(bootcampId);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
