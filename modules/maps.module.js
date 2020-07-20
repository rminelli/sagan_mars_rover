const configurationData = require("../config.json");
let mapSize = [0, 0];

const getMapSize = () => {
  return mapSize;
};
const setMapSize = (data) => {
  try {
    mapSize = data[0].split(" ");
    mapSize[0] = parseInt(mapSize[0]);
    mapSize[1] = parseInt(mapSize[1]);

    if (mapSize.length != 2 || mapSize.includes(NaN)) {
      mapSize = [0, 0];
      return {
        errorCode: 400,
        message: "The map is not defined",
      };
    }

    if (
      mapSize[0] > configurationData.maxCoordinate[0] ||
      mapSize[1] > configurationData.maxCoordinate[0]
    ) {
      return {
        errorCode: 400,
        message: "The map is too big",
      };
    }

    return mapSize;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

module.exports = () => {
  return {
    getMapSize,
    setMapSize,
  };
};
