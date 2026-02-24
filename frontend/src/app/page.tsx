"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSocket } from "../hooks/useSocket";
import { useTerminalStore } from "../store/useTerminalStore";

// CSS Imports
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// 1. Action: Only import the Responsive component, avoiding the broken WidthProvider
const ResponsiveGridLayout = dynamic<any>(
  () => import("react-grid-layout").then((mod) => mod.Responsive),
  { ssr: false }
);

export default function TerminalPage() {
  useSocket();
  const isConnected = useTerminalStore((state) => state.isConnected);
  const marketData = useTerminalStore((state) => state.marketData);

  // 2. Action: Create our own bulletproof width calculator
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth - 16); // -16px for padding
    
    // Update width on window resize
    const handleResize = () => setWindowWidth(window.innerWidth - 16);
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialLayouts = {
    lg: [
      { i: "watchlist", x: 0, y: 0, w: 3, h: 6 },
      { i: "chart", x: 3, y: 0, w: 9, h: 4 },
      { i: "news", x: 3, y: 4, w: 6, h: 2 },
      { i: "sentiment", x: 9, y: 4, w: 3, h: 2 },
    ],
  };

  const [layouts, setLayouts] = useState(initialLayouts);

  return (
    <main className="flex flex-col h-screen w-screen bg-[#030712] text-white font-mono overflow-hidden">
      
      {/* TOP NAV BAR */}
      <nav className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-[#090e1a] z-50">
        <div className="flex items-center gap-4">
          <span className="text-green-500 font-bold tracking-tighter text-xl">INVESTSAVE</span>
          <div className="h-4 w-[1px] bg-gray-700" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">Intelligence Terminal</span>
        </div>
        
        <div className="flex items-center gap-6 text-[10px]">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'GATEWAY: ONLINE' : 'GATEWAY: OFFLINE'}
            </span>
          </div>
        </div>
      </nav>

      {/* DRAGGABLE WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-2 bg-[#030712]">
        <ResponsiveGridLayout
          className="layout"
          width={windowWidth} // 3. Action: Inject our custom width here
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          draggableHandle=".drag-handle"
          onLayoutChange={(currentLayout: any, allLayouts: any) => setLayouts(allLayouts)}
        >
          {/* WATCHLIST PANEL */}
          <div key="watchlist" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col overflow-hidden shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab active:cursor-grabbing">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Watchlist</span>
            </div>
            <div className="p-3 text-xs overflow-y-auto">
              {Object.keys(marketData).length === 0 ? (
                <span className="text-gray-500 italic">Waiting for stream...</span>
              ) : (
                Object.values(marketData).map((t: any) => (
                  <div key={t.symbol} className="flex justify-between py-1 border-b border-gray-800 last:border-0">
                    <span className="font-bold">{t.symbol}</span>
                    <span className={t.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${t.price.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MAIN CHART PANEL */}
          <div key="chart" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col overflow-hidden shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab active:cursor-grabbing">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chart</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-700 text-[10px]">[ READY ]</div>
          </div>

          {/* NEWS FEED PANEL */}
          <div key="news" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col overflow-hidden shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab active:cursor-grabbing">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Intel</span>
            </div>
            <div className="p-3 text-xs text-gray-500 italic">Streaming...</div>
          </div>

          {/* SENTIMENT PANEL */}
          <div key="sentiment" className="border border-gray-800 bg-[#0b1120] rounded flex flex-col overflow-hidden shadow-xl">
            <div className="drag-handle h-8 bg-[#161e31] border-b border-gray-800 flex items-center px-3 cursor-grab active:cursor-grabbing">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentiment</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-lg font-bold text-gray-700 tracking-tighter">NEUTRAL</div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </main>
  );
}