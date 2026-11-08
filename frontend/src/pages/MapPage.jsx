import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Navigation, Filter, Layers, AlertCircle, X } from 'lucide-react';
import { useDistricts } from '../hooks/useDistricts';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDistrictContext } from '../context/DistrictContext';
import { RiskMap } from '../components/map/RiskMap';
import { MapLegend } from '../components/map/MapLegend';
import { DistrictDetailPanel } from '../components/map/DistrictDetailPanel';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { strings } from '../lib/strings';

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: districts = [], isLoading, error, refetch } = useDistricts();
  const { whatIfRainfall, selectedDistrictId, setSelectedDistrictId } = useDistrictContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [locationNotice, setLocationNotice] = useState(null);

  // URL search param synchronization
  const paramDistrictId = searchParams.get('district');
  const activeDistrictId = paramDistrictId ? Number(paramDistrictId) : selectedDistrictId;

  const activeDistrict = useMemo(() => {
    if (!activeDistrictId) return null;
    return districts.find((d) => d.id === Number(activeDistrictId)) || null;
  }, [districts, activeDistrictId]);

  // Geolocation integration
  const { locateUser, isLocating, error: geoError, userLocation } = useGeolocation(districts);

  const handleUseMyLocation = () => {
    setLocationNotice(null);
    locateUser((nearestDistrict, distanceKm) => {
      setSelectedDistrictId(nearestDistrict.id);
      setSearchParams({ district: String(nearestDistrict.id) });
      setLocationNotice(
        `Found nearest: ${nearestDistrict.name} (~${Math.round(distanceKm)} km away)`
      );
    });
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrictId(district.id);
    setSearchParams({ district: String(district.id) });
  };

  const handleClosePanel = () => {
    setSelectedDistrictId(null);
    setSearchParams({});
  };

  // Filter districts by region and search query
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchRegion = selectedRegion === 'All' || d.region === selectedRegion;
      const matchSearch =
        !searchQuery.trim() ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        d.region.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchRegion && matchSearch;
    });
  }, [districts, selectedRegion, searchQuery]);

  const regionsList = [
    'All',
    'Konkan',
    'Western Maharashtra',
    'Marathwada',
    'Vidarbha',
    'North Maharashtra',
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load map data"
        message="Unable to load district geospatial telemetry. Please retry."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Search, Region Filter & Location Controls */}
      <div className="bg-white border border-line rounded-card p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-none">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="map-search-input" className="sr-only">
            {strings.map.searchPlaceholder}
          </label>
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
            aria-hidden="true"
          />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={strings.map.searchPlaceholder}
            className="w-full min-h-[44px] pl-10 pr-4 text-xs sm:text-sm bg-canvas border border-line rounded-input text-ink-900 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-500 hover:text-ink-900"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Region filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <span className="text-xs font-semibold text-ink-500 mr-1 hidden lg:inline">
            Region:
          </span>
          {regionsList.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`min-h-[44px] px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedRegion === region
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-ink-700 border-line hover:bg-canvas'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* "Use my location" button */}
        <Button
          variant="outline"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="shrink-0 gap-2 text-xs"
        >
          <Navigation size={15} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? strings.map.locating : strings.map.useMyLocation}</span>
        </Button>
      </div>

      {/* Geolocation feedback notifications */}
      {(locationNotice || geoError) && (
        <div
          role="status"
          aria-live="polite"
          className={`px-4 py-2 text-xs rounded-btn border flex items-center justify-between ${
            geoError
              ? 'bg-[#FFEBEE] border-risk-severe/30 text-risk-severe'
              : 'bg-[#EBF5F6] border-accent/20 text-accent font-medium'
          }`}
        >
          <span>{geoError || locationNotice}</span>
          <button
            type="button"
            onClick={() => {
              setLocationNotice(null);
            }}
            className="p-1 hover:opacity-75"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Map Layout: Left map (~60%), Right detail panel (on desktop) */}
      <div className="relative bg-white border border-line rounded-card overflow-hidden h-[calc(100vh-230px)] min-h-[500px] flex flex-col sm:flex-row">
        {/* Main Map Canvas */}
        <div className="flex-1 relative h-full">
          <RiskMap
            districts={filteredDistricts}
            selectedDistrictId={activeDistrict?.id}
            onSelectDistrict={handleSelectDistrict}
            whatIfRainfall={whatIfRainfall}
            center={
              activeDistrict
                ? [activeDistrict.lat, activeDistrict.lon]
                : [19.7, 75.7]
            }
            zoom={activeDistrict ? 8 : 6}
            userLocation={userLocation}
          />

          {/* Floating Risk Legend on bottom left of map */}
          <div className="absolute bottom-4 left-4 z-10 max-w-xs pointer-events-auto">
            <MapLegend />
          </div>

          {/* Prompt banner if no district selected */}
          {!activeDistrict && (
            <div className="hidden sm:block absolute top-4 left-4 z-10 bg-white/95 border border-line rounded-card px-3.5 py-2 shadow-float text-xs text-ink-700">
              {strings.map.clickForDetails}
            </div>
          )}
        </div>

        {/* District Detail Panel: Bottom sheet on phone, Right panel on desktop */}
        {activeDistrict && (
          <DistrictDetailPanel
            district={activeDistrict}
            onClose={handleClosePanel}
            whatIfRainfall={whatIfRainfall}
          />
        )}
      </div>
    </div>
  );
}
