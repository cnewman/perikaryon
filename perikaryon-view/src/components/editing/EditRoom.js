import React, { useContext, useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { RoomContext } from '../../contexts/RoomContext';

const EditRoom = () => {

  const { activeArea, activeRoom, updateRoom } = useContext(RoomContext);

  const [id, setId] = useState(activeRoom.id);
  const [title, setTitle] = useState(activeRoom.title);
  const [description, setDescription] = useState(activeRoom.description);
  const [exits, setExits] = useState(activeRoom.exits);

  // If you click on a different room to edit, update the form
  useEffect(() => {
    setId(activeRoom.id);
    setTitle(activeRoom.title);
    setDescription(activeRoom.description);
    setExits(activeRoom.exits);
    ;
  }, [activeRoom, activeArea]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRoom = JSON.parse(JSON.stringify(activeRoom));
    updatedRoom.id = id;
    updatedRoom.title = title;
    updatedRoom.description = description;
    updatedRoom.exits = exits;

    updateRoom(updatedRoom);
  }

  const handleExitChange = (e, dir, exitDir) => {
    if (exitDir) {
      exitDir.roomId = e.target.value;
      const index = exits.indexOf(exit => exit.direction === exitDir.direction);
      exits[index] = exitDir;
      setExits([...exits]);
      return;
    }

    const newExit = { roomId: e.target.value, direction: dir }
    setExits([...exits, newExit]);

  };

  const showExits = () => {

    const dirs = ['north', 'east', 'south', 'west', 'up', 'down'];
    return dirs.map(dir => {
      const exitDir = exits.find(exit => exit.direction === dir);
      console.log(dir, exitDir)
      // if (exitDir) {
      return (
        <Form.Group key={dir} as={Row} controlId={`editRoom.${dir}`}>
          <Form.Label column>{dir}:</Form.Label>
          <Col lg={10}>
            <Form.Control
              type="text"
              value={exitDir && exitDir.roomId || 'none'}
              onChange={(e) => handleExitChange(e, dir, exitDir)}
            />
          </Col>
        </Form.Group>
      );
    });
  }



  return ( // userId, title, body
    <div style={{ padding: '5px 15px' }}>
      <h2 style={{ textAlign: 'center' }}>Edit</h2>
      <Form onSubmit={handleSubmit}>

        <Form.Group as={Row} controlId="editRoom.id">
          <Form.Label column>Id:</Form.Label>
          <Col lg={10}>
            <Form.Control
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="editRoom.title">
          <Form.Label column>Title:</Form.Label>
          <Col lg={10}>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="editRoom.description">
          <Form.Label column>Description:</Form.Label>
          <Col lg={10}>
            <Form.Control as="textarea"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Col>
        </Form.Group>

        {showExits()}

        <Button variant="primary" type="submit">
          Save Room to Area
        </Button>
        {console.log(exits)}
      </Form>
    </div >
  );
}

export default EditRoom;