const Dev = require('../models/Dev');
const parseStringIntoArray = require('../utils/parseStringIntoArray');

module.exports = {
  async index(req, res) {
    const { latitude, longitude, techs, distance } = req.query;

    const techsArray = parseStringIntoArray(techs);

    const devs = await Dev.find({
      techs: {
        $in: techsArray,
      },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance || 10000,
        },
      },
    });

    return res.json({ devs });
  },
};
