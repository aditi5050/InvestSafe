"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSocket } from "../hooks/useSocket";
import { useTerminalStore } from "../store/useTerminalStore";

const ResponsiveGridLayout = dynamic(
  () => import("react-grid-layout").then((mod) => mod.Responsive as any),
  { ssr: false }
);

export default function TerminalPage() {
  useSocket();
  const isConnected = useTerminalStore((state) => state.isConnected);
  const marketData = useTerminalStore((state) => state.marketData);
  const newsAlerts = useTerminalStore((state) => state.newsAlerts);
  const anomalies = useTerminalStore((state) => state.anomalies);
  
  // Pull the selected asset and the setter function from your store
  const selectedAsset = useTerminalStore((state) => state.selectedAsset || "AAPL");
  const setSelectedAsset = useTerminalStore((state) => state.setSelectedAsset);

  const [windowWidth, setWindowWidth] = useState(1200);
  const [videoId, setVideoId] = useState("a6KFJSDqzfc");
  const [videoInput, setVideoInput] = useState("https://www.youtube.com/watch?v=a6KFJSDqzfc");

  useEffect(() => {
    setWindowWidth(window.innerWidth - 16);
    const handleResize = () => setWindowWidth(window.innerWidth - 16);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUrlChange = (e: any) => {
    const val = e.target.value;
    setVideoInput(val);
    let extractedId = val;
    if (val.includes("v=")) extractedId = val.split("v=")[1].split("&")[0];
    else if (val.includes("youtu.be/")) extractedId = val.split("youtu.be/")[1].split("?")[0];
    if (extractedId && extractedId.length === 11) setVideoId(extractedId);
  };

  // DYNAMIC SENTIMENT CALCULATOR
  const liveSentiment = useMemo(() => {
    if (newsAlerts.length === 0) return { impact: "WAITING", conf: 0, color: "text-gray-600" };
    
    const bullish = newsAlerts.filter(n => n.impact === "BULLISH").length;
    const bearish = newsAlerts.filter(n => n.impact === "BEARISH").length;
    
    // Safely parse confidence percentage strings like "92%" to integers
    const totalConf = newsAlerts.reduce((acc, curr) => acc + parseInt(curr.confidence || "0"), 0);
    const avgConf = Math.round(totalConf / newsAlerts.length);

    if (bullish > bearish) return { impact: "BULLISH", conf: avgConf, color: "text-green-500" };
    if (bearish > bullish) return { impact: "BEARISH", conf: avgConf, color: "text-red-500" };
    return { impact: "MIXED", conf: avgConf, color: "text-yellow-500" };
  }, [newsAlerts]);

  // FIXED LAYOUT
  const initialLayouts = {
    lg: [
      { i: "watchlist", x: 0, y: 0, w: 2, h: 6 },
      { i: "stream", x: 2, y: 0, w: 5, h: 3 }, 
      { i: "chart", x: 7, y: 0, w: 5, h: 4 }, 
      { i: "news", x: 2, y: 3, w: 5, h: 3 },
      { i: "sentiment", x: 7, y: 4, w: 5, h: 2 },
    ],
  };

  const [layouts, setLayouts] = useState(initialLayouts);

  return (
    <main className="flex flex-col h-screen w-screen bg-[#030712] text-white font-mono overflow-hidden">
      
      {/* NAV BAR */}
      <nav className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-[#090e1a] z-50">
        <div className="flex items-center gap-4">
          <span className="text-green-500 font-bold tracking-tighter text-xl uppercase">InvestSafe</span>
          <div className="h-4 w-[1px] bg-gray-700" />
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Intelligence Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] uppercase">Gateway: {isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </nav>

      {/* 🚨 FLOATING ANOMALY HUD */}
      <div className="absolute top-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {anomalies.map((anomaly) => (
          <div 
            key={anomaly.id} 
            className="w-80 border border-gray-800 rounded bg-[#0b1120]/95 backdrop-blur-md shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className={`h-1 w-full ${anomaly.type.includes('BULLISH') ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <div className="p-3">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-black tracking-widest ${anomaly.type.includes('BULLISH') ? 'text-green-500' : 'text-red-500'}`}>
                  {anomaly.symbol} {anomaly.type}
                </span>
                <span className="text-[10px] text-gray-500 font-mono font-bold">Z: {anomaly.z_score}</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                {anomaly.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* DRAGGABLE WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-2">
        <ResponsiveGridLayout
          className="layout"
          width={windowWidth}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          draggableHandle=".drag-handle"
          onLayoutChange={(currentLayout: any, allLayouts: any) => setLayouts(allLayouts)}
          preventCollision={true}
          compactType={null}
        >
          {/* WATCHLIST WITH SEARCH BAR */}
          <div key="watchlist" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Watchlist</span>
              
              {/* 🔴 TWO-WAY SEARCH BAR */}
              <form 
                onSubmit={async (e: any) => {
                  e.preventDefault();
                  const symbol = e.target.symbol.value.toUpperCase();
                  if (symbol) {
                    setSelectedAsset(symbol); // Instantly updates the TradingView Chart
                    e.target.symbol.value = ""; // Clears the input box
                    
                    // 🔴 Tells the Backend to add it to the live streaming numbers
                    try {
                      await fetch("http://localhost:4000/add-asset", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ symbol })
                      });
                    } catch(err) { console.error("Failed to add asset:", err) }
                  }
                }}
              >
                <input 
                  name="symbol" 
                  type="text" 
                  placeholder="Add Asset..." 
                  onMouseDown={(e) => e.stopPropagation()} // Prevents dragging while typing
                  className="bg-[#030712] border border-gray-700 text-[9px] px-2 py-0.5 rounded w-28 text-white outline-none focus:border-blue-500 transition-colors" 
                />
              </form>
            </div>
            
            <div className="flex-1 py-2 overflow-y-auto">
              {Object.keys(marketData).length === 0 ? (
                <span className="text-gray-500 italic px-3 text-xs">Waiting for stream...</span>
              ) : (
                Object.values(marketData).map((t: any) => (
                  <div 
                    key={t.symbol} 
                    onClick={() => setSelectedAsset(t.symbol)} // TRIGGER SELECTION
                    className={`flex justify-between py-1.5 px-3 border-b border-gray-800/50 last:border-0 cursor-pointer transition-all duration-150 text-xs ${
                      selectedAsset === t.symbol 
                        ? 'bg-gray-800/80 border-l-2 border-l-blue-500' 
                        : 'hover:bg-gray-800/40 border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className={`font-bold ${selectedAsset === t.symbol ? 'text-blue-400' : 'text-gray-300'}`}>
                      {t.symbol}
                    </span>
                    <span className={t.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${t.price.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LIVE TV */}
          <div key="stream" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl relative">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab justify-between z-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span> Live TV
              </span>
              <input 
                type="text" value={videoInput} onChange={handleUrlChange} onMouseDown={(e) => e.stopPropagation()}
                className="bg-[#030712] border border-gray-700 text-[10px] px-2 py-1 rounded w-32 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex-1 bg-black relative pb-6">
              <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`} frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>

          {/* TRADINGVIEW CHART */}
          <div key="chart" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Market Chart: {selectedAsset}</span>
            </div>
            <div className="flex-1 bg-[#0b1120] overflow-hidden">
              <iframe
                src={`https://s.tradingview.com/widgetembed/?symbol=${selectedAsset}&interval=D&hidesidetoolbar=1&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`}
                style={{ width: "100%", height: "100%", border: "none" }}
              ></iframe>
            </div>
          </div>

          {/* AI INTEL FEED */}
          <div key="news" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live AI Analysis & Trade Ideas</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {newsAlerts.length === 0 ? (
                <span className="text-gray-500 italic text-xs">Waiting for AI analysis...</span>
              ) : (
                newsAlerts.map((alert, index) => (
                  <div key={index} className={`border-l-2 pl-3 py-2 bg-[#0f172a] ${
                    alert.impact === 'BULLISH' ? 'border-green-500' : 
                    alert.impact === 'BEARISH' ? 'border-red-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] font-bold uppercase ${
                        alert.impact === 'BULLISH' ? 'text-green-400' : 
                        alert.impact === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {alert.impact} ({alert.confidence})
                      </span>
                      <span className="text-[8px] text-gray-500 italic uppercase">{alert.category || 'Macro'}</span>
                    </div>
                    
                    <div className="text-xs text-gray-200 font-medium leading-tight mb-2">
                      {alert.headline}
                    </div>
                    
                    {/* ACTIONABLE ADVICE */}
                    <div className="text-[9px] text-gray-400 bg-[#030712] p-1.5 rounded border border-gray-800 flex flex-col gap-1.5">
                      <span><strong className="text-blue-400 uppercase">Analysis:</strong> {alert.summary || "Processing text context..."}</span>
                      <span><strong className="text-purple-400 uppercase">Trade Idea:</strong> {alert.suggestion || "Awaiting volume confirmation."}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DYNAMIC SENTIMENT */}
          <div key="sentiment" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Market Sentiment</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
               <span className={`text-4xl font-black tracking-tighter ${liveSentiment.color}`}>
                 {liveSentiment.impact}
               </span>
               <span className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">
                 Avg Confidence: {liveSentiment.conf}%
               </span>
            </div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </main>
  );
}