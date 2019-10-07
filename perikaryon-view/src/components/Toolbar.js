import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '../contexts/RoomContext';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const Toolbar = () => {

    const { areaManager, changeActiveArea, activeArea, saveArea } = useContext(RoomContext);

    /*
    * Take area names from the listOfAreaNames state variable and generate option elements
    */
    const generateAreaDropdown = () => {
      let areaDropdownList = [];
      const areaList = areaManager.map(area => area.manifest.title);
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

    const currentArea = () => {
      return <h3>{activeArea ? `Current Area: ${activeArea.manifest.title}` : ''}</h3>
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


