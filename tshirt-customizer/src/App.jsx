import React, { useState } from 'react'
import TShirtViewer from './components/TShirtViewer'
import ColorPicker from './components/ColorPicker'
import LogoUploader from './components/LogoUploader'

const PRESETS = {
  front: ['#ffffff', '#000000', '#1a73e8', '#e53935', '#43a047', '#fdd835', '#f57c00', '#8e24aa'],
  back: ['#ffffff', '#000000', '#1a73e8', '#e53935', '#43a047', '#fdd835', '#f57c00', '#8e24aa'],
  sleeve: ['#ffffff', '#000000', '#1a73e8', '#e53935', '#43a047', '#fdd835', '#f57c00', '#8e24aa'],
  collar: ['#ffffff', '#000000', '#1a73e8', '#e53935', '#43a047', '#fdd835', '#f57c00', '#8e24aa'],
}

export default function App() {
  const [view, setView] = useState('front')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeMobileColorPart, setActiveMobileColorPart] = useState(null)

  const [colors, setColors] = useState({
    front: '#ffffff',
    back: '#ffffff',
    sleeve: '#cccccc',
    collar: '#999999',
  })

  const [logos, setLogos] = useState({ front: null, back: null })
  const [logoStyle, setLogoStyle] = useState({ front: 'full', back: 'full' })

  const setLogo = (side, url) => setLogos(l => ({ ...l, [side]: url }))
  const setStyle = (side, style) => setLogoStyle(prev => ({ ...prev, [side]: style }))

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans overflow-hidden">

      {/* ── HEADER ── */}
      <header className="bg-white h-14 flex items-center justify-between px-6 border-b border-gray-100 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow">
            T
          </div>
          <h1 className="text-gray-900 text-base font-extrabold tracking-tight">T-Shirt Studio</h1>
          <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100">PRO</span>
        </div>
        <div className="hidden sm:flex gap-5">
          <button className="text-gray-400 hover:text-gray-700 font-medium text-sm transition">Models</button>
          <button className="text-gray-400 hover:text-gray-700 font-medium text-sm transition">Inspirations</button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── 3D CANVAS (Full Background) ── */}
        <div className="absolute inset-0 z-0">
          <TShirtViewer
            view={view}
            colors={colors}
            logos={logos}
            logoStyle={logoStyle}
          />
        </div>

        {/* ════════════════════════════════════
            DESKTOP LAYOUT
        ════════════════════════════════════ */}

        {/* LEFT SIDEBAR — Fabric Colors */}
        <div className="hidden lg:block absolute left-6 top-6 bottom-6 w-72 z-20">
          <div className="bg-white/85 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/60 h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow">1</span>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Fabric Colors</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ColorPicker colors={colors} setColors={setColors} presets={PRESETS} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — Logo Design + Checkout */}
        <div className="hidden lg:block absolute right-6 top-6 bottom-6 w-72 z-20">
          <div className="bg-white/85 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/60 h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black shadow">2</span>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Logo Design</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Logo Uploader — centered */}
              <div className="flex flex-col items-center w-full">
                <LogoUploader
                  frontLogo={logos.front}
                  backLogo={logos.back}
                  onUpload={setLogo}
                  style={logoStyle}
                  setStyle={setStyle}
                />
              </div>
            </div>
            {/* Checkout pinned at bottom */}
            <div className="p-4 border-t border-gray-100 bg-white/60">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Estimated</div>
                <div className="text-3xl font-black text-white mb-3">$29<span className="text-lg">.99</span></div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-blue-500/20">
                  Checkout Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW CONTROLS — centered at bottom of t-shirt area */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 items-center gap-1 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-lg border border-white/70">
          {['top', 'bottom', 'left', 'front', 'back', 'right'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                view === v
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {v}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => window.dispatchEvent(new Event('ZOOM_IN'))}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 transition-all font-bold text-lg flex items-center justify-center"
          >+</button>
          <button
            onClick={() => window.dispatchEvent(new Event('ZOOM_OUT'))}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 transition-all font-bold text-xl flex items-center justify-center leading-none"
          >−</button>
        </div>


        {/* ════════════════════════════════════
            MOBILE LAYOUT
        ════════════════════════════════════ */}

        {/* MOBILE — Part color picker accordion (left edge) */}
        <div className="lg:hidden absolute left-3 top-4 z-30 flex gap-2 items-start">
          <div className="bg-gray-900/85 backdrop-blur-lg rounded-xl border border-gray-700/60 p-1 flex flex-col gap-0.5">
            {['front', 'back', 'sleeve', 'collar'].map(part => (
              <button
                key={part}
                onClick={() => setActiveMobileColorPart(activeMobileColorPart === part ? null : part)}
                className={`px-2.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeMobileColorPart === part
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {part}
              </button>
            ))}
          </div>

          {activeMobileColorPart && (
            <div className="bg-gray-900/92 backdrop-blur-xl rounded-2xl border border-gray-700 p-4 w-56 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-[9px] font-black uppercase tracking-widest">{activeMobileColorPart} Color</h3>
                <button onClick={() => setActiveMobileColorPart(null)} className="text-gray-400 hover:text-white text-sm w-5 h-5 flex items-center justify-center">✕</button>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                <ColorPicker
                  colors={colors}
                  setColors={setColors}
                  presets={{ [activeMobileColorPart]: PRESETS[activeMobileColorPart] }}
                  isMobileCompact
                />
              </div>
            </div>
          )}
        </div>

        {/* MOBILE — View controls, centered bottom (above sheet) */}
        <div className="lg:hidden absolute bottom-[100px] left-1/2 -translate-x-1/2 z-30 flex items-center bg-gray-900/85 backdrop-blur-lg px-3 py-2 rounded-full border border-gray-700/50 shadow-xl gap-1">
          {['front', 'back', 'left', 'right'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                view === v ? 'bg-blue-600 text-white shadow' : 'text-gray-400'
              }`}
            >
              {v}
            </button>
          ))}
          <div className="w-px h-3 bg-gray-700 mx-1" />
          <button onClick={() => window.dispatchEvent(new Event('ZOOM_IN'))} className="text-white font-bold px-2 text-lg">+</button>
          <button onClick={() => window.dispatchEvent(new Event('ZOOM_OUT'))} className="text-white font-bold px-2 text-xl leading-none">−</button>
        </div>

        {/* MOBILE — Bottom sheet (Logo & Checkout) */}
        <div className="lg:hidden fixed inset-0 z-40 pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
            onClick={() => setSheetOpen(false)}
          />
          {/* Sheet */}
          <div
            className={`absolute left-0 right-0 bottom-0 transition-transform duration-500 ease-out pointer-events-auto bg-white border-t border-gray-200 rounded-t-3xl flex flex-col ${
              sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-88px)]'
            }`}
          >
            {/* Handle / drag tab */}
            <div
              className="w-full flex flex-col items-center pt-3 pb-2 cursor-pointer select-none"
              onClick={() => setSheetOpen(!sheetOpen)}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
              <span className="text-[10px] font-black tracking-[0.18em] text-blue-500 uppercase">
                {sheetOpen ? '↓ Close' : '↑ Logo & Checkout'}
              </span>
            </div>

            <div className="px-5 pb-10 flex flex-col gap-5 max-h-[65vh] overflow-y-auto">
              {/* Logo uploader — centered */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 self-start">
                  <span className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">★</span>
                  <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Graphics Studio</h2>
                </div>
                <div className="w-full flex flex-col items-center">
                  <LogoUploader
                    frontLogo={logos.front}
                    backLogo={logos.back}
                    onUpload={setLogo}
                    style={logoStyle}
                    setStyle={setStyle}
                    isMobile
                  />
                </div>
              </div>

              {/* Checkout card */}
              <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-4">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Final Total</div>
                  <div className="text-3xl font-black text-white">$29.99</div>
                </div>
                <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform uppercase tracking-widest">
                  Checkout Now →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
