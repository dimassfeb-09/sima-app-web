import { useEffect, useRef } from "react";
import { User } from "../types/user";
import { Marker } from "../models/marker";
import { fetchOrganizationByUserId } from "../models/organizations";

// Extend the Window interface to include HERE Maps types
declare global {
  interface Window {
    H: any; // Consider specifying more accurate types if available
  }
}

export default function MapComponent({
  markers,
  userInfo,
}: {
  markers: Marker[] | null;
  userInfo: User | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!window.H) {
        console.error("HERE Maps API is not loaded.");
        return;
      }

      if (!userInfo) {
        console.error("User info is missing.");
        return;
      }

      const { data: organization, error } = await fetchOrganizationByUserId(
        userInfo.user_id!
      );

      if (error || !organization) {
        console.error("Failed to fetch organization", error);
        return;
      }

      if (mapRef.current) {
        const platform = new window.H.service.Platform({
          apikey: import.meta.env.VITE_HERE_MAP_API_KEY,
        });

        const defaultLayers = platform.createDefaultLayers();

        const mapInstance = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            zoom: 15,
            center: {
              lat: organization.latitude,
              lng: organization.longitude,
            },
          }
        );

        const marker = {
          name: organization.name,
          latitude: organization.latitude,
          longitude: organization.longitude,
        };
        addMarkerToMap(mapInstance, true, marker);

        addMarkersToMap(mapInstance, markers);

        new window.H.mapevents.Behavior(
          new window.H.mapevents.MapEvents(mapInstance)
        );

        window.H.ui.UI.createDefault(mapInstance, defaultLayers);

        window.addEventListener("resize", () =>
          mapInstance.getViewPort().resize()
        );

        return () => {
          window.removeEventListener("resize", () =>
            mapInstance.getViewPort().resize()
          );
          mapInstance.dispose();
        };
      }
    };

    if (markers && markers.length > 0 && userInfo) {
      initializeMap();
    }
  }, [markers, userInfo]);

  const addMarkerToMap = (
    mapInstance: any,
    isCurrent: boolean = false,
    marker: Marker | null
  ) => {
    const mapMarker = new window.H.map.Marker({
      lat: marker?.latitude,
      lng: marker?.longitude,
    });
    mapInstance.addObject(mapMarker);
    mapMarker.addEventListener("tap", () => {
      displayInfoBox(mapInstance, isCurrent, marker!);
    });
  };

  const addMarkersToMap = (mapInstance: any, markers: Marker[] | null) => {
    markers?.forEach((marker) => {
      addCircleToMap(
        mapInstance,
        { lat: marker.latitude, lng: marker.longitude },
        20
      );
    });
  };

  const addCircleToMap = (
    mapInstance: any,
    center: { lat: number; lng: number },
    radius: number,
    options: { color?: string; strokeColor?: string; strokeWidth?: number } = {}
  ) => {
    const circle = new window.H.map.Circle(
      center, // Center of the circle
      radius, // Radius in meters
      {
        style: {
          fillColor: options.color || "rgba(255, 0, 0, 0.3)", // Default fill color (semi-transparent red)
          strokeColor: options.strokeColor || "red", // Border color
          lineWidth: options.strokeWidth || 2, // Border thickness
        },
      }
    );

    mapInstance.addObject(circle);
    zoomAnimation(circle);
  };

  const zoomAnimation = (circle: any) => {
    let growing = true;
    const maxRadius = 50;
    const minRadius = 5;
    const step = 2;
    const interval = 200; // 0.5 seconds

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
      setTimeout(animate, interval);
    };

    animate();
  };

  const displayInfoBox = (
    mapInstance: any,
    isCurrent: boolean,
    marker: Marker
  ) => {
    const previousBox = document.querySelector(".info-box");
    if (previousBox) previousBox.remove();
  
    const screenPosition = mapInstance.geoToScreen({
      lat: marker.latitude,
      lng: marker.longitude,
    });
  
    const infoBox = document.createElement("div");
    infoBox.className = "info-box";
  
    // Create the close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;"; // Unicode character for multiplication sign (×)
    closeButton.className = "close-button";
    closeButton.onclick = () => {
      infoBox.remove();
    };
  
    // Use innerHTML to render HTML content
    infoBox.innerHTML = `${
      isCurrent
        ? "<span class='bg-red-500 text-xs w-full text-white px-2 py-1 rounded-full'>Posisi Anda Sekarang</span>\n\n"
        : ""
    }Name: ${marker.name}
      Latitude: ${marker.latitude}
      Longitude: ${marker.longitude}
    `;
  
    // Append the close button to the infoBox
    infoBox.appendChild(closeButton);
  
    infoBox.style.position = "absolute";
    infoBox.style.left = `${screenPosition.x}px`;
    infoBox.style.top = `${screenPosition.y - 50}px`;
  
    mapRef.current?.appendChild(infoBox);
  };
  

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: "5",
      }}
    />
  );
}
