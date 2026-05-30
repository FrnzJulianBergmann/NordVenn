import type { Vendor } from '@/types/vendor'

const statusColor: Record<string, string> = {
  active: '#10b981', inactive: '#55556a', pending: '#f59e0b'
}

export default function VendorTable({ vendors, loading, onEdit, onDelete }: {
  vendors: Vendor[], loading: boolean,
  onEdit: (v: Vendor) => void, onDelete: (id: string) => void
}) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
  if (!vendors.length) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No vendors found.</p>

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Name','Email','Phone','Category','Status','Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'var(--bg-base)' : 'var(--bg-surface)' }}>
              <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{v.name}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.email || '—'}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.phone || '—'}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.category || '—'}</td>
              <td style={{ padding: '11px 14px' }}>
                <span style={{
                  color: statusColor[v.status] || '#888',
                  background: (statusColor[v.status] || '#888') + '22',
                  padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
                }}>{v.status}</span>
              </td>
              <td style={{ padding: '11px 14px' }}>
                <button onClick={() => onEdit(v)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, marginRight: 6 }}>Edit</button>
                <button onClick={() => onDelete(v.id)} style={{ background: 'none', border: '1px solid #ef444433', color: 'var(--danger)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
