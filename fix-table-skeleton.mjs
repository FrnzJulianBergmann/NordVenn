import { writeFileSync } from 'fs'
import { resolve } from 'path'

const content = `export const Skeleton = ({ w = '100%', h = 14, radius = 4 }: { w?: string|number; h?: number; radius?: number }) => (
  <div style={{ width: w, height: h, borderRadius: radius, background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      animation: 'shimmer 1.4s infinite',
    }} />
    <style>{\`@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }\`}</style>
  </div>
)

export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <>
    {Array.from({ length: rows }).map((_,i) => (
      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {Array.from({ length: cols }).map((_,j) => (
          <td key={j} style={{ padding: '13px 14px' }}>
            <Skeleton w={j === 0 ? '70%' : j === cols-1 ? 60 : '55%'} h={12} />
          </td>
        ))}
      </tr>
    ))}
  </>
)

export const CardSkeleton = () => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '14px 16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton w="45%" h={10} />
      <Skeleton w={32} h={32} radius={8} />
    </div>
    <Skeleton w="30%" h={28} radius={4} />
    <div style={{ marginTop: 8 }}><Skeleton w="50%" h={10} /></div>
  </div>
)
`

writeFileSync(resolve('components/skeleton.tsx'), content, 'utf8')
console.log('✅ TableSkeleton fixed — no more nested tbody')
