import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

type TilesetMode = 'new' | 'old'

const INITIAL_CAMERA = {
  destination: new Cesium.Cartesian3(-3964537.3040514886, 3353589.2071747687, 3695351.9151651273),
  orientation: {
    heading: 6.0185465793142265,
    pitch: -0.5415192982127444,
    roll: 0.00005420496873842495,
  },
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const tilesetsRef = useRef<Cesium.Cesium3DTileset[]>([])
  const [mode, setMode] = useState<TilesetMode>('old')
  const [loadedMode, setLoadedMode] = useState<TilesetMode | null>(null)
  const loading = mode !== loadedMode

  // Viewerを一度だけ初期化
  useEffect(() => {
    if (!containerRef.current) return

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTlmNTc2Yy0wNDFmLTRkZGUtOGM3Yi0xYTA3MjU0NDdjZjIiLCJpZCI6Mjc5MzczLCJpYXQiOjE3NDA1ODI1Nzl9._p92XdVvZ0jbpPpntbggENw7fXWHeReuPiR2_van-j4'
    Cesium.RequestScheduler.maximumRequests = 100
    Cesium.RequestScheduler.maximumRequestsPerServer = 50

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
    })
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.debugShowFramesPerSecond = true
    viewer.scene.camera.setView(INITIAL_CAMERA)

    viewerRef.current = viewer

    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  // モード変更時にタイルセットを切り替え
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    // 既存のタイルセットを削除
    for (const ts of tilesetsRef.current) {
      viewer.scene.primitives.remove(ts)
    }
    tilesetsRef.current = []

    const load = mode === 'new' ? loadNewTilesets(viewer) : loadOldTilesets(viewer)

    load.then((tilesets) => {
      tilesetsRef.current = tilesets
      setLoadedMode(mode)
    }).catch(() => setLoadedMode(mode))
  }, [mode])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={panelStyle}>
        <div style={labelStyle}>3Dタイルセット切替</div>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle(mode === 'old')}
            onClick={() => setMode('old')}
            disabled={loading}
          >
            最適化前
          </button>
          <button
            style={buttonStyle(mode === 'new')}
            onClick={() => setMode('new')}
            disabled={loading}
          >
            最適化後
          </button>
        </div>
        {loading && <div style={loadingStyle}>読み込み中...</div>}
      </div>
    </div>
  )
}

// ─── タイルセット読み込み関数 ───────────────────────────────────────────────
async function loadNewTilesets(viewer: Cesium.Viewer): Promise<Cesium.Cesium3DTileset[]> {
  const tileIds = [533935, 533936, 533945, 533946]
  const tilesets: Cesium.Cesium3DTileset[] = []
  for (const id of tileIds) {
    if (viewer.isDestroyed()) break
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      `https://pub-6c9dee2a5eec41b688fd8d1482ccf5e4.r2.dev/tokyo_new_3dtiles/${id}/tileset.json`,
      { maximumScreenSpaceError: 5 }
    )
    if (viewer.isDestroyed()) break
    tileset.immediatelyLoadDesiredLevelOfDetail = false
    tileset.loadSiblings = true
    tileset.dynamicScreenSpaceError = true
    tileset.dynamicScreenSpaceErrorDensity = 0.00278
    tileset.dynamicScreenSpaceErrorFactor = 4.0
    viewer.scene.primitives.add(tileset)
    tilesets.push(tileset)
  }
  return tilesets
}

// 古いタイルセットはオプションなしで読み込む
async function loadOldTilesets(viewer: Cesium.Viewer): Promise<Cesium.Cesium3DTileset[]> {
  const tileIds = [
    '13101_chiyoda-ku_2020_bldg_texture',
    '13102_chuo-ku_2020_bldg_texture',
    '13103_minato-ku_2020_bldg_texture',
  ]
  const tilesets: Cesium.Cesium3DTileset[] = []
  for (const id of tileIds) {
    if (viewer.isDestroyed()) break
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      `https://pub-6c9dee2a5eec41b688fd8d1482ccf5e4.r2.dev/tokyo_PLATEAU_3dtiles/${id}/tileset.json`
    )
    if (viewer.isDestroyed()) break
    viewer.scene.primitives.add(tileset)
    tilesets.push(tileset)
  }
  return tilesets
}

// スタイル定義
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  background: 'rgba(30, 30, 30, 0.85)',
  borderRadius: 8,
  padding: '12px 16px',
  color: '#fff',
  fontFamily: 'sans-serif',
  zIndex: 10,
  minWidth: 160,
  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#aaa',
  marginBottom: 8,
  letterSpacing: '0.05em',
}

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
}

const buttonStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '6px 10px',
  borderRadius: 5,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  background: active ? '#3b82f6' : '#444',
  color: active ? '#fff' : '#ccc',
  transition: 'background 0.2s',
})

const loadingStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#facc15',
  textAlign: 'center',
}

export default App
