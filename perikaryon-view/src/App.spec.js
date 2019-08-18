import React from 'react';
import Renderer from 'react-test-renderer';
import {shallow, configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import App from "./App"
const {List, Set} = require('immutable');

var json = require('./TestData.json')

configure({adapter: new Adapter()})

describe('Test snapshot of component', () => {
    it('Snapshot has not changed', () => {
        const component = Renderer.create(<App />);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe('Generation Functions', () => {
    it('Should contain 3 floors', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        const NUMBER_OF_FLOORS_IN_TEST_DATA = 3;
        expect(instance.GenerateFloorDropdown(json, 'mapped').count())
            .toBe(NUMBER_OF_FLOORS_IN_TEST_DATA)
    });
    it('Should contain floors -1, 0, and 1', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        expect(instance.GenerateFloorDropdown(json, 'mapped')
            .every(option => [-1, 0, 1].includes(option.props.value)))
            .toBe(true);
    });
    
    it('Should contain 3 areas', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        const NUMBER_OF_AREAS_IN_TEST_DATA = 3;
        expect(instance.GenerateAreaDropdown(json).length)
            .toBe(NUMBER_OF_AREAS_IN_TEST_DATA);
    });
    it('Should contain the mapped, craft, and limbo areas', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        expect(instance.GenerateAreaDropdown(json)
            .every(option => ['mapped','craft','limbo'].includes(option.props.value)))
            .toBe(true);
    });

    it('Should contain 8 rooms', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        const NUMBER_OF_ROOMS_IN_TEST_DATA = 8;
        expect(instance.GenerateAreaGraph(json, 'mapped', 0).count())
            .toBe(NUMBER_OF_ROOMS_IN_TEST_DATA);
    });
    it('Should have these specific room keys', () => {
        const component = shallow(<App />);
        const instance = component.instance();
        const INTERNAL_ROOM_KEYS_IN_DATA_SET = ['0', '1', '2', '4', '5', '7', '8', '9'];
        expect(instance.GenerateAreaGraph(json, 'mapped', 0)
            .every(room => INTERNAL_ROOM_KEYS_IN_DATA_SET.includes(room.key)))
            .toBe(true);
    });
});