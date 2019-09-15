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
        //const config = yaml.safeLoad(fs.readFileSync('/home/wottbox/Desktop/ranviermud/bundles/bundle-example-areas/areas/mapped/rooms.yml', 'utf-8'))
        //fs.rename('/home/wottbox/Desktop/ranviermud/bundles/bundle-example-areas/areas/mapped/rooms.yml', '/home/wottbox/Desktop/ranviermudbackup/rooms.yml')
        //const indentedJson = JSON.stringify(config)
        //let area = JSON.parse(indentedJson)
        // for(let key of Object.keys(req.body)){
        //   console.log(req.body[key])
        // }
        let area = []
        let currBundle = ""
        for(let key of Object.keys(req.body)){
          currBundle = req.body[key].bundle
            area.push({
              id:req.body[key].id,
              exits:Array.from(req.body[key].exits),
              area:req.body[key].area,
              title:req.body[key].title,
              coordinates:Object.values(req.body[key].coordinates),
              description:req.body[key].description,
              npcs: Array.from(req.body[key].npcs),
              doors:req.body[key].doors
            })
        }
        //console.log(yaml.safeDump(area, {condenseFlow:true, noCompatMode:true}))
        console.log(process.cwd()+'/bundles/' + currBundle + '/areas/mapped/rooms.yml')
        fs.writeFileSync(process.cwd()+'/bundles/' + currBundle + '/areas/mapped/rooms.yml', yaml.safeDump(area));

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
    const {title, metadata, bundle} = area;
    const rooms = area.rooms.size;
    const npcs = area.npcs.size;
    let roomList = [];
    for(const [name, room] of area.rooms){
      roomList.push(room);
    }
    areas.push({name, title, rooms, npcs, metadata, bundle, roomList});
  }
  let npcs = []

  for (const [name, npc] of state.MobManager.mobs) {
    const {area, script, behaviors, equipment, defaultEquipment, defaultItems, description, id, keywords, quests} = npc;
    npcs.push({name, area, script, behaviors, equipment, defaultEquipment, defaultItems, description, id, keywords, quests})
  }

  return ({areas, npcs});
}