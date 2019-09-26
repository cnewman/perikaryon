import React, { useContext } from 'react';
import { RoomContext } from '../contexts/RoomContext';

const Room = () => {

  const { activeArea, changeActiveRoom } = useContext(RoomContext);

  const listRooms = () => {

    if (!activeArea || !activeArea.roomList) {
      return null;
    }
    return activeArea.roomList.map(room => (
      <p key={room.id} onClick={() => changeActiveRoom(room)}>{room.id} - {room.title}</p>
    ));
  }

  return (
    <div>
      <h2>Rooms Here</h2>
      {listRooms()}
    </div>
  );
}

export default Room;