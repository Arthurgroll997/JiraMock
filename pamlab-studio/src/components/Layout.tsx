import type { Page } from '../types';
import Sidebar from './Sidebar';

export default function Layout({ activePage, onNavigate, children }: { activePage: Page; onNavigate: (p: Page) => void; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
