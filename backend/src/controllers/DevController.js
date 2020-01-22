const axios = require('axios');
const mongoose = require('mongoose');

const Dev = require('../models/Dev');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    if (!github_username) {
      return res.status(400).json('Parâmetro(s) Insuficiente(s).');
    }

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const response = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name, avatar_url, bio } = response.data;

      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs,
        location,
      });

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techs
      );

      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }

    return res.json(dev);
  },

  // eslint-disable-next-line consistent-return
  async delete(req, res) {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json('Parâmetro(s) insuficiente(s)');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json('Parâmetro(s) inválido(s)');
    }

    await Dev.findByIdAndRemove(id, err => {
      if (err) {
        return res
          .status(400)
          .json('Erro interno, tente novamente mais tarde.');
      }

      return res.status(200).json('Sucesso! dev removido.');
    });
  },
};
