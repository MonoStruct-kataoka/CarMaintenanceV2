// グローバル変数
let currentRecordId = null;
let currentRecord = null;
let photosData = {};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // URLパラメータからレコードIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    currentRecordId = urlParams.get('id');

    if (!currentRecordId) {
        alert('レコードIDが指定されていません');
        location.href = 'search.html';
        return;
    }

    loadRecord();
});

// レコードを読み込み
async function loadRecord() {
    try {
        currentRecord = await API.getRecord('maintenance_records', currentRecordId);
        
        // データを表示
        displayRecord(currentRecord);
        
        // DOM更新を待ってから写真を読み込み
        setTimeout(async () => {
            await loadPhotos();
        }, 100);
        
    } catch (error) {
        console.error('読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
        location.href = 'search.html';
    }
}

// レコードを表示
function displayRecord(record) {
    // ステータス
    const statusTexts = {
        draft: '下書き',
        completed: '完了',
        archived: 'アーカイブ'
    };
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');
    
    statusBadge.textContent = statusTexts[record.status] || record.status;
    statusBadge.className = `status-badge status-${record.status}`;
    statusText.textContent = record.status === 'completed' ? '整備完了' : '編集中';
    
    // 作成日時
    const createdDate = new Date(record.created_at || Date.now());
    document.getElementById('created-date').textContent = formatDateTime(createdDate);
    
    // PDF出力ボタンの表示制御
    if (record.status === 'completed') {
        document.getElementById('pdf-btn').style.display = 'flex';
    }
    
    // 車両情報
    document.getElementById('client-name').textContent = record.client_name || '-';
    document.getElementById('registration-number').textContent = record.registration_number || '-';
    document.getElementById('car-model').textContent = record.car_model || '-';
    document.getElementById('chassis-number').textContent = record.chassis_number || '-';
    document.getElementById('engine-model').textContent = record.engine_model || '-';
    document.getElementById('first-registration').textContent = record.first_registration || '-';
    document.getElementById('address').textContent = record.address || '-';
    
    // 整備情報
    document.getElementById('inspector-name').textContent = record.inspector_name || '-';
    document.getElementById('workshop-address').textContent = record.workshop_address || '-';
    document.getElementById('certification-number').textContent = record.certification_number || '-';
    document.getElementById('inspection-date').textContent = formatDate(record.inspection_date);
    document.getElementById('completion-date').textContent = formatDate(record.completion_date);
    document.getElementById('chief-mechanic-name').textContent = record.chief_mechanic_name || '-';
    document.getElementById('total-mileage').textContent = record.total_mileage ? `${record.total_mileage.toLocaleString()} km` : '-';
    
    // 整備事業者情報・点検実施情報サマリー（追加項目タブ内）
    document.getElementById('view-inspector-name').textContent = record.inspector_name || '-';
    document.getElementById('view-workshop-address').textContent = record.workshop_address || '-';
    document.getElementById('view-certification-number').textContent = record.certification_number || '-';
    document.getElementById('view-inspection-date').textContent = formatDate(record.inspection_date);
    document.getElementById('view-completion-date').textContent = formatDate(record.completion_date);
    document.getElementById('view-chief-mechanic-name').textContent = record.chief_mechanic_name || '-';
    document.getElementById('view-total-mileage').textContent = record.total_mileage ? `${record.total_mileage.toLocaleString()} km` : '-';
    
    // 点検結果
    if (record.inspection_data) {
        const inspectionData = JSON.parse(record.inspection_data);
        displayInspectionResults(inspectionData);
    }
    
    // カスタム点検項目
    if (record.custom_inspection_items) {
        const customItems = JSON.parse(record.custom_inspection_items);
        if (customItems.length > 0 && record.inspection_data) {
            const inspectionData = JSON.parse(record.inspection_data);
            displayCustomInspectionItems(customItems, inspectionData);
            document.getElementById('custom-items-section').style.display = 'block';
        }
    }
    
    // 交換部品
    if (record.replacement_parts) {
        const parts = JSON.parse(record.replacement_parts);
        if (Object.keys(parts).length > 0) {
            displayReplacementParts(parts);
            document.getElementById('replacement-parts-section').style.display = 'block';
        }
    }
    
    // 測定値
    if (record.measurements) {
        const measurements = JSON.parse(record.measurements);
        if (Object.keys(measurements).length > 0) {
            displayMeasurements(measurements);
            document.getElementById('measurements-section').style.display = 'block';
        }
    }
    
    // アドバイス
    if (record.advice && record.advice.trim()) {
        document.getElementById('advice').textContent = record.advice;
        document.getElementById('advice-section').style.display = 'block';
    }
    
    // タグ
    let tagsArray = [];
    if (record.tags) {
        try {
            tagsArray = typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags;
        } catch (e) {
            tagsArray = [];
        }
    }
    if (tagsArray.length > 0) {
        displayTags(tagsArray);
        document.getElementById('tags-section').style.display = 'block';
    }
}

// 点検結果を表示（写真付き）
function displayInspectionResults(inspectionData) {
    const sections = ['engine', 'interior', 'undercarriage', 'bottom', 'obd', 'daily'];
    console.log('点検結果表示開始');
    
    sections.forEach(section => {
        const pane = document.getElementById(`${section}-pane`);
        const items = inspectionItems[section];
        
        if (!items) return;
        
        let hasData = false;
        let html = '';
        
        items.forEach(group => {
            const groupItems = group.items.filter(item => inspectionData[item.id]);
            
            if (groupItems.length > 0) {
                hasData = true;
                html += `
                    <div class="inspection-group">
                        <div class="group-title">${group.category}</div>
                        <div class="inspection-items">
                            ${groupItems.map(item => {
                                const data = inspectionData[item.id];
                                const codeClass = getCodeClass(data.code);
                                console.log(`点検項目追加: ${item.id} (${item.name}) - 写真コンテナID: photos-${item.id}`);
                                return `
                                    <div class="inspection-row">
                                        <span class="inspection-row-name">${item.name}</span>
                                        <span class="inspection-row-code ${codeClass}">${data.code}</span>
                                    </div>
                                    <div class="item-photos" id="photos-${item.id}"></div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        if (hasData) {
            pane.innerHTML = html;
            console.log(`${section}パネルにHTML設定完了`);
        } else {
            pane.innerHTML = '<div class="inspection-empty">点検データがありません</div>';
        }
    });
}

// コードのクラスを取得
function getCodeClass(code) {
    const classMap = {
        '✓': 'code-check',
        '×': 'code-x',
        'A': 'code-a',
        'C': 'code-c',
        'P': 'code-p',
        '○': 'code-circle',
        '△': 'code-triangle',
        'T': 'code-t',
        'L': 'code-l',
        '/': 'code-slash'
    };
    return classMap[code] || '';
}

// 交換部品を表示（写真付き）
function displayReplacementParts(parts) {
    const container = document.getElementById('replacement-parts');
    console.log('交換部品表示:', Object.keys(parts));
    
    const html = Object.entries(parts).map(([name, quantity]) => {
        // 部品名をエンコードしてユニークなIDを生成
        const safeId = encodeURIComponent(name).replace(/[^a-zA-Z0-9]/g, '_');
        console.log(`部品追加: ${name} - 写真コンテナID: photos-part-${safeId}`);
        return `
            <div class="part-item-wrapper" data-part-name="${escapeHtml(name)}">
                <div class="part-item">
                    <span class="part-name">${escapeHtml(name)}</span>
                    <span class="part-quantity">${escapeHtml(quantity)}</span>
                </div>
                <div class="item-photos" id="photos-part-${safeId}"></div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    console.log('交換部品HTML設定完了');
}

// 部品名からIDを取得
function getPartIdByName(name) {
    // 標準部品を検索
    const standardParts = [
        { id: 'engine_oil', name: 'エンジン・オイル' },
        { id: 'oil_filter', name: 'オイル・フィルタ' },
        { id: 'llc', name: 'LLC (ロング・ライフ・クーラント)' },
        { id: 'brake_fluid', name: 'ブレーキ・フルード' },
        { id: 'air_filter', name: 'エア・フィルタ' },
        { id: 'spark_plug', name: 'スパーク・プラグ' },
        { id: 'wiper_blade', name: 'ワイパー・ブレード' },
        { id: 'battery', name: 'バッテリ' }
    ];
    
    const standard = standardParts.find(p => p.name === name);
    if (standard) return standard.id;
    
    // カスタム部品の場合はpart_プレフィックス + 名前
    return `part_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

// 測定値を表示
function displayMeasurements(measurements) {
    const container = document.getElementById('measurements');
    
    const html = Object.entries(measurements).map(([name, value]) => `
        <div class="measurement-item">
            <span class="measurement-label">${escapeHtml(name)}</span>
            <span class="measurement-value">${escapeHtml(value)}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// カスタム点検項目を表示
function displayCustomInspectionItems(customItems, inspectionData) {
    const container = document.getElementById('custom-inspection-items');
    console.log('カスタム点検項目表示:', customItems);
    
    // 実際にデータが入力されている項目のみをフィルタリング
    const itemsWithData = customItems.filter(item => inspectionData[item.id]);
    
    if (itemsWithData.length === 0) {
        container.innerHTML = '<div class="inspection-empty">入力されたカスタム点検項目がありません</div>';
        return;
    }
    
    const html = `
        <div class="inspection-group">
            <div class="group-title">カスタム点検項目</div>
            <div class="inspection-items">
                ${itemsWithData.map(item => {
                    const data = inspectionData[item.id];
                    const codeClass = getCodeClass(data.code);
                    console.log(`カスタム項目追加: ${item.id} (${item.name}) - 写真コンテナID: photos-${item.id}`);
                    return `
                        <div class="inspection-row">
                            <span class="inspection-row-name">${escapeHtml(item.name)}</span>
                            <span class="inspection-row-code ${codeClass}">${data.code}</span>
                        </div>
                        <div class="item-photos" id="photos-${item.id}"></div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('カスタム点検項目HTML設定完了');
}

// タグを表示
function displayTags(tags) {
    const container = document.getElementById('tags');
    
    const html = tags.map(tag => `
        <span class="tag">${escapeHtml(tag)}</span>
    `).join('');
    
    container.innerHTML = html;
}

// 写真を読み込み（各項目に埋め込み）
async function loadPhotos() {
    try {
        console.log('写真読み込み開始: recordId =', currentRecordId);
        const result = await API.getRecords('inspection_photos', { limit: 1000 });
        const allPhotos = result.data || [];
        console.log('全写真データ:', allPhotos.length, '件');
        
        // このレコードの写真のみをフィルタリング
        const photos = allPhotos.filter(photo => photo.record_id === currentRecordId);
        console.log('このレコードの写真:', photos.length, '件');
        
        if (photos.length === 0) {
            console.log('写真がありません');
            return;
        }
        
        // 項目IDでグループ化
        const photosByItem = {};
        photos.forEach(photo => {
            if (!photosByItem[photo.item_id]) {
                photosByItem[photo.item_id] = [];
            }
            photosByItem[photo.item_id].push(photo);
            console.log(`写真グループ化: item_id=${photo.item_id}, item_name=${photo.item_name}`);
        });
        
        console.log('グループ化された写真:', Object.keys(photosByItem).length, 'グループ');
        
        // 各項目に写真を埋め込み
        embedPhotosIntoItems(photosByItem);
        
    } catch (error) {
        console.error('写真読み込みエラー:', error);
    }
}

// 写真を各項目に埋め込み
function embedPhotosIntoItems(photosByItem) {
    console.log('写真を埋め込み開始:', photosByItem);
    
    Object.entries(photosByItem).forEach(([itemId, photos]) => {
        // まず直接IDでコンテナを探す
        let container = document.getElementById(`photos-${itemId}`);
        
        // 見つからない場合、部品の場合はitem_nameで検索
        if (!container && photos.length > 0) {
            const itemName = photos[0].item_name;
            console.log(`直接IDで見つからない。item_name: ${itemName} で検索`);
            
            // 部品名でマッチする要素を探す
            const partWrappers = document.querySelectorAll('.part-item-wrapper');
            partWrappers.forEach(wrapper => {
                const dataName = wrapper.getAttribute('data-part-name');
                if (dataName === itemName) {
                    const safeId = encodeURIComponent(itemName).replace(/[^a-zA-Z0-9]/g, '_');
                    container = wrapper.querySelector(`#photos-part-${safeId}`);
                    console.log(`部品名でマッチ: ${itemName}`);
                }
            });
        }
        
        if (!container) {
            console.warn(`写真コンテナが見つかりません: itemId=${itemId}, item_name=${photos[0]?.item_name}`);
            return;
        }
        
        // ソート順でソート
        photos.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        
        // 全体写真の場合は見出しを追加
        const isOverall = itemId === 'parts_overall';
        const titleHtml = isOverall ? `
            <div class="photo-section-title">
                <i class="fas fa-camera"></i> ${escapeHtml(photos[0].item_name || '全体写真')}
                <span class="photo-count-inline">${photos.length}枚</span>
            </div>
        ` : '';
        
        const html = `
            ${titleHtml}
            <div class="embedded-photo-gallery">
                ${photos.map(photo => `
                    <div class="photo-item" onclick="openLightbox('${photo.photo_url}')">
                        <img src="${photo.photo_url}" alt="${escapeHtml(photo.item_name)}">
                        <span class="photo-badge ${photo.before_after}">${photo.before_after === 'before' ? '前' : '後'}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
        container.style.display = 'block';
        console.log(`写真を表示: ${itemId}, ${photos.length}枚`);
    });
}

// 写真を表示
function displayPhotos(photosByItem) {
    const container = document.getElementById('photo-groups');
    
    // カテゴリ別に分類
    const categories = {
        engine: { title: 'エンジンルーム点検', icon: '🔧', items: {} },
        interior: { title: '室内点検', icon: '🚗', items: {} },
        undercarriage: { title: '足廻り点検', icon: '🛞', items: {} },
        bottom: { title: '下廻り点検', icon: '⚙️', items: {} },
        parts: { title: '交換部品', icon: '🔄', items: {} },
        overall: { title: '全体写真', icon: '📸', items: {} }
    };
    
    // 項目をカテゴリ別に振り分け
    Object.entries(photosByItem).forEach(([itemId, photos]) => {
        if (itemId.startsWith('engine_')) {
            categories.engine.items[itemId] = photos;
        } else if (itemId.startsWith('interior_')) {
            categories.interior.items[itemId] = photos;
        } else if (itemId.startsWith('under_')) {
            categories.undercarriage.items[itemId] = photos;
        } else if (itemId.startsWith('bottom_')) {
            categories.bottom.items[itemId] = photos;
        } else if (itemId.startsWith('part_')) {
            categories.parts.items[itemId] = photos;
        } else if (itemId === 'parts_overall') {
            categories.overall.items[itemId] = photos;
        }
    });
    
    // カテゴリ別に表示
    const html = Object.entries(categories)
        .filter(([_, cat]) => Object.keys(cat.items).length > 0)
        .map(([catKey, cat]) => {
            const itemsHtml = Object.entries(cat.items).map(([itemId, photos]) => {
                // ソート順でソート
                photos.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                
                return `
                    <div class="photo-group">
                        <div class="photo-group-title">
                            <i class="fas fa-camera"></i>
                            ${escapeHtml(photos[0].item_name || itemId)}
                            <span class="photo-count">${photos.length}枚</span>
                        </div>
                        <div class="photo-gallery">
                            ${photos.map(photo => `
                                <div class="photo-item" onclick="openLightbox('${photo.photo_url}')">
                                    <img src="${photo.photo_url}" alt="${escapeHtml(photo.item_name)}">
                                    <span class="photo-badge ${photo.before_after}">${photo.before_after === 'before' ? '前' : '後'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
            
            return `
                <div class="photo-category">
                    <div class="category-header">
                        <span class="category-icon">${cat.icon}</span>
                        <span class="category-title">${cat.title}</span>
                        <span class="category-count">${Object.keys(cat.items).length}項目</span>
                    </div>
                    ${itemsHtml}
                </div>
            `;
        }).join('');
    
    container.innerHTML = html;
}

// 点検タブ切替
function switchInspectionTab(section) {
    // タブの状態を更新
    document.querySelectorAll('.inspection-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // パネルの表示切替
    document.querySelectorAll('.inspection-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${section}-pane`).classList.add('active');
}

// ライトボックスを開く
function openLightbox(imageUrl) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    
    image.src = imageUrl;
    lightbox.classList.add('show');
}

// ライトボックスを閉じる
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
}

// 編集画面に遷移
function editRecord() {
    if (confirm('この記録を編集しますか？')) {
        location.href = `inspection.html?id=${currentRecordId}`;
    }
}

// PDF出力
function generatePDF() {
    location.href = `pdf-output.html?id=${currentRecordId}`;
}

// レコードを削除
async function deleteRecord() {
    if (!confirm('この整備記録を削除してもよろしいですか？\nこの操作は取り消せません。')) {
        return;
    }

    try {
        await API.deleteRecord('maintenance_records', currentRecordId);
        alert('✅ 整備記録を削除しました');
        location.href = 'search.html';
    } catch (error) {
        console.error('削除エラー:', error);
        alert('❌ 削除に失敗しました');
    }
}

// ユーティリティ関数
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateTime(date) {
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
