import logo from './logo.svg';
import './App.css';
import { Input, Form, FormGroup, Label, Button, Row, Col, Container, Table } from 'reactstrap';
import axios from 'axios';
import { useState } from 'react';


function App() {


  const [city, setCity] = useState("")
  const [state, setState] = useState(false)
  const [weatherData, setWeatherData] = useState({
    currentTemp: 0,
    minTemp: 0,
    maxTemp: 0,
    humidity: 0,
    windSpeed: 0,
    windDirection: 0,
    desc: ""
  });

  const [nextFiveDaysData, setNextFiveDaysData] = useState([])

  const [mode, setMode] = useState("metric");

  const weatherAPIKey = "9f3cd907b26f3460491046e997bb626b";
  const cityAPICall = `http://api.openweathermap.org/geo/1.0/direct`
  const weatherAPICall = `https://api.openweathermap.org/data/2.5/weather`
  const fiveDaysAPICall = `https://api.openweathermap.org/data/2.5/forecast`

  const nextFiveDays = [];
  const definedTime = "12:00:00"

  for (let i = 1; i <= 5; i++) {
    const currentTime = new Date()
    let month = currentTime.getMonth() + 1
    let day = currentTime.getDate() + i;
    let year = currentTime.getFullYear()

    if (day.toString().length == 1) {
      day = "0" + day
    }

    if (month.toString().length == 1) {
      month = "0" + month
    }

    const formedTime = `${year}-${month}-${day} ${definedTime}`
    nextFiveDays.push(formedTime)
  }

  const splitData = (records) => {
    return records.filter(record => nextFiveDays.includes(record.dt_txt))
  }

  const getCityDetails = ({ city }) => {
    const params = { limit: 5, appid: weatherAPIKey, q: city, units: state ? "metrics" : "imperial" }
    return axios.get(cityAPICall, { params })
  }

  const getWeatherDetails = ({ lat, lon }) => {
    const params = { limit: 5, appid: weatherAPIKey, lat, lon, units: state ? "metrics" : "imperial" }
    return axios.get(weatherAPICall, { params })
  }

  const getFiveDaysCast = ({ lat, lon }) => {
    const params = { appid: weatherAPIKey, lat, lon, units: state ? "metrics" : "imperial" }
    return axios.get(fiveDaysAPICall, { params })
  }


  const handleSubmit = async (event) => {
    event?.preventDefault()
    if (event) {
      setCity(event.target[0].value);
    }

    try {
      const response = await getCityDetails({ city: event ? event.target[0].value : city });
      if (response.data.length) {
        const { lon, lat } = response.data[0]
        const weatherResponse = await getWeatherDetails({ lat, lon });
        const fiveDaysResponse = await getFiveDaysCast({ lat, lon });
        const responseData = weatherResponse.data;
        const fiveDaysresponseData = fiveDaysResponse.data;
        console.log({ fiveDaysresponseData })
        console.log({ splitRecords: splitData(fiveDaysresponseData.list) });
        setNextFiveDaysData(splitData(fiveDaysresponseData.list))
        console.log({ result: weatherResponse.data })
        setWeatherData({
          currentTemp: (responseData.main.temp).toFixed(2),
          minTemp: (responseData.main.temp_min).toFixed(2),
          maxTemp: (responseData.main.temp_max).toFixed(2),
          humidity: responseData.main.humidity,
          windSpeed: responseData.wind.speed,
          windDirection: responseData.wind.deg,
          desc: responseData.weather[0].description
        })
      }
    } catch (error) {
      console.error({ error })
    }
  }


  const handleSwitch = () => {
    setState(!state);
    if (city.length >= 3) {
      handleSubmit()
    }
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  id="exampleEmail"
                  name="email"
                  placeholder="Type your city name and click submit"
                  type="text"
                  minLength={3}
                />
              </FormGroup>
              <FormGroup>
                <Label>Check this if you want to display in Celsius </Label>
                <Input
                  type="switch"
                  checked={state}
                  onChange={() => {
                    handleSwitch()
                  }}
                />
              </FormGroup>
              <Button type='submit'>
                Submit
              </Button>

            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4>
              Your entered {city} current whether is given on the below table
            </h4>
            <hr>
            </hr>
            <Table>
              <thead>
                <tr>
                  <th>Current Temprature</th>
                  <th>Minimum Temprature</th>
                  <th>Maximum Temprature</th>
                  <th>Weather Description</th>
                  <th>Humidity</th>
                  <th>Wind Direction</th>
                  <th>Wind Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{weatherData.currentTemp}</td>
                  <td>{weatherData.minTemp}</td>
                  <td>{weatherData.maxTemp}</td>
                  <td>{weatherData.desc}</td>
                  <td>{weatherData.windDirection}</td>
                  <td>{weatherData.windSpeed}</td>
                  <td>{weatherData.humidity}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <hr></hr>
        <Row>
          <Col>
            <h4>Next 5 week datas are given in the below table</h4>
          </Col>
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temprature</th>
                <th>Weather Description</th>
              </tr>
            </thead>
            <tbody>
              {nextFiveDaysData.map((data, index) => {
                return (
                  <tr key={index}>
                    <td>{nextFiveDays[index]}</td>
                    <td>{data.main.temp}</td>
                    <td>{data.weather[0].description}</td>
                  </tr>)
              }
              )}

            </tbody>
          </Table>
        </Row>
      </Container>


    </div>
  );
}

export default App;
