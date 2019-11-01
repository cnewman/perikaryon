import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '../contexts/RoomContext';

import { RIEInput } from 'riek'
import RGL, { WidthProvider } from 'react-grid-layout'

const ReactGridLayout = WidthProvider(RGL)
const gridWidth = 12;
const centerOfGrid = gridWidth / 2;

const AreaMap = (props) => {
  const { activeArea, activeFloor } = useContext(RoomContext);
  
  const CreateElementContainer = (area, roomid, title, coordinates) => {
    const ranvierCoords = TranslateReactGridToRanvierCoordinates(coordinates);
    return (
      <div className={'room'}
        id={roomid}
        coordinate_values={coordinates}
        key={roomid}
        data-grid={{ x: coordinates.x, y: coordinates.y, w: 1, h: 2 }}
      >
        <RIEInput
          value={title}
          propName={title}
          change={() => { }}
        />
        <br /> ({ranvierCoords.x},{ranvierCoords.y},{ranvierCoords.z})
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
  const TranslateRanvierToReactGridCoordinates = (coordinates, minX, minY) => {
    if (minY < 0) {
      return ({
        x: (coordinates[0] + Math.max(centerOfGrid, Math.abs(minX))),
        y: (((-coordinates[1]) + Math.abs(minY))) * 2,
        z: coordinates[2]
      })
    } else {
      return ({
        x: (coordinates[0] + Math.max(centerOfGrid, Math.abs(minX))),
        y: (coordinates[1] * 2),
        z: coordinates[2]
      })
    }

  }
  /*
  * Translate back to ranvier coordinates by subtracting grid center from x (to move it back to origin)
  * and dividing y by nodeheight to shrink it back to size == 1. This does not re-generate the original
  * coordinates, but it generates an equivalent coordinate system that won't change area layout.
  */
  const TranslateReactGridToRanvierCoordinates = (coordinates) => {
    return ({
      x: coordinates.x - centerOfGrid,
      y: coordinates.y / 2,
      z: coordinates.z,
    })
  }

  /*
   * Take Area data from Ranvier API response and make the graph using react-grid-layout API
   * This function maps over the API response object from Ranvier and checks to figure out which rooms
   * are part of the currently selected (via dropdown) area and then create a graph node for each.
   */
  const GenerateAreaGraph = () => {

    console.log(activeArea)
    let visibleRoomList = []
    let minX = 0
    let minY = 0
    if (activeArea && activeArea.rooms) {
      for (let room of activeArea.rooms) {
        if (room.coordinates) {
          console.log(room.coordinates)
          minX = Math.min(minX, room.coordinates[0])
          minY = Math.min(minY, room.coordinates[1])
        }
      }
      for (let room of activeArea.rooms) {
        if (room.coordinates) {
          const coordinates = TranslateRanvierToReactGridCoordinates(room.coordinates, minX, minY)
          if (coordinates.z == activeFloor) {
            visibleRoomList.push(CreateElementContainer("", room.id, room.title, coordinates))
          } else {
            console.log("Coordinates is null. Perikaryon map currently requires coordinates to work.");
          }
        }
      }
    }
    /*
     *Whenever the layout changes, update the mapOfRoomsInArea map coordinates
     */
    const LayoutChange = (roomLayoutList) => {
      if (activeArea && activeArea.rooms) {
        roomLayoutList.forEach((roomLayout) => {
          const indexOfRoom = activeArea.rooms.findIndex((room) => {
            return room.id == roomLayout.i
          })
          if (activeArea.rooms[indexOfRoom]) {
            console.log(roomLayout)
            const newCoords = TranslateReactGridToRanvierCoordinates({ x: roomLayout.x, y: roomLayout.y, z: activeFloor });
            activeArea.rooms[indexOfRoom].coordinates[0] = newCoords.x;
            activeArea.rooms[indexOfRoom].coordinates[1] = newCoords.y;
          }
        });
      }
    }
    // return (
    //     activeArea.rooms.map(room =>  {
    //     const styles = `entityList ${room.id === activeRoom.id ? 'selected-edit': ''}`;
    //     return (
    //     <p className={styles} key={room.id} onClick={() => changeActiveRoom(room)}>{room.id} - {room.title}</p>
    //   )}));
    console.log("visibleRoomList")
    console.log(visibleRoomList)
    return (
      <ReactGridLayout onLayoutChange={LayoutChange} margin={[20, 20]} verticalCompact={false} preventCollision={true} isResizable={false} id="areaGrid" className="layout" cols={gridWidth} rowHeight={30} width={1200} {...props}>
        {visibleRoomList}
      </ReactGridLayout>
    )
  }
  return (
    GenerateAreaGraph()
  )
}

export default AreaMap;