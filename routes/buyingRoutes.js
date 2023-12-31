const express = require('express');
const stripe = require("stripe")(
  "sk_test_51NiJyfH0IkXldde8uFZgJdDInCRjmqMOewtYEONVitYKVz3pNrjrpkFrj7AID9f1AXQXFmCwMqBsCyEqBPjK0wII00Q9QtNw3D"
);
const buyingController = require("./../controllers/buyingController");
const authController = require("./../controllers/authController");
const Enrolled = require('./../models/enrolledModel');

const buyingRouter = express.Router();
 
buyingRouter.post("/checkout-session",authController.protect, async(req, res, next) => {
    try{ 
      // 1- Get the currently course
      //const course = await Course.findById(req.params.courseID);
      console.log(req.body.cartItems);
      const line_items =  req.body.cartItems.map(item => {
        // console.log('Item', item);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.title} Course`,
              description: item.subTitle,
              images: [
                `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXeHK0UxO2iU4pyDff204SsbHQEpzADk_JtqbeXKsySQGWnYKnG4vroGakDbmpwcwq6Eg&usqp=CAU`,
              ],
              // images: [item.photo],
              metadata: {
                id: item._id,
              },
            },
            unit_amount: item.price * 100, // Amount in cents
          },
          quantity: 1,
        };
      })
          

      // 2- Create checkout session
      const session = await stripe.checkout.sessions.create({
        //Information about session
        //payment_method_types: ["card"],
        success_url: `http://localhost:5173/my-learning?success=true`, //checkout-success
        cancel_url: `http://localhost:5173/cart`,
        //customer_email: req.user.email,
        //client_reference_id: req.params.courseID,

        line_items,
        mode: "payment",
      });
      console.log(session);
      const courses = req.body.cartItems.map(async (item) => {
        await Enrolled.create({
          course: item._id,
          price: item.price,
          photo: item.photo,
          instructor: item.instructor,
          user: req.id,
        });

      })

      // 3- Create session as response to send to the client
      res.status(200).json({
        status: "Success",
        session,
        courses,        
      });
    }catch(err){
        console.log('Error: ', err);
        res.status(500).json({
          status: "Faild",
          message: err,
        });
    }
});

module.exports = buyingRouter;