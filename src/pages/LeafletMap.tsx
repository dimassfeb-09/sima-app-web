import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import LatLngExpression
import { Marker } from "../types/marker";
import { Users } from "../types/user";
import { fetchOrganizationByUserId } from "../models/organizations";
import { Organization } from "../types/organization";
import axios from "axios";

export default function LeafletMapComponent({
  markers,
  userInfo,
}: {
  markers: Marker[] | null;
  userInfo: Users | null;
}) {
  const mapRef = useRef<any>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentCoordinate, setCurrentCoordinate] = useState<
    [number, number] | null
  >(null);
  const [zoomCoordinate, setZoomCoordinate] = useState<number>(16);
  const polylineRef = useRef<L.Polyline | null>(null); // Reference for the polyline
  const lastCircleRef = useRef<L.Circle | null>(null); // Reference for the last clicked circle

  const fetchOrganizationInfo = async () => {
    try {
      const { data, error } = await fetchOrganizationByUserId(userInfo?.id!);
      setOrganization(data);

      if (error) {
        throw error;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "process":
        return "blue";
      case "success":
        return "green";
      case "error":
        return "red";
      default:
        return "grey";
    }
  };

  useEffect(() => {
    fetchOrganizationInfo();

    if (userInfo && organization) {
      const {
        latitude: organizationLatitude,
        longitude: organizationLongitude,
      } = organization;
      const initialCoordinate: [number, number] = [
        organizationLatitude,
        organizationLongitude,
      ];
      setCurrentCoordinate(initialCoordinate);

      // Initialize map
      mapRef.current = L.map("map", {
        center: initialCoordinate,
        zoom: zoomCoordinate,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      const customIcon = L.icon({
        iconUrl: "assets/map/marker.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add organization marker
      if (
        organization?.latitude !== undefined &&
        organization?.longitude !== undefined
      ) {
        L.marker([organization.latitude, organization.longitude], {
          icon: customIcon,
        }).addTo(mapRef.current).bindPopup(`
            <div>
              <strong>${organization.name}</strong><br />
              Latitude: ${organization.latitude}<br />
              Longitude: ${organization.longitude}
            </div>`);
      }

      // Add other markers
      markers
        ?.filter(
          (marker) => marker.status !== "success" && marker.status !== "error"
        )
        .forEach((marker) => {
          const color = getStatusStyle(marker.status!);
          const circle = L.circle([marker.latitude, marker.longitude], {
            radius: 20,
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
          }).addTo(mapRef.current).bindPopup(`
          <div>
            <p class="w-min px-1 py-1 text-white rounded bg-${color}-500">${marker.status}</p> 
            <div class="font-bold text-xl">${marker.name}</div>
            <div>Alamat: ${marker.address}</div>
            <div>Latitude: ${marker.latitude}</div>
            <div>Longitude: ${marker.longitude}</div>
            <div class="mt-5">
              <a
                href="https://www.google.com/maps/dir/?api=1&origin=${organization.latitude},${organization.longitude}&destination=${marker.latitude},${marker.longitude}&travelmode=driving"
                target="_blank" // Open in a new tab
                rel="noopener noreferrer"
                class="mt-2"
              >
                Lihat Rute
              </a>
            </div>
          </div>`);

          // Animation logic
          const minRadius = 20;
          const maxRadius = 50;
          const step = 2;
          let growing = true;

          const animate = () => {
            const currentRadius = circle.getRadius();
            if (growing) {
              if (currentRadius < maxRadius) {
                circle.setRadius(currentRadius + step);
              } else {
                growing = false;
              }
            } else {
              if (currentRadius > minRadius) {
                circle.setRadius(currentRadius - step);
              } else {
                growing = true;
              }
            }
            setTimeout(animate, 200);
          };

          animate();

          // Add click event to circle to create polyline
          circle.on("click", () => {
            if (lastCircleRef.current) {
              mapRef.current.removeLayer(polylineRef.current!); // Remove previous polyline
            }

            lastCircleRef.current = circle; // Update last clicked circle reference
            setCurrentCoordinate([marker.latitude, marker.longitude]);
            setZoomCoordinate(16.5); // Adjust zoom level

            // Draw line from organization to the clicked marker
            if (organization) {
              const organizationCoords: L.LatLngTuple = [
                organization.latitude,
                organization.longitude,
              ];
              const markerCoords: L.LatLngTuple = [
                marker.latitude,
                marker.longitude,
              ];

              fetchRoute(organizationCoords, markerCoords).then(
                (routeCoordinates) => {
                  if (routeCoordinates) {
                    polylineRef.current = L.polyline(routeCoordinates, {
                      color: "blue",
                      weight: 4,
                      opacity: 0.7,
                    }).addTo(mapRef.current); // Add the new polyline to the map
                  }
                }
              );
            }
          });
        });

      return () => {
        mapRef.current.remove();
      };
    }
  }, [markers, userInfo]);

  // Effect to update map position when currentCoordinate changes
  useEffect(() => {
    if (currentCoordinate && mapRef.current) {
      mapRef.current.setView(currentCoordinate, zoomCoordinate); // Set view to the current coordinate and zoom level
    }
  }, [currentCoordinate, zoomCoordinate]); // Depend on both currentCoordinate and zoomCoordinate

  const fetchRoute = async (start: L.LatLngTuple, end: L.LatLngTuple) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full`;

    try {
      const response = await axios.get(url);
      const route = response.data.routes[0];

      // Decode the geometry string to get the route coordinates
      const coordinates = decodePolyline(route.geometry);
      return coordinates;
    } catch (error) {
      console.error("Error fetching route data:", error);
      return null;
    }
  };

  // Function to decode polyline into LatLng coordinates
  const decodePolyline = (encoded: string): L.LatLngTuple[] => {
    const coordinates: L.LatLngTuple[] = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      let continuation = true;

      while (continuation) {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
        continuation = b >= 0x20;
      }

      const deltaLat = (result >> 1) ^ -(result & 1);
      lat += deltaLat;

      shift = 0;
      result = 0;
      continuation = true;

      while (continuation) {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
        continuation = b >= 0x20;
      }

      const deltaLng = (result >> 1) ^ -(result & 1);
      lng += deltaLng;

      coordinates.push([lat / 1e5, lng / 1e5]);
    }

    return coordinates;
  };

  const handleCardClick = async (mark: Marker) => {
    setCurrentCoordinate([mark.latitude, mark.longitude]);
    setZoomCoordinate(16.5); // Adjust zoom level as desired when card is clicked

    // Draw line from organization to the clicked marker
    if (organization) {
      const organizationCoords: L.LatLngTuple = [
        organization.latitude,
        organization.longitude,
      ];
      const markerCoords: L.LatLngTuple = [mark.latitude, mark.longitude];

      const routeCoordinates = await fetchRoute(
        organizationCoords,
        markerCoords
      );

      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current); // Remove existing polyline if it exists
      }

      if (routeCoordinates) {
        polylineRef.current = L.polyline(routeCoordinates, {
          color: "blue",
          weight: 4,
          opacity: 0.7,
        }).addTo(mapRef.current); // Add the new polyline to the map
      }
    }
  };

  return (
    <div className="flex">
      <div
        id="map"
        className="mt-2 z-0"
        style={{
          width: "80%",
          height: "92vh", // Set the map to occupy 80% of the viewport height
        }}
      />
      <div
        className="flex flex-col gap-4 p-4"
        style={{
          width: "20%",
          height: "92vh", // Set the card container to occupy 20% of the viewport height
          overflowY: "auto", // Allow vertical scrolling
          overflowX: "hidden", // Prevent horizontal overflow
        }}
      >
        {markers
          ?.filter((m) => m.status !== "success" && m.status !== "error")
          .map((marker, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(marker)} // Handle marker card click
              className="border rounded p-5 cursor-pointer hover:bg-gray-100"
            >
              <div className="font-bold">{marker.name}</div>
              <div>Alamat: {marker.address}</div>
              <div>Latitude: {marker.latitude}</div>
              <div>Longitude: {marker.longitude}</div>
              <div className="mt-2">
                <p
                  className={`w-min text-xs px-1 font-bold py-1 text-white rounded bg-${getStatusStyle(
                    marker.status!
                  )}-500`}
                >
                  {marker.status?.toLocaleUpperCase()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
