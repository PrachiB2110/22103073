const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const API_ENDPOINTS = { p: "primes", f: "fibo", e: "even", r: "rand" };

let window = [];

const fetchNumbers = async (type) => {
  const endpoint = API_ENDPOINTS[type];
  const url = `${API_BASE_URL}/${endpoint}`;
  try {
    const response = await axios.get(url, { timeout: TIMEOUT_MS });
    return response.data.numbers || [];
  } catch (err) {
    console.error(`Error fetching ${type}:`, err.message);
    return []; // Ignore timeout/errors
  }
};

const updateWindow = (numbers) => {
  const prevWindow = [...window];
  for (const num of numbers) {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift(); // Remove oldest
      }
      window.push(num);
    }
  }
  return prevWindow;
};

const calculateAverage = (arr) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / arr.length).toFixed(2));
};

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;

  if (!API_ENDPOINTS[numberid]) {
    return res.status(400).json({ error: "Invalid number ID. Use 'p', 'f', 'e', or 'r'." });
  }

  const newNumbers = await fetchNumbers(numberid);
  const prevState = updateWindow(newNumbers);
  const currState = [...window];
  const avg = calculateAverage(currState);

  res.json({
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: newNumbers,
    avg: avg
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
