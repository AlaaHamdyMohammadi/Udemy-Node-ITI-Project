const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const course = require("./../courseRoutes");
const userRouter = express.Router();

//users/InstructorId/courses
userRouter.use("/:instructorId/courses", course);

userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);

userRouter.post("/forgetPassword", authController.forgetPassword);
//userRouter.patch("/resetPassword/:token", authController.resetPassword);

userRouter.use(authController.protect); //It will protect all routes after this middleware

userRouter.get("/me", userController.getMe, userController.getUser);
userRouter.delete("/deleteMe", userController.deleteMe, userController.getUser);
 
  userRouter.patch(
    "/updateMe",
    userController.uploadUserPhoto,
    //userController.resizeUserPhoto,
    userController.updateMe
  );

//userRouter.use(authController.restrictTo("admin"));

userRouter
  .route("/")
  .get(authController.restrictTo("user","admin"),userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    //userController.resizeUserPhoto,
    userController.updateUser
  )
  .delete(authController.restrictTo("admin"), userController.deleteUser);

module.exports = userRouter;
