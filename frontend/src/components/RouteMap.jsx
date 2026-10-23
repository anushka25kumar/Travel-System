import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Plane, Train, Bus, MapPin, Info } from 'lucide-react';

export default function RouteMap({ selectedJourney, customLegs }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update Polylines and Markers when journey changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    layers.clearLayers();

    const legs = selectedJourney?.legs || customLegs || [];
    if (!legs || legs.length === 0) return;

    const allPoints = [];

    legs.forEach((leg, index) => {
      const srcLat = leg.sourceLat || 18.5204;
      const srcLng = leg.sourceLng || 73.8567;
      const dstLat = leg.destLat || 28.6139;
      const dstLng = leg.destLng || 77.2090;

      const p1 = [srcLat, srcLng];
      const p2 = [dstLat, dstLng];
      allPoints.push(p1);
      allPoints.push(p2);

      // Determine Mode Color & Style
      let lineColor = '#1677FF'; // Blue (Flight)
      let dashArray = '8, 8';
      let weight = 4;

      if (leg.mode === 'TRAIN') {
        lineColor = '#7C3AED'; // Purple (Train)
        dashArray = null;
        weight = 5;
      } else if (leg.mode === 'BUS') {
        lineColor = '#F59E0B'; // Orange (Bus)
        dashArray = null;
        weight = 4;
      }

      // Draw Polyline for this leg
      const polyline = L.polyline([p1, p2], {
        color: lineColor,
        weight: weight,
        opacity: 0.85,
        dashArray: dashArray,
        lineCap: 'round',
      }).addTo(layers);

      polyline.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-size: 11px; font-weight: 800; color: ${lineColor}; text-transform: uppercase;">
            Leg ${leg.legOrder || index + 1}: ${leg.mode}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #10224D; margin-top: 2px;">
            ${leg.carrierName || 'Carrier'}
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            <strong>${leg.sourceCity || leg.sourceStationName}</strong> &rarr; <strong>${leg.destCity || leg.destStationName}</strong>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
            Duration: ${leg.durationMinutes} mins | CO₂: ${leg.co2Kg} kg
          </div>
        </div>
      `);

      // Add Start Marker (for first leg)
      if (index === 0) {
        const startIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background-color: #10224D; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              A
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(p1, { icon: startIcon })
          .addTo(layers)
          .bindPopup(`<strong>Origin:</strong> ${leg.sourceCity} (${leg.sourceStationName || ''})`);
      }

      // Intermediate Transfer Hub Marker
      if (index < legs.length - 1) {
        const transferIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background-color: #F59E0B; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid white;">
              T
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker(p2, { icon: transferIcon })
          .addTo(layers)
          .bindPopup(`<strong>Transfer Hub:</strong> ${leg.destCity}<br/>Layover: ${leg.layoverMinutesToNext || 45} mins`);
      }

      // Final Destination Marker
      if (index === legs.length - 1) {
        const endIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background-color: #16A34A; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              B
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(p2, { icon: endIcon })
          .addTo(layers)
          .bindPopup(`<strong>Destination:</strong> ${leg.destCity} (${leg.destStationName || ''})`);
      }
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  }, [selectedJourney, customLegs]);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F2FF] text-[#1677FF] flex items-center justify-center font-bold text-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#10224D]">Interactive Journey Route Map</h3>
            <p className="text-[11px] text-slate-500">Live corridor tracking with mode-specific geometry</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-[#1677FF]" />
            <span className="text-slate-600">Flight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-[#7C3AED]" />
            <span className="text-slate-600">Train</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-600">Bus</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-200">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {selectedJourney && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-[#F4F8FF] p-2.5 rounded-xl border border-blue-50">
          <span>Active Journey: <strong className="text-[#10224D]">{selectedJourney.title}</strong></span>
          <span className="font-bold text-[#1677FF]">{selectedJourney.legs?.length || 1} Transit Segment(s)</span>
        </div>
      )}
    </div>
  );
}
