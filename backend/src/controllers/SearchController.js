const Dev = require("../models/Dev");
const parseStringIntoArray = require("../utils/parseStringIntoArray");

module.exports = {
  async index(req, res) {
    const { latitude, longitude, techs, distance } = req.query;

    if (!distance) {
      distance = 10000;
    }

    const techsArray = parseStringIntoArray(techs);

    const devs = await Dev.find({
      techs: {
        $in: techsArray
      },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance
        }
      }
    });

    return res.json({ devs });
  }
};
