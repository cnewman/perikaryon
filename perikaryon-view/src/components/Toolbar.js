import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '../contexts/RoomContext';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const Toolbar = () => {

  const { areaManager, changeActiveArea, changeActiveFloor, activeArea, saveArea, areaFloors, activeFloor } = useContext(RoomContext);
  /*
  *Take floor numbers from the listOfFloorsInArea state variable and generate option elements
  */
  const generateFloorDropdown = () => {
    let floorDropdownList = []
    for (let floor of areaFloors) {
      floorDropdownList.push(<option key={floor} value={floor}>{floor}</option>)
    }
    return (
      <select 
      id="floorDropdown"
      className="custom-select"
      value={activeFloor}
      onChange={(e) => changeActiveFloor(e.target.value)}>
        {floorDropdownList}
      </select>
    )

  }
  /*
  * Take area names from the listOfAreaNames state variable and generate option elements
  */
  const generateAreaDropdown = () => {
    let areaDropdownList = [];
    for (let area of areaManager) {
       areaDropdownList.push(<option key={area.get("manifest").get("title")} value={area.get("manifest").get("title")}>{area.get("manifest").get("title")}</option>)
    }
    return (
      <select
        id="areaDropdown"
        className="custom-select"
        value={(activeArea) ? activeArea.name : ""}
        onChange={(e) => changeActiveArea(e.target.value)}
      >
        <option value="" disabled hidden>Select Area</option>
        {areaDropdownList}
      </select>
    );
  }

  const currentArea = () => {
    if (activeArea.size > 0) {
      return <h3>{activeArea ? `Current Area: ${activeArea.get("manifest").get("title")}` : ''}</h3>
    }
  }

  const saveAreaButton = () => {
    if (activeArea) {
      return (
        <Button onClick={saveArea}>Save Area</Button>
      )
    }
    return null;
  }

  return (
    <div className="container py-2">
      <Row>
        <Col>
          {generateAreaDropdown()}
          {generateFloorDropdown()}
        </Col>
        {currentArea()}
        <Col>
        </Col>
        {saveAreaButton()}
        <Col>
        </Col>
      </Row>
    </div>
  );
}

export default Toolbar;


