const mongoose = require("mongoose");
const validator = require("validator");
const { calculateAverage } = require("../utils/helpers");

const Schema = new mongoose.Schema(
  {
    taxi_name: {
      type: String,
      required: [true, "Taxi name is required."],
      minlength: [3, "Taxi name cannot be shorter than 3 characters."],
      maxlength: [32, "Taxi name cannot be longer than 16 characters."],
      unique: true,
      trim: true,
    },

    taxi_username: {
      type: String,
      required: [true, "Taxi username is required."],
      minlength: [3, "Taxi username cannot be shorter than 3 characters."],
      maxlength: [24, "Taxi username cannot be longer than 12 characters."],
      unique: true,
      trim: true,
    },

    taxi_profile: {
      type: String,
      validate: [validator.isURL, "Invalid profile photo url."],
      trim: true,
    },

    taxi_city: {
      type: String,
      required: [true, "The city taxi serves is required."],
      trim: true,
    },

    taxi_location: {
      type: {
        type: String,
        enum: {
          values: ["Point"],
          message: "Invalid location point.",
        },
        required: [true, "The location point is required."],
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates is required."],
      },
    },

    taxi_phone: {
      type: String,
      required: [true, "Taxi phone number is required."],
      validate: [validator.isMobilePhone, "Invalid phone number."],
      unique: true,
      trim: true,
    },

    taxi_whatsapp: {
      type: String,
      validate: [validator.isMobilePhone, "Invalid phone number."],
      trim: true,
    },

    taxi_address: {
      type: String,
      trim: true,
    },

    taxi_photos: [
      {
        type: String,
        validate: [validator.isURL, "Invalid photo url(s)."],
        trim: true,
      },
    ],

    taxi_popularity: {
      rating: {
        type: Number,
        min: [0, "Taxi rating cannot be less than 1 star."],
        max: [5, "Taxi rating cannot be higher than 5 stars."],
      },

      voted: {
        type: Number,
      },

      average: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

Schema.index({ taxi_location: "2dsphere" });

// * Document Middleware
Schema.pre("save", function (next) {
  this.taxi_popularity.average = calculateAverage(this.taxi_popularity);

  next();
});

const Taxi = mongoose.model("Taxi", Schema);

module.exports = Taxi;
