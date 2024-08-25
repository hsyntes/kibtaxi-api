const HttpRequest = require("./HttpRequest");
const AppError = require("../errors/AppError");

exports.getTaxisFromPlacesAPI = async function (lat, long, next) {
  try {
    const taxis = await HttpRequest.post(":searchNearby", {
      includedTypes: ["taxi_stand"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: Number(lat),
            longitude: Number(long),
          },
          radius: 30000,
        },
      },
    });

    return taxis.places;
  } catch (e) {
    console.error(e);
    next(new AppError(500, "error", `Taxi data(s) couldn't fetch: ${e}`));
  }
};

exports.getTaxiPhotos = (photos) =>
  photos.map(
    (photo) =>
      `${process.env.GOOGLE_PLACES_API}/${photo.name
        .split("places/")
        .at(1)}/media?maxWidthPx=${photo.widthPx}&maxHeightPx=${
        photo.heightPx
      }&key=${process.env.GOOGLE_PLACES_API_KEY}`
  );

exports.getTaxiReviews = (reviews) =>
  reviews.map((review) => ({
    reviewer_photo: review?.authorAttribution?.photoUri,
    reviewer_name: review?.authorAttribution?.displayName,
    reviewer_rating: review?.rating,
    reviewer_review:
      review?.originalText?.languageCode === "tr"
        ? review.originalText
        : review.text,
    reviewer_publishDate: review?.publishTime,
  }));
