import "./App.scss";


import axios from 'axios'
import { RIEInput } from 'riek'
import Draggable from 'react-draggable'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { useState } from 'react'
import AreaMap from "./components/AreaMap";
import Header from "./components/Header";
import Room from "./components/Room";
import Toolbar from "./components/Toolbar";
import EditEntity from "./components/editing/EditEntity";
import RoomContextProvider from "./contexts/RoomContext";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const App = () => {
  const [leftKey, setLeftKey] = useState('rooms');
  const [rightkey, setRightKey] = useState('edit');

  const getEntityList = () => {
    let entity = null;
    switch (leftKey) {
      case 'rooms':
          entity = <Room /> 
      break;
      case 'npcs':

      break;
      case 'items':

      break;
    }
    return entity;
  }

  const getWorkArea = () => {
    let workArea = null;
    switch (rightkey) {
      case 'map':
        workArea = <AreaMap />
      break;
      case 'edit':
        workArea = <EditEntity />
      break;
    }
    return workArea;
  }


  const isLActive = (entity) => {
    return entity === leftKey ? 'active' : '';
  }

  const isRActive = (option) => {
    return option === rightkey ? 'active' : '';
  }

  return (
    <div className="container-fluid">
      <RoomContextProvider>
      <div className="row" id="topdash">
        <div id="buttondiv" className="col-xl">
          <nav id="topNavBar" className="navbar navbar-expand-lg navbar-light bg-light">
            {/* <button id="descBtn" onClick={() => this.HandleClickEditWindowToggleButtons("descBtn")} type="button" className={"topdashbtn btn " + descBtnClass} >Description</button>
            <button id="itemBtn" onClick={() => this.HandleClickEditWindowToggleButtons("itemBtn")} type="button" className={"topdashbtn btn " + itemBtnClass}>Items</button>
            <button id="npcBtn" onClick={() => this.HandleClickEditWindowToggleButtons("npcBtn")} type="button" className={"topdashbtn btn " + npcBtnClass}>NPC</button> */}
            <Toolbar />
            <p id="title">
              {/* <RIEInput
                value={this.state.selectedArea}
                propName={this.state.selectedArea || "area"}
                change={this.HandleChangeAreaNameEvent}
              /> */}
            </p>
            <ul className="navbar-nav ml-auto">
              {/* {this.GenerateAreaDropdown()}
              {this.GenerateFloorDropdown()} */}
            </ul>
            {/* <button id="saveButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleSaveArea(clickEvent)}>Save Area</button> */}
          </nav>
        </div>
      </div>
      <div id="reactgrid" className="row">
        <div id="roomlist" className="col-sm-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={`nav-link ${isLActive('rooms')}`} onClick={() => setLeftKey('rooms')}>Rooms</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isLActive('npcs')}`} onClick={() => setLeftKey('npcs')}>Npcs</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isLActive('items')}`} onClick={() => setLeftKey('items')}>Items</a>
            </li>
          </ul>
          {getEntityList()}
   
        </div>
        <div className="col-xl">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={`nav-link ${isRActive('map')}`} onClick={() => setRightKey('map')}>AreaMap</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isRActive('edit')}`} onClick={() => setRightKey('edit')}>Edit</a>
            </li>
          </ul>
          {console.log("MAPMAPMA")}
          {getWorkArea()}
        </div>
      </div>
      
      <div className="d-flex flex-row align-items-end justify-content-between" id="dashboard">
        <div />
        <div id="roomButtons" className="tab-content">
          {/* <button id="deleteRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleDeleteRoomEvent(clickEvent)}>Delete Room</button>
          <button id="addRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleAddRoomEvent(clickEvent)}>Add Room</button> */}
        </div>
      </div>
      </RoomContextProvider>
    </div>
  );


}

export default App;


{/*  */}