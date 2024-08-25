const axios = require("axios");

module.exports = class HttpRequest {
  static async post(endpoint, payload) {
    try {
      const response = await axios.post(
        `${process.env.GOOGLE_PLACES_API}${endpoint}`,
        {
          ...payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": "*",
          },
        }
      );

      return response?.data;
    } catch (e) {
      console.error(e);
      return e.response.data;
    }
  }
};
