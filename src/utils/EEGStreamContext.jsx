import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const EEGStreamContext = createContext(null);

const getWsUrl = (path) => {
  const host = window.location.hostname || "127.0.0.1";
  return `ws://${host}:8000${path}`;
};

const initBands = Array(30).fill({ val: 0 });
const initGraph = Array(30).fill({ time: "--:--:--", attention: 50 });

export function EEGStreamProvider({ children }) {
  // --- Dashboard Stream State ---
  const [dashboardData, setDashboardData] = useState({
    score: 0,
    state: "Waiting",
    stress: 0,
    confidence: 0,
    explanation: "Upload a dataset to begin real-time analysis...",
    trend: "stable",
    drop_detected: false
  });
  const [history, setHistory] = useState(initGraph);
  const [bands, setBands] = useState({ alpha: initBands, beta: initBands, theta: initBands });
  const [metrics, setMetrics] = useState(null);
  const [dashboardConnected, setDashboardConnected] = useState(false);

  // --- Research Stream State ---
  const [researchData, setResearchData] = useState(null);
  const [researchConnected, setResearchConnected] = useState(false);

  const dashWsRef = useRef(null);
  const resWsRef = useRef(null);
  const dashReconnectTimer = useRef(null);
  const resReconnectTimer = useRef(null);
  const isMounted = useRef(true);

  // Helper to fetch metrics
  const fetchMetrics = () => {
    const host = window.location.hostname || "127.0.0.1";
    fetch(`http://${host}:8000/api/v1/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error("Failed to fetch metrics", err));
  };

  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();

    // 1. Establish Dashboard Stream
    function connectDashboard() {
      if (!isMounted.current) return;
      if (dashWsRef.current && dashWsRef.current.readyState <= 1) return;

      const ws = new WebSocket(getWsUrl("/api/v1/stream"));
      dashWsRef.current = ws;

      ws.onopen = () => {
        setDashboardConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;
        const data = JSON.parse(event.data);
        setDashboardData(data);
        if (data.score > 0) {
          setHistory(prev => [...prev.slice(1), { time: data.timestamp, attention: data.score }]);
          setBands(prev => ({
            alpha: [...prev.alpha.slice(1), { val: data.alpha }],
            beta:  [...prev.beta.slice(1),  { val: data.beta  }],
            theta: [...prev.theta.slice(1), { val: data.theta }]
          }));
        }
      };

      ws.onclose = () => {
        setDashboardConnected(false);
        if (!isMounted.current) return;
        dashReconnectTimer.current = setTimeout(connectDashboard, 1500);
      };

      ws.onerror = () => ws.close();
    }

    // 2. Establish Research Stream
    function connectResearch() {
      if (!isMounted.current) return;
      if (resWsRef.current && resWsRef.current.readyState <= 1) return;

      const ws = new WebSocket(getWsUrl("/api/v1/research/stream"));
      resWsRef.current = ws;

      ws.onopen = () => {
        setResearchConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;
        const data = JSON.parse(event.data);
        if (data.type === "research") {
          setResearchData(data);
        } else if (data.type === "waiting") {
          setResearchData(null);
        }
      };

      ws.onclose = () => {
        setResearchConnected(false);
        if (!isMounted.current) return;
        resReconnectTimer.current = setTimeout(connectResearch, 1500);
      };

      ws.onerror = () => ws.close();
    }

    connectDashboard();
    connectResearch();

    // Trigger regular metrics updates every 10s
    const metricsInterval = setInterval(fetchMetrics, 10000);

    return () => {
      isMounted.current = false;
      clearTimeout(dashReconnectTimer.current);
      clearTimeout(resReconnectTimer.current);
      clearInterval(metricsInterval);
      if (dashWsRef.current) dashWsRef.current.close();
      if (resWsRef.current) resWsRef.current.close();
    };
  }, []);

  return (
    <EEGStreamContext.Provider value={{
      dashboardData,
      history,
      bands,
      metrics,
      dashboardConnected,
      researchData,
      researchConnected,
      refreshMetrics: fetchMetrics
    }}>
      {children}
    </EEGStreamContext.Provider>
  );
}

export function useEEGStream() {
  const context = useContext(EEGStreamContext);
  if (!context) {
    throw new Error("useEEGStream must be used within an EEGStreamProvider");
  }
  return context;
}
