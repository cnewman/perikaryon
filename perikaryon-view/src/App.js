import "./App.scss";


import axios from 'axios'
import { RIEInput } from 'riek'
import Draggable from 'react-draggable'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { useState } from 'react'
import AreaGrid from "./components/AreaGrid";
import Header from "./components/Header";
import Room from "./components/Room";
import Toolbar from "./components/Toolbar";
import EditEntity from "./components/EditEntity";
import RoomContextProvider from "./contexts/RoomContext";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const App = () => {
  const [leftKey, setLeftKey] = useState('rooms');
  const [rightkey, setRightKey] = useState('edit');
  return (
    <div>
      <Header />
      <RoomContextProvider>
        <Toolbar />
        <Row>
          <Col>
            <Tabs id="" activeKey={leftKey} onSelect={k => setLeftKey(k)}>
              <Tab eventKey="rooms" title="Rooms">
                <Room />
              </Tab>
              <Tab eventKey="npcs" title="Npcs" disabled>
              </Tab>
              <Tab eventKey="items" title="Items" disabled>
              </Tab>
            </Tabs>
          </Col>
          <Col>
            <Tabs id="" activeKey={rightkey} onSelect={k => setRightKey(k)}>
              <Tab eventKey="edit" title="Edit">
                <EditEntity/>
              </Tab>
              <Tab eventKey="map" title="Map">
                <AreaGrid />
              </Tab>
              <Tab eventKey="tbd" title="TBD" disabled>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </RoomContextProvider>
    </div>
  );
}

export default App;
