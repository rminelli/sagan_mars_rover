const configurationData = require("../config.json");
const Maps = require("./maps.module")();
let rovers = [];
const setRoverCollection = (data) => {
  try {
    if (data.length % 2 != 0) {
      return {
        errorCode: 400,
        error: "Incomplete information",
      };
    }
    for (let i = 0; i < data.length; i++) {
      if (i % 2 == 0) {
        let rover = {
          pos: data[i],
          route: data[i + 1],
        };

        let checkData = _checkRoverData(rover);
        if (checkData.errorCode) {
          return checkData;
        }

        rovers.push(rover);
      }
    }
    return rovers;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

const _checkRoverData = (roverData) => {
  try {
    let roverPos = roverData.pos;
    let roverRoute = roverData.route;
    let mapSize = Maps.getMapSize();
    if (roverRoute.length > configurationData.maxCoordinate) {
      return {
        errorCode: 400,
        error: `The movement exceeds the configurationDatauration parameters ${configurationData.maxCoordinate}`,
      };
    }
    roverPos = roverPos.split(" ");
    if (roverPos.length != 3 || roverPos.includes("")) {
      return {
        errorCode: 400,
        error: "The position is not well defined",
      };
    }

    if (!configurationData.compass.includes(roverPos[2])) {
      return {
        errorCode: 400,
        error: `The orientation is not well defined:  ${configurationData.compass}`,
      };
    }
    let roverPosX = parseInt(roverPos[0]);
    let roverPosY = parseInt(roverPos[1]);
    if (roverPosX > mapSize[0] || roverPosY > mapSize[1]) {
      return {
        errorCode: 400,
        error: `position is off the map. X:${mapSize[0]} - Y:${mapSize[1]}`,
      };
    }

    return false;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};
module.exports = () => {
  return {
    setRoverCollection,
  };
};
