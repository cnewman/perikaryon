import React from 'react';
import Toolbar from './components/Toolbar'
import RoomContextProvider, {RoomContext, getAreas} from './contexts/RoomContext'
import "whatwg-fetch";
import {renderHook} from "@testing-library/react-hooks"
import fetchMock from "fetch-mock"
import {act} from "react-test-renderer"
import {List, Record, fromJS, isKeyed, Map} from 'immutable'

describe("useDataApi", () => {
 beforeAll(() => {
     global.fetch = fetch;
 })
 afterAll(() => {
     fetchMock.restore()
 })

 it('should return data with successful request', async () => {
    const wrapper = ({children}) => <RoomContextProvider>{children}</RoomContextProvider>
    const { result } = renderHook(() => Toolbar(), {wrapper});
    fetchMock.mock('http://localhost:3004/areasFiles', [
        {"manifest":{"title":"Map Test","info":{"respawnInterval":60},"instanced":"player","bundlePath":"/home/wotterbox/ranviermud/bundles/bundle-example-areas/areas/mapped"},"npcs":[{"id":"squirrel","keywords":["squirrel"],"name":"A Squirrel","level":2,"description":"A furry little squirrel","behaviors":{"ranvier-wander":{"interval":30,"areaRestricted":true}}}],"rooms":[{"id":"start","title":"Begin","coordinates":[0,0,0],"description":"You are in the start of this area. There are hallways to the north and south.","npcs":["mapped:squirrel"]},{"id":"hallway-north-1","title":"Hallway North 1","coordinates":[0,1,0],"description":"You are in the north hallway."},{"id":"hallway-north-2","title":"Hallway North 2","coordinates":[0,2,0],"description":"You are in the north hallway."},{"id":"basement-north","title":"Basement","coordinates":[0,2,-1],"description":"You are in the basement.","doors":{"mapped:hallway-north-2":{"closed":true}}},{"id":"hallway-south-1","title":"Hallway South 1","coordinates":[0,-1,0],"description":"You are in the south hallway."},{"id":"hallway-south-2","title":"Hallway South 2","coordinates":[0,-2,0],"description":"You are in the south hallway."},{"id":"attic-south","title":"Attic","coordinates":[0,-2,1],"description":"You are in the attic.","exits":[{"direction":"east","roomId":"limbo:white"}]},{"id":"hallway-east-1","title":"Hallway East 1","coordinates":[1,0,0],"description":"You are in the east hallway."},{"id":"hallway-east-2","title":"Hallway East 2","coordinates":[2,0,0],"description":"You are in the east hallway."},{"id":"hallway-east-3","title":"Hallway East 3","coordinates":[2,-1,0],"description":"You are in the east hallway."}]}
    ]);
    
    await act (async () => {
        const response = await getAreas()
        for (let area of response) {
            console.log(area.get("manifest").get("title"))
        }
        //result.current.callApi('http://localhost:3004/areasFiles')
    });
    // expect(result.current.data).toBe({
    //     returnedData: "foo"
    // });
 })
})