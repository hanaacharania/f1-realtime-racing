//finish line
// canada: 644, 238
const finishLine = { x: 664, y: 271 };

let gameOver = false;

// canada
// const waypoints = [ //change
//   { x: 720, y: 370 },
//   { x: 482, y: 382 },
//   { x: 448, y: 420 },
//   { x: 334, y: 372 },
//   { x: 36, y: 85 },
//   { x: 86, y: 91 },
//   { x: 224, y: 99 },
//   { x: 370, y: 140 },
//   { x: finishLine.x, y: finishLine.y }
// ];

// austria

const waypoints = [ //change
  { x: 440, y: 493 }, 
  { x: 424, y: 477 }, 
  { x: 170, y: 247 },
  { x: 114, y: 215 },
  { x: 172, y: 165 },
  { x: 428, y: 71 },
  { x: 414, y: 151 },

  { x: 284, y: 251 },
  { x: 366, y: 341 },
  { x: 420, y: 255 },

  { x: 622, y: 131 },
  { x: 684, y: 215 },


  { x: finishLine.x, y: finishLine.y }
];

//car
let car = {
  // canada: 738, 295
  x: 550, //get this for every race
  y: 378,
  width: 20,
  height: 10,
  color: "red",
  speed: 2,
  dx: 0,
  dy: 0
};


// AI cars
const aiCars = [
  {
    // canada: 730, 295
    x: 564,
    y: 366,
    width: 20,
    height: 10,
    color: "blue",
    speed: 1.5,
    dx: 0,
    dy: 0,
    angle: 0,
    waypointIndex: 0
  },
];


function moveCar() {
  const nextX = car.x + car.dx;
  const nextY = car.y + car.dy;

  // Check pixel under center of car
  const centerX = nextX + car.width / 2;
  const centerY = nextY + car.height / 2;

  //print center
  console.log(`Center: (${centerX}, ${centerY})`);

  if (trackVisible && currentTrackImg) {
    ctx.drawImage(currentTrackImg, 0, 0, canvas.width, canvas.height);
  }

  if (onTrack(centerX, centerY)) {
    car.x = nextX;
    car.y = nextY;  
  }

}

function moveAICars() {

  for (const ai of aiCars) {
    let bestAngle = ai.angle;
    let maxScore = -Infinity;

    for (let a = -Math.PI/2; a <= Math.PI/2; a += Math.PI / 8) {
      const testAngle = ai.angle + a;
      // don't allow going backwards
      const testDX = Math.cos(testAngle) * ai.speed;
      const testDY = Math.sin(testAngle) * ai.speed;
      const testX = ai.x + testDX;
      const testY = ai.y + testDY;
      const waypoint = waypoints[ai.waypointIndex];
      const toWaypointX = waypoint.x - ai.x;
      const toWaypointY = waypoint.y - ai.y;
      const distBefore = Math.hypot(toWaypointX, toWaypointY);
      const distAfter = Math.hypot(waypoint.x - testX, waypoint.y - testY);
      const progress = distBefore - distAfter;  

      const centerX = testX + ai.width / 2;
      const centerY = testY + ai.height / 2;

      if (onTrack(centerX, centerY)) {
        if (progress > maxScore) {
          maxScore = progress;
          bestAngle = testAngle;
        }
      }
    }

    // Apply best angle and try to move
    const finalDX = Math.cos(bestAngle) * ai.speed;
    const finalDY = Math.sin(bestAngle) * ai.speed;
    const nextX = ai.x + finalDX;
    const nextY = ai.y + finalDY;

    const centerX = nextX + ai.width / 2;
    const centerY = nextY + ai.height / 2;

    if (trackVisible && currentTrackImg) {
      ctx.drawImage(currentTrackImg, 0, 0, canvas.width, canvas.height);
    }

    if (onTrack(centerX, centerY)) {
      ai.angle = bestAngle;
      ai.dx = finalDX;
      ai.dy = finalDY;
      ai.x = nextX;
      ai.y = nextY;
      const waypoint = waypoints[ai.waypointIndex];
      const distToWaypoint = Math.hypot(ai.x - waypoint.x, ai.y - waypoint.y);
      if (distToWaypoint < 15 && ai.waypointIndex < waypoints.length - 1) {
        ai.waypointIndex++;
      }
    } else {
      // Blocked: jitter angle to escape
      ai.angle += (Math.random() - 0.5) * Math.PI / 4;
    }
  }
}

function onTrack(x,y) {

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return false;  // Outside canvas = definitely off track
  }

  const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  const [r, g, b, a] = imageData;

  

  // const isOut = r == 255 && g == 0 && b == 0 && a == 255;
  // const isOut = r == 21 && g ==  20 && b == 30 && a == 255;
  const isOut = r == 0 && g == 0 && b == 255 && a == 255 || r == 255 && g == 0 && b == 0 && a == 255; // black = off track

  

  return !isOut;
  
}

function drawScene() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (trackVisible && currentTrackImg) {
    ctx.drawImage(currentTrackImg, 0, 0, canvas.width, canvas.height);
    // Draw car ONLY if track is visible
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Draw AI cars
    aiCars.forEach(aiCar => {
      ctx.fillStyle = aiCar.color;
      ctx.fillRect(aiCar.x, aiCar.y, aiCar.width, aiCar.height);
    });

    //draw finish line
    const lineWidth = 10;
    const lineHeight = 50;
    const squareSize = 5;
    drawCheckeredFinishLine(finishLine.x - lineWidth / 2, finishLine.y - lineHeight / 2, lineWidth, lineHeight, squareSize);
    
  }
}

function drawCheckeredFinishLine(x, y, width, height, squareSize) {
  for (let row = 0; row < height / squareSize; row++) {
    for (let col = 0; col < width / squareSize; col++) {
      const isBlack = (row + col) % 2 === 0;
      ctx.fillStyle = isBlack ? "black" : "white";
      ctx.fillRect(x + col * squareSize, y + row * squareSize, squareSize, squareSize);
    }
  }
}

function hasCrossedFinish(car) {
  const lineWidth = 10;
  const lineHeight = 50;

  const carCenterX = car.x + car.width / 2;
  const carCenterY = car.y + car.height / 2;

  return (
    carCenterX >= finishLine.x - lineWidth / 2 &&
    carCenterX <= finishLine.x + lineWidth / 2 &&
    carCenterY >= finishLine.y - lineHeight / 2 &&
    carCenterY <= finishLine.y + lineHeight / 2
  );
}

// Set to track currently pressed keys
const keysPressed = new Set();

function keyDownHandler(e) {
  keysPressed.add(e.key.toLowerCase());
  updateCarDirection();
}

function keyUpHandler(e) {
  keysPressed.delete(e.key.toLowerCase());
  updateCarDirection();
}

function updateCarDirection() {
  car.dx = 0;
  car.dy = 0;

  if (keysPressed.has("d")) {
    car.dx += car.speed;
  }
  if (keysPressed.has("a")) {
    car.dx -= car.speed;
  }
  if (keysPressed.has("w")) {
    car.dy -= car.speed;
  }
  if (keysPressed.has("s")) {
    car.dy += car.speed;
  }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

const canvas = document.getElementById("trackCanvas");
const ctx = canvas.getContext("2d");

let trackVisible = false;
let currentTrackImg = null;

// Fetch next F1 race and show info
async function fetchCurrentRace() {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races");
    const data = await res.json();

    const races = data.MRData.RaceTable.Races;
    const today = new Date();
    let nextRace = null;

    // Find next upcoming race
    for (const race of races) {
      const raceDate = new Date(race.date);
      if (raceDate >= today) {
        nextRace = race;
        break;
      }
    }

    if (!nextRace) {
      document.getElementById("raceInfo").innerHTML = "No more races this season.";
      return;
    }

    const raceDate = new Date(nextRace.date);
    const availableStart = new Date(raceDate);
    availableStart.setDate(raceDate.getDate() - 2);
    const availableEnd = new Date(raceDate);
    availableEnd.setDate(raceDate.getDate() + 1);

    const infoDiv = document.getElementById("raceInfo");
    infoDiv.innerHTML = `
      <h2>${nextRace.raceName}</h2>
      <p>Track: ${nextRace.Circuit.circuitName}</p>
      <p>Location: ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}</p>
      <p>Race Date: ${raceDate.toDateString()}</p>
      <p>Track Available: ${availableStart.toDateString()} – ${availableEnd.toDateString()}</p>
    `;

    // Load track
    loadTrackImage(nextRace.Circuit.circuitName);

    if (today >= availableStart && today <= availableEnd) {
    trackVisible = true; // show track automatically
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentTrackImg.onload = () => {
        if (trackVisible) {
            drawScene(); // draw track and car
        }
    };
    } else {
    infoDiv.innerHTML += `<p style="color:red;">Track not available for play today.</p>`;
    trackVisible = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    // Fetch and show weather forecast for the race day
    fetchWeather(nextRace.Circuit.Location.lat, nextRace.Circuit.Location.long, nextRace.date);

  } catch (error) {
    console.error("Error fetching race data:", error);
    document.getElementById("raceInfo").innerText = "Failed to load race data.";
  }
}

// Load track image based on circuit name
function loadTrackImage(circuitName) {
  const circuitMap = {
    "Circuit Gilles Villeneuve": "canada.avif",
    "Red Bull Ring": "austria.avif",
    // add more
  };

  const filename = circuitMap[circuitName];
  console.log("Loading track image filename:", filename);

  if (!filename) {
    alert("No image available for this circuit: " + circuitName);
    return;
  }

  currentTrackImg = new Image();
  currentTrackImg.src = `tracks/${filename}`;

  currentTrackImg.onload = () => {
    if (trackVisible) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentTrackImg, 0, 0, canvas.width, canvas.height);
    }
  };
}


// Fetch race day weather forecast from Open-Meteo for given lat/lon and date (YYYY-MM-DD)
async function fetchWeather(lat, lon, raceDate) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
              `&start_date=${raceDate}&end_date=${raceDate}` +
              `&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max` +
              `&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();

    // Extract the data for the race day
    const tempMax = data.daily.temperature_2m_max[0];
    const tempMin = data.daily.temperature_2m_min[0];
    const windMax = data.daily.windspeed_10m_max[0];
    const weatherCode = data.daily.weathercode[0];

    const weatherDescriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    const condition = weatherDescriptions[weatherCode] || "Unknown";

    const weatherDiv = document.getElementById("weatherInfo");
    weatherDiv.innerHTML = `
      <h3>Forecast for Race Day (${raceDate})</h3>
      <p>Max Temperature: ${tempMax} °C</p>
      <p>Min Temperature: ${tempMin} °C</p>
      <p>Max Wind Speed: ${windMax} km/h</p>
      <p>Conditions: ${condition}</p>
    `;
  } catch (error) {
    console.error("Weather fetch error:", error);
    document.getElementById("weatherInfo").innerText = "Failed to load weather forecast.";
  }
}

// Toggle showing/hiding the track image manually
function toggleTrack() {
  trackVisible = !trackVisible;
  drawScene(); // redraw scene to reflect track visibility
  updateToggleButtonText();
}

function updateToggleButtonText() {
  const btn = document.getElementById("toggleTrackBtn");
  btn.innerText = trackVisible ? "Hide Track" : "Show Track Temporarily";
}

// Add event listener for toggle button after DOM loaded
document.addEventListener("DOMContentLoaded", () => { 
  fetchCurrentRace();
  
  setInterval(() => {
    if (!trackVisible || gameOver) return;

    moveCar();
    moveAICars();

    // Check if player finishes
    if (hasCrossedFinish(car)) {
      gameOver = true;
      alert("You win!");
    }

    // Check if any AI finishes
    for (const ai of aiCars) {
      if (hasCrossedFinish(ai)) {
        gameOver = true;
        alert("AI wins!");
        break;
      }
    }

    drawScene();
  }, 20);

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
  document.getElementById("toggleTrackBtn").addEventListener("click", toggleTrack);
});

