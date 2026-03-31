import { useState } from 'react';
import type { Page } from '../types';

interface WelcomeProps {
  onNavigate: (p: Page) => void;
  onLoadTemplate?: (index: number) => void;
}

export default function Welcome({ onNavigate, onLoadTemplate }: WelcomeProps) {
  const [visible, setVisible] = useState(true);

  const dismiss = (target: Page) => {
    localStorage.setItem('pamlab-welcomed', '1');
    setVisible(false);
    onNavigate(target);
  };

  if (!visible) return null;

  const features = [
    { icon: '🔧', title: 'Build Workflows', desc: 'Drag-and-drop workflow builder with pre-built templates for onboarding, offboarding, and emergency access' },
    { icon: '🧪', title: 'Test Against Mock APIs', desc: '7 realistic mock APIs (Fudo PAM, AD, Matrix42, ServiceNow, Jira, Remedy) — test your scripts before production' },
    { icon: '📤', title: 'Export & Deploy', desc: 'Generate production-ready PowerShell scripts with proper auth for your real systems' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Hero */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 -top-20 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 mb-4">
            PAMlab Studio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Build, test, and automate Privileged Access Management workflows
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {features.map((f) => (
          <div key={f.title} className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-blue-500/40 transition-colors">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={() => {
            onLoadTemplate?.(0);
            dismiss('workflow');
          }}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-base font-semibold shadow-lg shadow-blue-600/20 transition-all"
        >
          ▶️ Start with a Demo
        </button>
        <button
          onClick={() => dismiss('workflow')}
          className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-xl text-base font-medium transition-colors"
        >
          🔧 Build from Scratch
        </button>
      </div>
      <button
        onClick={() => dismiss('dashboard')}
        className="mt-6 text-sm text-gray-600 hover:text-gray-400 transition-colors"
      >
        Skip intro →
      </button>
    </div>
  );
}
