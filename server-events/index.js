'use strict'
const express = require('express');
const fs = require('fs');
const fsPath = require('fs-path');
const { Data } = require('ranvier');
const app = express();
const port = 3004;
const yaml = require('js-yaml')
const bodyParser = require('body-parser')
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

      // Store Area definitions in state
      state.areaDefinitions = getAreaDefinitions(state);

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


      app.get('/areasFiles', (req, res) => {
        console.log('gotfromfiles');
        res.send(state.areaDefinitions);
      });


      app.put('/areas', (req, res) => {

        if (!req.body) {
          res.send('none');
        }
        const baseName = replaceAll(req.body.manifest.title, ' ', '_').toLowerCase();
        const areaPath = (req.body.manifest.bundlePath) ? req.body.manifest.bundlePath : __dirname + '/../areas/' + baseName;
        console.log(req.body.manifest.title, 'saved to', areaPath)
        delete req.body.manifest.bundlePath;
        fsPath.writeFile(areaPath + `/rooms.yml`, yaml.safeDump(req.body.rooms), (err) => {
          if (err) {
            Logger.error(err);
          }
        });
        fsPath.writeFile(areaPath + `/items.yml`, yaml.safeDump(req.body.items), (err) => {
          if (err) {
            Logger.error(err);
          }
        });
        fsPath.writeFile(areaPath + `/manifest.yml`, yaml.safeDump(req.body.manifest), (err) => {
          if (err) {
            Logger.error(err);
          }
        });
        fsPath.writeFile(areaPath + `/npcs.yml`, yaml.safeDump(req.body.npcs), (err) => {
          if (err) {
            Logger.error(err);
          }
        });
        console.log(req.body.manifest.title, 'saved')


        // console.log(req.params.id);
        res.send('Woot');
      });

      app.put('/savearea', (req, res) => {
        let area = []
        let currBundle = ""
        for (let key of Object.keys(req.body)) {
          currBundle = req.body[key].bundle
          area.push({
            id: req.body[key].id,
            exits: Array.from(req.body[key].exits),
            area: req.body[key].area,
            title: req.body[key].title,
            coordinates: Object.values(req.body[key].coordinates),
            description: req.body[key].description,
            npcs: Array.from(req.body[key].npcs),
            doors: req.body[key].doors
          })
        }
        console.log(process.cwd() + '/bundles/' + currBundle + '/areas/mapped/rooms.yml')
        fs.writeFileSync(process.cwd() + '/bundles/' + currBundle + '/areas/mapped/rooms.yml', yaml.safeDump(area));

      });
      app.listen(port, () => console.log(`Express listening on port ${port}!`))
    },

    shutdown: state => function () {
    },
  }
};

function getAreaDefinitions(state) {
  const bundlesPath = __dirname + '../../../';
  const bundles = fs.readdirSync(bundlesPath);
  const areas = [];
  for (const bundle of bundles) {
    const bundlePath = bundlesPath + bundle;
    if (fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..') {
      continue;
    }

    // only load bundles the user has configured to be loaded
    if (state.Config.get('bundles', []).indexOf(bundle) === -1) {
      continue;
    }

    const path = bundlePath + '/areas/';
    if (fs.existsSync(path)) {
      const dirs = fs.readdirSync(path);
      for (const areaDir of dirs) {
        const areaPath = path + areaDir;
        if (fs.statSync(areaPath).isFile()) {
          continue;
        }
        // const areaName = path.basename(areaDir);

        const paths = {
          manifest: areaPath + '/manifest.yml',
          rooms: areaPath + '/rooms.yml',
          items: areaPath + '/items.yml',
          npcs: areaPath + '/npcs.yml',
          quests: areaPath + '/quests.yml',
        };
        console.log(areaPath)

        let manifest, items, npcs, rooms;
        if (fs.existsSync(paths.manifest)) {
          manifest = Data.parseFile(paths.manifest);
        }
        // load items
        if (fs.existsSync(paths.items)) {
          items = Data.parseFile(paths.items)
        }

        // load npcs
        if (fs.existsSync(paths.npcs)) {
          npcs = Data.parseFile(paths.npcs)
        }

        // load rooms
        if (fs.existsSync(paths.rooms)) {
          rooms = Data.parseFile(paths.rooms)
        }

        const area = {
          manifest,
          items,
          npcs,
          rooms
        };
        area.manifest.bundlePath = areaPath;
        areas.push(area);
      }
    }

  }
  return areas;
}

function getAreasInfo(state) {
  let areas = []
  for (const [name, area] of state.AreaManager.areas) {
    const { title, metadata, bundle } = area;
    const rooms = area.rooms.size;
    const npcs = area.npcs.size;
    let roomList = [];
    for (const [, room] of area.rooms) {
      roomList.push(room);
    }
    areas.push({ name, title, rooms, npcs, metadata, bundle, roomList });
  }

  let npcs = []
  for (const [uuid, npc] of state.MobManager.mobs) {
    const { area, script, behaviors, equipment, defaultEquipment, defaultItems, description, id, keywords, quests } = npc;
    npcs.push({ uuid, area, script, behaviors, equipment, defaultEquipment, defaultItems, description, id, keywords, quests })
  }

  let items = []
  for (const item of state.ItemManager.items) {
    const { area, metadata, behaviors, defaultItems, description, id, name, room, roomDesc, script } = item;
    items.push({ area, metadata, behaviors, defaultItems, description, id, name, room, roomDesc, script })
  }
  return ({ areas, npcs, items });
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}