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

export default function App() {
  // change between work and travel
  const [working, setWorking] = useState(true);
  // save user input
  const [userInputText, setUserInputText] = useState("");
  // save toDos
  const [toDos, setToDos] = useState({});
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
      const newToDos = {...toDos, [Date.now()]: {userInputText, working}};
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
      // const prevModeString = await AsyncStorage.getItem(MODE_STORAGE_KEY);
      // const prevModeBool = prevModeString === "true" ? true : false;
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
    const doneToDos = {...toDos};
    // delete doneToDos[toDoKey] didn't work
    delete doneToDos[toDoKey];
    setToDos(doneToDos);
    await saveToDos(doneToDos);
  }

  // load toDos only once when the application loads
  useEffect(() => {
    loadPrevMode();
    loadToDos();
    // set loading status to false once done loading
    setIsLoading(false);
  }, []);

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
            {
              Object.keys(toDos).map( (toDoKey) => 
                // only display blocks when the mode recorded in the object === current system mode
                // no need for an extra ScrollView 
                toDos[toDoKey].working === working ? (
                  <View key={toDoKey} style={styles.toDoView}>
                    <Text style={styles.toDoText}>{toDos[toDoKey].userInputText}</Text>
                    <TouchableOpacity onPress={() => alertBeforeDelete(toDoKey)}>
                      <FontAwesome style={styles.toDoDelete} name="remove" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  null
                )
              )
            }
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
  toDoView: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.gray,
    marginVertical: 5,
    paddingVertical: 20,
    paddingHorizontal: 35,
    borderRadius: 15,
  },
  toDoText: {
    color: "#fff",
    fontSize: 18,
  },
  toDoDelete: {
    color: "#fff",
    fontSize: 18
  },
  loadingView: {
    height: "70%",
    justifyContent: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#fff",
    marginTop: 10,
  }
});
