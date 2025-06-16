# f1-realtime-racing

A JavaScript-based racing game that simulates real-time Formula 1 racing with weather forecasts, live track toggling, and basic AI pathfinding. Compete against AI cars on real F1 tracks and try to cross the finish line first!

Features:

Live Race Schedule: Fetches upcoming F1 races via the Ergast API.
Race Day Weather: Integrates with Open-Meteo for forecasts.
AI Racing Opponent: Basic angle-based pathfinding to follow waypoints.
Dynamic Track Rendering: Only shows the track during a limited time window (e.g., race weekend).
Manual Driving: Use WASD keys to control your car.
Finish Line Detection: End the race once a car crosses the checkered line.

How to Play:

1. Open http://172.20.10.3:3000/ in a modern browser.
2. Use W/A/S/D keys to steer your red car.
3. Beat the AI to the finish line!

Click "Show Track Temporarily" if outside the race window to preview the track.


Dependencies:
Ergast F1 API — for race data.
Open-Meteo API — for weather forecasts.

