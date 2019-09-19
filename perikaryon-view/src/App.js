import "./App.scss";


import axios from 'axios'
import {RIEInput} from 'riek'
import Draggable from 'react-draggable'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { Component } from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'


const shortid = require('shortid')
const ReactGridLayout = WidthProvider(RGL)
const { List, Set, Map } = require('immutable')

const gridWidth = 12;
const centerOfGrid = gridWidth / 2;

class Room {
  constructor(area, title, description, coordinates, id, bundle, doors = {}, exits = [], npcs = new Set(), items = []) {
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
    this.items = items;
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
      mapOfNpcs: Map(),
      mapOfItems: Map(),
      nodeHeight: 2,
      showDesc: false,
      showNpcs: false,
      showItems: false,
    };
  }
  //#region [rgba(155,89,182,0.1)] Handlers
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
  /*
   * When a new area is selected in the dropdown, change the value so React can re-render.
   */
  HandleAreaDropdownChange = (e) => {
    this.setState({
      selectedArea: e.target.value,
    }, this.GenerateFloorDropdown);
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
   * When a new floor is selected in the dropdown, change the value so React can re-render.
   */
  HandleFloorDropdownChange = (e) => {
    this.setState({
      selectedFloor: e.target.value
    });
  }
  HandleBtnToggleClick = (buttonId) => {
    if (buttonId === 'descBtn') {
      this.state.showDesc === true ? this.setState({ showDesc: false }) : this.setState({ showDesc: true })
    } else if (buttonId === 'itemBtn') {
      this.state.showItems === true ? this.setState({ showItems: false }) : this.setState({ showItems: true })
    } else if (buttonId === 'npcBtn') {
      this.state.showNpcs === true ? this.setState({ showNpcs: false }) : this.setState({ showNpcs: true })
    }
  }
  /*
   * These functions allow for room descriptions to be displayed in the editor as well as modified.
   * The HandleClicknode function receives a click and updates the selectedRoom id. GenerateDescriptionBox
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
  HandleJsonChange = (e) => {

  }
  //#endregion
  //#region [rgba(250,150,30,0.1)] Helper Functions
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
            this.state.mapOfRoomsInArea.get(roomLayout.i).npcs,
            this.state.mapOfRoomsInArea.get(roomLayout.i).items))
      }));
    });
  }
  /*
   * Handles the addition of new rooms by updating the current room map state with an additional room.
   * This function should possibly be combined with handleaddroom. It only exists because of some prior
   * behavior that has been removed.
   */
  UpdateRoomMap(room) {
    this.setState((prevState) => ({
      mapOfRoomsInArea: prevState.mapOfRoomsInArea.set(this.state.selectedArea + room.title, room)
    }))
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
  //#endregion 
  /*
   *When we first mount the component, grab data from Ranvier.
   */
  InitializeRoomMap() {
    let areaMap = Map()
    let npcMap = Map()
    let itemMap = Map()
    let minX = 0
    let minY = 0
    
    for(let npc of this.state.ranvierAPIResponse['npcs']){
      let npcResponseMap = new Map(Object.entries(npc))
      npcMap = npcMap.set(npcResponseMap.get('area').name+':'+npcResponseMap.get('id'), npc)
    }
    for(let item of this.state.ranvierAPIResponse['items']){
      let itemResponseMap = new Map(Object.entries(item))
      itemMap = itemMap.set(itemResponseMap.get('area').name+':'+itemResponseMap.get('id'), item)
    }
    for (let area of this.state.ranvierAPIResponse['areas']) {
      let APIResponseMap = new Map(Object.entries(area))
      for (let room of APIResponseMap.get('roomList')) {
        if (room.coordinates) {
          minX = Math.min(minX, room.coordinates.x)
          minY = Math.min(minY, room.coordinates.y)
        }
      }
    }
    for (let area of this.state.ranvierAPIResponse['areas']) {
      let APIResponseMap = new Map(Object.entries(area))
      for (let room of APIResponseMap.get('roomList')) {
        if (room.coordinates) {
          const coordinates = this.TranslateRanvierToReactGridCoordinates(room.coordinates, minX, minY)
          areaMap = areaMap.set(area.name + room.title,
            new Room(area.name, room.title, room.description, coordinates, room.id, area.bundle, room.doors, room.exits, room.defaultNpcs, room.defaultItems))
        }
      }
    }
    this.setState({
      mapOfRoomsInArea: areaMap,
      mapOfNpcs: npcMap,
      mapOfItems: itemMap
    })
  }
  /*
   * Generate the HTML to create a new node on the area graph.
   */
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
    return (
      <ReactGridLayout layout={this.state.layout} onLayoutChange={this.LayoutChange} id="areaGrid" className="layout" cols={gridWidth} rowHeight={30} width={1200} {...this.props}>
        {visibleRoomList}
      </ReactGridLayout>
    )
  }

  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an area from the dropdown and the area's rooms will be displayed.
  * This function maps over the API response object from Ranvier and just pulls each area name.
  */
  GenerateAreaDropdown() {
    for (let area of this.state.ranvierAPIResponse['areas']) {
      this.setState((prevState) => ({
        listOfAreas: prevState.listOfAreas.push(<option key={area.name} value={area.name}>{area.name}</option>),
      }))
    }
  }
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an floor from the dropdown and the area's rooms that are on that floor will
  * be displayed. This function maps over the API response object from Ranvier and just pulls 
  * unique floor numbers to populate the dropdown.
  */
  GenerateFloorDropdown() {
    let uniquelistOfFloorsInArea = Set()
    for (let area of this.state.ranvierAPIResponse['areas']) {
      if (area.name == this.state.selectedArea) {
        for (let room of area.roomList) {
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
  //Generates a room description box whenever there is a room selected and the option to show descriptions is active.
  GenerateDescriptionBox() {
    if (this.state.selectedRoom !== "" && this.state.showDesc) {
      return (
        <Draggable cancel="textarea">
          <div id="descriptionDiv">
            <textarea id="roomDescription" type="text" readOnly={false} onChange={this.HandleChangeDescriptionEvent} value={this.state.description || ''} />
          </div>
        </Draggable>
      )
    }
    return <div></div>;
  }
  //Generates an NPC box whenever there is a room selected and the option to show npcs is active.
  GenerateNPCBox() {
    if (this.state.selectedRoom !== "" && this.state.showNpcs) {
      let npcList = []
      let room = this.state.mapOfRoomsInArea.get(this.state.selectedArea + this.state.selectedRoom)
      for (let npcIdentifier of room.npcs) {
        let npcData = this.state.mapOfNpcs.get(npcIdentifier)
        if (npcData) {
          npcList.push(
            <div className="card">
              <div className="card-header" id={npcData.uuid}>
                <button className="btn btn-link" type="button" data-toggle="collapse" data-target={"#" + npcData.id} aria-expanded="true" aria-controls={npcData.id}>
                  {npcData.id}
                </button>
              </div>
              <div id={npcData.id} className="collapse show" aria-labelledby={npcData.uuid} data-parent="#npcAccordion">
                <Editor
                  value={npcData}
                  onChange={this.HandleJsonChange}
                />
              </div>
            </div>
          )
        }
      }
      return (
        <Draggable>
          <div id="npcDiv">
            <div className="accordion" id="npcAccordion">
              {npcList}
            </div>
          </div>
        </Draggable>
      )
    }
    return <div></div>;
  }
  /*
  * Render the dropdown and area graph. The area graph uses react-grid-layout's API.
  */
  render() {
    let descBtnClass = this.state.showDesc === true ? "active" : "btn-secondary";
    let itemBtnClass = this.state.showItems === true ? "active" : "btn-secondary";
    let npcBtnClass = this.state.showNpcs === true ? "active" : "btn-secondary";

    return (
      <div className="container-fluid">
        <div className="row" id="topdash">
          <div id="buttondiv" className="col-xl">
            <nav id="topNavBar" className="navbar navbar-expand-lg navbar-light bg-light">
              <button id="descBtn" onClick={() => this.HandleBtnToggleClick("descBtn")} type="button" className={"topdashbtn btn " + descBtnClass} >Description</button>
              <button id="itemBtn" onClick={() => this.HandleBtnToggleClick("itemBtn")} type="button" className={"topdashbtn btn " + itemBtnClass}>Items</button>
              <button id="npcBtn" onClick={() => this.HandleBtnToggleClick("npcBtn")} type="button" className={"topdashbtn btn " + npcBtnClass}>NPC</button>
              <p id="title">{this.state.selectedArea}</p>
              <ul className="navbar-nav ml-auto">
                <select id="areaDropdown" className="custom-select" onChange={(areaDropdownEvent) => this.HandleAreaDropdownChange(areaDropdownEvent)}>
                  <option>Select Area</option>
                  {this.state.listOfAreas}
                </select>
                <select id="floorDropdown" className="custom-select" onChange={(floorDropdownEvent) => this.HandleFloorDropdownChange(floorDropdownEvent)}>
                  {this.state.listOfFloorsInArea}
                </select>
              </ul>
              <button id="saveButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleSaveArea(clickEvent)}>Save Area</button>
            </nav>
          </div>
        </div>
        <div id="reactgrid" className="row">
          <div className="col-xl">
              {this.GenerateAreaGraph()}
          </div>
        </div>
        {this.GenerateDescriptionBox()}
        {this.GenerateNPCBox()}
        <div className="d-flex flex-row align-items-end justify-content-between" id="dashboard">
          <div />
          <div id="roomButtons" className="tab-content">
            <button id="deleteRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleDeleteRoomEvent(clickEvent)}>Delete Room</button>
            <button id="addRoomButton" className="btn btn-light dashbutton" onClick={(clickEvent) => this.HandleAddRoomEvent(clickEvent)}>Add Room</button>
          </div>
        </div>
      </div>
    );
  }
}
export default App;