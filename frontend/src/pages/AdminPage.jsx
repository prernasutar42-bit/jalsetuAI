import React, { useState, useMemo } from 'react';
import { ShieldCheck, RefreshCw, Radio, BellRing, Bug, ArrowUpDown } from 'lucide-react';
import { useDistricts, useRefreshPredictions } from '../hooks/useDistricts';
import { useCreateAlert } from '../hooks/useAlerts';
import { RiskBadge } from '../components/risk/RiskBadge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { SendAlertDialog } from '../components/alerts/SendAlertDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { setSimulateApiError, isSimulateApiError } from '../api/client';
import { formatPercent, formatRainfall } from '../lib/formatters';
import { strings } from '../lib/strings';

export function AdminPage() {
  const { data: districts = [], isLoading, error, refetch } = useDistricts();
  const refreshPredictionsMutation = useRefreshPredictions();
  const createAlertMutation = useCreateAlert();

  const [showAll, setShowAll] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [simErrorActive, setSimErrorActive] = useState(isSimulateApiError());

  // Rank districts by risk probability descending
  const rankedDistricts = useMemo(() => {
    return [...districts].sort(
      (a, b) => b.current_risk.probability - a.current_risk.probability
    );
  }, [districts]);

  const displayedDistricts = showAll ? rankedDistricts : rankedDistricts.slice(0, 10);

  const handleRefreshPredictions = async () => {
    setRefreshSuccess(false);
    await refreshPredictionsMutation.mutateAsync();
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 4000);
  };

  const handleCreateAlert = async (alertData) => {
    await createAlertMutation.mutateAsync(alertData);
  };

  const toggleSimulatedError = () => {
    const nextVal = !simErrorActive;
    setSimulateApiError(nextVal);
    setSimErrorActive(nextVal);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-[#E9EEF4] animate-pulse rounded" />
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Admin console telemetry unavailable"
        message="Failed to load state-wide district risk rankings."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
            <span>{strings.admin.title}</span>
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">{strings.admin.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPredictions}
            disabled={refreshPredictionsMutation.isPending}
            className="gap-2"
          >
            <RefreshCw
              size={14}
              className={refreshPredictionsMutation.isPending ? 'animate-spin' : ''}
            />
            <span>{strings.admin.refreshPredictionsBtn}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAlertModalOpen(true)}
            className="gap-2"
          >
            <BellRing size={14} />
            <span>{strings.admin.sendAlertBtn}</span>
          </Button>
        </div>
      </div>

      {/* Status Banners */}
      {refreshSuccess && (
        <div
          role="status"
          className="p-3 bg-[#E8F5E9] border border-risk-low/30 rounded-btn text-xs text-[#1B5E20] font-medium"
        >
          {strings.admin.refreshSuccess}
        </div>
      )}

      {/* Diagnostics / Error Simulator Box */}
      <div className="bg-white border border-line rounded-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-ink-500" />
          <div>
            <span className="text-xs font-semibold text-ink-900 block">
              Test Mode: Simulated API Failure
            </span>
            <span className="text-[11px] text-ink-500 block">
              Toggle simulated 503 errors to test UI skeleton, empty, and retry states.
            </span>
          </div>
        </div>
        <Button
          variant={simErrorActive ? 'danger' : 'outline'}
          size="sm"
          onClick={toggleSimulatedError}
          className="text-xs shrink-0"
        >
          {simErrorActive ? 'Simulated Error: ACTIVE' : 'Simulated Error: OFF'}
        </Button>
      </div>

      {/* District Risk Ranking Table */}
      <Card>
        <CardHeader
          title={strings.admin.highRiskRanking}
          subtitle={`Current ranking across ${rankedDistricts.length} monitoring zones`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs min-h-[36px]"
            >
              {showAll ? strings.admin.top10Only : strings.admin.showAllDistricts}
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-canvas border-b border-line text-ink-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">24h Rainfall</th>
                <th className="py-3 px-4">Primary River</th>
                <th className="py-3 px-4">AI Risk Level</th>
                <th className="py-3 px-4 text-right">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {displayedDistricts.map((d, index) => (
                <tr key={d.id} className="hover:bg-canvas/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink-500">
                    #{index + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-ink-900">
                    {d.name}
                  </td>
                  <td className="py-3.5 px-4 text-ink-700">{d.region}</td>
                  <td className="py-3.5 px-4 font-mono text-ink-900 font-medium">
                    {formatRainfall(d.rainfall.current_24h_mm)}
                  </td>
                  <td className="py-3.5 px-4 text-ink-700 truncate max-w-[150px]">
                    {d.river.name} ({d.river.current_m} m)
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge
                      level={d.current_risk.level}
                      size="sm"
                      showProbability={false}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-900">
                    {formatPercent(d.current_risk.probability)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Send manual alert dialog */}
      <SendAlertDialog
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        districts={districts}
        onSubmitAlert={handleCreateAlert}
        isLoading={createAlertMutation.isPending}
      />
    </div>
  );
}
