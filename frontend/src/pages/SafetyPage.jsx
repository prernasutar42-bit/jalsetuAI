import React, { useState } from 'react';
import { Phone, CheckSquare, Square, LifeBuoy, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { strings } from '../lib/strings';

export function SafetyPage() {
  const [activeTab, setActiveTab] = useState('before'); // 'before' | 'during' | 'after'
  const [completedItems, setCompletedItems] = useState({});

  const toggleCheck = (id) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getActiveChecklist = () => {
    switch (activeTab) {
      case 'during':
        return strings.safety.checklistDuring;
      case 'after':
        return strings.safety.checklistAfter;
      case 'before':
      default:
        return strings.safety.checklistBefore;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <LifeBuoy size={20} className="text-accent" aria-hidden="true" />
          <span>{strings.safety.title}</span>
        </h1>
        <p className="text-xs text-ink-500 mt-0.5">{strings.safety.subtitle}</p>
      </div>

      {/* Emergency Helplines Section (Tap to Call) */}
      <section aria-labelledby="helpline-heading">
        <h2 id="helpline-heading" className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-3">
          {strings.safety.emergencyHelplines} (Verified 24/7)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {strings.safety.contacts.map((contact) => (
            <div
              key={contact.number}
              className="bg-white border border-line rounded-card p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block">
                  {contact.label}
                </span>
                <h3 className="text-sm font-bold text-ink-900 mt-0.5">{contact.name}</h3>
                <p className="text-[11px] text-ink-500 mt-1 leading-normal">{contact.desc}</p>
              </div>

              <a
                href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                className="min-h-[44px] px-3.5 py-2 rounded-btn bg-[#EBF5F6] hover:bg-[#D8EDEF] border border-accent/20 text-accent font-mono font-bold text-sm flex items-center justify-between transition-colors"
                aria-label={`Call ${contact.name} at ${contact.number}`}
              >
                <span>{contact.number}</span>
                <span className="flex items-center gap-1 text-xs font-sans font-semibold">
                  <Phone size={14} />
                  <span>{strings.safety.callNow}</span>
                </span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Action Checklists: Before / During / After */}
      <section aria-labelledby="checklists-heading">
        <Card>
          <CardHeader
            title={strings.safety.checklistsTitle}
            subtitle="Step-by-step mitigation and personal safety protocols"
          />
          <CardBody className="space-y-4">
            {/* Tab navigation */}
            <div
              role="tablist"
              aria-label="Flood preparedness stages"
              className="flex border-b border-line gap-2 overflow-x-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'before'}
                onClick={() => setActiveTab('before')}
                className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'before'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                {strings.safety.tabBefore}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'during'}
                onClick={() => setActiveTab('during')}
                className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'during'
                    ? 'border-risk-high text-risk-high'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                {strings.safety.tabDuring}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'after'}
                onClick={() => setActiveTab('after')}
                className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'after'
                    ? 'border-risk-low text-risk-low'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                {strings.safety.tabAfter}
              </button>
            </div>

            {/* Checklist items list */}
            <div className="space-y-6 pt-2">
              {getActiveChecklist().map((section) => (
                <div key={section.id} className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, idx) => {
                      const itemKey = `${section.id}-${idx}`;
                      const isDone = Boolean(completedItems[itemKey]);

                      return (
                        <div
                          key={itemKey}
                          onClick={() => toggleCheck(itemKey)}
                          role="checkbox"
                          aria-checked={isDone}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleCheck(itemKey);
                            }
                          }}
                          className={`p-3 rounded-btn border text-xs sm:text-sm flex items-start gap-3 cursor-pointer select-none transition-colors ${
                            isDone
                              ? 'bg-[#F0FDF4] border-risk-low/30 text-ink-500 line-through'
                              : 'bg-canvas hover:bg-white border-line text-ink-900'
                          }`}
                        >
                          <div className="pt-0.5 text-accent shrink-0">
                            {isDone ? (
                              <CheckSquare size={17} className="text-risk-low" />
                            ) : (
                              <Square size={17} className="text-ink-500" />
                            )}
                          </div>
                          <span className="leading-relaxed flex-1">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
