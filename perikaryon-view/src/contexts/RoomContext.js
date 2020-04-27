import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import uuid from 'uuid/v1';
import {List, Record, fromJS, isKeyed, Map, isCollection} from 'immutable'

export const RoomContext = createContext();
export const getAreasStatic = (ranvierDataInJson) => {
  let newAreaManager = List();
  for (let keyval of ranvierDataInJson) {
    let mapthis = fromJS(
      {
        "manifest": keyval.manifest,
        "items": keyval.items,
        "npcs": keyval.npcs,
        "rooms": keyval.rooms
      })
    newAreaManager = newAreaManager.push(mapthis)
  }
  return newAreaManager;
};
const RoomContextProvider = (props) => {

  const [areaManager, setAreaManager] = useState(List());
  const [mobManager, setMobManager] = useState(List());
  const [itemManager, setItemManager] = useState(List());
  const [activeFloor, setActiveFloor] = useState(0);
  const [areaFloors, setAreaFloors] = useState(List());
  const [activeArea, setActiveArea] = useState(Record({}));
  const [activeRoom, setActiveRoom] = useState(Record({}));
  const [activeItem, setActiveItem] = useState(Record({}));
  const [activeMob, setActiveMob] = useState(Record({}));
  const [activeEntity, setActiveEntity] = useState(null);

  useEffect(() => {
    if(isCollection(props.data)){
      setAreaManager(props.data)
    }else{
      const loadData = async () => {
        setAreaManager(await props.data)
      }
      loadData();
    }
  }, [])

  const changeActiveFloor = (newFloor) => {
    setActiveFloor(newFloor);
  }
  const changeActiveArea = (newAreaName) => {
    const foundArea = areaManager.find((area) => area.get("manifest").get("title") === newAreaName);
    
    const setOfFloorsInArea = new Set()
    if(foundArea.get("rooms")){
      for (let room of foundArea.get("rooms")) {
        if(room.get("coordinates")){
          setOfFloorsInArea.add(room.get("coordinates").get("2"))
        }
      }
    }
    setAreaFloors(Array.from(setOfFloorsInArea));
    setActiveArea(foundArea);
    setActiveRoom(Record({}));
    setActiveItem(Record({}));
    setActiveMob(Record({}));
    setActiveEntity(null);
    // setActiveRooms
    //console.log(newAreaName, foundArea)
  };

  const changeActiveRoom = (newRoom) => {
    // const foundRoom = activeArea.rooms.find((room) => room.id === newRoomId);
    setActiveRoom(fromJS(newRoom));
    setActiveEntity('ROOM');
    //console.log(activeRoom.title, activeEntity)
  }

  const changeActiveMob = (newMobName) => {


  }

  const changeActiveItem = (newItemName) => {


  }

  const createRoom = () => {
    const room = fromJS({
      id: `${uuid().substring(0,7)}`,
      title: `New Room in ${activeArea.manifest.title}`,
      description: 'You see....',
      exits: [],
    })
    
    setActiveEntity('ROOM');
    activeArea.rooms.push(room);
    setActiveArea(activeArea);
    setActiveRoom(fromJS(room));
  }

  const saveArea = () => {
    console.log('do saveArea')
    // axios.put("http://localhost:3004/savearea", this.state.mapOfRoomsInArea).then(res => console.log(res.data));

    axios.put(`http://localhost:3004/areas`, activeArea)
      .then(res => {
        //console.log(res);
        //console.log(res.data);
      })
      .catch(err => err);

  }

  // const getAreas = () => {
  //   fetch("http://localhost:3004/areas")
  //     .then(res => res.json())
  //     .then(res => {
  //       console.log(res)
  //       setAreaManager(res.areas);
  //       setMobManager(res.npcs);
  //       setItemManager(res.items);
  //     })
  //     .catch(err => err);
  // }

  const updateArea = (updatedArea) => {
    setActiveArea(updatedArea)
  }

  const updateRoom = (updatedRoom) => {
    const index = activeArea.rooms.map(room => room.id).indexOf(activeRoom.id);
    console.log(`Updated Room: ${activeRoom.id}`)
    const updatedArea = { ...activeArea };
    updatedArea.rooms[index] = updatedRoom;

    setActiveArea(updatedArea);
    setActiveRoom(fromJS(updatedRoom));
  }


  return (
    <RoomContext.Provider value={
      {
        areaManager,
        itemManager,
        mobManager,
        activeArea, changeActiveArea, updateArea,
        activeRoom, changeActiveRoom,
        activeItem, setActiveItem,
        activeMob, changeActiveMob,
        activeEntity, changeActiveItem,
        updateRoom, createRoom,
        saveArea, areaFloors,
        changeActiveFloor, activeFloor
      }
    }>
      {props.children}
    </RoomContext.Provider>
  );
}

export default RoomContextProvider;
