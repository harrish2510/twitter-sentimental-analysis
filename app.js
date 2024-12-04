import React, { useState, useEffect } from 'react';
import './App.css'; // Create a separate CSS file for styling

function App() {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0); // Time remaining for next request

  // Effect to update the countdown timer
  useEffect(() => {
    // Check the remaining time every second
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(prevTime => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(timer); // Clean up the interval on unmount
  }, [timeRemaining]);

  const fetchSentiment = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze?country=India");
      if (!response.ok) {
        const errorData = await response.json();
        // If time_remaining is returned by the server, set the remaining time
        if (errorData.time_remaining) {
          const [minutes, seconds] = errorData.time_remaining.split(':').map(Number);
          setTimeRemaining(minutes * 60 + seconds); // Set the remaining time in seconds
        }
        throw new Error(errorData.error || "Error fetching data");
      }

      // If the request is successful, retrieve the chart image
      const chartImage = await response.blob();
      const imageUrl = URL.createObjectURL(chartImage);
      setSentimentData(imageUrl);

      // Reset the timer to 3 minutes (180 seconds) after a successful request
      setTimeRemaining(180);
    } catch (error) {
      setError(error.message);
      setSentimentData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Sentiment Analysis for Mental Health</h1>

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Button or Loading state */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <button onClick={fetchSentiment} disabled={timeRemaining > 0}>
          {timeRemaining > 0 ? `Next Request in ${timeRemaining}s` : 'Fetch Sentiment'}
        </button>
      )}

      {/* Displaying the sentiment chart image */}
      {sentimentData && <img src={sentimentData} alt="Sentiment Chart" />}
    </div>
  );
}

export default App;
