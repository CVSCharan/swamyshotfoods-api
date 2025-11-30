import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["user", "admin", "staff"])
    .withMessage("Role must be user, admin, or staff"),
  body("pic")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
];

export const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const menuValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("desc").trim().notEmpty().withMessage("Description is required"),
  body("morningTimings")
    .optional()
    .isObject()
    .withMessage("Morning timings must be an object"),
  body("morningTimings.startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("morningTimings.endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  body("eveningTimings")
    .optional()
    .isObject()
    .withMessage("Evening timings must be an object"),
  body("eveningTimings.startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("eveningTimings.endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  body("ingredients").trim().notEmpty().withMessage("Ingredients are required"),
  body("priority").isInt().withMessage("Priority must be an integer"),
  body("imgSrc").isURL().withMessage("Image source must be a valid URL"),
];

export const storeConfigValidation = [
  body("isShopOpen")
    .optional()
    .isBoolean()
    .withMessage("isShopOpen must be a boolean"),
  body("isCooking")
    .optional()
    .isBoolean()
    .withMessage("isCooking must be a boolean"),
  body("isHoliday")
    .optional()
    .isBoolean()
    .withMessage("isHoliday must be a boolean"),
  body("holidayMessage")
    .optional()
    .isString()
    .withMessage("holidayMessage must be a string"),
  body("isNoticeActive")
    .optional()
    .isBoolean()
    .withMessage("isNoticeActive must be a boolean"),
  body("noticeMessage")
    .optional()
    .isString()
    .withMessage("noticeMessage must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),
];
