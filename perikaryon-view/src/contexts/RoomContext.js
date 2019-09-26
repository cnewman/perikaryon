import React, { createContext, useState, useEffect } from 'react';

export const RoomContext = createContext();

const RoomContextProvider = (props) => {

  const [areaManager, setAreaManager] = useState([]);
  const [mobManager, setMobManager] = useState([]);
  const [itemManager, setItemManager] = useState([]);

  const [activeArea, setActiveArea] = useState(null);
  const [activeRoom, setActiveRoom] = useState([]);
  const [activeItem, setActiveItem] = useState([]);
  const [activeMob, setActiveMob] = useState([]);
  const [activeEntity, setActiveEntity] = useState([]);



  useEffect(() => {
    getAreas();
  }, [])

  const changeActiveArea = (newAreaName) => {
    const foundArea = areaManager.find((area) => area.name === newAreaName);
    setActiveArea(foundArea);
    // setActiveRooms
    console.log(newAreaName, foundArea)
  };

  const changeActiveRoom = (newRoom) => {
    // const foundRoom = activeArea.roomList.find((room) => room.id === newRoomId);
    setActiveRoom(newRoom);
    setActiveEntity(newRoom);

  }

  const changeActiveMob = (newMobName) => {


  }

  const changeActiveItem = (newItemName) => {


  }

  const getAreas = () => {
    fetch("http://localhost:3004/areas")
      .then(res => res.json())
      .then(res => {
        console.log(res)
        setAreaManager(res.areas);
        setMobManager(res.npcs);
        setItemManager(res.items);
      })
      .catch(err => err);
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
      }
    }>
      {props.children}
    </RoomContext.Provider>
  );
}

export default RoomContextProvider;
