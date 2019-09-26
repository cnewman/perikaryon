import React, { useContext } from 'react'
import { RoomContext } from '../../contexts/RoomContext';
import EditRoom from './EditRoom';

const EditEntity = () => {

  const { activeEntity } = useContext(RoomContext);


  const loadEditor = () => {
    switch (activeEntity) {
      case 'ROOM':
        return <EditRoom />;
      default:
        return null;
    }
  };

  return (
    <div>
      {loadEditor()}
    </div>
  );
}

export default EditEntity;