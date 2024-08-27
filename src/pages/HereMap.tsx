import { useEffect, useRef, useState } from "react";
import { User } from "../types/user";

// Extend the Window interface to include HERE Maps types
declare global {
  interface Window {
    H: any; // Consider specifying more accurate types if available
  }
}

interface Marker {
  user_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapComponent({
  markers,
  userInfo,
}: {
  markers: Marker[] | null;
  userInfo: User | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (window.H) {
      const defaultCenterLocation = findDefaultCenterLocation(
        markers,
        userInfo
      );

      if (defaultCenterLocation && mapRef.current) {
        const platform = initializePlatform();
        const defaultLayers = platform.createDefaultLayers();
        const mapInstance = initializeMap(defaultCenterLocation, defaultLayers);

        addMapBehavior(mapInstance);
        addMapUI(mapInstance, defaultLayers);
        handleResize(mapInstance);
        addMarkersToMap(mapInstance, markers);

        setMap(mapInstance);

        return () => cleanup(mapInstance);
      } else {
        console.error("No valid center location found.");
      }
    } else {
      console.error("HERE Maps API is not loaded.");
    }
  }, [markers, userInfo]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "70%",
        height: "100%",
        position: "fixed",
      }}
    />
  );

  function findDefaultCenterLocation(
    markers: Marker[] | null,
    userInfo: User | null
  ) {
    return markers?.find((marker) => marker.user_id === userInfo?.user_id);
  }

  function initializePlatform() {
    return new window.H.service.Platform({
      apikey: import.meta.env.VITE_HERE_MAP_API_KEY, // Replace with your API key
    });
  }

  function initializeMap(defaultCenterLocation: Marker, defaultLayers: any) {
    const zoom = defaultCenterLocation.latitude ? 14 : 10;
    const defaultCenterLocationLatitude = defaultCenterLocation.latitude
      ? defaultCenterLocation.latitude
      : -6.195442;
    const defaultCenterLocationLongitude = defaultCenterLocation.longitude
      ? defaultCenterLocation.longitude
      : 106.848969;

    return new window.H.Map(mapRef.current!, defaultLayers.vector.normal.map, {
      zoom: zoom,
      center: {
        lat: defaultCenterLocationLatitude,
        lng: defaultCenterLocationLongitude,
      },
    });
  }

  function addMapBehavior(mapInstance: any) {
    new window.H.mapevents.Behavior(
      new window.H.mapevents.MapEvents(mapInstance)
    );
  }

  function addMapUI(mapInstance: any, defaultLayers: any) {
    if (window.H.ui) {
      window.H.ui.UI.createDefault(mapInstance, defaultLayers);
    } else {
      console.error("HERE Maps UI is not available.");
    }
  }

  function handleResize(mapInstance: any) {
    const resizeListener = () => mapInstance.getViewPort().resize();
    window.addEventListener("resize", resizeListener);
  }

  function addMarkersToMap(mapInstance: any, markers: Marker[] | null) {
    markers?.forEach((marker) => {
      const mapMarker = new window.H.map.Marker({
        lat: marker.latitude,
        lng: marker.longitude,
      });

      mapInstance.addObject(mapMarker);

      mapMarker.addEventListener("tap", () => {
        displayInfoBox(mapInstance, marker);
      });
    });
  }

  function displayInfoBox(mapInstance: any, marker: Marker) {
    const previousBox = document.querySelector(".info-box");
    if (previousBox) previousBox.remove();

    const screenPosition = mapInstance.geoToScreen({
      lat: marker.latitude,
      lng: marker.longitude,
    });

    const infoBox = document.createElement("div");
    infoBox.className = "info-box";
    infoBox.innerText = `Name: ${marker.name}\nLatitude: ${marker.latitude}\nLongitude: ${marker.longitude}`;
    infoBox.style.position = "absolute";
    infoBox.style.left = `${screenPosition.x}px`;
    infoBox.style.top = `${screenPosition.y - 50}px`;

    mapRef.current?.appendChild(infoBox);
  }

  function cleanup(mapInstance: any) {
    window.removeEventListener("resize", mapInstance.getViewPort().resize);
    mapInstance.dispose();
  }
}
