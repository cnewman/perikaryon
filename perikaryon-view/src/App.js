import React, { Component } from "react";
import "./App.css";
import "../node_modules/react-grid-layout/css/styles.css"
import "../node_modules/react-resizable/css/styles.css"
import RGL, {WidthProvider} from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

class App extends Component {
  static defaultProps = {
    onLayoutChange: function(){},
    verticalCompact: false
  };
  constructor(props) {
    super(props);
    this.state = { 
      ranvierAPIResponse: "",
      selectValue: "",
      currentFloor: 0
    };
  }

 /*
  * Take Area data from Ranvier API response and make the graph using react-grid-layout API
  * This function maps over the API response object from Ranvier and checks to figure out which rooms
  * are part of the currently selected (via dropdown) area and then create a graph node for each.
  */
  GenerateAreaGraph(ranvierAPIResponse, selectedArea, currentFloor) {
    let divList = []
    for(let [_,area] of Object.entries(ranvierAPIResponse)){
      if(area.name == selectedArea){
        for(let [roomKey, room] of Object.entries(area.roomList)){
          if (room.coordinates != null) {
            if (currentFloor == room.coordinates.z) {
              divList.push(<div style={{ background: "#000FFF" }} key={roomKey} data-grid={{ x: (room.coordinates.x), y: (room.coordinates.y) + 2, w: 1, h: 1 }}>{room.title}({(room.coordinates.x * 2) + 3},{(room.coordinates.y * 2) + 3},{room.coordinates.z})</div>)
            }
          } else {
            console.log("Coordinates is null. Areabuilder currently requires coordinates to work.");
          }
        }
      }
    }
    return (divList);
  }
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an area from the dropdown and the area's rooms will be displayed.
  * This function maps over the API response object from Ranvier and just pulls each area name.
  */
  GenerateDropdown(ranvierAPIResponse) {
    return (
      Object.keys(ranvierAPIResponse)
        .map(function (key) {
          return (
            <option key={ranvierAPIResponse[key].name} value={ranvierAPIResponse[key].name}>{ranvierAPIResponse[key].name}</option>
          );
        })
    );
  }
  
  /*
  * Take Area data from Ranvier API response and make a dropdown.
  * User can select an floor from the dropdown and the area's rooms that are on that floor will
  * be displayed. This function maps over the API response object from Ranvier and just pulls 
  * unique floor numbers to populate the dropdown.
  */
  GenerateFloorDropdown(ranvierAPIResponse, selectedArea) {
    let uniqueFloorNumbers = new Set();
    for(let apikey of Object.keys(ranvierAPIResponse)){
      if(ranvierAPIResponse[apikey].name == selectedArea){
        for(let room of ranvierAPIResponse[apikey].roomList){
          if(room.coordinates != null){
            uniqueFloorNumbers.add(room.coordinates.z);
          } else{
            console.log("Coordinates is null. Areabuilder currently requires coordinates to work.");
          }
        }
      }
    }
    let floorNumberElementList = [];
    for (let floorNumber of uniqueFloorNumbers){
      floorNumberElementList.push(<option value={floorNumber}>{floorNumber}</option>)
    }
    return (floorNumberElementList);
  }

  /*
  * When a new area is selected in the dropdown, change the value so React can re-render.
  */
  HandleAreaDropdownChange = (e) => {
    this.setState({selectValue: e.target.value});
  }

  /*
  * When a new floor is selected in the dropdown, change the value so React can re-render.
  */
  HandleFloorDropdownChange = (e) => {
    this.setState({currentFloor: e.target.value});
  }

  /*
  * Once the component mounts, call Ranvier's API (only locally, currently) so that we can
  * populate area grid and dropdown.
  */
  callAPI() {
    fetch("http://localhost:3004/areas")
      .then(res => res.json())
      .then(res => {
        this.setState({ ranvierAPIResponse: res });
      })
      .catch(err => err);
  }
  componentDidMount() {
    this.callAPI();
  }

  /*
  * Render the dropdown and area graph. The area graph uses react-grid-layout's API.
  */
  render() {
    return(
      <div>
        <div>
        <select onChange={this.HandleAreaDropdownChange}>
          <option value=""></option>
          {this.GenerateDropdown(this.state.ranvierAPIResponse)}
        </select>
        <select onChange={this.HandleFloorDropdownChange}>
          {this.GenerateFloorDropdown(this.state.ranvierAPIResponse, this.state.selectValue)}
        </select>
        </div>
        <div>
        <ReactGridLayout className="layout" cols={12} rowHeight={30} width={1200} {...this.props}>
          {this.GenerateAreaGraph(this.state.ranvierAPIResponse, this.state.selectValue, this.state.currentFloor)}
        </ReactGridLayout>
        </div>
      </div>
    );
  }
}
export default App;