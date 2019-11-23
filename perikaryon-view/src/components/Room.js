import React, { useContext } from 'react';
import { RoomContext } from '../contexts/RoomContext';

const Room = () => {

  const { activeArea, changeActiveRoom, activeRoom, createRoom } = useContext(RoomContext);

  const listRooms = () => {

    if (!activeArea || !activeArea.get("rooms")) {
      return null;
    }
    return (
      activeArea.get("rooms").map(room =>  {
      const styles = `entityList ${room.get("id") === activeRoom.id ? 'selected-edit': ''}`;
      return (
      <p className={styles} key={room.get("id")} onClick={() => changeActiveRoom(room)}>{room.get("id")} - {room.get("title")}</p>
    )}));
  }

  const newRoom = () => {
    if (!activeArea || !activeArea.rooms) {
      return null;
    }

    return (
      <p className='entityList' onClick={createRoom}>+ Add Room</p>
    )
  }

  const heading = () => {
    if (!activeArea || !activeArea.get("rooms")) {
      return <p>Select an area to see rooms</p>;
    }
    return <h2>Rooms</h2>
  }

  return (
    <div>
      {heading()}
      {newRoom()}
      {listRooms()}
    </div>
  );
}

export default Room;