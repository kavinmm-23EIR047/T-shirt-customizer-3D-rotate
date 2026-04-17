import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

export default function ColorPicker({ colors, setColors, presets, isMobileCompact }) {
  const presetKeys = Object.keys(presets)
  const defaultTab = isMobileCompact ? presetKeys[0] : 'front'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (isMobileCompact && presetKeys[0]) {
      setActiveTab(presetKeys[0])
      setShowPicker(false)
    }
  }, [presetKeys[0], isMobileCompact])

  const tabs = [
    { id: 'front',  label: 'Front'   },
    { id: 'back',   label: 'Back'    },
    { id: 'sleeve', label: 'Sleeves' },
    { id: 'collar', label: 'Collar'  },
  ]

  const activeColor   = colors[activeTab] || '#ffffff'
  const activePresets = presets[activeTab] || Object.values(presets)[0] || []

  const handleChange = (newColor) => {
    setColors(prev => ({ ...prev, [activeTab]: newColor }))
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Tab bar — desktop full mode only */}
      {!isMobileCompact && (
        <div className="flex p-1 bg-gray-200 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowPicker(false) }}
              className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Active color preview strip */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
        <div
          className="w-8 h-8 rounded-lg shrink-0 border border-white/30"
          style={{ background: activeColor, boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }}
        />
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-black uppercase tracking-widest mb-0.5 text-gray-400">
            {activeTab} color
          </span>
          <span className="text-xs font-bold font-mono text-gray-700">
            {activeColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Swatches */}
      <div className="flex flex-wrap gap-3 items-center px-1">
        {activePresets.map(c => (
          <button
            key={c}
            onClick={() => handleChange(c)}
            title={c}
            style={{ background: c, boxShadow: activeColor === c ? '0 0 0 3px #3b82f6' : '0 0 0 1.5px rgba(0,0,0,0.12)' }}
            className={`w-10 h-10 rounded-full transition-transform duration-150 ${
              activeColor === c ? 'scale-110' : 'hover:scale-105'
            }`}
          />
        ))}

        {/* Custom color wheel */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          title="Custom Color"
          style={{
            background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
            boxShadow: showPicker ? '0 0 0 3px #3b82f6' : '0 0 0 1.5px rgba(0,0,0,0.15)',
          }}
          className={`w-10 h-10 rounded-full transition-transform duration-150 overflow-hidden ${
            showPicker ? 'scale-110' : 'hover:scale-105'
          }`}
        />
      </div>

      {/* Expandable hex picker */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showPicker ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm flex flex-col items-center gap-3 mt-1">
          <HexColorPicker color={activeColor} onChange={handleChange} style={{ width: '100%' }} />
          <div className="flex w-full items-center justify-between font-mono bg-white/80 px-3 py-2 rounded-lg border border-white/30">
            <span className="text-gray-400 font-semibold text-xs">HEX</span>
            <span className="font-bold text-gray-800 text-sm">{activeColor.toUpperCase()}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
