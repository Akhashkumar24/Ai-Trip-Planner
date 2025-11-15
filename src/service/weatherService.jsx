const OPENWEATHER_API_KEY = 'd5fe821ef3b868fee4e93a4571e5f74';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (cityName, countryCode = '') => {
  try {
    const query = countryCode ? `${cityName},${countryCode}` : cityName;
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!currentWeatherResponse.ok) {
      throw new Error('Weather data not found');
    }
    
    const currentWeather = await currentWeatherResponse.json();
    
    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    
    return {
      current: currentWeather,
      forecast: forecastData
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!currentWeatherResponse.ok) {
      throw new Error('Weather data not found');
    }
    
    const currentWeather = await currentWeatherResponse.json();
    
    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    
    return {
      current: currentWeather,
      forecast: forecastData
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

export const analyzeWeatherForTrip = (weatherData, startDate, endDate) => {
  if (!weatherData) return null;
  
  const { current, forecast } = weatherData;
  
  // Calculate trip duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const tripDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Current weather analysis
  const currentTemp = Math.round(current.main.temp);
  const feelsLike = Math.round(current.main.feels_like);
  const humidity = current.main.humidity;
  const description = current.weather[0].description;
  const weatherCondition = current.weather[0].main.toLowerCase();
  
  // Forecast analysis for trip dates
  let tripForecast = [];
  let avgTemp = 0;
  let tempCount = 0;
  let rainDays = 0;
  let conditions = {};
  
  if (forecast && forecast.list) {
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    
    forecast.list.forEach(item => {
      const forecastDate = new Date(item.dt * 1000);
      const forecastTimestamp = forecastDate.getTime();
      
      if (forecastTimestamp >= startTimestamp && forecastTimestamp <= endTimestamp) {
        tripForecast.push({
          date: forecastDate.toLocaleDateString(),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        });
        
        avgTemp += item.main.temp;
        tempCount++;
        
        const condition = item.weather[0].main.toLowerCase();
        conditions[condition] = (conditions[condition] || 0) + 1;
        
        if (condition.includes('rain') || condition.includes('drizzle')) {
          rainDays++;
        }
      }
    });
  }
  
  const avgTripTemp = tempCount > 0 ? Math.round(avgTemp / tempCount) : currentTemp;
  const mostCommonCondition = Object.keys(conditions).reduce((a, b) => 
    conditions[a] > conditions[b] ? a : b, 'clear'
  );
  
  // Generate weather insights
  const insights = generateWeatherInsights({
    currentTemp,
    avgTripTemp,
    humidity,
    weatherCondition,
    mostCommonCondition,
    rainDays,
    tripDays,
    description
  });
  
  return {
    current: {
      temperature: currentTemp,
      feelsLike,
      humidity,
      description,
      condition: weatherCondition
    },
    tripForecast,
    analysis: {
      averageTemperature: avgTripTemp,
      expectedConditions: mostCommonCondition,
      rainDays,
      totalDays: tripDays,
      insights
    }
  };
};

const generateWeatherInsights = (data) => {
  const { currentTemp, avgTripTemp, humidity, mostCommonCondition, rainDays, tripDays } = data;
  
  let insights = {
    expectedConditions: '',
    bestTimeToVisit: '',
    packingRecommendations: [],
    activitySuggestions: []
  };
  
  // Temperature analysis
  if (avgTripTemp >= 30) {
    insights.expectedConditions = `Expect warm to hot weather with average temperatures around ${avgTripTemp}°C (${Math.round(avgTripTemp * 9/5 + 32)}°F). High humidity levels around ${humidity}% will make it feel warmer.`;
    insights.packingRecommendations.push('Lightweight, breathable clothing', 'Sunscreen and sunglasses', 'Hat for sun protection', 'Plenty of water bottles');
    insights.activitySuggestions.push('Early morning or evening sightseeing', 'Indoor attractions during midday', 'Beachside activities');
  } else if (avgTripTemp >= 20) {
    insights.expectedConditions = `Pleasant weather expected with comfortable temperatures averaging ${avgTripTemp}°C (${Math.round(avgTripTemp * 9/5 + 32)}°F). Humidity around ${humidity}%.`;
    insights.packingRecommendations.push('Light layers for flexibility', 'Comfortable walking shoes', 'Light jacket for evenings');
    insights.activitySuggestions.push('Perfect for outdoor exploration', 'Walking tours', 'Outdoor dining');
  } else {
    insights.expectedConditions = `Cool weather with temperatures around ${avgTripTemp}°C (${Math.round(avgTripTemp * 9/5 + 32)}°F). Pack accordingly for cooler conditions.`;
    insights.packingRecommendations.push('Warm layers', 'Waterproof jacket', 'Comfortable boots', 'Warm accessories');
    insights.activitySuggestions.push('Museum visits', 'Indoor cultural activities', 'Cozy cafes and restaurants');
  }
  
  // Rain analysis
  if (rainDays > tripDays * 0.5) {
    insights.expectedConditions += ` Expect frequent rainfall during your trip (${rainDays} out of ${tripDays} days), creating a cozy, monsoon atmosphere.`;
    insights.packingRecommendations.push('Waterproof rain gear', 'Umbrella', 'Quick-dry clothing', 'Waterproof bags for electronics');
    insights.activitySuggestions.push('Indoor attractions', 'Covered markets', 'Traditional architecture tours', 'Local cultural experiences');
  } else if (rainDays > 0) {
    insights.expectedConditions += ` Some rainfall expected (${rainDays} days), adding freshness to the air.`;
    insights.packingRecommendations.push('Light rain jacket', 'Small umbrella');
  }
  
  // Best time analysis
  if (mostCommonCondition === 'clear' || mostCommonCondition === 'sunny') {
    insights.bestTimeToVisit = 'Excellent timing! Clear skies and sunny weather make this perfect for outdoor activities and sightseeing.';
  } else if (mostCommonCondition === 'rain') {
    insights.bestTimeToVisit = 'This period offers a unique monsoon experience with lush greenery and fewer crowds, though indoor backup plans are recommended.';
  } else if (mostCommonCondition === 'clouds') {
    insights.bestTimeToVisit = 'Good timing with comfortable cloudy weather - perfect for walking around without harsh sun exposure.';
  }
  
  return insights;
};

export const getWeatherIcon = (condition) => {
  const iconMap = {
    clear: '☀️',
    sunny: '☀️',
    clouds: '⛅',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '❄️',
    mist: '🌫️',
    fog: '🌫️',
    haze: '🌫️'
  };
  
  return iconMap[condition.toLowerCase()] || '🌤️';
};