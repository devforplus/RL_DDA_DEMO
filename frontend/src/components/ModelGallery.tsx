import { Link } from 'react-router-dom'
import { models } from '../data/models'
import { replayIdForModel } from '../config'

export default function ModelGallery() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
      {models.map((m) => (
        <article key={m.id} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
          <img src={m.previewImage} alt={m.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
          <div style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{m.name}</h3>
            <p style={{ marginTop: 4, color: '#555' }}>{m.description}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to={`/watch/${m.id}`}>라이브 보기</Link>
              <Link to={`/play/${m.id}`}>플레이</Link>
              {replayIdForModel(m.id) && (
                <Link to={`/replay/${replayIdForModel(m.id)}`}>샘플 리플레이</Link>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}



