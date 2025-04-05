const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT_MS = 3000;

const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const API_ENDPOINTS = { p: "primes", f: "fibo", e: "even", r: "rand" };

// ✅ Your current valid token
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzODM0OTY1LCJpYXQiOjE3NDM4MzQ2NjUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijk0MzhhZDJkLTIzMTUtNDgyYy1hN2EzLWE5ODZlNzljZjEyYiIsInN1YiI6InByYWNoaWJoYW5kYXJpNjQzQGdtYWlsLmNvbSJ9LCJlbWFpbCI6InByYWNoaWJoYW5kYXJpNjQzQGdtYWlsLmNvbSIsIm5hbWUiOiJwcmFjaGkgYmhhbmRhcmkiLCJyb2xsTm8iOiIyMjEwMzA3MyIsImFjY2Vzc0NvZGUiOiJTck1RcVIiLCJjbGllbnRJRCI6Ijk0MzhhZDJkLTIzMTUtNDgyYy1hN2EzLWE5ODZlNzljZjEyYiIsImNsaWVudFNlY3JldCI6IlhVYlp5VE1wcXpYRFVNd0oifQ.-Ufaf2WOvfYzFzt8nYhmRlWVtkk15YqlBmAFWyn7EpY";

let window = [];

const fetchNumbers = async (type) => {
  const endpoint = API_ENDPOINTS[type];
  const url = `${API_BASE_URL}/${endpoint}`;

  console.log("\n🌐 GET /numbers/" + type + " called");
  console.log("📤 Sending request to:", url);
  console.log("🔐 Using token (first 20 chars):", ACCESS_TOKEN.slice(0, 20) + "...");

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: "application/json"
      }
    });

    console.log("✅ Received response");
    return response.data.numbers || [];

  } catch (err) {
    console.error(`❌ Error fetching "${type}"`);
    console.error("⛔ Status:", err.response?.status);
    console.error("📨 Error message:", err.message);
    console.error("📃 Response body:", err.response?.data);
    return [];
  }
};

const updateWindow = (numbers) => {
  const prevWindow = [...window];
  for (const num of numbers) {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift();
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

// 📁 Serve frontend if needed
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

  console.log("🪟 Prev state:", prevState);
  console.log("🪟 Curr state:", currState);
  console.log("📊 Average:", avg);

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
