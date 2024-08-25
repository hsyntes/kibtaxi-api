const AppError = require("../../errors/AppError");
const {
  getTaxisFromPlacesAPI,
  getTaxiPhotos,
  getTaxiReviews,
} = require("../../utils/helpers");
const Response = require("../../utils/Response");

exports.getTaxis = async function (req, res, next) {
  try {
    const { lat, long } = req.query;
    const taxisFromPlacesAPI = await getTaxisFromPlacesAPI(lat, long, next);

    const taxis = taxisFromPlacesAPI.map((taxiFromPlacesAPI) => {
      let taxi_photos = [];
      let taxi_profile;
      let taxi_reviews = [];

      if (taxiFromPlacesAPI?.photos) {
        taxi_photos = getTaxiPhotos(taxiFromPlacesAPI.photos);
        taxi_profile = taxi_photos[0];
      }

      if (taxiFromPlacesAPI?.reviews)
        taxi_reviews = getTaxiReviews(taxiFromPlacesAPI.reviews);

      return {
        taxi_name: taxiFromPlacesAPI?.displayName?.text,
        taxi_address: taxiFromPlacesAPI?.shortFormattedAddress,
        taxi_popularity: {
          rating: taxiFromPlacesAPI?.rating,
          voted: taxiFromPlacesAPI?.userRatingCount,
          average:
            Number(taxiFromPlacesAPI?.rating) *
            Number(taxiFromPlacesAPI?.userRatingCount),
        },
        taxi_phone: taxiFromPlacesAPI?.internationalPhoneNumber,
        taxi_profile,
        taxi_photos,
        taxi_reviews,
        taxi_googleMaps: taxiFromPlacesAPI?.googleMapsUri,
      };
    });

    const popular_taxis = taxis
      .sort((a, b) => b.taxi_popularity.average - a.taxi_popularity.average)
      .slice(0, 3);

    Response.send(res, 200, "success", undefined, taxis.length, {
      popular_taxis,
      taxis,
    });
  } catch (e) {
    next(e);
  }
};
