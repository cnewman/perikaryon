import React, { Component } from "react";
import "./App.css";
import "../node_modules/react-grid-layout/css/styles.css"
import "../node_modules/react-resizable/css/styles.css"
import RGL, { WidthProvider } from "react-grid-layout";
import axios from 'axios';

const { List, Set, Map } = require('immutable');
const ReactGridLayout = WidthProvider(RGL);
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
    verticalCompact: false
  };
  constructor(props) {
    super(props);
    this.state = {
      ranvierAPIResponse: "",
      selectedArea: "",
      areaList: List(),
      floorList: List(),
      selectedFloor: 0,
      addRoomField: "",
      roomData: Map(),
      selectedRoom:""
    };
  }
  CreateElementContainer(area, title, coordinates) {
    let smallestYCoordinate = 0
    let smallestXCoordinate = 0
    for (let [, room] of this.state.roomData) {
      if (room.area == this.state.selectedArea) {
        if (room.coordinates != null) {
          smallestXCoordinate = Math.min(room.coordinates.x, smallestXCoordinate)
          smallestYCoordinate = Math.min(room.coordinates.y, smallestYCoordinate)
        }
      }
    }
    return (
      <div style={{ background: "#000FFF" }}
        id={title}
        coordinate_values={coordinates}
        key={area + title}
        onClick= {this.HandleClickNode}
        data-grid={{ x: (coordinates.x + Math.abs(smallestXCoordinate)), y: (coordinates.y + Math.abs(smallestYCoordinate)), w: 1, h: 1 }}
      >
        {title}({(coordinates.x)},{(coordinates.y)},{coordinates.z})
      </div>
    )
  }
  /*
   *Whenever the layout changes, update the roomData map coordinates
   */
  LayoutChange = (roomLayoutList) => {
    roomLayoutList.forEach((roomLayout) => {
      this.setState((prevState) => ({
        roomData: prevState.roomData.set(roomLayout.i,
          new Room(this.state.roomData.get(roomLayout.i).area,
            this.state.roomData.get(roomLayout.i).title,
            this.state.roomData.get(roomLayout.i).description,
            { x: roomLayout.x, y: roomLayout.y, z: prevState.roomData.get(roomLayout.i).coordinates.z },
            this.state.roomData.get(roomLayout.i).id,
            this.state.roomData.get(roomLayout.i).bundle,
            this.state.roomData.get(roomLayout.i).doors,
            this.state.roomData.get(roomLayout.i).exits,
            this.state.roomData.get(roomLayout.i).npcs))
      }));
    });
  }

  /*
   *When we first mount the component, grab data from Ranvier.
   */
  InitializeRoomMap() {
    let areaMap = Map()
    for (let [, area] of Object.entries(this.state.ranvierAPIResponse)) {
      for (let [, room] of Object.entries(area.roomList)) {
        if (room.coordinates) {
          areaMap = areaMap.set(area.name + room.title,
            new Room(area.name, room.title, room.description, room.coordinates, room.id, area.bundle, room.doors, room.exits, room.npcs))
        }
      }
    }
    this.setState({
      roomData: areaMap
    })
  }
  HandleAddRoomEvent = (e) => {
    if (this.state.addRoomField) {
      this.AddRoom(this.state.addRoomField)
    }
  }
  HandleDeleteRoomEvent = (e) => {
    if(this.state.roomData){
      this.setState((prevState) => ({
        roomData: prevState.roomData.delete(this.state.selectedArea+this.state.selectedRoom)
      }))
    }
  }
  HandleChangeFieldEvent = (e) => {
    this.setState({
      addRoomField: e.target.value
    })
  }
  UpdateRoomMap(room) {
    this.setState((prevState) => ({
      roomData: prevState.roomData.set(this.state.selectedArea + room.title, room)
    }), this.GenerateAreaGraph)
  }
  AddRoom(title) {
    if (title) {
      this.UpdateRoomMap(new Room(this.state.selectedArea, title, "", { x: 0, y: 0, z: this.state.selectedFloor }, title))
    }
  }
  /*
   * Take Area data from Ranvier API response and make the graph using react-grid-layout API
   * This function maps over the API response object from Ranvier and checks to figure out which rooms
   * are part of the currently selected (via dropdown) area and then create a graph node for each.
   */
  GenerateAreaGraph() {
    let visibleRoomList = List()
    for (let [, room] of this.state.roomData) {
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
          areaList: prevState.areaList.push(<option key={this.state.ranvierAPIResponse[key].name} value={this.state.ranvierAPIResponse[key].name}>{this.state.ranvierAPIResponse[key].name}</option>),
        }), this.GenerateAreaGraph)
      })
  }
  /*
  * When a new floor is selected in the dropdown, change the value so React can re-render.
  */
  HandleFloorDropdownChange = (e) => {
    this.setState({
      selectedFloor: e.target.value
    }, this.GenerateAreaGraph);
  }
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an floor from the dropdown and the area's rooms that are on that floor will
  * be displayed. This function maps over the API response object from Ranvier and just pulls 
  * unique floor numbers to populate the dropdown.
  */
  GenerateFloorDropdown() {
    let uniqueFloorList = Set()
    for (let apikey of Object.keys(this.state.ranvierAPIResponse)) {
      if (this.state.ranvierAPIResponse[apikey].name == this.state.selectedArea) {
        for (let room of this.state.ranvierAPIResponse[apikey].roomList) {
          if (room.coordinates != null) {
            uniqueFloorList = uniqueFloorList.add(room.coordinates.z)
          } else {
            console.log("Coordinates property is null. Areabuilder currently requires coordinates to work.");
          }
        }
      }
    }
    let uniqueFloorDropdownElements = List()
    for (let floor of uniqueFloorList) {
      uniqueFloorDropdownElements = uniqueFloorDropdownElements.push(<option key={floor} value={floor}>{floor}</option>)
    }
    this.setState({
      floorList: uniqueFloorDropdownElements
    }, this.GenerateAreaGraph);

  }

  /*
  * Once changes have been made, determine exit directions and upload the new area back to Ranvier for saving.
  */
  HandleSaveArea = (e) => {
    axios.put("http://localhost:3004/savearea", this.state.roomData).then(res => console.log(res.data));
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
  * The HandleClicKnode function receives a click and updates the selectedRoom id. GenerateTextBlock
  * is then used to open a text box with the room's description. Finally, changes made in the textarea
  * are reflected in the room's description via the HandleChangeDescriptionEvent function.
  */
  HandleChangeDescriptionEvent = (e) => {
    this.state.roomData.get(this.state.selectedArea+this.state.selectedRoom).description = e.target.value;
    this.setState({
      description: e.target.value
    })
  }
  HandleClickNode = (e) => {
    this.setState({
      selectedRoom: e.target.id
    }, this.GenerateTextBlock)
  }
  GenerateTextBlock(){
    if(this.state.selectedRoom){
      this.setState({
        description: this.state.roomData.get(this.state.selectedArea+this.state.selectedRoom).description
      })
    }
  }

  /*
  * Render the dropdown and area graph. The area graph uses react-grid-layout's API.
  */
  render() {
    return (
      <div>
        <div id="buttondiv">
          <select id={"areaDropdown"} onChange={(areaDropdownEvent) => this.HandleAreaDropdownChange(areaDropdownEvent)}>
            <option value=""></option>
            {this.state.areaList}
          </select>

          <select id={"floorDropDown"} onChange={(floorDropdownEvent) => this.HandleFloorDropdownChange(floorDropdownEvent)}>
            {this.state.floorList}
          </select>

          <button id={"saveButton"} onClick={(clickEvent) => this.HandleSaveArea(clickEvent)}>Save Area</button>
          <button id={"deleteRoomButton"} onClick={(clickEvent) => this.HandleDeleteRoomEvent(clickEvent)}>Delete Room</button>
          <button id={"addRoomButton"} onClick={(clickEvent) => this.HandleAddRoomEvent(clickEvent)}>Add Room</button>
          <input type="text" onChange={(typingEvent) => this.HandleChangeFieldEvent(typingEvent)} />
        </div>

        <div id="reactgrid">
          <ReactGridLayout layout={this.state.layout} onLayoutChange={this.LayoutChange} id="areaGrid" className="layout" cols={12} rowHeight={30} width={1200} {...this.props}>
            {this.GenerateAreaGraph()}
          </ReactGridLayout>
        </div>
        <textarea id="roomDescription" type="text" readOnly={false} onChange={this.HandleChangeDescriptionEvent} value={this.state.description || ''}/>
      </div>
    );
  }
}
export default App;