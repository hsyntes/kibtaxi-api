const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    taxi_placeId: { type: String, required: true },
    taxi_name: { type: String, required: true },
    taxi_address: { type: String, required: true },
    taxi_popularity: {
      rating: { type: Number },
      voted: { type: Number },
      average: { type: Number },
    },
    taxi_phone: { type: String },
    taxi_profile: { type: String },
    taxi_photos: { type: [String] },
    taxi_reviews: { type: [Object] },
    taxi_googleMaps: { type: String, required: true },
    taxi_location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

Schema.index({ taxi_location: "2dsphere" });

const Taxi = mongoose.model("Taxi", Schema);

module.exports = Taxi;
