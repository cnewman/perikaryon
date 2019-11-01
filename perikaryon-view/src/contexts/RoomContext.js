import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import uuid from 'uuid/v1';

export const RoomContext = createContext();

const RoomContextProvider = (props) => {

  const [areaManager, setAreaManager] = useState([]);
  const [mobManager, setMobManager] = useState([]);
  const [itemManager, setItemManager] = useState([]);
  const [activeFloor, setActiveFloor] = useState(0);
  const [areaFloors, setAreaFloors] = useState([]);
  const [activeArea, setActiveArea] = useState(null);
  const [activeRoom, setActiveRoom] = useState({});
  const [activeItem, setActiveItem] = useState({});
  const [activeMob, setActiveMob] = useState({});
  const [activeEntity, setActiveEntity] = useState(null);

  useEffect(() => {
    getAreas();
  }, [])

  const changeActiveFloor = (newFloor) => {
    setActiveFloor(newFloor);
  }
  const changeActiveArea = (newAreaName) => {
    const foundArea = areaManager.find((area) => area.manifest.title === newAreaName);
    const setOfFloorsInArea = new Set()
    if(foundArea.rooms){
      for (let room of foundArea.rooms) {
        if(room.coordinates){
          setOfFloorsInArea.add(room.coordinates[2])
        }
      }
    }
    setAreaFloors(Array.from(setOfFloorsInArea));
    setActiveArea(foundArea);
    setActiveRoom({});
    setActiveItem({});
    setActiveMob({});
    setActiveEntity(null);
    // setActiveRooms
    console.log(newAreaName, foundArea)
  };

  const changeActiveRoom = (newRoom) => {
    // const foundRoom = activeArea.rooms.find((room) => room.id === newRoomId);
    setActiveRoom(newRoom);
    setActiveEntity('ROOM');
    console.log(activeRoom.title, activeEntity)
  }

  const changeActiveMob = (newMobName) => {


  }

  const changeActiveItem = (newItemName) => {


  }

  const createRoom = () => {
    const room = {
      id: `${uuid().substring(0,7)}`,
      title: `New Room in ${activeArea.manifest.title}`,
      description: 'You see....',
      exits: [],
    }
    
    setActiveEntity('ROOM');
    activeArea.rooms.push(room);
    setActiveArea(activeArea);
    setActiveRoom(room);
  }

  const saveArea = () => {
    console.log('do saveArea')
    // axios.put("http://localhost:3004/savearea", this.state.mapOfRoomsInArea).then(res => console.log(res.data));

    axios.put(`http://localhost:3004/areas`, activeArea)
      .then(res => {
        console.log(res);
        console.log(res.data);
      })
      .catch(err => err);

  }


  const getAreas = () => {
    fetch('http://localhost:3004/areasFiles')
      .then(res => res.json())
      .then(res => {
        console.log(res)
        setAreaManager(res);
      })
      .catch(err => console.log(err));
  };

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
    const index = areaManager.areas.map(area => area.id).indexOf(activeArea.id);
    console.log(`Updated Area: ${activeArea.id}`)

  }

  const updateRoom = (updatedRoom) => {
    const index = activeArea.rooms.map(room => room.id).indexOf(activeRoom.id);
    console.log(`Updated Room: ${activeRoom.id}`)
    const updatedArea = { ...activeArea };
    updatedArea.rooms[index] = updatedRoom;

    setActiveArea(updatedArea);
    setActiveRoom(updatedRoom);
  }


  return (
    <RoomContext.Provider value={
      {
        areaManager,
        itemManager,
        mobManager,
        activeArea, changeActiveArea,
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
