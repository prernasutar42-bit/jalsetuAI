import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import { getRiskLevelFromProbability, calculateSimulatedRisk, RISK_LEVELS } from '../../lib/riskUtils';
import { formatPercent } from '../../lib/formatters';

// Map controller component to pan and zoom dynamically
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export function RiskMap({
  districts = [],
  selectedDistrictId = null,
  onSelectDistrict,
  whatIfRainfall = 0,
  center = [19.7, 75.7],
  zoom = 6,
  userLocation = null,
}) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '380px' }}
      >
        <MapViewController center={center} zoom={zoom} />

        {/* Crisp OpenStreetMap CartoDB Positron / OSM tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* User location pin if resolved */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            pathOptions={{
              color: '#0E7C86',
              fillColor: '#0E7C86',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent={false} direction="top">
              <span className="font-sans text-xs font-semibold">Your Location</span>
            </Tooltip>
          </CircleMarker>
        )}

        {/* 36 Maharashtra Districts: Polygon if geometry present, else CircleMarker */}
        {districts.map((district) => {
          const baseProb = district.current_risk?.probability ?? 0.2;
          const simulated = whatIfRainfall > 0
            ? calculateSimulatedRisk(baseProb, whatIfRainfall)
            : { probability: baseProb, level: district.current_risk?.level || 'low' };

          const riskMeta = RISK_LEVELS[simulated.level] || RISK_LEVELS.low;
          const isSelected = selectedDistrictId === district.id;

          const lat = district.lat || district.centroid_lat;
          const lon = district.lon || district.centroid_lon;

          // If district has polygon geometry, render GeoJSON boundary
          const hasGeometry = Boolean(district.geometry && (district.geometry.type || district.geometry.coordinates));

          return (
            <React.Fragment key={district.id}>
              {hasGeometry && (
                <GeoJSON
                  key={`poly-${district.id}-${simulated.level}-${isSelected}`}
                  data={district.geometry}
                  eventHandlers={{
                    click: () => onSelectDistrict && onSelectDistrict(district),
                  }}
                  style={{
                    color: isSelected ? '#0F1B2D' : riskMeta.color,
                    weight: isSelected ? 3 : 1.5,
                    fillColor: riskMeta.color,
                    fillOpacity: isSelected ? 0.65 : 0.45,
                  }}
                />
              )}

              {/* Center CircleMarker (used as primary marker when no geometry, or center label pin when polygon present) */}
              <CircleMarker
                center={[lat, lon]}
                radius={
                  hasGeometry
                    ? 5
                    : isSelected
                    ? 16
                    : simulated.level === 'severe'
                    ? 14
                    : simulated.level === 'high'
                    ? 12
                    : simulated.level === 'moderate'
                    ? 10
                    : 8
                }
                eventHandlers={{
                  click: () => onSelectDistrict && onSelectDistrict(district),
                }}
                pathOptions={{
                  color: isSelected ? '#0F1B2D' : '#FFFFFF',
                  fillColor: riskMeta.color,
                  fillOpacity: isSelected ? 0.95 : 0.85,
                  weight: isSelected ? 3 : 1.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="font-sans text-xs p-1">
                    <p className="font-bold text-ink-900">{district.name}</p>
                    <p className="text-[11px] text-ink-500">{district.region}</p>
                    <p
                      className="font-mono font-bold text-xs mt-0.5"
                      style={{ color: riskMeta.color }}
                    >
                      {riskMeta.label} ({formatPercent(simulated.probability)})
                    </p>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
