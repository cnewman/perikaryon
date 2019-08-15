'use strict'
const express = require('express');
const fs = require('fs');
const {Data} = require('ranvier');
const app = express();
const port = 3004;

var cors = require("cors");
app.use(cors());

module.exports = {
  listeners: {
    /**
     * The startup event is passed the `commander` variable which lets you access command line arguments used to start
     * the server. As with all entity scripts/commands/etc. you also have access to the entire game state.
     */
    startup: state => function (commander) {
      state.express = app;
      app.get('/players', (req, res) => {
        const activePlayerCount = state.PlayerManager.players.size;
        const players = [...state.PlayerManager.players].map(([_, player]) => ({
          name: player.name,
          role: player.role > 0 ? 'Staff' : 'Player'
        }));
        let dataPath = Data.getDataFilePath('player', 'any');
        dataPath = dataPath.slice(0, dataPath.lastIndexOf('/'));

        fs.readdir(dataPath, null, (err, files) => {
          const totalPlayerCount = files.length;
          res.json({
            activePlayerCount,
            totalPlayerCount,
            players,
          });
        });
      });

      app.get('/areas', (req, res) => {
        res.json(getAreasInfo(state));
      });

      app.listen(port, () => console.log(`Express listening on port ${port}!`))
    },

    shutdown: state => function () {
    },
  }
};

function getAreasInfo(state) {
  const areaCount = state.AreaManager.areas.size;
  let areas = []
  for (const [name, area] of state.AreaManager.areas) {
    const {title, metadata} = area;
    const rooms = area.rooms.size;
    const npcs = area.npcs.size;
    let roomList = [];
    for(const [name, room] of area.rooms){
      roomList.push(room);
    }
    areas.push({name, title, rooms, npcs, metadata, roomList});
  }

  return (areas);
}