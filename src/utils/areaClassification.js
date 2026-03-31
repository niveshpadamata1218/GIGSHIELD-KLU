/**
 * Area Classification Utility
 * Classifies user location into area types and assigns risk scores
 */

/**
 * Classify area based on city name
 */
export const classifyArea = (city) => {
  if (!city) return 'urban'

  const cityNormalized = city.toLowerCase().trim()

  // Explicit city buckets from plan tables
  const urbanCities = ['hyderabad', 'mumbai', 'delhi', 'bangalore', 'bengaluru']
  const semiUrbanCities = ['warangal', 'vijayawada', 'indore', 'salem', 'coimbatore', 'nagpur']
  const semiRuralCities = ['smalltown1', 'smalltown2']

  if (urbanCities.includes(cityNormalized)) return 'urban'
  if (semiUrbanCities.includes(cityNormalized)) return 'semi-urban'
  if (semiRuralCities.includes(cityNormalized)) return 'semi-rural'

  // Keyword fallback classification for unknown inputs
  const ruralKeywords = ['village', 'remote', 'gaon', 'gram', 'forest', 'hilly', 'mountain']
  if (ruralKeywords.some((keyword) => cityNormalized.includes(keyword))) {
    return 'rural'
  }

  const semiRuralKeywords = ['small town', 'taluka', 'tahsil', 'block', 'mandal', 'subdivision']
  if (semiRuralKeywords.some((keyword) => cityNormalized.includes(keyword))) {
    return 'semi-rural'
  }

  const semiUrbanKeywords = ['tier-2', 'tier 2', 'second tier']
  if (semiUrbanKeywords.some((keyword) => cityNormalized.includes(keyword))) {
    return 'semi-urban'
  }

  return 'rural'
}

/**
 * Calculate risk score based on various factors
 */
export const calculateRiskScore = ({ weatherSeverity = 0, aqi = 0, zoneDensity = 0, gigActivity = 0 }) => {
  let score = 0
  
  // Weather severity contribution (0-20)
  score += Math.min(20, weatherSeverity * 2)
  
  // AQI contribution (0-20)
  score += Math.min(20, (aqi / 500) * 20)
  
  // Zone density contribution (0-20) - 1-100 scale
  score += Math.min(20, (zoneDensity / 100) * 20)
  
  // Gig activity contribution (0-40) - 1-100 scale
  score += Math.min(40, (gigActivity / 100) * 40)
  
  // Clamp score between 0-100
  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Recommend plan based on risk score
 */
export const recommendPlanByRisk = (riskScore) => {
  if (riskScore < 40) return 'Basic'
  if (riskScore <= 70) return 'Smart'
  return 'Pro'
}

/**
 * Get area display name
 */
export const getAreaDisplayName = (areaType) => {
  const displayNames = {
    rural: 'Rural',
    'semi-rural': 'Semi-Rural',
    'semi-urban': 'Semi-Urban',
    urban: 'Urban'
  }
  return displayNames[areaType] || 'Urban'
}

/**
 * Mock location detection (for development)
 * In production, replace with real Google Maps/Geocoding API
 */
export const mockDetectLocation = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const mockLocations = [
    { city: 'Hyderabad', state: 'Telangana', coordinates: [17.3850, 78.4867] },
    { city: 'Bangalore', state: 'Karnataka', coordinates: [12.9716, 77.5946] },
    { city: 'Mumbai', state: 'Maharashtra', coordinates: [19.0760, 72.8777] },
    { city: 'Delhi', state: 'Delhi', coordinates: [28.7041, 77.1025] },
    { city: 'Pune', state: 'Maharashtra', coordinates: [18.5204, 73.8567] },
    { city: 'Salem', state: 'Tamil Nadu', coordinates: [11.6643, 78.1460] },
    { city: 'Coimbatore', state: 'Tamil Nadu', coordinates: [11.0026, 76.6755] },
    { city: 'Nagpur', state: 'Maharashtra', coordinates: [21.1458, 79.0882] },
    { city: 'Indore', state: 'Madhya Pradesh', coordinates: [22.7196, 75.8577] }
  ]
  
  return mockLocations[Math.floor(Math.random() * mockLocations.length)]
}

/**
 * Real location detection using Google Maps Geocoding API
 * Requires GOOGLE_MAPS_API_KEY environment variable
 */
export const detectLocationWithGoogle = async (latitude, longitude) => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found, using mock location')
      return mockDetectLocation()
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    )
    
    if (!response.ok) throw new Error('Geocoding failed')
    
    const data = await response.json()
    if (data.results.length === 0) throw new Error('No results found')
    
    const addressComponents = data.results[0].address_components
    
    let city = ''
    let state = ''
    
    // Extract city and state from address components
    addressComponents.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name
      }
    })
    
    return {
      city: city || 'Unknown City',
      state: state || 'Unknown State',
      coordinates: [latitude, longitude]
    }
  } catch (error) {
    console.error('Location detection error:', error)
    return mockDetectLocation()
  }
}

/**
 * Get user location - tries real API, falls back to mock
 */
export const getUserLocation = async (options = {}) => {
  const { preferredCity = '', preferredState = '' } = options

  const resolvePreferred = () => ({
    city: preferredCity || 'Hyderabad',
    state: preferredState || 'Telangana',
    coordinates: []
  })

  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const location = await detectLocationWithGoogle(latitude, longitude)
          resolve(location)
        },
        () => {
          // If geolocation fails, use provided city fallback before mock.
          if (preferredCity) {
            resolve(resolvePreferred())
            return
          }
          mockDetectLocation().then(resolve)
        }
      )
    } else {
      // Geolocation not available, use provided city fallback before mock.
      if (preferredCity) {
        resolve(resolvePreferred())
        return
      }
      mockDetectLocation().then(resolve)
    }
  })
}
