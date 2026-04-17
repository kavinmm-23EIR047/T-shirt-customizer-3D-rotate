import { useRef, useState } from 'react'

const STYLE_OPTIONS = [
  { id: 'box', label: 'Full Box', desc: 'Fills the chest area', preview: ( <svg viewBox="0 0 44 36" width="44" height="36"><rect x="2" y="2" width="40" height="32" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1"/><rect x="6" y="6" width="32" height="24" rx="1" fill="#2874f0" opacity="0.7"/></svg> ) },
  { id: 'heart', label: 'Heart / Zest', desc: 'Right wearer side', preview: ( <svg viewBox="0 0 44 36" width="44" height="36"><rect x="2" y="2" width="40" height="32" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1"/><rect x="30" y="8" width="8" height="8" rx="1" fill="#2874f0" opacity="0.7"/></svg> ) },
  { id: 'vertical', label: 'Vertical', desc: 'Center portrait', preview: ( <svg viewBox="0 0 44 36" width="44" height="36"><rect x="2" y="2" width="40" height="32" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1"/><rect x="18" y="4" width="8" height="28" rx="1" fill="#2874f0" opacity="0.7"/></svg> ) },
  { id: 'horizontal', label: 'Horizontal', desc: 'Center landscape', preview: ( <svg viewBox="0 0 44 36" width="44" height="36"><rect x="2" y="2" width="40" height="32" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1"/><rect x="4" y="13" width="36" height="10" rx="1" fill="#2874f0" opacity="0.7"/></svg> ) },
]

export default function LogoUploader({ frontLogo, backLogo, onUpload, style, setStyle }) {
  const [activeSide, setActiveSide] = useState('front')
  const fileRef = useRef()

  const activeLogo = activeSide === 'front' ? frontLogo : backLogo
  const activeStyle = style[activeSide]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onUpload(activeSide, url)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Segmented Tabs */}
      <div className="flex p-1 bg-gray-100/80 rounded-xl">
        {['front', 'back'].map((side) => (
          <button
            key={side}
            onClick={() => setActiveSide(side)}
            className={`flex-1 py-2 px-1 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
              activeSide === side ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'
            }`}
          >
            {side} Face
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      {!activeLogo ? (
        <div 
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center group"
        >
          <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-full flex items-center justify-center mb-3 text-gray-400 transition-colors">
            <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Click to upload logo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Active Logo Display */}
          <div className="relative border border-gray-200 bg-gray-50 rounded-xl p-2 flex items-center justify-center overflow-hidden group">
            <img src={activeLogo} alt="Logo preview" className="h-24 object-contain max-w-full drop-shadow-md" />
            <button 
              onClick={() => onUpload(activeSide, null)}
              className="absolute top-2 right-2 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              title="Remove Logo"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>

          {/* Placement Styling */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Placement Style</div>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_OPTIONS.map((opt) => {
                const isActive = activeStyle === opt.id || (!activeStyle && opt.id === 'box')
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(activeSide, opt.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                      isActive ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2 bg-white rounded-md shadow-sm border border-gray-100 p-1 flex items-center justify-center">
                      {opt.preview}
                    </div>
                    <span className={`text-[11px] font-bold leading-tight ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight mt-1">
                      {opt.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  )
}