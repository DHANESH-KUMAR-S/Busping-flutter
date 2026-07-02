/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  busMarker?: { lat: number; lng: number; busNumber: string } | null;
  stopMarker?: { lat: number; lng: number; name: string } | null;
  userMarker?: { lat: number; lng: number; role: string } | null;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  enableRouting?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function LeafletMap({
  center = [37.7749, -122.4194], // SF default
  zoom = 13,
  busMarker,
  stopMarker,
  userMarker,
  onMapClick,
  height = "100%",
  enableRouting = true,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Markers and polyline references so we can update them without recreating the map
  const busMarkerRef = useRef<any>(null);
  const stopMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // 1. Inject Leaflet assets dynamically
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep styling and library in DOM for fast tab switching, but cleanup is optional.
    };
  }, []);

  // 2. Initialize Map once Leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // We can customize or add it top-right
    }).setView(center, zoom);

    // Add Tile Layer (OpenStreetMap CartoDB Positron for modern elegant look)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CartoDB",
        maxZoom: 20,
      }
    ).addTo(map);

    // Custom small zoom control
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    mapRef.current = map;

    // Handle map click
    map.on("click", (e: any) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        busMarkerRef.current = null;
        stopMarkerRef.current = null;
        userMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // 3. Pan map when center changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  }, [center[0], center[1]]);

  // 4. Manage Markers & Routing Polyline
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;

    // Helper to create custom HTML DivIcon (Material design look)
    const createHtmlIcon = (emoji: string, color: string, label: string) => {
      return L.divIcon({
        html: `
          <div class="flex flex-col items-center select-none" id="marker-${label.replace(/\s+/g, '-')}">
            <div class="flex items-center justify-center w-9 h-9 rounded-full shadow-lg border-2 border-white transition-all transform scale-100 hover:scale-110 active:scale-95" style="background-color: ${color};">
              <span class="text-lg">${emoji}</span>
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-800 shadow-sm border border-slate-100 max-w-[80px] truncate text-center">
              ${label}
            </div>
          </div>
        `,
        className: "",
        iconSize: [40, 50],
        iconAnchor: [20, 36],
      });
    };

    // User Marker
    if (userMarker) {
      const icon = createHtmlIcon(
        userMarker.role === "driver" ? "🚌" : "🔵",
        userMarker.role === "driver" ? "#2196F3" : "#3B82F6",
        userMarker.role === "driver" ? "My Bus" : "Me"
      );
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userMarker.lat, userMarker.lng]);
      } else {
        userMarkerRef.current = L.marker([userMarker.lat, userMarker.lng], {
          icon,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // Stop Marker
    if (stopMarker) {
      const icon = createHtmlIcon("📍", "#FF7043", stopMarker.name);
      if (stopMarkerRef.current) {
        stopMarkerRef.current.setLatLng([stopMarker.lat, stopMarker.lng]);
      } else {
        stopMarkerRef.current = L.marker([stopMarker.lat, stopMarker.lng], {
          icon,
        }).addTo(map);
      }
    } else if (stopMarkerRef.current) {
      map.removeLayer(stopMarkerRef.current);
      stopMarkerRef.current = null;
    }

    // Bus Marker
    if (busMarker) {
      const icon = createHtmlIcon("🚌", "#4CAF50", `Bus ${busMarker.busNumber}`);
      if (busMarkerRef.current) {
        // Simple micro-animation by setting coordinates
        busMarkerRef.current.setLatLng([busMarker.lat, busMarker.lng]);
      } else {
        busMarkerRef.current = L.marker([busMarker.lat, busMarker.lng], {
          icon,
        }).addTo(map);
      }
    } else if (busMarkerRef.current) {
      map.removeLayer(busMarkerRef.current);
      busMarkerRef.current = null;
    }

    // 5. OSRM Routing (Polyline)
    if (enableRouting && busMarker && stopMarker) {
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${busMarker.lng},${busMarker.lat};${stopMarker.lng},${stopMarker.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("OSRM routing failure");
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(
              ([lon, lat]: [number, number]) => [lat, lon]
            );

            if (polylineRef.current) {
              polylineRef.current.setLatLngs(coords);
            } else {
              polylineRef.current = L.polyline(coords, {
                color: "#2196F3",
                weight: 5,
                opacity: 0.8,
                dashArray: "2, 8", // Elegant dashed pattern to represent routing path
                lineCap: "round",
                lineJoin: "round",
              }).addTo(map);
            }
          }
        } catch (e) {
          console.warn("OSRM Routing failed, falling back to straight line: ", e);
          // Fallback straight line
          const coords = [
            [busMarker.lat, busMarker.lng],
            [stopMarker.lat, stopMarker.lng],
          ];
          if (polylineRef.current) {
            polylineRef.current.setLatLngs(coords);
          } else {
            polylineRef.current = L.polyline(coords, {
              color: "#2196F3",
              weight: 4,
              opacity: 0.6,
              dashArray: "5, 5",
            }).addTo(map);
          }
        }
      };

      fetchRoute();
    } else if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  }, [busMarker, stopMarker, userMarker, leafletLoaded, enableRouting]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100" style={{ height }} id="leaflet-map-container">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-50 z-10 animate-pulse">
          <span className="text-3xl animate-bounce">🗺️</span>
          <p className="text-sm text-slate-500 font-medium">Loading map canvas...</p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" style={{ outline: "none" }} />
    </div>
  );
}
