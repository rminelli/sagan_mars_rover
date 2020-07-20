const fs = require("fs");
const configurationData = require("../config.json");
const Maps = require("../modules/maps.module")();
const Rover = require("../modules/rover.module")();

const htmlHead = `<head>
<title>Sagan Mars Rover</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
</head>`;

let lostRovers = [],
  newRoverPosition,
  response = `${htmlHead} <div class="jumbotron" style="padding:40px;"> <h1>Sagan Mars Rover</h1><p><b>Input:</b></p><br>[[INPUT]]<br><br><p><b>Output:</b></p><br>[[OUTPUT]]</div>`,
  cartesians = configurationData.cartesians,
  compass = configurationData.compass,
  mapSize,
  rovers;

const init = () => {
  try {
    let initConfig = _setInitialConfigurations();
    if (initConfig.errorCode) {
      return initConfig;
    }

    let initMove = _moveRovers();
    if (initMove.errorCode) {
      return initMove;
    }

    _setOutputSheet();

    return response;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

const _setInitialConfigurations = () => {
  try {
    let dataFile = fs.readFileSync(configurationData.sampleInput, "utf8");
    dataFile = dataFile.replace(/\r?\r/g, "");
    let arrData = dataFile.split("\n");
    response = response.replace("[[INPUT]]", arrData.join("<br>"));

    mapSize = Maps.setMapSize(arrData);
    if (mapSize.errorCode) {
      return mapSize;
    }

    arrData = arrData.slice(1, arrData.length);
    rovers = Rover.setRoverCollection(arrData);
    if (rovers.errorCode) {
      return rovers;
    }
    return true;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

const _moveRovers = () => {
  try {
    if (rovers.length == 0) {
      return { errorCode: 404, message: "Without rovers" };
    }

    newRoverPosition = rovers.map((rover) => {
      return _move(rover);
    });

    return true;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

const _setOutputSheet = () => {
  try {
    let output = "";
    for (let rover of newRoverPosition) {
      let lost = rover.lost ? " LOST" : "";
      output += `${rover.position[0]} ${rover.position[1]} ${
        configurationData.compass[rover.orientation]
      }${lost}<br>`;
    }
    response = response.replace("[[OUTPUT]]", output);
    return output;
  } catch (error) {
    return { errorCode: 500, message: error.message };
  }
};

function _move(rover) {
  let arrPos = rover.pos.split(" ");
  (sRoute = rover.route),
    (currentP = [parseInt(arrPos[0]), parseInt(arrPos[1])]),
    (currentO = compass.indexOf(arrPos[2])),
    (oldPosition = [currentP[0], currentP[1]]),
    (oldOrientation = currentO),
    (lost = false);

  for (let r of sRoute) {
    if (!lost) {
      if (r != "F") {
        if (r == "R") {
          currentO = currentO + 1 == compass.length ? 0 : currentO + 1;
        } else {
          currentO = currentO - 1 < 0 ? compass.length - 1 : currentO - 1;
        }
      } else {
        let checkLost = _checkLostRovers(currentP, currentO);

        if (checkLost) {
          let newO = compass[currentO];
          currentP[0] = currentP[0] + cartesians[newO][0];
          currentP[1] = currentP[1] + cartesians[newO][1];
        }
      }

      if (_checkCurrentPosition(currentP)) {
        oldPosition = [currentP[0], currentP[1]];
        oldOrientation = currentO;
      } else {
        lostRovers.push({
          position: oldPosition,
          orientation: oldOrientation,
        });
        lost = true;
        break;
      }
    }
  }
  return {
    position: oldPosition,
    orientation: oldOrientation,
    lost: lost,
  };
}

function _checkCurrentPosition(currentP) {
  if (currentP[0] > mapSize[0] || currentP[0] < 0) {
    return false;
  }
  if (currentP[1] > mapSize[1] || currentP[1] < 0) {
    return false;
  }
  return true;
}

function _checkLostRovers(currentP, currentO) {
  if (lostRovers.length > 0) {
    for (let lost of lostRovers) {
      if (
        JSON.stringify(lost.position) == JSON.stringify(currentP) &&
        lost.orientation == currentO
      ) {
        return false;
      }
    }
  }

  return true;
}

module.exports = () => {
  return {
    init,
  };
};
