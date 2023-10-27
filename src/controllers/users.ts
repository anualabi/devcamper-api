import asyncHandler from "../middleware/async";
import ErrorResponse from "../utilities/errorResponse";
import User from "../models/user";

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const errorMessage = `User with id ${req.params.id} not found.`;
    return next(new ErrorResponse(errorMessage, 404));
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Create user
// @route   POST /api/v1/auth/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  // Protect user password from being updated
  if ("password" in req.body) {
    const errorMessage = `Admins cannot update user passwords.`;
    return next(new ErrorResponse(errorMessage, 403));
  }

  let user = await User.findById(req.params.id);

  if (!user) {
    const errorMessage = `User with id ${req.params.id} not found.`;
    return next(new ErrorResponse(errorMessage, 404));
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const errorMessage = `User with id ${req.params.id} not found.`;
    return next(new ErrorResponse(errorMessage, 404));
  }

  await user.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
