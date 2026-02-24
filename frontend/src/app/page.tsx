"use client";

import React, { useState, useEffect } from "react";
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

  // RESTORED: All 5 blocks from your 6:38 PM version
  const initialLayouts = {
    lg: [
      { i: "watchlist", x: 0, y: 0, w: 3, h: 6 },
      { i: "stream", x: 3, y: 0, w: 6, h: 4 },
      { i: "chart", x: 9, y: 0, w: 3, h: 4 },
      { i: "news", x: 3, y: 4, w: 6, h: 2 },
      { i: "sentiment", x: 9, y: 4, w: 3, h: 2 },
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
        >
          {/* 1. WATCHLIST */}
          <div key="watchlist" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Watchlist</span>
            </div>
            <div className="flex-1 p-3 text-xs overflow-y-auto">
              {Object.keys(marketData).length === 0 ? (
                <span className="text-gray-500 italic">Waiting for stream...</span>
              ) : (
                Object.values(marketData).map((t: any) => (
                  <div key={t.symbol} className="flex justify-between py-1 border-b border-gray-800 last:border-0">
                    <span className="font-bold text-gray-300">{t.symbol}</span>
                    <span className={t.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${t.price.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. LIVE TV */}
          <div key="stream" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl relative">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab justify-between z-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span> Live TV
              </span>
              <input 
                type="text" value={videoInput} onChange={handleUrlChange} onMouseDown={(e) => e.stopPropagation()}
                className="bg-[#030712] border border-gray-700 text-[10px] px-2 py-1 rounded w-48 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex-1 bg-black relative pb-6">
              <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`} frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>

          {/* 3. CHART */}
          <div key="chart" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Chart</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-700 text-[10px]">[ READY ]</div>
          </div>

          {/* 4. AI INTEL */}
          <div key="news" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">AI Intel</span>
            </div>
            <div className="p-3 text-xs text-gray-500 italic">Streaming...</div>
          </div>

          {/* 5. SENTIMENT */}
          <div key="sentiment" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sentiment</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-lg font-bold text-gray-700">NEUTRAL</div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </main>
  );
}