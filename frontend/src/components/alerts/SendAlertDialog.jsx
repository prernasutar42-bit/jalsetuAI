import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { strings } from '../../lib/strings';

export function SendAlertDialog({
  isOpen,
  onClose,
  districts = [],
  onSubmitAlert,
  isLoading = false,
}) {
  const [districtId, setDistrictId] = useState(districts[0]?.id || 1);
  const [level, setLevel] = useState('high');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const districtOptions = districts.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.region})`,
  }));

  const levelOptions = [
    { value: 'severe', label: 'Severe Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'moderate', label: 'Moderate Risk' },
    { value: 'low', label: 'Low Risk' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide specific advisory instructions.');
      return;
    }

    const selectedDistrict = districts.find((d) => d.id === Number(districtId));

    onSubmitAlert({
      district_id: Number(districtId),
      district_name: selectedDistrict?.name || 'Maharashtra Zone',
      level,
      message: message.trim(),
    });

    setMessage('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={strings.admin.dialogTitle}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-ink-500">{strings.admin.dialogSubtitle}</p>

        <Select
          label={strings.admin.selectDistrictLabel}
          value={districtId}
          onChange={(e) => setDistrictId(Number(e.target.value))}
          options={districtOptions}
        />

        <Select
          label={strings.admin.severityLabel}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          options={levelOptions}
        />

        <div>
          <label
            htmlFor="alert-message-textarea"
            className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
          >
            {strings.admin.alertMessageLabel}
          </label>
          <textarea
            id="alert-message-textarea"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError('');
            }}
            placeholder={strings.admin.alertMessagePlaceholder}
            className="w-full p-3 text-xs bg-white border border-line rounded-input text-ink-900 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          {error && <p className="mt-1 text-xs text-risk-severe font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {strings.admin.cancelBtn}
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
            {isLoading ? 'Broadcasting...' : strings.admin.publishBtn}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
