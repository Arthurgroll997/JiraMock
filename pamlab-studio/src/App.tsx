import { useState, useMemo } from 'react';
import type { Page, ApiResult, StepResultType } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ScenarioBuilder from './components/ScenarioBuilder';
import WorkflowWizard from './components/WorkflowWizard';
import CodeEditor from './components/CodeEditor';
import ResultsPanel from './components/ResultsPanel';
import ApiExplorer from './components/ApiExplorer';
import EventStream from './components/EventStream';
import Settings from './components/Settings';
import Welcome from './components/Welcome';
import RunHistory from './components/RunHistory';
import { useKeyboardShortcuts, type Shortcut } from './hooks/useKeyboardShortcuts';

const PAGE_SHORTCUTS: Page[] = ['dashboard', 'workflow', 'editor', 'explorer', 'settings'];

export default function App() {
  const welcomed = localStorage.getItem('pamlab-welcomed');
  const [page, setPage] = useState<Page>(welcomed ? 'dashboard' : 'welcome');
  const [script, setScript] = useState('# Write your PowerShell script here\n');
  const [steps, setSteps] = useState<StepResultType[]>([]);
  const [traffic, setTraffic] = useState<ApiResult[]>([]);
  const [pendingTemplate, setPendingTemplate] = useState<number | null>(null);

  const shortcuts = useMemo<Shortcut[]>(() => [
    ...PAGE_SHORTCUTS.map((p, i) => ({
      key: String(i + 1),
      ctrl: true,
      handler: () => setPage(p),
      description: `Navigate to ${p}`,
    })),
    { key: 'Enter', ctrl: true, handler: () => { if (page === 'editor') window.dispatchEvent(new CustomEvent('pamlab:run')); }, description: 'Run script' },
    { key: 's', ctrl: true, handler: () => { if (page === 'editor') window.dispatchEvent(new CustomEvent('pamlab:save')); }, description: 'Save script' },
    { key: 'e', ctrl: true, handler: () => { if (page === 'editor') window.dispatchEvent(new CustomEvent('pamlab:export')); }, description: 'Export script' },
    { key: 'e', ctrl: true, shift: true, handler: () => { if (page === 'editor') window.dispatchEvent(new CustomEvent('pamlab:export-production')); }, description: 'Export for Production' },
  ], [page]);

  useKeyboardShortcuts(shortcuts);

  const handleResults = (s: StepResultType[], t: ApiResult[]) => {
    setSteps(s);
    setTraffic(t);
  };

  const handleNavigate = (p: Page) => {
    setPage(p);
  };

  const renderPage = () => {
    switch (page) {
      case 'welcome': return <Welcome onNavigate={handleNavigate} onLoadTemplate={(i) => setPendingTemplate(i)} />;
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'scenarios': return <ScenarioBuilder onNavigate={handleNavigate} onLoadScript={setScript} />;
      case 'workflow': return <WorkflowWizard onNavigate={handleNavigate} onLoadScript={setScript} initialTemplate={pendingTemplate} onTemplateConsumed={() => setPendingTemplate(null)} />;
      case 'editor': return <CodeEditor script={script} onScriptChange={setScript} onResults={handleResults} />;
      case 'results': return <ResultsPanel steps={steps} traffic={traffic} />;
      case 'explorer': return <ApiExplorer />;
      case 'events': return <EventStream />;
      case 'history': return <RunHistory />;
      case 'settings': return <Settings />;
    }
  };

  if (page === 'welcome') {
    return <Welcome onNavigate={handleNavigate} onLoadTemplate={(i) => setPendingTemplate(i)} />;
  }

  return <Layout activePage={page} onNavigate={handleNavigate}>{renderPage()}</Layout>;
}
