# tiles-performance-comparison
## 東京圏における建築物 3D Tiles モデルの最適化前後比較

**オンラインデモ**: https://rosyo-gis.github.io/tiles-performance-comparison/

---

## 概要

[tiles-performance](https://github.com/Rosyo-gis/tiles-performance.git) で生成した最適化済み 3D Tiles と、[PLATEAU](https://www.mlit.go.jp/plateau/) が公式提供する 3D Tiles の表示パフォーマンスを比較するビューアアプリです。  
Cesium の FPS カウンターを有効化し、カクつきの改善効果を視覚的に確認できます。

---

## 比較結果

### FPS 比較（同一飛行ルート）

![FPS比較グラフ](public/fps.png)

### 最適化前（PLATEAU 公式 3D Tiles）

![最適化前の飛行](public/1.gif)

### 最適化後（改善済み 3D Tiles）

![最適化後の飛行](public/2.gif)

---

## 比較対象

| | 最適化前（Old） | 最適化後（New） |
|---|---|---|
| **データソース** | PLATEAU 公式配信 | [tiles-performance](https://github.com/Rosyo-gis/tiles-performance.git) で生成 |
| **対象エリア** | 千代田区・中央区・港区 | 千代田区・中央区・港区 |
| **タイル分割** | ルートノード最大 50.6MB | Quadtree 分割、面数 5,000 以下/タイル |
| **LOD** | なし | LOD1（遠距離）+ LOD2（近距離） |
| **テクスチャ圧縮** | 非圧縮 | KTX2（VRAM 約 80% 削減） |

---

## セットアップ

### 必要環境

- Node.js 18+

### インストール・起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開き、左上のボタンで **最適化前 / 最適化後** を切り替えてください。

---

## 操作方法

### タイルセット切替

左上パネルの **最適化前** / **最適化後** ボタンで表示する 3D Tiles を切り替えます。  
読み込み中はボタンが無効化され、完了後に操作可能になります。

### 飛行路線

1. タイルセットの読み込みが完了したら、**飛行路線** ボタンをクリックします。
2. カメラが事前定義されたルートに沿って東京都心上空を自動飛行します。
3. 飛行中は FPS カウンター（画面右上）でフレームレートを確認できます。
4. 途中でキャンセルしたい場合は **取消** ボタンをクリックしてください。

> **比較のコツ**: 最適化前・最適化後それぞれで同じ **飛行路線** を実行し、FPS の違いを比較するとパフォーマンス改善効果が分かりやすくなります。さらに、建物が密集しているエリアで視点をドラッグして前後に動かすと、差がより一層はっきりと確認できます。

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| React 19 + TypeScript | UI コンポーネント |
| Vite | バンドラー |
| CesiumJS 1.140 | 3D 地球・3D Tiles レンダリング |
| vite-plugin-cesium | Cesium の Vite 統合 |

---

## 関連プロジェクト

- [tiles-performance](https://github.com/Rosyo-gis/tiles-performance.git) — 3D Tiles 生成・最適化スクリプト
