import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { RecentPredictionsModal } from './components/RecentPredictionsModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CongestionPredictionPage } from './pages/CongestionPredictionPage';
import { WaitingTimePredictionPage } from './pages/WaitingTimePredictionPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { AboutPage } from './pages/AboutPage';
import { api } from './services/api';
import {
  MetadataResponse,
  StoredPrediction,
  PredictionInput,
  UserWorkflowState,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<UserWorkflowState | null>(null);
  const [sessionPredictions, setSessionPredictions] = useState<StoredPrediction[]>(() => {
    try {
      const saved = localStorage.getItem('naviport_session_predictions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [predictionPrefill, setPredictionPrefill] = useState<Partial<PredictionInput> | null>(null);

  useEffect(() => {
    api.getMetadata()
      .then(setMetadata)
      .catch((err) => console.error('Error fetching metadata:', err));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('naviport_session_predictions', JSON.stringify(sessionPredictions));
    } catch (e) {
      console.error('Failed to save session predictions:', e);
    }
  }, [sessionPredictions]);

  const handlePredictionCompleted = (newPred: StoredPrediction) => {
    setSessionPredictions((prev) => [newPred, ...prev.slice(0, 49)]); // Keep last 50
  };

  const handleClearHistory = () => {
    setSessionPredictions([]);
    localStorage.removeItem('naviport_session_predictions');
  };

  const handleSelectPredictionToReload = (pred: StoredPrediction) => {
    setPredictionPrefill(pred.input);
    if (pred.type === 'congestion') {
      setActiveTab('congestion');
    } else {
      setActiveTab('waiting-time');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#071426] text-[#F3F7FC] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={sessionPredictions.length}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            metadataCount={metadata?.dataset_records ?? 0}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            metadata={metadata}
            onSelectPortForPrediction={(port) => {
              setPredictionPrefill({ port });
              setActiveTab('congestion');
            }}
          />
        )}

        {activeTab === 'congestion' && (
          <CongestionPredictionPage
            metadata={metadata}
            onPredictionCompleted={handlePredictionCompleted}
            onProceedToWaitingTime={(input, congResult) => {
              setActiveScenario((prev) => ({
                input,
                congestionResult: congResult,
                waitingTimeResult: prev?.waitingTimeResult || null,
              }));
              setPredictionPrefill({ ...input, congestion_class: congResult.prediction.class });
              setActiveTab('waiting-time');
            }}
            initialValues={predictionPrefill}
          />
        )}

        {activeTab === 'waiting-time' && (
          <WaitingTimePredictionPage
            metadata={metadata}
            onPredictionCompleted={handlePredictionCompleted}
            congestionResult={activeScenario?.congestionResult}
            onNavigateToCongestion={() => setActiveTab('congestion')}
            onProceedToAnalytics={(input, cong, waitResult) => {
              setActiveScenario({
                input,
                congestionResult: cong,
                waitingTimeResult: waitResult,
              });
              setActiveTab('analytics');
            }}
            initialValues={predictionPrefill}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage
            metadata={metadata}
            activeScenario={activeScenario}
            predictions={sessionPredictions}
            onModifyScenario={(type) => setActiveTab(type)}
            onClearScenario={() => setActiveScenario(null)}
            onSelectPrediction={handleSelectPredictionToReload}
            onClearPredictions={handleClearHistory}
          />
        )}

        {activeTab === 'model-info' && (
          <ModelInfoPage />
        )}

        {activeTab === 'about' && (
          <AboutPage setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Session History Modal */}
      <RecentPredictionsModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        predictions={sessionPredictions}
        onClearHistory={handleClearHistory}
        onSelectPrediction={handleSelectPredictionToReload}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
