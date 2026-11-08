import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Droplets,
  Waves,
  ShieldAlert,
  ArrowRight,
  LifeBuoy,
  RefreshCw,
  Home,
  Sliders,
  Compass,
} from 'lucide-react';
import { useDistricts, useDistrict } from '../hooks/useDistricts';
import { useDistrictContext } from '../context/DistrictContext';
import { RiskBadge } from '../components/risk/RiskBadge';
import { FactorList } from '../components/risk/FactorList';
import { ForecastChart } from '../components/charts/ForecastChart';
import { WhatIfSimulator } from '../components/risk/WhatIfSimulator';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { DistrictCardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatPercent, formatRainfall, formatTimeAgo } from '../lib/formatters';
import { calculateSimulatedRisk } from '../lib/riskUtils';
import { strings } from '../lib/strings';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: districts = [], isLoading: districtsLoading, error: districtsError, refetch: refetchDistricts } = useDistricts();
  const { homeDistrictId, setHomeDistrictId, selectedDistrictId, setSelectedDistrictId, whatIfRainfall } = useDistrictContext();

  // Read district from URL query if present, otherwise default to context / home
  const paramDistrictId = searchParams.get('district');
  const activeDistrictId = paramDistrictId ? Number(paramDistrictId) : (selectedDistrictId || homeDistrictId || 1);

  const {
    data: district,
    isLoading: districtLoading,
    error: districtError,
    refetch: refetchDistrict,
  } = useDistrict(activeDistrictId);

  // Sync state with URL parameter
  useEffect(() => {
    if (paramDistrictId) {
      setSelectedDistrictId(Number(paramDistrictId));
    }
  }, [paramDistrictId, setSelectedDistrictId]);

  const handleDistrictChange = (e) => {
    const newId = Number(e.target.value);
    setSelectedDistrictId(newId);
    setSearchParams({ district: String(newId) });
  };

  if (districtsLoading || districtLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div className="h-6 w-48 bg-[#E9EEF4] animate-pulse rounded" />
          <div className="h-10 w-44 bg-[#E9EEF4] animate-pulse rounded" />
        </div>
        <DistrictCardSkeleton />
        <DistrictCardSkeleton />
      </div>
    );
  }

  if (districtsError || districtError) {
    return (
      <ErrorState
        title="Failed to load district hydrology telemetry"
        message="Unable to communicate with the simulated forecasting pipeline. Click below to retry."
        onRetry={() => {
          refetchDistricts();
          refetchDistrict();
        }}
      />
    );
  }

  if (!district) {
    return (
      <EmptyState
        title="District not found"
        description="The selected district zone could not be resolved from telemetry records."
        actionLabel="Switch to default (Kolhapur)"
        onAction={() => setSearchParams({ district: '1' })}
      />
    );
  }

  // Calculate simulated risk if what-if rainfall slider is active
  const baseProb = district.current_risk.probability;
  const simulated = whatIfRainfall > 0
    ? calculateSimulatedRisk(baseProb, whatIfRainfall)
    : { probability: baseProb, level: district.current_risk.level };

  const districtOptions = districts.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.region})`,
  }));

  const isHome = homeDistrictId === district.id;

  return (
    <div className="space-y-5">
      {/* Top Controls: District Selector & Timestamp */}
      <div className="bg-white border border-line rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-md">
          <div className="w-full">
            <label htmlFor="district-select" className="sr-only">
              {strings.dashboard.selectDistrict}
            </label>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-accent shrink-0" aria-hidden="true" />
              <select
                id="district-select"
                value={activeDistrictId}
                onChange={handleDistrictChange}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm font-semibold bg-canvas border border-line rounded-input text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {districtOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 font-mono">
            <Clock size={13} aria-hidden="true" />
            <span>Updated {formatTimeAgo(district.current_risk.updated_at)}</span>
          </div>

          {!isHome ? (
            <button
              type="button"
              onClick={() => setHomeDistrictId(district.id)}
              className="min-h-[44px] px-3 text-xs font-semibold text-accent hover:bg-canvas rounded-btn border border-line flex items-center gap-1.5 transition-colors"
              title={strings.dashboard.setAsHome}
            >
              <Home size={14} />
              <span className="hidden sm:inline">Set Home</span>
            </button>
          ) : (
            <span className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-[#EBF5F6] border border-accent/20 rounded-btn">
              <Home size={14} />
              <span>Home Zone</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Telemetry & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Risk Badge, Factors, Telemetry */}
        <div className="lg:col-span-2 space-y-5">
          {/* Big RiskBadge Card */}
          <Card>
            <CardHeader
              title={`${district.name} Flood Risk Assessment`}
              subtitle={`Hydrological Region: ${district.region}`}
              action={
                <Link
                  to={`/map?district=${district.id}`}
                  className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  <Compass size={15} />
                  <span>View on Map</span>
                </Link>
              }
            />
            <CardBody className="space-y-4">
              <RiskBadge
                level={simulated.level}
                probability={simulated.probability}
                size="hero"
              />

              {whatIfRainfall > 0 && (
                <div className="p-3 rounded-btn bg-[#FFF9E6] border border-risk-moderate/40 text-ink-900 text-xs flex items-center justify-between">
                  <span>
                    What-if simulation active: <strong>+{whatIfRainfall} mm</strong> rainfall
                    added.
                  </span>
                  <span className="font-mono font-bold text-risk-high">
                    Baseline: {formatPercent(baseProb)}
                  </span>
                </div>
              )}

              {/* Rainfall and River Telemetry Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Rainfall Telemetry */}
                <div className="p-3.5 bg-canvas border border-line rounded-card space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-700 flex items-center gap-1.5">
                      <Droplets size={15} className="text-accent" />
                      <span>24h Rainfall</span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-500 uppercase">
                      Trend: {district.rainfall.trend}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-ink-900">
                      {formatRainfall(district.rainfall.current_24h_mm + whatIfRainfall)}
                    </span>
                    <span className="text-xs text-ink-500">
                      (Normal: {district.rainfall.normal_24h_mm} mm)
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500">
                    Precipitation anomaly ratio:{' '}
                    <strong className="font-mono text-ink-700">
                      {(
                        (district.rainfall.current_24h_mm + whatIfRainfall) /
                        district.rainfall.normal_24h_mm
                      ).toFixed(1)}
                      x normal
                    </strong>
                  </p>
                </div>

                {/* River Stage Telemetry */}
                <div className="p-3.5 bg-canvas border border-line rounded-card space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-700 flex items-center gap-1.5">
                      <Waves size={15} className="text-accent" />
                      <span>River Level ({district.river.name})</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        district.river.status === 'danger'
                          ? 'bg-[#FFEBEE] text-risk-severe'
                          : district.river.status === 'warning'
                          ? 'bg-[#FFF8E1] text-risk-moderate'
                          : 'bg-[#E8F5E9] text-risk-low'
                      }`}
                    >
                      {district.river.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-ink-900">
                      {district.river.current_m} m
                    </span>
                    <span className="text-xs text-ink-500">
                      Danger: {district.river.danger_level_m} m
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500">
                    Warning mark: {district.river.warning_level_m} m • Margin:{' '}
                    <strong className="font-mono text-ink-700">
                      {district.river.freeboard_m} m
                    </strong>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* "Why this rating" FactorList with bars */}
          <Card>
            <CardHeader
              title={strings.risk.whyRating}
              subtitle="Explainable AI factor weights and contributing hydrology signals"
            />
            <CardBody>
              <FactorList factors={district.factors} />
            </CardBody>
          </Card>

          {/* 24/48/72h forecast chart */}
          <Card>
            <CardHeader
              title="24h / 48h / 72h Forecast Outlook"
              subtitle="Predictive horizon based on upstream catchment runoffs"
            />
            <CardBody>
              <ForecastChart forecast={district.forecast} />
            </CardBody>
          </Card>
        </div>

        {/* Right Col: What-if simulator & Safety quick action */}
        <div className="space-y-5">
          {/* What-if Simulator */}
          <WhatIfSimulator
            districtId={district.id}
            baseProbability={baseProb}
            districtName={district.name}
          />

          {/* Emergency Safety Guidelines Card */}
          <Card>
            <CardHeader
              title="Official Preparedness"
              subtitle="Emergency protocols for affected residents"
            />
            <CardBody className="space-y-3.5">
              <p className="text-xs text-ink-700 leading-relaxed">
                Review verified emergency helplines (112, 1070) and essential before, during, and
                after flood action checklists.
              </p>
              <Button
                as={Link}
                to="/safety"
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <LifeBuoy size={16} className="text-accent" />
                  <span>{strings.dashboard.safetyAction}</span>
                </div>
                <ArrowRight size={15} />
              </Button>
            </CardBody>
          </Card>

          {/* Live Alert Notice Banner */}
          <div className="bg-canvas border border-line rounded-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
              <ShieldAlert size={16} className="text-accent" />
              <span>District Advisory Status</span>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed">
              If risk escalates beyond 80%, automated early warnings are broadcast to local
              panchayats and municipal councils.
            </p>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-accent hover:underline inline-block pt-1"
            >
              Check active bulletin feed &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
