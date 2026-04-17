export default function Toolbar({ view, setView }) {
  return (
    <div style={{
      display: 'flex', gap: 0, borderBottom: '1px solid #f0f0f0', background: '#fff'
    }}>
      {['front', 'back'].map(side => (
        <button
          key={side}
          onClick={() => setView(side)}
          style={{
            flex: 1,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: 1,
            border: 'none',
            borderBottom: view === side ? '3px solid #2874f0' : '3px solid transparent',
            color: view === side ? '#2874f0' : '#878787',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {side === 'front' ? '👕 Front' : '🔄 Back'}
        </button>
      ))}
    </div>
  )
}