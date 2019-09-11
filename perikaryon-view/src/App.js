import React, { Component } from "react";
import "./App.scss";
import "../node_modules/react-grid-layout/css/styles.css"
import "../node_modules/react-resizable/css/styles.css"
import RGL, { WidthProvider } from "react-grid-layout";
import axios from 'axios';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import Draggable from 'react-draggable'
const shortid = require('shortid')

const { List, Set, Map } = require('immutable');
const ReactGridLayout = WidthProvider(RGL);
const gridWidth = 12;
const centerOfGrid = gridWidth / 2;
class Room {
  constructor(area, title, description, coordinates, id, bundle, doors = {}, exits = [], npcs = new Set()) {
    this.id = id;
    this.area = area;
    this.title = title;
    this.description = description;
    this.coordinates = coordinates;
    //this.modified = modified;
    this.doors = this.doors = new Map(Object.entries(JSON.parse(JSON.stringify(doors || {}))));
    this.exits = Set(exits);
    this.npcs = npcs;
    this.bundle = bundle;
  }
}
class App extends Component {
  static defaultProps = {
    verticalCompact: false,
    margin: [20, 20],
    preventCollision: true,
    isResizable: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      ranvierAPIResponse: "",
      selectedArea: "",
      selectedRoom: "",
      selectedFloor: 0,
      listOfAreas: List(),
      listOfFloorsInArea: List(),
      mapOfRoomsInArea: Map(),
      nodeHeight: 2,
    };
  }
  CreateElementContainer(area, title, coordinates) {
    const ranvierCoordinates = this.TranslateReactGridToRanvierCoordinates(coordinates)
    return (
      <div className={this.state.selectedRoom == title ? 'room Selected' : 'room'}
        id={title}
        coordinate_values={coordinates}
        key={area + title}
        onClick={this.HandleClickNode}
        data-grid={{ x: coordinates.x, y: coordinates.y, w: 1, h: this.state.nodeHeight }}
      >
        <RIEInput
          value={title}
          propName={title}
          change={this.HandleChangeRoomNameEvent}
        />
        <br /> ({ranvierCoordinates.x},{ranvierCoordinates.y},{ranvierCoordinates.z})
      </div>
    )
  }
  /*
   * Take ranvier coordinates and do one of two things: If y is negative, remove the negative and shove it upward
   * by the smallest negative number in the set of room coordinates (since react-grid won't show anything lower than)
   * (0,0). Additionally, flip the y coordinate on its axis so that north and south appear correctly on the map.
   * Same with x except just shove things over by the smallest negative x-coordinate.
   * If y is positive, do the same thing as before for x and z. For y, just multiply by node height so that nodes do
   * not overlap.
   */
  TranslateRanvierToReactGridCoordinates(coordinates, minX, minY) {
    if (minY < 0) {
      return ({
        x: (coordinates.x + Math.max(centerOfGrid, Math.abs(minX))),
        y: (((-coordinates.y) + Math.abs(minY)) * this.state.nodeHeight),
        z: coordinates.z
      })
    } else {
      return ({
        x: (coordinates.x + Math.max(centerOfGrid, Math.abs(minX))),
        y: (coordinates.y * this.state.nodeHeight),
        z: coordinates.z
      })
    }

  }
  /*
  * Translate back to ranvier coordinates by subtracting grid center from x (to move it back to origin)
  * and dividing y by nodeheight to shrink it back to size == 1. This does not re-generate the original
  * coordinates, but it generates an equivalent coordinate system that won't change area layout.
  */
  TranslateReactGridToRanvierCoordinates(coordinates) {
    return ({
      x: coordinates.x - centerOfGrid,
      y: coordinates.y / this.state.nodeHeight,
      z: coordinates.z,
    })
  }
  /*
   *Whenever the layout changes, update the mapOfRoomsInArea map coordinates
   */
  LayoutChange = (roomLayoutList) => {
    roomLayoutList.forEach((roomLayout) => {
      this.setState((prevState) => ({
        mapOfRoomsInArea: prevState.mapOfRoomsInArea.set(roomLayout.i,
          new Room(this.state.mapOfRoomsInArea.get(roomLayout.i).area,
            this.state.mapOfRoomsInArea.get(roomLayout.i).title,
            this.state.mapOfRoomsInArea.get(roomLayout.i).description,
            {
              x: roomLayout.x,
              y: roomLayout.y,
              z: prevState.mapOfRoomsInArea.get(roomLayout.i).coordinates.z
            },
            this.state.mapOfRoomsInArea.get(roomLayout.i).id,
            this.state.mapOfRoomsInArea.get(roomLayout.i).bundle,
            this.state.mapOfRoomsInArea.get(roomLayout.i).doors,
            this.state.mapOfRoomsInArea.get(roomLayout.i).exits,
            this.state.mapOfRoomsInArea.get(roomLayout.i).npcs))
      }));
    });
  }

  /*
   *When we first mount the component, grab data from Ranvier.
   */
  InitializeRoomMap() {
    let areaMap = Map()
    let minX = 0
    let minY = 0
    for (let [, area] of Object.entries(this.state.ranvierAPIResponse)) {
      for (let [, room] of Object.entries(area.roomList)) {
        if (room.coordinates) {
          minX = Math.min(minX, room.coordinates.x)
          minY = Math.min(minY, room.coordinates.y)
        }
      }
    }
    for (let [, area] of Object.entries(this.state.ranvierAPIResponse)) {
      for (let [, room] of Object.entries(area.roomList)) {
        if (room.coordinates) {
          const coordinates = this.TranslateRanvierToReactGridCoordinates(room.coordinates, minX, minY)
          areaMap = areaMap.set(area.name + room.title,
            new Room(area.name, room.title, room.description, coordinates, room.id, area.bundle, room.doors, room.exits, room.npcs))
        }
      }
    }
    this.setState({
      mapOfRoomsInArea: areaMap,
    })
  }
  HandleAddRoomEvent = (e) => {
    const roomtitle = "ChangeMe" + shortid.generate();
    this.UpdateRoomMap(new Room(this.state.selectedArea, roomtitle, "Hello! I'm a new room", { x: 10, y: 10, z: this.state.selectedFloor }, roomtitle))
    this.setState({
      selectedRoom: roomtitle,
      description: "Hello! I'm a new room"
    })
  }
  HandleDeleteRoomEvent = (e) => {
    if (this.state.mapOfRoomsInArea) {
      this.setState((prevState) => ({
        mapOfRoomsInArea: prevState.mapOfRoomsInArea.delete(this.state.selectedArea + this.state.selectedRoom),
        selectedRoom: ""
      }))
    }
  }
  HandleChangeRoomNameEvent = (newName) => {
    const key = Object.keys(newName);
    let room = JSON.parse(JSON.stringify(this.state.mapOfRoomsInArea.get(this.state.selectedArea + key)))
    room.title = newName[key];

    const newID = newName[key].toLowerCase().split(' ').join('-')
    room.id = newID

    this.setState((prevState) => ({
      mapOfRoomsInArea: prevState.mapOfRoomsInArea.delete(this.state.selectedArea + key)
    }))

    this.setState((prevState) => ({
      mapOfRoomsInArea: prevState.mapOfRoomsInArea.set(room.area + room.title, room)
    }))
  }
  UpdateRoomMap(room) {
    this.setState((prevState) => ({
      mapOfRoomsInArea: prevState.mapOfRoomsInArea.set(this.state.selectedArea + room.title, room)
    }))
  }
  /*
   * Take Area data from Ranvier API response and make the graph using react-grid-layout API
   * This function maps over the API response object from Ranvier and checks to figure out which rooms
   * are part of the currently selected (via dropdown) area and then create a graph node for each.
   */
  GenerateAreaGraph() {
    let visibleRoomList = List()
    for (let [, room] of this.state.mapOfRoomsInArea) {
      if (room.area == this.state.selectedArea) {
        if (room.coordinates != null) {
          if (this.state.selectedFloor == room.coordinates.z) {
            visibleRoomList = visibleRoomList.push(this.CreateElementContainer(this.state.selectedArea, room.title, room.coordinates))
          }
        } else {
          console.log("Coordinates is null. Areabuilder currently requires coordinates to work.");
        }
      }
    }
    return (visibleRoomList)
  }
  /*
  * When a new area is selected in the dropdown, change the value so React can re-render.
  */
  HandleAreaDropdownChange = (e) => {
    this.setState({
      selectedArea: e.target.value,
    }, this.GenerateFloorDropdown);
  }
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an area from the dropdown and the area's rooms will be displayed.
  * This function maps over the API response object from Ranvier and just pulls each area name.
  */
  GenerateAreaDropdown() {
    Object.keys(this.state.ranvierAPIResponse)
      .forEach((key) => {
        this.setState((prevState) => ({
          listOfAreas: prevState.listOfAreas.push(<option key={this.state.ranvierAPIResponse[key].name} value={this.state.ranvierAPIResponse[key].name}>{this.state.ranvierAPIResponse[key].name}</option>),
        }))
      })
  }
  /*
  * When a new floor is selected in the dropdown, change the value so React can re-render.
  */
  HandleFloorDropdownChange = (e) => {
    this.setState({
      selectedFloor: e.target.value
    });
  }
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an floor from the dropdown and the area's rooms that are on that floor will
  * be displayed. This function maps over the API response object from Ranvier and just pulls 
  * unique floor numbers to populate the dropdown.
  */
  GenerateFloorDropdown() {
    let uniquelistOfFloorsInArea = Set()
    for (let apikey of Object.keys(this.state.ranvierAPIResponse)) {
      if (this.state.ranvierAPIResponse[apikey].name == this.state.selectedArea) {
        for (let room of this.state.ranvierAPIResponse[apikey].roomList) {
          if (room.coordinates != null) {
            uniquelistOfFloorsInArea = uniquelistOfFloorsInArea.add(room.coordinates.z)
          } else {
            console.log("Coordinates property is null. Areabuilder currently requires coordinates to work.");
          }
        }
      }
    }
    let uniqueFloorDropdownElements = List()
    for (let floor of uniquelistOfFloorsInArea) {
      uniqueFloorDropdownElements = uniqueFloorDropdownElements.push(<option key={floor} value={floor}>{floor}</option>)
    }
    this.setState({
      listOfFloorsInArea: uniqueFloorDropdownElements
    });

  }

  /*
  * Once changes have been made, determine exit directions and upload the new area back to Ranvier for saving.
  */
  HandleSaveArea = (e) => {
    for (let [, room] of this.state.mapOfRoomsInArea) {
      room.coordinates = this.TranslateReactGridToRanvierCoordinates(room.coordinates)
    }
    axios.put("http://localhost:3004/savearea", this.state.mapOfRoomsInArea).then(res => console.log(res.data));
  }

  /*
  * Once the component mounts, call Ranvier's API (only locally, currently) so that we can
  * populate area grid and dropdown.
  */
  callAPI() {
    fetch("http://localhost:3004/areas")
      .then(res => res.json())
      .then(res => {
        this.setState({ ranvierAPIResponse: res }, this.InitializeRoomMap);
        this.GenerateAreaDropdown();
      })
      .catch(err => err);

  }
  componentDidMount() {
    this.callAPI();
  }

  /*
  * These functions allow for room descriptions to be displayed in the editor as well as modified.
  * The HandleClicknode function receives a click and updates the selectedRoom id. GenerateTextBlock
  * is then used to open a text box with the room's description. Finally, changes made in the textarea
  * are reflected in the room's description via the HandleChangeDescriptionEvent function.
  */
  HandleChangeDescriptionEvent = (e) => {
    this.state.mapOfRoomsInArea.get(this.state.selectedArea + this.state.selectedRoom).description = e.target.value;
    this.setState({
      description: e.target.value
    })
  }
  HandleClickNode = (e) => {
    if (e.target.id) {
      this.setState({
        selectedRoom: e.target.id,
        description: this.state.mapOfRoomsInArea.get(this.state.selectedArea + e.target.id).description
      })
    } else {
      this.setState({
        selectedRoom: ""
      })
    }

  }
  GenerateTextBlock() {
    if (this.state.selectedRoom !== "") {
      return (
        <div id="descriptionDiv">
          <textarea id="roomDescription" type="text" readOnly={false} onChange={this.HandleChangeDescriptionEvent} value={this.state.description || ''} />
        </div>
      )
    }
    return <div></div>;
  }

  /*
  * Render the dropdown and area graph. The area graph uses react-grid-layout's API.
  */
  render() {
    return (
      <div className="container-fluid">
        <div className="row" id="topdash">
          <div id="buttondiv" className="col-xl">
            <nav id="topNavBar" className="navbar navbar-expand-lg navbar-light bg-light">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a href="#itemDiv" className="nav-link active" data-toggle="tab">Items</a>
                </li>
                <li className="nav-item">
                  <a href="#npcDiv" className="nav-link" data-toggle="tab">NPCs</a>
                </li>
              </ul>
              <p id="title">{this.state.selectedArea}</p>
              <ul className="navbar-nav ml-auto">
                <select id={"areaDropdown"} className="custom-select" onChange={(areaDropdownEvent) => this.HandleAreaDropdownChange(areaDropdownEvent)}>
                  <option>Select Area</option>
                  {this.state.listOfAreas}
                </select>
                <select id={"floorDropdown"} className="custom-select" onChange={(floorDropdownEvent) => this.HandleFloorDropdownChange(floorDropdownEvent)}>
                  {this.state.listOfFloorsInArea}
                </select>
              </ul>
              <button id="saveButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleSaveArea(clickEvent)}>Save Area</button>
            </nav>
          </div>
        </div>
        <div id="reactgrid" className="row">
          <div className="col-xl" onClick={this.HandleClickNode}>
            <ReactGridLayout layout={this.state.layout} onLayoutChange={this.LayoutChange} id="areaGrid" className="layout" cols={gridWidth} rowHeight={30} width={1200} {...this.props}>
              {this.GenerateAreaGraph()}
            </ReactGridLayout>
          </div>
        </div>
        <Draggable cancel="textarea">
          {this.GenerateTextBlock()}
        </Draggable>
        <div className="d-flex flex-row align-items-end justify-content-between" id="dashboard">
          <div />
          <div id="roomButtons" className="tab-content">
            <button id="deleteRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleDeleteRoomEvent(clickEvent)}>Delete Room</button>
            <button id="addRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleAddRoomEvent(clickEvent)}>Add Room</button>
            {/* <div id="itemDiv" className="tab-pane fade show active"></div>
              <div id="descriptionDiv" className="tab-pane fade">
                <textarea id="roomDescription" type="text" readOnly={false} onChange={this.HandleChangeDescriptionEvent} value={this.state.description || ''} />
              </div>
              <div id="npcDiv" className="tab-pane fade"></div> */}
          </div>
        </div>
      </div>
    );
  }
}
export default App;