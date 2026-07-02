/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { Search, MapPin, Check, ChevronRight } from "lucide-react";
import LeafletMap from "./LeafletMap";
import { SearchResult } from "../types";

interface StopPickerProps {
  onStopPicked: (name: string, lat: number, lon: number) => void;
  onCancel: () => void;
}

export default function StopPicker({ onStopPicked, onCancel }: StopPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lon: number;
  } | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      
      const mappedResults: SearchResult[] = data.map((item: any) => ({
        name: item.display_name.split(",")[0] || item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
      setResults(mappedResults);
    } catch (error) {
      console.error("Nominatim search error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (res: SearchResult) => {
    setSelectedLocation({
      name: res.name,
      lat: res.lat,
      lon: res.lon,
    });
    setResults([]);
    setSearchQuery("");
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({
      name: `Dropped Marker (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lon: lng,
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onStopPicked(
        selectedLocation.name,
        selectedLocation.lat,
        selectedLocation.lon
      );
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F5F5F5]" id="stop-picker">
      {/* Top Search bar overlay */}
      <div className="p-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 z-20 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Select Bus Stop</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search school, street or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-16 py-2.5 bg-slate-50 text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Results dropdown list */}
        {results.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
            {results.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(res)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-3 text-xs transition-colors"
              >
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-800 truncate flex-grow">
                  {res.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="flex-grow relative overflow-hidden">
        <LeafletMap
          center={
            selectedLocation
              ? [selectedLocation.lat, selectedLocation.lon]
              : [37.7749, -122.4194]
          }
          zoom={14}
          stopMarker={
            selectedLocation
              ? {
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lon,
                  name: selectedLocation.name,
                }
              : null
          }
          onMapClick={handleMapClick}
          height="100%"
          enableRouting={false}
        />

        {/* Map Guidelines Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-xl text-[11px] font-bold shadow-md z-10 flex items-center space-x-2 border border-blue-500/50 pointer-events-none">
          <span className="text-sm">📍</span>
          <span>Tap anywhere on map or search above to pick a stop.</span>
        </div>
      </div>

      {/* Confirmer Bottom Bar */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-lg shrink-0 z-20">
        {selectedLocation ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                📍
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Selected Location
                </p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {selectedLocation.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Use This Location</span>
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 font-semibold py-3 select-none">
            Please search or tap the map to drop a stop marker.
          </p>
        )}
      </div>
    </div>
  );
}
