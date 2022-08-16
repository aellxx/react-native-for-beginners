import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; 
import { StatusBar } from 'expo-status-bar';
import { theme } from './js/colors';
import { useState, useEffect } from 'react';
import { StyleSheet, 
        Text, 
        View,
        TouchableOpacity,
        TextInput,
        ScrollView,
        ActivityIndicator,
        Alert,
       } 
        from 'react-native';

const MODE_STORAGE_KEY = "@workOrTravel";
const TODO_STORAGE_KEY = "@toDos";
const DONE_TODO_STORAGE_KEY = "@doneToDos";

export default function App() {
  // change between work and travel
  const [working, setWorking] = useState(true);
  // save user input
  const [userInputText, setUserInputText] = useState("");
  // save toDos
  const [toDos, setToDos] = useState({});
  // save finished tasks
  const [doneToDos, setDoneToDos] = useState({});
  // loading status
  const [isLoading, setIsLoading] = useState(true);

  // switch between modes
  const travel = async () => {
    setWorking(false);
    await setCurrMode(false);
  }
  const work = async () => {
    setWorking(true);
    await setCurrMode(true);
  }

  // 1 character behind when using {}, problem solved after changing to ()
  const onChangeText = (inputText) => setUserInputText(inputText);

   // save the toDos to a storage
  const saveToDos = async (toDos) => {
    try {
      await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(toDos));
    } catch(e) {
      alert("Error saving to-dos");
    }
  }
  
  // add a toDo when user presses "done"
  const addToDo = async () => {
    if (userInputText === "") {
      return;
    } else {
      const newToDos = {...toDos, [Date.now()]: {userInputText, working, done: false}};
      // Object.assign({}, toDos, {[Date.now()]: {userInputText, working}});
      setToDos(newToDos);
      await saveToDos(newToDos);
      setUserInputText("");
    }
  }

  // load toDos from the storage
  const loadToDos = async () => {
    try {
      const toDosString = await AsyncStorage.getItem(TODO_STORAGE_KEY);
      // convert to JSON and reload
      setToDos(JSON.parse(toDosString));
    } catch(e) {
      alert("Error loading to-dos");
    }
  }

  // save current mode to async
  const setCurrMode = async (mode) => {
    try {
      await AsyncStorage.setItem(MODE_STORAGE_KEY, mode.toString());
    } catch(e) {
      alert("Error: Failed to save current mode.");
    }
  }

  // load previous mode when restarted
  const loadPrevMode = async () => {
    try {
      const prevMode = await AsyncStorage.getItem(MODE_STORAGE_KEY) === "true" ? true : false;
      setWorking(prevMode);
    } catch(e) {
      alert("Error: Failed to load previous mode.");
    }
  }

  const alertBeforeDelete = (toDoKey) => Alert.alert(
    "Are you sure?", 
    `Deleting "${toDos[toDoKey].userInputText}"`,
    [
      {
        text: "Oops",
      },
      {
        text: "I'm sure",
        onPress: async () => deleteToDo(toDoKey),
        style: "destructive",
      }
    ]
  );

  // delete to-dos
  const deleteToDo = async (toDoKey) => {
    const deletedToDos = {...toDos};
    // delete doneToDos[toDoKey] didn't work
    delete deletedToDos[toDoKey];
    setToDos(deletedToDos);
    await saveToDos(deletedToDos);
  }

  const checkOffToDo = async (toDoKey) => {
    // alert(`checking off ${toDos[toDoKey].userInputText}`);
    toDos[toDoKey].done = true;
    const newDoneToDos = {...doneToDos, [Date.now()]: toDos[toDoKey]};
    setDoneToDos(newDoneToDos);
    await saveDoneToDos(newDoneToDos);
    deleteToDo(toDoKey);
  }

  const deleteDoneToDo = (toDoKey) => {
    // alert(`deleting a done to-do: ${doneToDos[toDoKey].userInputText}`)
    const deletedDoneToDos = {...doneToDos};
    delete deletedDoneToDos[toDoKey];
    setDoneToDos(deletedDoneToDos);
  }

  // save the done toDos to a storage
  const saveDoneToDos = async (doneToDos) => {
    try {
      await AsyncStorage.setItem(DONE_TODO_STORAGE_KEY, JSON.stringify(doneToDos));
    } catch(e) {
      alert("Error saving done to-dos");
    }
  }

  const loadDoneToDos = async () => {
    try {
      const doneToDosString = await AsyncStorage.getItem(DONE_TODO_STORAGE_KEY);
      doneToDosString !== null ? setDoneToDos(JSON.parse(doneToDosString)) : setDoneToDos({}); 
    } catch(e) {
      alert("Error loading done to-dos");
    }
  }

  const editToDoContent = async (text, toDoKey) => {
    //toDos[toDoKey].userInputText = text;
    const editedToDos = {...toDos};
    editedToDos[toDoKey].userInputText = text;
    setToDos(editedToDos);
    await saveToDos(editedToDos);
  }

  const editToDo = (toDoKey) => {
    // alert(`edit ${toDos[toDoKey].userInputText}?`);
    Alert.prompt("Edit to-do", 
                `Editing "${toDos[toDoKey].userInputText}"`,
                (text) => editToDoContent(text, toDoKey)
                );
  }

  // load toDos only once when the application loads
  useEffect(() => {
    loadPrevMode();
    loadToDos();
    loadDoneToDos();
    // set loading status to false once done loading
    setIsLoading(false);
  }, []);

  console.log(doneToDos);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Work/Travel mode header */}
      <View style={styles.header}>
        {/* Surround text with TouchableOpacity for mode change */}
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.buttonText, color: working ? "white" : theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.buttonText, color: !working ? "white" : theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>

      {/* Text input for to-do(work) or travel list (travel) */}
      <TextInput 
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
        returnKeyType="done"
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        value={userInputText /* to update UI and code simultaneously */ } 
      />

      {/* Paint To-Dos */}
      {
        isLoading ? (
          <View style={styles.loadingView}>
            <ActivityIndicator 
              color="white" 
              size="large"/>
            <Text style={styles.loadingText}>Loading your list...</Text>
          </View>
        ) : (
          <ScrollView>
            {/* Task list scroll view */}
            <ScrollView>
              {
                Object.keys(toDos).map( (toDoKey) => 
                  // only display blocks when the mode recorded in the object === current system mode
                  // no need for an extra ScrollView 
                  toDos[toDoKey].working === working ? (
                    <View key={toDoKey} style={{...styles.toDoItemView, backgroundColor: theme.gray}}>
                      <Text style={styles.toDoText}>{toDos[toDoKey].userInputText}</Text>
                      <View style={styles.checkMarksView}>
                        <TouchableOpacity onPress={() => editToDo(toDoKey)}>
                          <FontAwesome style={styles.checkMarksText} name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => checkOffToDo(toDoKey)}>
                          <FontAwesome style={styles.checkMarksText} name="check" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => alertBeforeDelete(toDoKey)}>
                          <FontAwesome name="remove" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    null
                  )
                )
              }
            </ScrollView>
            {/* Done list scroll view */}
            <ScrollView>
            {
                Object.keys(doneToDos).map( (toDoKey) => 
                  // only display blocks when the mode recorded in the object === current system mode
                  // no need for an extra ScrollView 
                  doneToDos[toDoKey].working === working ? (
                    <View key={toDoKey} style={{...styles.toDoItemView, backgroundColor: theme.toDoBg}}>
                      <Text style={{...styles.toDoText, textDecorationLine: 'line-through', opacity: 0.5}}>{doneToDos[toDoKey].userInputText}</Text>
                      <TouchableOpacity onPress={() => deleteDoneToDo(toDoKey)} style={{opacity: 0.5}}>
                        <FontAwesome name="trash" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    null
                  )
                )
              }
            </ScrollView>
          </ScrollView>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  buttonText: {
    fontSize: 35,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizonal: 15,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDoItemView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    paddingVertical: 20,
    paddingHorizontal: 35,
    borderRadius: 15,
  },
  toDoText: {
    color: "#fff",
    fontSize: 18,
  },
  checkMarksView: {
    flexDirection: "row",
  },
  checkMarksText: {
    marginRight: 7,
  },
  loadingView: {
    height: "70%",
    justifyContent: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#fff",
    marginTop: 10,
  },
});
