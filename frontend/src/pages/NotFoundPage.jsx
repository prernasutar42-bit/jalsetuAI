import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { strings } from '../lib/strings';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white border border-line rounded-card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-canvas border border-line flex items-center justify-center text-ink-500">
          <FileQuestion size={28} />
        </div>
        <div>
          <span className="font-mono text-xs font-bold text-ink-500 uppercase tracking-widest block">
            404 Error
          </span>
          <h1 className="text-lg font-bold text-ink-900 mt-1">
            {strings.common.notFoundTitle}
          </h1>
          <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">
            {strings.common.notFoundDesc}
          </p>
        </div>
        <div className="pt-2">
          <Button as={Link} to="/" variant="primary" className="w-full gap-2">
            <Home size={16} />
            <span>{strings.common.backToHome}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
