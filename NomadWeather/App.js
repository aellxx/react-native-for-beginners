import * as Location from "expo-location";
import React, {useState, useEffect} from "react";
import { View, 
        StyleSheet, 
        Text, 
        ScrollView, 
        Dimensions, 
        ActivityIndicator } from "react-native";
import { Fontisto } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get("window").width;
const API_KEY = "db92cefaef9744e28cd5d7214d227ffd";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "", 
  Snow: "snow", 
  Rain: "rains", 
  Drizzle: "rain", 
  Thunderstorm: "lightning",
}

export default function App () {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const getLocation = async() => {
    const granted = await Location.requestForegroundPermissionsAsync().granted;
    if (!granted) {
      setOk((current) => false);
    }
    // get geo coordinates
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy: 5});

    // get city
    const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps: false});
    setCity(location[0].city);
    console.log(latitude, longitude);
  }

  const getWeather = async() => {
    const granted = await Location.requestForegroundPermissionsAsync().granted;
    if (!granted) {
      setOk((current) => false);
    }
    // get geo coordinates
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy: 5});

    // get city
    const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps: false});
    setCity(location[0].city);
    
    // get weather information & save
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`)
    const json = await response.json();
    setDays(json.daily);
    console.log(days[0]);
  }

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView 
        showsHorizontalScrollIndicator
        pagingEnabled 
        horizontal 
      >
        {days.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator 
              color="white" 
              size="large"/>
          </View>
          ) : (
              days.map((day, index) => (
                <View key={index} style={styles.day}>
                  <View>
                    <Text style={styles.temp}>{Math.round(day.temp.day)}&#176;C</Text>
                  </View>
                  <View style={styles.weatherText}>
                    <Fontisto  
                      name={icons[day.weather[0].main]} 
                      size={60} 
                      color="black" />
                    <Text style={styles.description}>{day.weather[0].main}</Text>
                    <Text style={styles.tinyText}>{day.weather[0].description}</Text>
                  </View>
                  <View style={styles.minmax_sun}>
                    <View style={styles.minmax}>
                      <Text style={{fontSize: 25}}>High: {Math.round(day.temp.max)}&#176;</Text>
                      <Text style={{fontSize: 25}}>Low: {Math.round(day.temp.min)}&#176;</Text>
                      <Text style={{fontSize: 25}}>Feels like: {Math.round(day.feels_like.day)}&#176;</Text>
                    </View>
                    <View style={styles.sun}>
                      <Text>sunrise: {new Date(day.sunrise * 1000).toLocaleTimeString()}</Text>
                      <Text>sunset: {new Date(day.sunset * 1000).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                </View>
              ))
          )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#a5d6f4",
  }, 
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 50,
  },
  day: {
    // flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: "space-around",
    alignItems: "center",
    padding:30,
  },
  temp: {
    fontSize: 100,
  },
  description: {
    marginTop: -10,
    fontSize: 50,
  },
  tinyText: {
    fontSize: 25,
  },
  loading: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  weatherText: {
    alignItems: "center",
  }, 
  minmax_sun: {
    marginTop: -40,
  },
  minmax: {
    alignItems: "center",
    marginTop: 30,
    fontSize: 40,
  }, 
  sun: {
    marginTop: 10,
    alignItems: "center",
  }
})
