const boardGames = require('../data/bggDataset.json');

const sendResponse = (req, res, status, gamesObj) => {
  const content = JSON.stringify(gamesObj);

  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf-8'),
  });

  res.write(content);
  res.end();
};

const getAllGames = (req, res) => {
  const gamesObj = {
    boardGames,
  };

  sendResponse(req, res, 200, gamesObj);
};

const getGamesByMechanic = (req, res) => {
  const gamesObjArr = [];

  boardGames.forEach((game) => {
    if (game.Mechanics.includes(req.query.mechanic)) {
      gamesObjArr.push(game);
    }
  });

  if (gamesObjArr.length === 0) {
    const badReq = {
      message: 'Invalid Mechanic',
      id: 'badRequest',
    };
    sendResponse(req, res, 400, badReq);
  } else {
    sendResponse(req, res, 200, gamesObjArr);
  }
};

const getGame = (req, res) => {
  const gameObj = boardGames.find((game) => `${game.ID}` === req.query.id);

  if (gameObj === undefined) {
    const badReq = {
      message: 'Invalid ID',
      id: 'badRequest',
    };
    sendResponse(req, res, 400, badReq);
  } else {
    sendResponse(req, res, 200, gameObj);
  }
};

const getGamesByPlayers = (req, res) => {
  const gamesObjArr = [];

  boardGames.forEach((game) => {
    if (req.query.players >= game['Min Players'] && req.query.players <= game['Max Players']) {
      gamesObjArr.push(game);
    }
  });

  if (gamesObjArr.length === 0) {
    const badReq = {
      message: 'No games found for that player count',
      id: 'badRequest',
    };
    sendResponse(req, res, 400, badReq);
  } else {
    sendResponse(req, res, 200, gamesObjArr);
  }
};

const addGame = (req, res) => {
  let gameObj = {};

  let {
    id, name, yearPublished, minPlayers, maxPlayers, playTime, minAge, mechanics,
  } = req.body;

  if (!id || !name || !yearPublished || !minPlayers
    || !maxPlayers || !playTime || !minAge || !mechanics) {
    const badReq = {
      message: 'All parameters are required',
      id: 'missingParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  name = String(name);
  id = Number(id);
  yearPublished = Number(yearPublished);
  minPlayers = Number(minPlayers);
  maxPlayers = Number(maxPlayers);
  playTime = Number(playTime);
  minAge = Number(minAge);
  mechanics = mechanics.split(',');

  let responseCode = 204;

  gameObj = boardGames.find((game) => game.ID === id);

  if (gameObj === undefined) {
    responseCode = 201;
    gameObj = boardGames.push(
      {
        ID: id,
        Name: name,
        'Year Published': yearPublished,
        'Min Players': minPlayers,
        'Max Players': maxPlayers,
        'Play Time': playTime,
        'Min Age': minAge,
        Rating: 'Not Rated',
        Mechanics: mechanics,
      },
    );
  } else {
    gameObj.Name = name;
    gameObj['Year Published'] = yearPublished;
    gameObj['Min Players'] = minPlayers;
    gameObj['Max Players'] = maxPlayers;
    gameObj['Play Time'] = playTime;
    gameObj['Min Age'] = minAge;
    gameObj.Mechanics = mechanics;
  }

  if (responseCode === 201) {
    return sendResponse(req, res, responseCode, gameObj);
  }

  return sendResponse(req, res, responseCode, {});
};

const rateGame = (req, res) => {
  let gameObj = {};

  let { id, rating } = req.body;

  if (!id || !rating) {
    const badReq = {
      message: 'Both id and rating are required',
      id: 'missingParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  id = Number(id);
  rating = Number(rating);

  gameObj = boardGames.find((game) => game.ID === id);

  if (gameObj === undefined) {
    const badReq = {
      message: 'Invalid ID input',
      id: 'invalidParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  const responseCode = 204;

  gameObj.Rating = rating;

  return sendResponse(req, res, responseCode, {});
};

const notFound = (req, res) => {
  const object = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  sendResponse(req, res, 404, object);
};

module.exports = {
  getAllGames,
  getGamesByMechanic,
  getGame,
  getGamesByPlayers,
  addGame,
  rateGame,
  notFound,
};
