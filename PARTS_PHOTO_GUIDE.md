# 交換部品の写真撮影機能ガイド

## 📸 概要

主な交換部品等の各項目に、**カメラ機能**が搭載されています。  
交換前の古い部品と交換後の新しい部品を写真で記録することで、何の部品をどの部品で交換したかを明確に確認できます。

---

## 🎯 重要性

### なぜ交換部品の写真が必要か？

1. **作業証明**: 実際に部品を交換したことの証拠
2. **品質保証**: 交換した部品の状態を記録
3. **顧客説明**: 交換前後の比較で分かりやすく説明
4. **トレーサビリティ**: 部品番号やメーカーを写真で記録
5. **トラブル防止**: 作業内容の明確な記録

---

## 📝 使い方

### 1. 交換部品セクションを開く

```
inspection.html → 「追加項目」タブ → 「主な交換部品等」
```

### 2. カメラアイコンをクリック

各部品の右側に表示されているカメラアイコン（📷）をクリックします。

**標準部品の例:**
- エンジン・オイル
- オイル・フィルタ
- LLC（ロング・ライフ・クーラント）
- ブレーキ・フルード
- エア・フィルタ
- スパーク・プラグ
- ワイパー・ブレード
- バッテリ

**カスタム部品:**
- 「部品を追加」ボタンで追加した任意の部品

### 3. 写真を撮影・アップロード

#### 交換前（Before）の撮影
1. 「写真を撮影 / アップロード」ボタンをクリック
2. カメラ起動またはファイル選択
3. **古い部品の状態**を撮影
   - 摩耗状態
   - 損傷箇所
   - 部品番号
   - 全体像

#### 交換後（After）の撮影
1. 同じ手順で新しい写真を追加
2. 写真の下にある「後に変更」ボタンをクリック
3. **新しい部品**を撮影
   - 新品の状態
   - 取り付け状態
   - 部品番号
   - 全体像

### 4. 写真の管理

- **削除**: 不要な写真は×ボタンで削除
- **Before/After切替**: 各写真の下のボタンで区分を変更
- **複数枚登録**: 1つの部品に複数の写真を登録可能

---

## 💡 撮影のコツ

### 交換前の撮影ポイント

1. **全体像**: 部品全体が写るように
2. **問題箇所のクローズアップ**: 摩耗や損傷部分を拡大
3. **部品番号**: メーカー名、型番が読める角度
4. **周辺環境**: 取り付け位置も含めて

### 交換後の撮影ポイント

1. **新品の状態**: パッケージや部品本体
2. **取り付け後**: 正しく取り付けられていることを確認
3. **部品番号**: 新しい部品の型番を記録
4. **比較用**: 古い部品と同じ角度で撮影すると比較しやすい

---

## 🔍 ID体系

交換部品の写真は、以下のIDで管理されます：

```
部品ID: part_{部品の識別子}

例:
- エンジン・オイル: part_engine_oil
- オイル・フィルタ: part_oil_filter
- カスタム部品: part_custom_1234567890
```

これにより、点検項目の写真と交換部品の写真が明確に分離されます。

---

## 📊 写真の表示

### 入力画面（inspection.html）
- カメラボタンに緑色のバッジが表示される（写真がある場合）
- クリックでモーダルが開き、写真一覧を確認可能

### 詳細表示画面（view.html）
- 「点検写真」セクションに自動的にグループ化されて表示
- 部品名ごとに写真が整理される

### 顧客ページ（customer.html）
- QRコードからアクセス
- 交換部品の写真も含めてすべて表示
- Before/Afterのバッジ付き

### PDF出力（pdf-output.html）
- 選択した写真をPDFに含めることが可能
- 交換部品の写真も出力対象

---

## ⚙️ 技術仕様

### データベース構造

```javascript
// inspection_photos テーブル
{
    id: "photo-uuid",
    record_id: "整備記録ID",
    item_id: "part_engine_oil",  // 部品のID
    item_name: "エンジン・オイル",
    photo_url: "data:image/jpeg;base64,...",
    before_after: "before",  // または "after"
    photographer: "田中 太郎",
    photo_date: "2025-10-27T12:34:56Z",
    sort_order: 0
}
```

### 写真の保存

- **形式**: Base64エンコード（PoC版）
- **容量制限**: LocalStorage使用時は約5-10MB
- **推奨サイズ**: 1枚あたり500KB以下
- **対応形式**: JPEG, PNG, GIF

---

## 🎨 UI要素

### カメラボタン

```css
.camera-btn {
    width: 42px;
    height: 42px;
    border: 2px solid #2196F3;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    color: #2196F3;
}

/* 写真がある場合、緑色のバッジを表示 */
.camera-btn.has-photos::after {
    content: '';
    position: absolute;
    top: -5px;
    right: -5px;
    width: 16px;
    height: 16px;
    background: #4CAF50;
    border-radius: 50%;
    border: 2px solid white;
}
```

---

## 📱 レスポンシブ対応

- **スマホ**: タップ操作で簡単に撮影
- **タブレット**: 大画面で写真を確認しながら作業
- **PC**: ファイル選択で既存の写真をアップロード

---

## 🔧 実装例

### HTML構造

```html
<div class="replacement-item" data-item-id="part_engine_oil">
    <label class="replacement-label">エンジン・オイル</label>
    <div style="display: flex; gap: 8px; align-items: center;">
        <input type="number" class="replacement-quantity" placeholder="L">
        <button class="camera-btn" onclick="openPhotoModal('part_engine_oil', 'エンジン・オイル')">
            <i class="fas fa-camera"></i>
        </button>
    </div>
</div>
```

### JavaScript処理

```javascript
// 写真モーダルを開く
function openPhotoModal(itemId, itemName) {
    currentPhotoItemId = itemId;  // "part_engine_oil"
    currentPhotoItemName = itemName;  // "エンジン・オイル"
    
    // モーダル表示
    document.getElementById('photoModal').classList.add('show');
    
    // 既存の写真を表示
    renderPhotoGallery();
}

// 写真を保存
async function savePhotos() {
    for (const itemId of Object.keys(photosData)) {
        if (itemId.startsWith('part_')) {
            // 交換部品の写真
            const itemName = getItemNameById(itemId);
            // ... 保存処理
        }
    }
}
```

---

## 📚 関連ドキュメント

- [README.md](README.md) - システム全体の説明
- [inspection.html](inspection.html) - 入力画面
- [js/inspection.js](js/inspection.js) - メイン処理
- [js/inspection-data.js](js/inspection-data.js) - 部品データ定義

---

## 🆘 トラブルシューティング

### カメラボタンが表示されない
- ブラウザのキャッシュをクリア
- ページを再読み込み（Ctrl+F5 / Cmd+Shift+R）

### 写真が保存されない
- LocalStorageの容量制限を確認
- 写真のサイズを小さくする（圧縮）

### 写真が他のレコードに表示される
- 最新版に更新（写真の完全分離機能を実装済み）
- ブラウザのキャッシュをクリア

---

## 📞 サポート

このシステムはPoC（概念実証）版です。  
本番運用時は、写真の圧縮機能やクラウドストレージ連携の実装を推奨します。

---

**最終更新**: 2025-10-27  
**バージョン**: 1.0.0
