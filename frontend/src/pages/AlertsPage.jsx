import React, { useState, useMemo } from 'react';
import { Bell, Filter, RefreshCw, Radio } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useDistricts } from '../hooks/useDistricts';
import { AlertCard } from '../components/alerts/AlertCard';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { strings } from '../lib/strings';

export function AlertsPage() {
  const { data: alerts = [], isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const { data: districts = [] } = useDistricts();

  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const districtOptions = [
    { value: 'all', label: strings.alerts.allDistricts },
    ...districts.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const levelOptions = [
    { value: 'all', label: strings.alerts.allLevels },
    { value: 'severe', label: 'Severe' },
    { value: 'high', label: 'High' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'low', label: 'Low' },
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchDistrict = selectedDistrict === 'all' || String(alert.district_id) === selectedDistrict;
      const matchLevel = selectedLevel === 'all' || alert.level === selectedLevel;
      return matchDistrict && matchLevel;
    });
  }, [alerts, selectedDistrict, selectedLevel]);

  if (alertsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
      </div>
    );
  }

  if (alertsError) {
    return (
      <ErrorState
        title="Failed to load flood alerts"
        message="Unable to fetch official bulletins from disaster control server. Click below to retry."
        onRetry={refetchAlerts}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <Bell size={20} className="text-accent" aria-hidden="true" />
            <span>{strings.alerts.title}</span>
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">{strings.alerts.subtitle}</p>
        </div>

        {/* Aria-live container for automated alerts feed */}
        <div
          aria-live="polite"
          className="flex items-center gap-2 text-xs font-semibold text-accent bg-[#EBF5F6] border border-accent/20 px-3 py-1.5 rounded-btn"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" aria-hidden="true" />
          <span>{strings.alerts.liveAlertNotice}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-line rounded-card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          label={strings.alerts.filterByDistrict}
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          options={districtOptions}
        />

        <Select
          label={strings.alerts.filterByLevel}
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          options={levelOptions}
        />

        <div className="sm:col-span-2 lg:col-span-1 flex items-end">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedLevel('all');
            }}
            className="w-full text-xs"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Alerts Count & History Feed */}
      <div className="flex items-center justify-between text-xs text-ink-500 px-1">
        <span>
          Showing <strong>{filteredAlerts.length}</strong> active bulletin
          {filteredAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          title={strings.alerts.noAlertsFound}
          description="There are currently no official flood bulletins or warnings matching your selected criteria."
          actionLabel="Clear all filters"
          onAction={() => {
            setSelectedDistrict('all');
            setSelectedLevel('all');
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
