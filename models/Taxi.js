const mongoose = require("mongoose");
const validator = require("validator");

const Schema = new mongoose.Schema(
  {
    taxi_name: {
      type: String,
      required: [true, "Taxi name is required."],
      minlength: [3, "Taxi name cannot be shorter than 3 characters."],
      maxlength: [16, "Taxi name cannot be longer than 16 characters."],
      unique: true,
      trim: true,
    },

    taxi_profile: {
      type: String,
      validate: [validator.isURL, "Invalid profile photo url."],
      trim: true,
    },

    taxi_description: {
      type: String,
      maxlength: [255, "Taxi description cannot be longer than 255."],
      trim: true,
    },

    taxi_location: {
      type: String,
      required: [true, "The location where this taxi serves is required."],
      trim: true,
    },

    taxi_phone: {
      type: String,
      required: [true, "Taxi phone number of the taxi is required."],
      validate: [validator.isMobilePhone, "Invalid phone number."],
      unique: true,
      trim: true,
    },

    taxi_whatsapp: {
      type: String,
      validate: [validator.isMobilePhone, "Invalid phone number."],
      trim: true,
    },

    taxi_email: {
      type: String,
      validate: [validator.isEmail, "Invalid email address."],
      lowercase: true,
      trim: true,
    },

    taxi_website: {
      type: String,
      validate: [validator.isURL, "Invalid website url."],
      lowercase: true,
      trim: true,
    },

    taxi_instagram: {
      type: String,
      validate: [validator.isURL, "Invalid instagram url."],
      lowercase: true,
      trim: true,
    },

    taxi_photos: [
      {
        type: String,
        validate: [validator.isURL, "Invalid photo url(s)."],
        trim: true,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

const Taxi = mongoose.model("Taxi", Schema);

module.exports = Taxi;
