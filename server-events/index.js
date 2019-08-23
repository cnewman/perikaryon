'use strict'
const express = require('express');
const fs = require('fs');
const {Data} = require('ranvier');
const app = express();
const port = 3004;
const yaml = require('js-yaml')
const bodyParser = require ('body-parser')
var cors = require("cors");
app.use(cors());
app.use(bodyParser.json())

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
      app.put('/savearea', (req, res) => {
        for(let key of Object.keys(req.body)){
          console.log(req.body[key])
        }
        const config = yaml.safeLoad(fs.readFileSync('/home/wottbox/Desktop/ranviermud/bundles/bundle-example-areas/areas/mapped/rooms.yml', 'utf-8'))
        const indentedJson = JSON.stringify(config,null,null)
        let area = JSON.parse(indentedJson)
        for(let room of area){
          console.log(room)
        }
        for(let key of Object.keys(req.body)){
          if(req.body[key].title == "testArea"){
            area.push({
              id:req.body[key].title,
              title:req.body[key].title,
              coordinates:[req.body[key].coordinates.x, req.body[key].coordinates.y, req.body[key].coordinates.z],
              description:req.body[key].description
            })
          }
        }
        //console.log(yaml.safeDump(area, {condenseFlow:true}))
        fs.writeFileSync('/home/wottbox/Desktop/ranviermud/bundles/bundle-example-areas/areas/mapped/rooms.yml', yaml.safeDump(area));

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