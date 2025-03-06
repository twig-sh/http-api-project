const boardGames = require('../data/bggDataset.json');

// handles the sending of all responses
const sendResponse = (req, res, status, gamesObj) => {
  const content = JSON.stringify(gamesObj);

  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf-8'),
  });

  res.write(content);
  res.end();
};

// GET all board games in the dataset
const getAllGames = (req, res) => {
  sendResponse(req, res, 200, boardGames);
};

// GET all games that contain a specific mechanic
const getGamesByMechanic = (req, res) => {
  const gamesObjArr = [];

  // push all games that contain the mechanic to a separate array to be sent
  boardGames.forEach((game) => {
    if (game.Mechanics.includes(req.query.mechanic)) {
      gamesObjArr.push(game);
    }
  });

  // if no games were found with that mechanic, send a bad request (400)
  // otherwise send the new array (200)
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

// GET a specific game by its id
const getGame = (req, res) => {
  // check if a game with this id exists
  const gameObj = boardGames.find((game) => `${game.ID}` === req.query.id);

  // if no game with this id exists, send a bad request (400)
  // otherwise send the game object (200)
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

// GET games that support a specific player count
const getGamesByPlayers = (req, res) => {
  const gamesObjArr = [];

  // push all games that fit the specified player count into a new array
  boardGames.forEach((game) => {
    if (req.query.players >= game['Min Players'] && req.query.players <= game['Max Players']) {
      gamesObjArr.push(game);
    }
  });

  // if no games were found (the array is empty), send a bad request (400)
  // otherwise send the new array (200)
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

// POST a new game into the dataset
const addGame = (req, res) => {
  let gameObj = {};

  // pull all the parameters from the request body
  let {
    id, name, yearPublished, minPlayers, maxPlayers, playTime, minAge, mechanics,
  } = req.body;

  // if any parameter is missing from the body, send a bad request (400)
  if (!id || !name || !yearPublished || !minPlayers
    || !maxPlayers || !playTime || !minAge || !mechanics) {
    const badReq = {
      message: 'All parameters are required',
      id: 'missingParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  // parse all the parameters into their proper values
  name = String(name);
  id = Number(id);
  yearPublished = Number(yearPublished);
  minPlayers = Number(minPlayers);
  maxPlayers = Number(maxPlayers);
  playTime = Number(playTime);
  minAge = Number(minAge);
  mechanics = mechanics.split(',');

  let responseCode = 204;

  // check to see if a game with this id already exists
  gameObj = boardGames.find((game) => game.ID === id);

  // if it doesn't, push a new game into the dataset
  // if it does, update the non id body parameters in the existing game
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
        'BGG Rank': 'User Submitted',
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

// POST a rating onto an existing game in the dataset
const rateGame = (req, res) => {
  let gameObj = {};

  // pull all the parameters from the request body
  let { id, rating } = req.body;

  // if any parameter is missing, send a bad request (400)
  if (!id || !rating) {
    const badReq = {
      message: 'Both id and rating are required',
      id: 'missingParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  // parse the parameters into their proper types
  id = Number(id);
  rating = Number(rating);

  // check if the game's id exists in the dataset
  gameObj = boardGames.find((game) => game.ID === id);

  // if it doesn't, send a bad request (400)
  if (gameObj === undefined) {
    const badReq = {
      message: 'Invalid ID input',
      id: 'invalidParams',
    };
    return sendResponse(req, res, 400, badReq);
  }

  const responseCode = 204;

  // if it does, update the rating on the game object
  gameObj.Rating = rating;

  return sendResponse(req, res, responseCode, {});
};

// if an invalid url is input, send a not found response (404)
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
