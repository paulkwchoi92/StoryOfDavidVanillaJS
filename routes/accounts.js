// const faker = require("faker");
//// Used to sign source of truth tokens for session and protected routes.
// const jwt = require("jsonwebtoken");
// Provides access to secret.
// const keys = require("../../config/keys");
// Needed to create the router.
const express = require("express");
// Handles directing requests to the desired handlers.
const router = express.Router();
// Used to encrypt passwords.
// const bcrypt = require("bcryptjs");
// User model.

const Account = require("../models/account");

// NB: The callback for every Express route requires a request and response as arguments.
router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));

// Handles creation of new users.
router.post("/register", (req, res) => {
  // Runs validation method and deconstructs its return.
  
  const body = req.body;
  // First check to make sure this email is not already in use.

  // Else, create a new user.
  console.log(req.body)
  
  // let RandomizedQuestions = shuffle(testsRandomer);
  const newUser = new Account({
    username: body.email,
    password: body.password,
  });
  newUser.save().then(res.json({ status: "success" }));

  // Salt the password.
});


router.post("/getpassword", (req, res) => {
  // Runs validation method and deconstructs its return.

  const body = req.body;
  // First check to make sure this email is not already in use.

  // Else, create a new user.

  // let RandomizedQuestions = shuffle(testsRandomer);
  const newUser = new Account({
    username: body.email,
    password: body.password,
  });

  newUser.save().then(res.json({status: "success"}))
  // Salt the password.
});
// Handles logging in.
// router.post("/login", (req, res) => {
//   // Runs validation method and deconstructs its return.
//   const { errors, isValid } = validateLoginInput(req.body);

//   if (!isValid) {
//     // Return 400 if invalid form.
//     return res.status(400).json(errors);
//   }

//   const email = req.body.email;
//   const password = req.body.password;

//   User.findOne({ email }).then((user) => {
//     if (!user) {
//       // Use the validations to send the error.
//       errors.email = `There is no user with the email: ${email}`;
//       return res.status(404).json(errors);
//     }

//     bcrypt.compare(password, user.password).then((good) => {
//       if (good) {
//         const payload = { id: user.id };

//         jwt.sign(
//           payload,
//           keys.secretOrKey,
//           // Tell the key to expire in one hour
//           { expiresIn: 3600 },
//           (err, token) => {
//             res.json({
//               user: user,
//               success: true,
//               token: "Bearer " + token,
//             });
//           }
//         );
//       } else {
//         // Use the validations to send the error.
//         errors.password = "Incorrect password";
//         return res.status(400).json((errors.password = "Incorrect password"));
//       }
//     });
//   });
// });

// Serves specific user.

module.exports = router;
