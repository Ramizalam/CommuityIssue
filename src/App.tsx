import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ReportIssue } from './pages/ReportIssue';
import { IssueList } from './pages/IssueList';
import { AdminPanel } from './components/AdminPanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
          <Route path="/admin" element={<AdminPanel />} />
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/issues" element={<IssueList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;