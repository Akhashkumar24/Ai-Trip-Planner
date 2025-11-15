import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';
import { chatSession } from '@/service/AIModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from "firebase/firestore";
import { db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, IndianRupee, Plane, Cloud, Home, Utensils, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeatherData, analyzeWeatherForTrip } from '@/service/weatherService';

// Travel themes
const travelThemes = [
  { id: 'adventure', name: 'Adventure', icon: '🏔️', desc: 'Thrilling experiences and outdoor activities' },
  { id: 'relaxation', name: 'Relaxation', icon: '🏖️', desc: 'Peaceful and rejuvenating experiences' },
  { id: 'cultural', name: 'Cultural', icon: '🏛️', desc: 'Museums, history, and local traditions' },
  { id: 'romantic', name: 'Romantic', icon: '💕', desc: 'Perfect for couples and intimate moments' },
  { id: 'family', name: 'Family Fun', icon: '👨‍👩‍👧‍👦', desc: 'Activities for all family members' },
  { id: 'foodie', name: 'Foodie', icon: '🍜', desc: 'Culinary experiences and local cuisine' },
  { id: 'nature', name: 'Nature', icon: '🌿', desc: 'Wildlife, parks, and natural beauty' },
  { id: 'urban', name: 'Urban Explorer', icon: '🏙️', desc: 'City life, shopping, and nightlife' }
];

// Travel pace options
const travelPace = [
  { id: 'slow', name: 'Slow & Steady', icon: '🐌', desc: 'Take time to enjoy each moment' },
  { id: 'moderate', name: 'Balanced', icon: '⚖️', desc: 'Mix of relaxation and activity' },
  { id: 'fast', name: 'Action-Packed', icon: '⚡', desc: 'See and do as much as possible' }
];

// Weather preferences
const weatherPreferences = [
  { id: 'sunny', name: 'Sunny & Warm', icon: '☀️', desc: 'Perfect beach weather' },
  { id: 'mild', name: 'Mild & Pleasant', icon: '🌤️', desc: 'Comfortable temperatures' },
  { id: 'cool', name: 'Cool & Crisp', icon: '🌨️', desc: 'Perfect for cozy activities' },
  { id: 'rainy', name: 'Rainy & Cozy', icon: '🌧️', desc: 'Love the monsoon charm' }
];

// Accommodation types
const accommodationTypes = [
  { id: 'budget', name: 'Budget Hotels', icon: '🏨', desc: 'Clean and comfortable basics' },
  { id: '3star', name: '3-Star Hotels', icon: '⭐', desc: 'Good amenities and service' },
  { id: '4star', name: '4-Star Hotels', icon: '✨', desc: 'Luxury amenities and comfort' },
  { id: 'luxury', name: 'Luxury Resorts', icon: '🏖️', desc: 'Premium experiences' },
  { id: 'boutique', name: 'Boutique Hotels', icon: '🏩', desc: 'Unique and stylish properties' },
  { id: 'homestay', name: 'Homestays', icon: '🏡', desc: 'Local family experiences' }
];

// Food preferences
const foodPreferences = [
  { id: 'local', name: 'Local Cuisine', icon: '🍛', desc: 'Authentic regional dishes' },
  { id: 'international', name: 'International', icon: '🍕', desc: 'Global food options' },
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥗', desc: 'Plant-based options' },
  { id: 'street', name: 'Street Food', icon: '🍡', desc: 'Local street food adventures' },
  { id: 'fine', name: 'Fine Dining', icon: '🍷', desc: 'High-end restaurant experiences' },
  { id: 'casual', name: 'Casual Dining', icon: '🍔', desc: 'Comfortable restaurant meals' }
];

// Transportation modes
const transportationModes = [
  { id: 'flight', name: 'Flight', icon: '✈️', desc: 'Fastest way to reach' },
  { id: 'train', name: 'Train', icon: '🚄', desc: 'Comfortable and scenic' },
  { id: 'bus', name: 'Bus', icon: '🚌', desc: 'Budget-friendly option' },
  { id: 'car', name: 'Car/Taxi', icon: '🚗', desc: 'Door-to-door convenience' }
];

// Currency options (focusing on INR as default)
const currencies = [
  { id: 'INR', name: 'INR - Indian rupee', symbol: '₹' },
  { id: 'USD', name: 'USD - US Dollar', symbol: '$' },
  { id: 'EUR', name: 'EUR - Euro', symbol: '€' },
  { id: 'GBP', name: 'GBP - British Pound', symbol: '£' }
];

function CreateTrip() {
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    startDate: '',
    endDate: '',
    theme: '',
    pace: '',
    weather: '',
    accommodation: '',
    food: '',
    transportation: '',
    currency: 'INR',
    budget: '',
    passengers: 1,
    additionalPreferences: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.startLocation || !formData.destination) {
          toast('Please fill in both starting location and destination');
          return false;
        }
        return true;
      case 2:
        if (!formData.startDate || !formData.endDate) {
          toast('Please select your travel dates');
          return false;
        }
        return true;
      case 3:
        return true; // Optional fields
      case 4:
        if (!formData.currency || !formData.budget || formData.passengers < 1) {
          toast('Please fill in currency, budget, and number of passengers');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const onGenerateTrip = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setOpenDialog(true);
      return;
    }

    const totalDays = calculateDays();
    if (totalDays === 0) {
      toast('Please select valid travel dates');
      return;
    }

    setLoading(true);

    try {
      // Get weather data for destination
      const weatherData = await getWeatherData(formData.destination);
      const weatherAnalysis = weatherData ? 
        analyzeWeatherForTrip(weatherData, formData.startDate, formData.endDate) : null;

      // Build comprehensive AI prompt with weather data
      let weatherInfo = '';
      if (weatherAnalysis) {
        weatherInfo = `
        WEATHER INFORMATION FOR ${formData.destination}:
        - Current temperature: ${weatherAnalysis.current.temperature}°C
        - Weather condition: ${weatherAnalysis.current.description}
        - Humidity: ${weatherAnalysis.current.humidity}%
        - Expected conditions during trip: ${weatherAnalysis.analysis.expectedConditions}
        - Average temperature during stay: ${weatherAnalysis.analysis.averageTemperature}°C
        - Rainy days expected: ${weatherAnalysis.analysis.rainDays} out of ${weatherAnalysis.analysis.totalDays} days
        - Weather insights: ${weatherAnalysis.analysis.insights.expectedConditions}
        - Best time to visit analysis: ${weatherAnalysis.analysis.insights.bestTimeToVisit}
        `;
      }

      const prompt = `Generate a comprehensive Travel Plan in JSON format for:
      
      TRIP DETAILS:
      - Starting from: ${formData.startLocation}
      - Destination: ${formData.destination}
      - Travel dates: ${formData.startDate} to ${formData.endDate}
      - Duration: ${totalDays} days
      - Travelers: ${formData.passengers} passenger(s)
      - Budget: ${formData.currency} ${formData.budget || 'Flexible budget'}
      - Travel theme: ${formData.theme || 'flexible'}
      - Pace preference: ${formData.pace || 'moderate'}
      - Weather preference: ${formData.weather || 'any'}
      - Accommodation: ${formData.accommodation || 'mid-range'}
      - Food preference: ${formData.food || 'local cuisine'}
      - Transportation: ${formData.transportation || 'convenient'}
      - Additional preferences: ${formData.additionalPreferences || 'Open to suggestions'}
      
      ${weatherInfo}
      
      Please provide a detailed response in this JSON format:
      {
        "tripTitle": "Destination, Country",
        "tripHighlights": ["highlight1", "highlight2", "highlight3"],
        "weatherAnalysis": {
          "expectedConditions": "Detailed weather description",
          "bestTimeToVisit": "Analysis of timing",
          "packingRecommendations": ["item1", "item2"]
        },
        "itinerary": [
          {
            "day": 1,
            "title": "Day title",
            "date": "YYYY-MM-DD",
            "dailySchedule": {
              "morning": "Morning activities description",
              "afternoon": "Afternoon activities description", 
              "evening": "Evening activities description",
              "night": "Night activities description"
            },
            "foodRecommendations": ["recommendation1", "recommendation2"],
            "stayOptions": ["option1", "option2"],
            "optionalActivities": ["activity1", "activity2"],
            "tip": "Daily tip for travelers"
          }
        ],
        "budgetAnalysis": {
          "totalEstimatedCost": "${formData.currency} XX,XXX—${formData.currency} XX,XXX",
          "breakdown": {
            "transport": {
              "percentage": "XX%",
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            },
            "accommodation": {
              "percentage": "XX%", 
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            },
            "food": {
              "percentage": "XX%",
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            },
            "activities": {
              "percentage": "XX%",
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            },
            "insurance": {
              "percentage": "XX%",
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            },
            "contingency": {
              "percentage": "XX%",
              "amount": "${formData.currency} X,XXX—${formData.currency} X,XXX"
            }
          }
        },
        "packingChecklist": ["item1", "item2", "item3"]
      }
      
      Make this plan detailed, culturally authentic, and perfectly tailored to the weather conditions and user preferences.`;

      const result = await chatSession.sendMessage(prompt);
      const tripData = result?.response?.text();
      SaveAiTrip(tripData, weatherAnalysis);
    } catch (error) {
      console.error('Error generating trip:', error);
      toast('Error generating trip. Please try again.');
      setLoading(false);
    }
  };

  const SaveAiTrip = async (TripData, weatherAnalysis) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const docId = Date.now().toString();
      
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: TripData,
        weatherData: weatherAnalysis,
        userEmail: user?.email,
        id: docId,
        createdAt: new Date().toISOString()
      });
      
      setLoading(false);
      navigate('/view-trip/' + docId);
    } catch (error) {
      console.error('Error saving trip:', error);
      toast('Error saving trip. Please try again.');
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error)
  });

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      onGenerateTrip();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
      toast('Error signing in. Please try again.');
    });
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-12">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300
            ${currentStep >= step ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'}`}>
            {step}
          </div>
          {step < 4 && <div className={`w-16 h-1 transition-all duration-300 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
        </div>
      ))}
    </div>
  );

  const OptionCard = ({ option, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected 
          ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="text-3xl mb-2 text-center">{option.icon}</div>
      <h3 className="font-semibold text-lg mb-1 text-center">{option.name}</h3>
      <p className="text-sm text-gray-600 text-center">{option.desc}</p>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className="text-center mb-12">
          <h1 className='font-bold text-4xl text-gray-800 mb-4'>Plan Your Perfect Trip ✈️</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Tell us about your dream getaway and we'll create a personalized itinerary with weather insights and detailed budget breakdown.
          </p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Location & Destination */}
          {currentStep === 1 && (
            <div className='space-y-8'>
              <div className="text-center mb-8">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Where's your journey?</h2>
                <p className='text-gray-600'>Let's start with your departure and destination</p>
              </div>

              <div className='space-y-6'>
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block flex items-center'>
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Where are you starting your trip from?
                  </label>
                  <Input 
                    placeholder='e.g., Goa, India' 
                    value={formData.startLocation}
                    onChange={(e) => handleInputChange('startLocation', e.target.value)}
                    className="h-14 text-lg border-2 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block flex items-center'>
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Search for your destination country/city
                  </label>
                  <Input 
                    placeholder='Search for places...' 
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="h-14 text-lg border-2 focus:border-blue-500 rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g., Rameswaram, Tamil Nadu, India</p>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button onClick={nextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl">
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {currentStep === 2 && (
            <div className='space-y-8'>
              <div className="text-center mb-8">
                <CalendarDays className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Select Dates</h2>
                <p className='text-gray-600'>When would you like to travel?</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block'>Start Date</label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="h-14 text-lg border-2 focus:border-blue-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block'>End Date</label>
                  <Input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-14 text-lg border-2 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-lg font-semibold text-blue-800">
                    Trip Duration: {calculateDays()} days
                  </p>
                  <p className="text-sm text-blue-600">
                    {formData.startDate} – {formData.endDate}
                  </p>
                </div>
              )}

              <div className='flex justify-between'>
                <Button variant="outline" onClick={prevStep} size="lg" className="px-8 py-3 rounded-xl">
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={nextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl">
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences (Optional) */}
          {currentStep === 3 && (
            <div className='space-y-10'>
              <div className="text-center mb-8">
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Customize Your Experience</h2>
                <p className='text-gray-600'>These preferences help us create your perfect trip (Optional)</p>
              </div>

              {/* Travel Theme */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Which of these travel themes best describes your dream getaway? (Optional)</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {travelThemes.map((theme) => (
                    <OptionCard
                      key={theme.id}
                      option={theme}
                      isSelected={formData.theme === theme.id}
                      onClick={() => handleInputChange('theme', theme.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Travel Pace */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>What pace of travel do you prefer? (Optional)</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {travelPace.map((pace) => (
                    <OptionCard
                      key={pace.id}
                      option={pace}
                      isSelected={formData.pace === pace.id}
                      onClick={() => handleInputChange('pace', pace.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Weather Preference */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>What kind of weather do you prefer for your trip? (Optional)</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {weatherPreferences.map((weather) => (
                    <OptionCard
                      key={weather.id}
                      option={weather}
                      isSelected={formData.weather === weather.id}
                      onClick={() => handleInputChange('weather', weather.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>What type of accommodation would you prefer? (Optional)</h3>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {accommodationTypes.map((accommodation) => (
                    <OptionCard
                      key={accommodation.id}
                      option={accommodation}
                      isSelected={formData.accommodation === accommodation.id}
                      onClick={() => handleInputChange('accommodation', accommodation.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Food Preference */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>What type of food would you like to enjoy during your trip? (Optional)</h3>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {foodPreferences.map((food) => (
                    <OptionCard
                      key={food.id}
                      option={food}
                      isSelected={formData.food === food.id}
                      onClick={() => handleInputChange('food', food.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Transportation */}
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>How would you like to travel from departure to destination? (Optional)</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {transportationModes.map((transport) => (
                    <OptionCard
                      key={transport.id}
                      option={transport}
                      isSelected={formData.transportation === transport.id}
                      onClick={() => handleInputChange('transportation', transport.id)}
                    />
                  ))}
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant="outline" onClick={prevStep} size="lg" className="px-8 py-3 rounded-xl">
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={nextStep} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl">
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Budget & Final Details */}
          {currentStep === 4 && (
            <div className='space-y-8'>
              <div className="text-center mb-8">
                <IndianRupee className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Budget & Final Details</h2>
                <p className='text-gray-600'>Help us plan within your budget</p>
              </div>

              <div className='space-y-6'>
                {/* Currency Selection */}
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block'>Which currency would you like to use for your trip? (Optional)</label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {currencies.map((currency) => (
                      <div
                        key={currency.id}
                        onClick={() => handleInputChange('currency', currency.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          formData.currency === currency.id 
                            ? 'border-blue-600 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2 text-center">{currency.symbol}</div>
                        <h4 className="font-semibold text-center">{currency.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Input */}
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block'>
                    What is your estimated travel budget? ({formData.currency}) (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-gray-600">
                      {currencies.find(c => c.id === formData.currency)?.symbol}
                    </span>
                    <Input 
                      type="number" 
                      placeholder={`e.g. ${formData.currency} 43300`}
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="h-14 text-lg pl-12 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block flex items-center'>
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    How many passengers? (Required)
                  </label>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="1 adult"
                    value={formData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 1)}
                    className="h-14 text-lg border-2 focus:border-blue-500 rounded-xl"
                  />
                </div>

                {/* Additional Preferences */}
                <div>
                  <label className='text-lg font-semibold text-gray-700 mb-3 block'>Any additional preferences or specific places/activities you'd like to include? (Optional)</label>
                  <textarea
                    placeholder="e.g., I want to visit the Ramanathaswamy Temple, go for temple hopping, or try local South Indian cuisine..."
                    value={formData.additionalPreferences}
                    onChange={(e) => handleInputChange('additionalPreferences', e.target.value)}
                    className="w-full h-32 p-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none text-lg"
                  />
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant="outline" onClick={prevStep} size="lg" className="px-8 py-3 rounded-xl">
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button 
                  onClick={onGenerateTrip} 
                  disabled={loading}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl shadow-lg"
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className='w-5 h-5 mr-2 animate-spin' />
                      Creating Your Perfect Trip...
                    </>
                  ) : (
                    <>
                      Generate My Trip ✨
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sign In Dialog */}
        <Dialog open={openDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>
                <div className="text-center space-y-4">
                  <h2 className='font-bold text-2xl'>🌟 Almost There!</h2>
                  <p className="text-gray-600">Sign in to save and access your personalized travel plan</p>
                  <Button
                    onClick={login}
                    className="w-full mt-6 flex gap-4 items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl">
                    <FcGoogle className="h-6 w-6" />
                    Continue with Google
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateTrip;