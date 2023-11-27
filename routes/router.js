// router.js
const express = require("express");
const router = express.Router();
const User = require('../models/userSchema');
const multer = require("multer");
const fs = require("fs");

// image Uploading we use Multer
var storage = multer.diskStorage({
  destination: function(req, file, callbacks){
    callbacks(null, './uploads');
  },
  filename: function(req, file, callbacks) {
    callbacks(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

var upload = multer({
  storage: storage,
}).single('image');

// Define Users page route
router.get('/add', (req, res) => {
  res.render('add_users', {title: 'Add Users'})
}) 

// Route to insert new user in database
router.post('/add', upload, async (req, res) => {
  try {
    // Create a new user instance
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    // Save the user to the database
    await newUser.save();

    // Set session message
    req.session.message = {
      type: 'success',
      message: 'User added successfully!',
    };

    // Redirect to the home page after a short delay (adjust as needed)
    setTimeout(() => {
      res.redirect("/");
    }, 1000); // Delay for 1 second (adjust as needed)
  } catch (error) {
    console.error(error);
    res.json({ message: error.message, type: 'danger' });
  }
});


// Route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().exec();

    res.render('index', {
      title: 'Home Page',
      users: users,
    });
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Edit an user Route
router.get('/edit/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    
    if (!user) {
      return res.redirect("/");
    }

    res.render("edit_users", {
      title: "Edit User",
      user: user,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// Update user route
router.post('/update/:id', upload, async (req, res) => {
  try {
    let id = req.params.id;
    let newImage = ''; // Corrected variable name

    if (req.file) {
      // If a new image is uploaded, update the image path
      newImage = req.file.filename; // Corrected variable assignment
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      newImage = req.body.old_image;
    }

    // Use findByIdAndUpdate with the { new: true } option to get the updated document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found', type: 'danger' });
    }

    req.session.message = {
      type: 'success',
      message: 'User Updated Successfully!',
    };
    
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, type: 'danger' });
  }
});

// Delete User Route
router.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Find the user to be deleted
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found', type: 'danger' });
    }

    // Delete the user's image file if it exists
    // if (userToDelete.image) {
    //   try {
    //     await fs.unlink('./uploads/' + userToDelete.image);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    if (userToDelete.image) {
      const imagePath = './uploads/' + userToDelete.image;
    
      try {
        await fs.promises.unlink(imagePath);
      } catch (err) {
        console.error(err);
      }
    }    

    // Remove the user from the database
    await User.deleteOne({ _id: id });

    req.session.message = {
      type: 'info',
      message: 'User Deleted Successfully!',
    };
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, type: 'danger' });
  }
});


module.exports = router;
