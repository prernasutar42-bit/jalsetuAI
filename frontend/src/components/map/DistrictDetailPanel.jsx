import React from 'react';
import { X, ArrowRight, Droplets, Waves, Home, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiskBadge } from '../risk/RiskBadge';
import { FactorList } from '../risk/FactorList';
import { ForecastChart } from '../charts/ForecastChart';
import { Button } from '../ui/Button';
import { formatPercent, formatRainfall, formatTimeAgo } from '../../lib/formatters';
import { calculateSimulatedRisk } from '../../lib/riskUtils';
import { strings } from '../../lib/strings';
import { useDistrictContext } from '../../context/DistrictContext';

export function DistrictDetailPanel({ district, onClose, whatIfRainfall = 0 }) {
  const { homeDistrictId, setHomeDistrictId } = useDistrictContext();

  if (!district) return null;

  const baseProb = district.current_risk.probability;
  const simulated = whatIfRainfall > 0
    ? calculateSimulatedRisk(baseProb, whatIfRainfall)
    : { probability: baseProb, level: district.current_risk.level };

  const isHome = homeDistrictId === district.id;

  return (
    <aside
      aria-label={`${district.name} detailed telemetry`}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] sm:static sm:inset-auto sm:max-h-full sm:h-full sm:w-[420px] bg-white border-t sm:border-t-0 sm:border-l border-line flex flex-col shadow-float sm:shadow-none overflow-hidden transition-all duration-300"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-line bg-canvas/50 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">{district.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded-btn bg-white border border-line text-ink-500 font-medium">
              {district.region}
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            Zone ID #{district.id} • {formatTimeAgo(district.current_risk.updated_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-btn flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-canvas transition-colors"
            aria-label={strings.map.closePanel}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Panel Content (Scrollable) */}
      <div className="p-4 overflow-y-auto space-y-5 flex-1">
        {/* Risk Badge hero */}
        <RiskBadge
          level={simulated.level}
          probability={simulated.probability}
          size="hero"
        />

        {whatIfRainfall > 0 && (
          <div className="p-2.5 rounded-btn bg-canvas border border-line text-xs flex items-center justify-between">
            <span className="text-ink-500">Includes simulated storm:</span>
            <span className="font-mono font-bold text-accent">+{whatIfRainfall} mm rain</span>
          </div>
        )}

        {/* Action button row */}
        <div className="flex gap-2">
          <Button
            as={Link}
            to={`/?district=${district.id}`}
            variant="primary"
            size="sm"
            className="flex-1 gap-1.5"
          >
            <span>District Dashboard</span>
            <ArrowRight size={15} />
          </Button>

          {!isHome ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHomeDistrictId(district.id)}
              className="gap-1.5"
              title="Set as your primary home district"
            >
              <Home size={15} />
              <span>Make Home</span>
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-accent bg-[#EBF5F6] border border-accent/20 rounded-btn">
              <Home size={14} />
              <span>Home</span>
            </span>
          )}
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Rainfall card */}
          <div className="bg-canvas border border-line rounded-card p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-ink-500 text-xs font-semibold">
              <Droplets size={14} className="text-accent" />
              <span>24h Rainfall</span>
            </div>
            <div className="font-mono text-xl font-bold text-ink-900">
              {formatRainfall(district.rainfall?.current_24h_mm)}
            </div>
            <p className="text-[11px] text-ink-500">
              Normal: {district.rainfall?.normal_24h_mm} mm ({district.rainfall?.anomaly_ratio}x)
            </p>
          </div>

          {/* River Card */}
          <div className="bg-canvas border border-line rounded-card p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-ink-500 text-xs font-semibold">
              <Waves size={14} className="text-accent" />
              <span>River Stage</span>
            </div>
            <div className="font-mono text-xl font-bold text-ink-900 truncate">
              {district.river?.current_m} m
            </div>
            <p className="text-[11px] text-ink-500 truncate" title={district.river?.name}>
              {district.river?.name}
            </p>
          </div>
        </div>

        {/* River status breakdown */}
        <div className="bg-white border border-line rounded-card p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="text-ink-700">Warning Level Mark:</span>
            <span className="font-mono text-ink-900">{district.river?.warning_level_m} m</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span className="text-ink-700">Danger Level Mark:</span>
            <span className="font-mono text-risk-severe font-bold">{district.river?.danger_level_m} m</span>
          </div>
          {district.river?.dam_discharge_cusec > 0 && (
            <div className="flex items-center justify-between font-medium pt-1 border-t border-line">
              <span className="text-ink-700">Active Dam Discharge:</span>
              <span className="font-mono text-ink-900">
                {district.river.dam_discharge_cusec.toLocaleString('en-IN')} cusecs
              </span>
            </div>
          )}
        </div>

        {/* Contributing Factors */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-3">
            {strings.risk.factorsTitle}
          </h3>
          <FactorList factors={district.factors} />
        </div>

        {/* 24/48/72h forecast chart */}
        <div className="pt-2 border-t border-line">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
            {strings.risk.forecastTitle}
          </h3>
          <ForecastChart forecast={district.forecast} />
        </div>

        {/* Local authority notice */}
        <p className="text-[11px] text-ink-500 leading-normal pt-2 border-t border-line">
          {strings.disclaimer}
        </p>
      </div>
    </aside>
  );
}
