export const SelectTravelList = [
    {
        id:1,
        title: 'Just Me',
        desc: 'A sole traveler in exploration',
        icon: '✈️',
        people:'1 person'
    },
    {
        id:2,
        title: 'A Couple',
        desc: 'Two travelers in tandem',
        icon: '🥂',
        people:'2 people'
    },
    {
        id:3,
        title: 'Family',
        desc: 'A group of fun loving adventurers',
        icon: '🏡',
        people:'3 to 5 People'
    },
    {
        id:4,
        title: 'Friends',
        desc: 'A bunch of thrill-seekers',
        icon: '⛵',
        people:'5 to 10 people'
    }
]

export const SelectBudgetOptions = [
    {
        id:1,
        title: 'Cheap',
        desc: 'Stay conscious of costs',
        icon: '💵',
    },
    {
        id:2,
        title: 'Moderate',
        desc: 'Keep cost on the average side',
        icon: '💰',
    },
    {
        id:3,
        title: 'Luxury',
        desc: 'Dont worry about cost',
        icon: '💸',
    }
]

export const AI_PROMPT = `Generate a comprehensive Travel Plan for Location: {location}, for {totalDays} Days for {traveler} with a {budget} budget. 

Please provide the response in the following JSON format:
{
  "hotel_options": [
    {
      "name": "Hotel Name",
      "address": "Full Address",
      "price": "Price range per night",
      "image_url": "Hotel image URL (placeholder if needed)",
      "geo_coordinates": "latitude,longitude", 
      "rating": "Star rating",
      "description": "Brief hotel description"
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "plan": [
        {
          "time": "Time slot (e.g., Morning 9:00 AM - 12:00 PM)",
          "place": "Place Name",
          "details": "Detailed description of the place and activities",
          "image_url": "Place image URL (placeholder if needed)",
          "geo_coordinates": "latitude,longitude",
          "ticket_pricing": "Entry fee or cost",
          "rating": "Rating out of 5 stars",
          "time_to_travel": "Recommended time to spend"
        }
      ]
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Tailor all recommendations based on the user's specific preferences mentioned above
2. If user dislikes certain attractions/activities, completely exclude them from the itinerary
3. If user loves certain attractions/activities, prioritize and include multiple related options
4. Consider the budget when suggesting hotels and activities
5. Ensure the itinerary flows logically geographically to minimize travel time
6. Include diverse activities suitable for the specified group size
7. Provide realistic pricing in local currency
8. Include the best times to visit each location to avoid crowds
9. Make sure all places and hotels actually exist in the specified location
10. Balance indoor and outdoor activities based on typical weather`