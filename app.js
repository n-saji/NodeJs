require("dotenv").config();
const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5050;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json());

const cors = require("cors");

console.log(process.env.INPUT_ORIGIN);

app.use(
  cors({
    origin: `${process.env.INPUT_ORIGIN}`,
  })
);

app.use((req, res, next) => {
  const allowedOrigins = process.env.INPUT_ORIGIN;
  const origin = req.headers.origin;

  if ((!allowedOrigins.includes(origin) && origin) || !origin) {
    return res.status(403).json({ message: "Access forbidden" });
  }
  next();
});

app.get("/api/weather", async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    const WEATHER_API_URL = process.env.WEATHER_API_URL;
    const { lat, lon } = req.query;
    const apiUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log(apiUrl);

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error making API call:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/api/cities", async (req, res) => {
  try {
    const apiurl = process.env.GEO_API_URL;

    const { city } = req.query;
    const apiUrl = apiurl + `/cities?namePrefix=${city}`;
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
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
