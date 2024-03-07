// import logo from './logo.svg';
import React, { useState, useEffect } from "react";
import './App.css';

import "@aws-amplify/ui-react/styles.css";
// import { Storage } from "aws-amplify";
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
// import {API, graphqlOperation} from "aws-amplify"
import { generateClient } from 'aws-amplify/api';

// import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { listNotes } from "./graphql/queries";


import {
  withAuthenticator,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Image,
  View,
} from "@aws-amplify/ui-react";

import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";


function App({ signOut }) {
  const [notes, setNotes] = useState([]);
  const client = generateClient();
  useEffect(() => {
    fetchNotes();
  }, []);


  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;

    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image){
          const url = await getUrl({key:note.id})
          note.image = url
        } return note
      })
    )
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
   
    const result = await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    if (!!data.image) await uploadData({key: result.data.createNote.id, data:image}).result;
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({key: id})
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <View
        name="image"
        as="input"
        type="file"
        style={{ alignSelf: "end" }}
      />
      {notes.map((note) => (
        <Flex
          key={note.id || note.name}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Text as="strong" fontWeight={700}>
            {note.name}
          </Text>
          <Text as="span">{note.description}</Text>
          {note.image && (
            <Image
              src={note.image}
              alt={`visual aid for ${notes.name}`}
              style={{ width: 400 }}
            />
          )}
          <Button variation="link" onClick={() => deleteNote(note)}>
            Delete note
          </Button>
        </Flex>
      ))}
      <Button onClick={signOut}>Sign Out</Button>
    </View>
    
  );
}

export default withAuthenticator(App);



 {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <h1>Hello from V2</h1>
      </header> */}