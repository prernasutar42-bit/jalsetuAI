// Risk utility functions, color mappings, and calculation helpers

export const RISK_LEVELS = {
  low: {
    key: 'low',
    label: 'Low',
    color: '#2E7D32',
    bgLight: '#E8F5E9',
    borderColor: '#A5D6A7',
    textColor: '#1B5E20',
    description: 'Normal water flow. Minor localized ponding possible in low-lying spots.',
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    color: '#E0A100',
    bgLight: '#FFF8E1',
    borderColor: '#FFE082',
    textColor: '#7F5700',
    description: 'Rising water levels. Caution advised near natural nullahs and riverbanks.',
  },
  high: {
    key: 'high',
    label: 'High',
    color: '#E8590C',
    bgLight: '#FBE9E7',
    borderColor: '#FFAB91',
    textColor: '#BF360C',
    description: 'High flood risk. Waterlogging on main roads and low-lying residential sectors.',
  },
  severe: {
    key: 'severe',
    label: 'Severe',
    color: '#B71C1C',
    bgLight: '#FFEBEE',
    borderColor: '#FFCDD2',
    textColor: '#B71C1C',
    description: 'Critical inundation threat. Immediate evacuation readiness and vigilance required.',
  },
};

/**
 * Determine risk level key from probability (0 to 1)
 */
export function getRiskLevelFromProbability(probability) {
  const p = Math.max(0, Math.min(1, probability));
  if (p >= 0.8) return 'severe';
  if (p >= 0.6) return 'high';
  if (p >= 0.3) return 'moderate';
  return 'low';
}

/**
 * Recalculate risk given base probability and additional rainfall (0 to 100 mm)
 */
export function calculateSimulatedRisk(baseProbability, addedRainfallMm = 0) {
  const base = Math.max(0, Math.min(1, baseProbability));
  const added = Math.max(0, Math.min(100, Number(addedRainfallMm) || 0));
  
  // Non-linear realistic amplification: +100 mm pushes probability significantly up towards 1.0
  const boost = (added / 100) * (1 - base * 0.45);
  const simulatedProb = Math.min(1, Number((base + boost * 0.7).toFixed(2)));
  const level = getRiskLevelFromProbability(simulatedProb);
  
  return {
    probability: simulatedProb,
    level,
    addedRainfallMm: added,
  };
}

/**
 * Get map marker styling for a district given probability
 */
export function getMarkerStyle(probability) {
  const levelKey = getRiskLevelFromProbability(probability);
  const meta = RISK_LEVELS[levelKey];
  return {
    color: meta.color,
    fillColor: meta.color,
    fillOpacity: 0.75,
    weight: 2,
    radius: levelKey === 'severe' ? 14 : levelKey === 'high' ? 12 : levelKey === 'moderate' ? 10 : 8,
  };
}
