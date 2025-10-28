import { getJson } from "serpapi";
import { Locations } from "../models/locations";

export interface SerAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callSerpAPI(
  query: string,
  device: string,
  location: Location
): Promise<SerAPIResponse> {
  const data = await checkClosestLocation(location);
  return new Promise((resolve) => {
    const params = {
      engine: "google_shopping",
      q: query,
      device: device,
      location: data?.canonical_name || "Austin,Texas,United States",
      hl: "en",
      gl: "us",
      api_key: process.env.SERPAPI_API_KEY,
    };

    getJson(params, (json: any) => {
      if (json && json.shopping_results) {
        resolve({
          success: true,
          data: {
            products: json.shopping_results,
          },
        });
      } else {
        resolve({
          success: false,
          error: "No shopping results found",
        });
      }
    });
  });
}

export async function serpProductApi(
  productId: string
): Promise<SerAPIResponse> {
  // return new Promise((resolve) => {
  // getJson(
  //   JSON.stringify({
  //     engine: "google_product",
  //     product_id: productId,
  //     api_key: process.env.SERPAPI_API_KEY,
  //   }),
  //   (json) => {
  //     resolve({ success: true, data: json });
  //   },
  //   (error) => {
  //     resolve({
  //       success: false,
  //       error: error.message || "Unknown error occurred",
  //     });
  //   }
  // );
  // });
  return { success: false, data: {} };
}

// Constants for Earth's radius in different units
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = 6371000;

// Helper function to calculate distance between two GPS coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "km" | "m" = "km"
): number => {
  const R = unit === "km" ? EARTH_RADIUS_KM : EARTH_RADIUS_METERS;

  // Convert degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

interface Location {
  longitude: number;
  latitude: number;
}

interface LocationResult {
  canonical_name: string;
  distance: number;
  coordinates: [number, number];
}

const checkClosestLocation = async (
  location: Location
): Promise<any | null> => {
  // Validate input
  if (!location?.longitude || !location?.latitude) {
    console.warn("Invalid location data provided");
    return null;
  }

  // Validate coordinate ranges
  if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
    console.warn("Invalid coordinate values");
    return null;
  }

  try {
    // Use MongoDB's geospatial query to find nearby locations
    const nearbyLocations = await Locations.find({
      gps: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          $maxDistance: 100000, // 100km radius in meters
        },
      },
    })
      .limit(10)
      .lean<Array<{ gps: [number, number]; canonical_name: string }>>(); // Use lean for better performance
    // Early return if no locations found
    if (nearbyLocations.length === 0) {
      return null;
    }

    // Find the closest location using reduce
    const closestLocation = nearbyLocations.reduce<{
      result: LocationResult | null;
      minDistance: number;
    }>(
      (acc, loc) => {
        if (!loc.gps || loc.gps.length !== 2) return acc;

        const [longitude, latitude] = loc.gps;
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          latitude,
          longitude,
          "km"
        );

        if (distance < acc.minDistance) {
          return {
            result: {
              canonical_name: loc.canonical_name,
              distance,
              coordinates: [longitude, latitude],
            },
            minDistance: distance,
          };
        }
        return acc;
      },
      { result: null, minDistance: Infinity }
    );

    return closestLocation.result || null;
  } catch (error) {
    console.error("Error finding closest location:", error);
    // Consider adding error logging service here
    return null;
  }
};
export { checkClosestLocation };
