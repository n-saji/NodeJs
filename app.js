require("dotenv").config();
const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const INPUT_ORIGIN = ["http://localhost:5173","https://n-saji.github.io"]
const app = express();
const PORT = process.env.PORT || 5050;
const WEATHER_API_URL = process.env.WEATHER_API_URL
const WEATHER_API_KEY = process.env.API_KEY;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json());

const cors = require("cors");


app.use(
  cors({
    origin: INPUT_ORIGIN,
  })
);

app.use((req, res, next) => {
  const allowedOrigins = INPUT_ORIGIN;
  const origin = req.headers.origin;

  if ((!allowedOrigins.includes(origin) && origin) || !origin) {
    return res.status(403).json({ message: "Access forbidden" });
  }
  next();
});

app.get("/api/weather", async (req, res) => {
  try {

    ;
    const { lat, lon } = req.query;
    const apiUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log(apiUrl);

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${WEATHER_API_KEY}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error making API call:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/cities", async (req, res) => {
  try {
    const apiurl = process.env.GEO_API_URL;

    const { city } = req.query;
    const apiUrl = apiurl + `/cities?namePrefix=${city}&minPopulation=100000&limit=10`;
    const RAPID_API_KEY = process.env.RAPID_API_KEY;
    console.log(apiUrl, RAPID_API_KEY);

    const response = await axios.get(apiUrl, {
      headers: {
        "x-rapidapi-key": `${RAPID_API_KEY}`,
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error making API call:", error.message);
    res.status(500).json({ error: "Failed to fetch city data" });
  }
});

app.get("/api/weather/forecast", async (req, res) => { 
  const { lat, lon } = req.query;
  link = WEATHER_API_URL + `/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  console.log(link)

  try {
    axios({ method: 'get', url: link })
    .then(response => {
      res.json(response.data)
    })
  } catch (error) {
    console.error("error making call to fetch forecast data", error.message)
    res.status(500).json({ error: "Failed to fetch forecast data" });
  }

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
