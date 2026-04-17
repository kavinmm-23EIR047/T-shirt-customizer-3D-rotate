import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

export default function ColorPicker({ colors, setColors, presets }) {
  const [activeTab, setActiveTab] = useState('front')
  const [showPicker, setShowPicker] = useState(false)

  const tabs = [
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
    { id: 'sleeve', label: 'Sleeves' },
    { id: 'collar', label: 'Collar' }
  ]

  const activeColor = colors[activeTab]

  const handleChange = (newColor) => {
    setColors(prev => ({ ...prev, [activeTab]: newColor }))
  }

  // Use the specific presets for the active tab (though they are all the same in App.jsx currently)
  const activePresets = presets[activeTab] || Object.values(presets)[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Segmented Control */}
      <div className="flex p-1 bg-gray-100/80 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowPicker(false); }}
            className={`flex-1 py-2 px-1 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swatches Grid */}
      <div className="flex flex-wrap gap-3 items-center">
        {activePresets.map(c => (
          <div
            key={c}
            onClick={() => handleChange(c)}
            className={`w-9 h-9 rounded-full cursor-pointer transition-transform duration-200 shadow-inner ${
              activeColor === c ? 'scale-110 ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-105'
            }`}
            style={{ 
              background: c,
              border: c.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none'
            }}
            title={c}
          />
        ))}
        
        {/* Custom Color Wheel Button */}
        <div
          onClick={() => setShowPicker(!showPicker)}
          className={`w-9 h-9 rounded-full cursor-pointer transition-transform duration-200 border-2 overflow-hidden ${
            showPicker ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 border-transparent' : 'border-gray-200 hover:scale-105'
          }`}
          style={{
            background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
          }}
          title="Custom Color"
        />
      </div>

      {/* Embedded Color Picker (Optional drop-down) */}
      <div className={`transition-all duration-300 overflow-hidden ${showPicker ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-3">
          <HexColorPicker color={activeColor} onChange={handleChange} />
          <div className="flex w-full items-center justify-between text-sm text-gray-500 font-mono bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span>HEX</span>
            <span className="font-semibold text-gray-700">{activeColor.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}