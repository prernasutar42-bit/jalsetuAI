import { useState, useCallback } from 'react';

// Haversine formula for distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation(districts = []) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const locateUser = useCallback(
    (onDistrictFound) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserLocation(coords);

          if (districts.length > 0) {
            let nearest = districts[0];
            let minDistance = Infinity;

            for (const d of districts) {
              const dist = getDistanceFromLatLonInKm(
                coords.latitude,
                coords.longitude,
                d.lat,
                d.lon
              );
              if (dist < minDistance) {
                minDistance = dist;
                nearest = d;
              }
            }

            if (onDistrictFound) {
              onDistrictFound(nearest, minDistance);
            }
          }
        },
        (err) => {
          setIsLocating(false);
          let message = 'Unable to retrieve location.';
          if (err.code === 1) {
            message = 'Location access was denied. Please allow location permissions.';
          } else if (err.code === 2) {
            message = 'Position unavailable. Check network or GPS connection.';
          } else if (err.code === 3) {
            message = 'Location request timed out.';
          }
          setError(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },
    [districts]
  );

  return {
    locateUser,
    isLocating,
    error,
    userLocation,
  };
}
