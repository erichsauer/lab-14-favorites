const request = require('superagent');

const URL = `https://trefle.io/api/v1/plants/search?token=${process.env.PLANTS}`;

async function getPlants(search) {
  const plants = await request.get(`${URL}&q=${search}`);
  return plants.body.data;
}

function mungePlants(plants) {
  const mungedPlants = plants.map(({
    id,
    common_name,
    scientific_name,
    year,
    family_common_name,
    image_url,
    genus,
    family
  }) => ({
    id,
    common_name,
    scientific_name,
    year,
    family_common_name,
    image_url,
    genus,
    family
  })
  );
    // filter our null common names
  const filteredPlants = mungedPlants.filter(({ common_name }) => common_name);
    
  return filteredPlants;
}

module.exports = {
  getPlants,
  mungePlants
};
