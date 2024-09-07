import { useEffect, useRef } from "react";
import { Users } from "../types/user";
import { Marker } from "../types/marker";
import { fetchOrganizationByUserId } from "../models/organizations";

declare global {
  interface Window {
    H: any;
  }
}

export default function MapComponent({
  markers,
  userInfo,
}: {
  markers: Marker[] | null;
  userInfo: Users | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
        userInfo.id!
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
            zoom: 16,
            center: {
              lat: organization.latitude,
              lng: organization.longitude,
            },
          }
        );

        mapInstanceRef.current = mapInstance; // Store the map instance

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
        15,
        marker // Pass marker to use in info box
      );
    });
  };

  const addCircleToMap = (
    mapInstance: any,
    center: { lat: number; lng: number },
    radius: number,
    marker: Marker
  ) => {
    const circle = new window.H.map.Circle(center, radius, {
      style: {
        fillColor: "rgba(255, 0, 0, 0.3)",
        strokeColor: "red",
        lineWidth: 2,
      },
    });

    mapInstance.addObject(circle);

    // Add click event to circle
    circle.addEventListener("tap", () => {
      console.log("Circle tapped");
      displayInfoBox(mapInstance, false, marker);
    });

    zoomAnimation(circle);
  };

  const zoomAnimation = (circle: any) => {
    let growing = true;
    const maxRadius = 50;
    const minRadius = 5;
    const step = 2;
    const interval = 200;

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

    // Style the infoBox
    infoBox.style.position = "absolute";
    infoBox.style.left = `${screenPosition.x}px`;
    infoBox.style.top = `${screenPosition.y - 50}px`;
    infoBox.style.backgroundColor = "white";
    infoBox.style.border = "1px solid #ddd";
    infoBox.style.borderRadius = "5px";
    infoBox.style.padding = "10px";
    infoBox.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    infoBox.style.maxWidth = "200px";
    infoBox.style.zIndex = "10";

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.className = "close-button";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "5px";
    closeButton.style.backgroundColor = "#f8f8f8";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => {
      infoBox.remove();
    };

    const statusStyle = getStatusStyle(marker.status ?? "error");

    infoBox.innerHTML = `${
      isCurrent
        ? "<span class='bg-red-500 text-xs w-full text-white px-2 py-1 rounded-full'>Posisi Anda Sekarang</span><br><br>"
        : ""
    }${
      marker.status
        ? `Status: <span class="${statusStyle} text-xs w-full text-white px-2 py-1 rounded-full">${marker.status}</span>
          `
        : ""
    }Title: ${marker.name}
      Latitude: ${marker.latitude}
      Longitude: ${marker.longitude}
    `;

    infoBox.appendChild(closeButton);

    mapRef.current?.appendChild(infoBox);
  };

  // Helper function to get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-500";
      case "process":
        return "bg-blue-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-grey-500";
    }
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
