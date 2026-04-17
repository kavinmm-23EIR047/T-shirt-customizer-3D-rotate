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
  const [activeMobileColorPart, setActiveMobileColorPart] = useState(null); // 'front', 'back', 'sleeve', 'collar'

  const [colors, setColors] = useState({
    front: '#ffffff',
    back: '#ffffff',
    sleeve: '#cccccc',
    collar: '#999999',
  })

  const [logos, setLogos] = useState({ front: null, back: null })

  const [logoStyle, setLogoStyle] = useState({
    front: 'full',
    back: 'full',
  })

  const setLogo = (side, url) =>
    setLogos(l => ({ ...l, [side]: url }))

  const setStyle = (side, style) =>
    setLogoStyle(prev => ({ ...prev, [side]: style }))

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans overflow-hidden">
      
      {/* ── HEADER (Shared) ── */}
      <div className="bg-white h-16 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            T
          </div>
          <h1 className="text-gray-900 text-lg lg:text-xl font-extrabold tracking-tight">T-Shirt Studio</h1>
          <span className="hidden sm:inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">PRO</span>
        </div>
        <div className="hidden sm:flex gap-4">
          <button className="text-gray-500 hover:text-gray-900 font-medium text-sm transition">Models</button>
          <button className="text-gray-500 hover:text-gray-900 font-medium text-sm transition">Inspirations</button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#f1f3f5]">
        
        {/* ── 3D CANVAS (Always Full Screen) ── */}
        <div className="absolute inset-0 z-0">
          <TShirtViewer
            view={view}
            colors={colors}
            logos={logos}
            logoStyle={logoStyle}
          />
        </div>

        {/* ── DESKTOP ONLY: LEFT SIDEBAR (Premium Glass) ── */}
        <div className="hidden lg:flex absolute left-8 top-12 bottom-12 w-[380px] z-20 pointer-events-none flex-col">
          <div className="bg-white/70 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-white/80 pointer-events-auto h-full flex flex-col transition-all hover:translate-x-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shadow-md font-black">1</span>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Fabric Colors</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
              <ColorPicker colors={colors} setColors={setColors} presets={PRESETS} />
            </div>
          </div>
        </div>

        {/* ── DESKTOP ONLY: RIGHT SIDEBAR (Premium Glass) ── */}
        <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col gap-6 items-end group pr-4">
          {/* Action Cards */}
          <div className="w-[380px] bg-white/70 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-white/80 flex flex-col h-fit max-h-[80vh] transition-all hover:-translate-x-1">
             <div className="flex items-center gap-3 mb-6">
               <span className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xs shadow-md font-black">2</span>
               <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest leading-none mt-1">Logo Design</h2>
             </div>
             <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                <LogoUploader frontLogo={logos.front} backLogo={logos.back} onUpload={setLogo} style={logoStyle} setStyle={setStyle} />
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimated</div>
                      <div className="text-4xl font-black mb-4">$29<span className="text-xl">.99</span></div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                        Checkout Now
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                  </div>
                </div>
             </div>
          </div>
          {/* Floating Camera Pills */}
          <div className="bg-white/40 backdrop-blur-3xl p-3 flex flex-col gap-2 rounded-full shadow-2xl border border-white items-center">
             {['top','bottom','left','front','back','right'].map(v => (
               <button key={v} onClick={() => setView(v)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${view === v ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-white/80 hover:bg-white text-gray-600'}`}>
                 <span className="capitalize text-[10px] font-bold">{v[0]}</span>
               </button>
             ))}
             <div className="h-4 w-[1px] bg-gray-400/20 my-1"></div>
             <button onClick={() => window.dispatchEvent(new Event('ZOOM_IN'))} className="w-10 h-10 rounded-full bg-white/80 hover:bg-blue-600 hover:text-white transition-all font-bold group">
                <span className="group-hover:scale-125 transition-transform block">+</span>
             </button>
             <button onClick={() => window.dispatchEvent(new Event('ZOOM_OUT'))} className="w-10 h-10 rounded-full bg-white/80 hover:bg-blue-600 hover:text-white transition-all font-bold group">
                <span className="group-hover:scale-125 transition-transform block">-</span>
             </button>
          </div>
        </div>

        {/* ── MOBILE ONLY: LEFT EDGE COLOR ACCORDION ── */}
        <div className="lg:hidden absolute left-4 top-24 z-30 flex gap-2 pointer-events-none items-start">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700 p-1.5 flex flex-col gap-1 pointer-events-auto">
            {['front', 'back', 'sleeve', 'collar'].map(part => (
              <button
                key={part}
                onClick={() => setActiveMobileColorPart(activeMobileColorPart === part ? null : part)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeMobileColorPart === part ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
          
          {/* Expanded Color Picker Panel */}
          {activeMobileColorPart && (
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700 p-4 w-64 shadow-2xl pointer-events-auto animate-in slide-in-from-left-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest">{activeMobileColorPart} COLOR</h3>
                <button onClick={() => setActiveMobileColorPart(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                 <ColorPicker 
                   colors={colors} 
                   setColors={setColors} 
                   presets={{[activeMobileColorPart]: PRESETS[activeMobileColorPart]}} 
                   isMobileCompact 
                 />
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE ONLY: VIEW CONTROLS (Floating Above Sheet) ── */}
        <div className="lg:hidden absolute bottom-[110px] left-1/2 -translate-x-1/2 z-30 flex items-center bg-gray-900/80 backdrop-blur-lg px-4 py-2 rounded-full border border-gray-700 shadow-2xl gap-2">
          {['front', 'back', 'left', 'right'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                view === v ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              {v}
            </button>
          ))}
          <div className="w-[1px] h-3 bg-gray-700 mx-1"></div>
          <button onClick={() => window.dispatchEvent(new Event('ZOOM_IN'))} className="text-white font-bold p-1">+</button>
          <button onClick={() => window.dispatchEvent(new Event('ZOOM_OUT'))} className="text-white font-bold p-1">-</button>
        </div>

        {/* ── MOBILE ONLY: DARK BOTTOM SHEET ── */}
        <div className="lg:hidden fixed inset-0 z-40 pointer-events-none">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
            onClick={() => setSheetOpen(false)}
          />
          <div
            className={`absolute left-0 right-0 bottom-0 transition-transform duration-500 ease-out pointer-events-auto bg-gray-900 border-t border-gray-700 rounded-t-[2.5rem] flex flex-col ${sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}
          >
            {/* Handle */}
            <div className="w-full flex flex-col items-center pt-4 pb-3 cursor-pointer" onClick={() => setSheetOpen(!sheetOpen)}>
              <div className="w-14 h-1.5 bg-gray-700 rounded-full mb-2"></div>
              <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
                {sheetOpen ? 'Minimize' : 'Logo & Graphics'}
              </span>
            </div>

            {/* Content (Logo & Checkout) */}
            <div className="px-5 pb-10 flex flex-col gap-6 max-h-[65vh] overflow-y-auto scrollbar-hide">
              <div className="bg-gray-800/80 p-5 rounded-3xl border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">★</span>
                  <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Graphics Studio</h2>
                </div>
                <LogoUploader 
                  frontLogo={logos.front} 
                  backLogo={logos.back} 
                  onUpload={setLogo} 
                  style={logoStyle} 
                  setStyle={setStyle} 
                  isMobile
                />
              </div>

              <div className="bg-black/50 p-6 rounded-[2rem] border border-gray-800 flex flex-col gap-4">
                 <div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Final Total</div>
                    <div className="text-3xl font-black text-white">$29.99</div>
                 </div>
                 <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform uppercase tracking-widest">
                   Checkout Now
                 </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}