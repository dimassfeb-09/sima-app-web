import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for custom marker icons
import { Marker } from "../types/marker";
import { Users } from "../types/user";
import { fetchOrganizationByUserId } from "../models/organizations";
import { Organization } from "../types/organization";

export default function LeafletMapComponent({
  markers,
  userInfo,
}: {
  markers: Marker[] | null;
  userInfo: Users | null;
}) {
  const mapRef = useRef<any>(null);

  const [organization, setOrganization] = useState<Organization | null>(null);

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

    if (markers && markers.length > 0 && userInfo && organization) {
      const { latitude, longitude } = organization;
      mapRef.current = L.map("map", {
        center: [latitude, longitude],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      if (
        organization?.latitude !== undefined &&
        organization?.longitude !== undefined
      ) {
        L.marker([organization.latitude, organization.longitude]).addTo(
          mapRef.current
        ).bindPopup(`
            <div>
              <strong>${organization.name}</strong><br />
              Latitude: ${organization.latitude}<br />
              Longitude: ${organization.longitude}
            </div>`);
      }

      markers
        .filter(
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
            
            <div>${marker.name}</div>
            <div>Latitude: ${marker.latitude}</div>
            <div>Longitude: ${marker.longitude}</div>
           
          </div>
        `);

          // Animation variables
          const minRadius = 20;
          const maxRadius = 50;
          const step = 2;
          let growing = true;

          const animate = () => {
            const currentRadius = circle.getRadius();

            // Zoom in (grow)
            if (growing) {
              if (currentRadius < maxRadius) {
                circle.setRadius(currentRadius + step);
              } else {
                growing = false; // Start shrinking when maxRadius is reached
              }
            }
            // Zoom out (shrink)
            else {
              if (currentRadius > minRadius) {
                circle.setRadius(currentRadius - step);
              } else {
                growing = true;
              }
            }

            setTimeout(animate, 200);
          };

          animate();
        });

      return () => {
        mapRef.current.remove();
      };
    }
  }, [markers, userInfo]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}
