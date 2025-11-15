import { db } from '@/service/firebaseConfig';
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { toast } from 'sonner';
import { 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Cloud, 
  Sun, 
  CloudRain,
  Thermometer,
  Droplet,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  ArrowLeft,
  Clock,
  Utensils,
  Home,
  Camera,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeatherIcon } from '@/service/weatherService';

function Viewtrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    if (tripId) {
      GetTripData();
    }
  }, [tripId]);

  const GetTripData = async () => {
    try {
      const docRef = doc(db, 'AITrips', tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTrip(data);
        
        // Parse trip data if it's a JSON string
        if (typeof data.tripData === 'string') {
          try {
            const parsedData = JSON.parse(data.tripData);
            setTripData(parsedData);
          } catch (e) {
            console.log('Trip data is not JSON, treating as text');
            setTripData(null);
          }
        } else {
          setTripData(data.tripData);
        }
      } else {
        console.log("No such document");
        toast("No trip found");
        navigate('/');
      }
    } catch (error) {
      console.error("Error getting trip:", error);
      toast("Error loading trip");
    } finally {
      setLoading(false);
    }
  };

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${tripData?.tripTitle || trip?.userSelection?.destination}`,
          text: 'Check out my AI-generated travel itinerary!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading your perfect trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Trip not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const userSelection = trip.userSelection || {};
  const weatherData = trip.weatherData;

  // If we have structured JSON data, use it; otherwise, display raw text
  if (tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="mb-4 lg:mb-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-4xl font-bold text-gray-800 mt-4 lg:mt-0">
                {tripData.tripTitle || userSelection.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userSelection.startLocation} → {userSelection.destination}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {userSelection.startDate} to {userSelection.endDate}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {userSelection.passengers} passenger(s)
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 lg:mt-0">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Trip Highlights */}
          {tripData.tripHighlights && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Trip Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tripData.tripHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Analysis */}
          {tripData.weatherAnalysis && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Cloud className="w-8 h-8 mr-3 text-blue-600" />
                Weather Analysis
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Expected Conditions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tripData.weatherAnalysis.expectedConditions}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Best Time To Visit</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tripData.weatherAnalysis.bestTimeToVisit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Itinerary</h2>
            <div className="space-y-4">
              {tripData.itinerary && tripData.itinerary.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div 
                    className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                    onClick={() => toggleDayExpansion(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">Day {day.day}</h3>
                        <h4 className="text-lg opacity-90">{day.title}</h4>
                        <p className="text-sm opacity-75">{day.date}</p>
                      </div>
                      {expandedDays[index] ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </div>
                  
                  {expandedDays[index] && (
                    <div className="p-6 bg-gray-50">
                      {/* Daily Schedule */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          {day.dailySchedule.morning && (
                            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Sun className="w-4 h-4 mr-2 text-yellow-600" />
                                Morning
                              </h5>
                              <p className="text-gray-600">{day.dailySchedule.morning}</p>
                            </div>
                          )}
                          
                          {day.dailySchedule.afternoon && (
                            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Sun className="w-4 h-4 mr-2 text-orange-600" />
                                Afternoon
                              </h5>
                              <p className="text-gray-600">{day.dailySchedule.afternoon}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {day.dailySchedule.evening && (
                            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                                Evening
                              </h5>
                              <p className="text-gray-600">{day.dailySchedule.evening}</p>
                            </div>
                          )}
                          
                          {day.dailySchedule.night && (
                            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                Night
                              </h5>
                              <p className="text-gray-600">{day.dailySchedule.night}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {day.foodRecommendations && day.foodRecommendations.length > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <Utensils className="w-4 h-4 mr-2 text-green-600" />
                              Food Recommendations
                            </h6>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {day.foodRecommendations.map((food, i) => (
                                <li key={i}>• {food}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {day.stayOptions && day.stayOptions.length > 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <Home className="w-4 h-4 mr-2 text-blue-600" />
                              Stay Options
                            </h6>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {day.stayOptions.map((stay, i) => (
                                <li key={i}>• {stay}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {day.optionalActivities && day.optionalActivities.length > 0 && (
                          <div className="p-4 bg-pink-50 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <Camera className="w-4 h-4 mr-2 text-pink-600" />
                              Optional Activities
                            </h6>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {day.optionalActivities.map((activity, i) => (
                                <li key={i}>• {activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {day.tip && (
                        <div className="mt-4 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                          <h6 className="font-semibold text-gray-800 mb-1">💡 Travel Guide Tip:</h6>
                          <p className="text-gray-700">{day.tip}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Budget Analysis */}
          {tripData.budgetAnalysis && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <IndianRupee className="w-8 h-8 mr-3 text-green-600" />
                Budget Range
              </h2>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-green-600 mb-2">
                  Total Estimated Cost
                </h3>
                <p className="text-xl text-gray-700">
                  {tripData.budgetAnalysis.totalEstimatedCost}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tripData.budgetAnalysis.breakdown || {}).map(([category, data]) => (
                  <div key={category} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 capitalize">{category}</h4>
                      <span className="text-sm text-gray-500">{data.percentage}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700">{data.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packing Checklist */}
          {(tripData.packingChecklist || tripData.weatherAnalysis?.packingRecommendations) && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Packing Checklist</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tripData.packingChecklist || tripData.weatherAnalysis?.packingRecommendations || []).map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback for non-JSON trip data
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Your Trip to {userSelection.destination}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-600">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {userSelection.startLocation} → {userSelection.destination}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {userSelection.startDate} to {userSelection.endDate}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {userSelection.passengers} passenger(s)
            </span>
          </div>
          
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {trip.tripData}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewtrip;