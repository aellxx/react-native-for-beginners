import { StatusBar } from 'expo-status-bar';
import { theme } from './js/colors';
import { useState, useEffect } from 'react';
import { StyleSheet, 
        Text, 
        View,
        TouchableOpacity,
        TextInput,
       } 
        from 'react-native';


export default function App() {
  // change between work and travel
  const [working, setWorking] = useState(true);
  // save user input
  const [text, setText] = useState("");
  // save toDos
  const [toDos, setToDos] = useState({});

  // switch between modes
  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const onChangeText = (event) => {
    setText(event);
  }

  const addToDo = () => {
    if (text === "") {
      return;
    } else {
      // save to do
      setToDos((currentList) => currentList[Date.now()] = text);
      console.log(toDos);
    }
    // empty text input box 
    setText("");
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.buttonText, color: working ? "white" : theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.buttonText, color: !working ? "white" : theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput 
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
        returnKeyType="done"
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
      />
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
    paddingHorizonal: 10,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
  }
});
