import React, { useContext } from 'react'
import { RoomContext } from '../contexts/RoomContext';

const EditEntity = () => {

  const { activeEntity } = useContext(RoomContext);

  return (
    <div>

      <h3>Edit here</h3>
      {console.log(activeEntity)}
      {/* {Object.keys(activeEntity)} */}
    </div>
  );
}

export default EditEntity;