import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '../contexts/RoomContext';

const Toolbar = () => {

  const { areaManager, changeActiveArea, activeArea } = useContext(RoomContext);

  /*
  * Take area names from the listOfAreaNames state variable and generate option elements
  */
  const generateAreaDropdown = () => {
    let areaDropdownList = [];
    const areaList = areaManager.map(area => area.name);
    for (let areaName of areaList) {
      areaDropdownList.push(<option key={areaName} value={areaName}>{areaName}</option>)
    }
    return (
      <select
        id="areaDropdown"
        className="custom-select"
        value={activeArea && activeArea.name || ""}
        onChange={(e) => changeActiveArea(e.target.value)}

      >
        <option value="" disabled hidden>Select Area</option>
        {areaDropdownList}
      </select>
    );
  }
  //  
  // onChange={(areaDropdownEvent) => this.HandleAreaDropdownChange(areaDropdownEvent)}

  return (
    <div className=''>
      {generateAreaDropdown()}

    </div>
  );
}

export default Toolbar;


