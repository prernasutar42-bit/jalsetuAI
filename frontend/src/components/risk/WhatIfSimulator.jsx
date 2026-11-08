import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { useDistrictContext } from '../../context/DistrictContext';
import { calculateSimulatedRisk } from '../../lib/riskUtils';
import { simulateWhatIf } from '../../api/districts';
import { RiskBadge } from './RiskBadge';
import { formatPercent, formatRainfall } from '../../lib/formatters';
import { Button } from '../ui/Button';

export function WhatIfSimulator({ districtId = 1, baseProbability = 0.5, districtName = 'Selected District' }) {
  const { whatIfRainfall, setWhatIfRainfall, selectedDistrictId } = useDistrictContext();
  const activeZoneId = districtId || selectedDistrictId || 1;

  // Local state for backend simulated result
  const [backendResult, setBackendResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (whatIfRainfall === 0) {
      setBackendResult(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsSimulating(true);
        const res = await simulateWhatIf(activeZoneId, whatIfRainfall);
        if (isMounted) {
          setBackendResult(res);
        }
      } catch (err) {
        // Fallback to local formula if network fails
      } finally {
        if (isMounted) setIsSimulating(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeZoneId, whatIfRainfall]);

  const fallback = calculateSimulatedRisk(baseProbability, whatIfRainfall);
  const displayProb = backendResult ? backendResult.simulated_probability : fallback.probability;
  const displayLevel = backendResult ? backendResult.level : fallback.level;

  return (
    <div className="bg-white border border-line rounded-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-900">What-if rainfall simulator</h3>
        </div>
        {whatIfRainfall > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWhatIfRainfall(0)}
            className="text-xs h-8 px-2.5 gap-1.5"
            title="Reset simulation"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <p className="text-xs text-ink-500 leading-relaxed">
        Simulate the impact of sudden storm precipitation in {districtName}. Recalculates flood risk using the ML prediction service in real time.
      </p>

      {/* Slider input */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-baseline text-xs">
          <label htmlFor="rainfall-slider" className="font-semibold text-ink-700">
            Additional Rainfall:
          </label>
          <span className="font-mono text-sm font-bold text-ink-900">
            +{whatIfRainfall} mm
          </span>
        </div>
        <input
          id="rainfall-slider"
          type="range"
          min="0"
          max="100"
          step="5"
          value={whatIfRainfall}
          onChange={(e) => setWhatIfRainfall(Number(e.target.value))}
          aria-label="Additional simulated rainfall in millimeters"
          className="w-full h-2 bg-[#E9EEF4] rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-[11px] font-mono text-ink-500">
          <span>+0 mm</span>
          <span>+50 mm</span>
          <span>+100 mm</span>
        </div>
      </div>

      {/* Impact readout */}
      <div className="bg-canvas border border-line rounded-card p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500">Baseline probability:</span>
          <span className="font-mono font-semibold text-ink-700">{formatPercent(baseProbability)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500">Simulated probability:</span>
          <span className="font-mono font-bold text-ink-900 text-sm flex items-center gap-1.5">
            {formatPercent(displayProb)}
            {isSimulating && <span className="text-[10px] text-accent animate-pulse font-sans font-normal">(computing...)</span>}
          </span>
        </div>
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-700">Scenario rating:</span>
          <RiskBadge
            level={displayLevel}
            probability={displayProb}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
