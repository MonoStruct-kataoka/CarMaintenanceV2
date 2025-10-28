// グローバル変数
let currentTab = 'vehicle';
let currentRecordId = null;
let inspectionData = {};
let photosData = {};

// マーク定義（記号と日本語説明）
const markDefinitions = {
    '✓': '点検良好',
    '×': '交換',
    'A': '調整',
    'C': '清掃',
    'P': '省略',
    '○': '特定整備',
    '△': '修理',
    'T': '締付',
    'L': '給油(水)',
    '/': '該当なし'
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // URLパラメータからレコードIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    currentRecordId = urlParams.get('id');

    // 日付を設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inspection-date').value = today;
    document.getElementById('completion-date').value = today;

    // 点検項目を描画
    renderInspectionItems();
    renderReplacementParts();
    renderMeasurements();
    renderCustomInspectionItems();

    // タブ切り替えイベント
    setupTabNavigation();

    // 写真アップロードイベント
    setupPhotoUpload();

    // 車両番号の自動更新
    document.getElementById('registration-number')?.addEventListener('input', function() {
        const value = this.value || '未登録';
        document.getElementById('vehicle-display').textContent = value;
    });

    // 整備情報の自動サマリー更新
    setupSummaryAutoUpdate();

    // 既存レコードがある場合は読み込み、ない場合はデータをクリア
    if (currentRecordId) {
        loadRecord(currentRecordId);
    } else {
        // 新規レコードの場合、データを初期化
        inspectionData = {};
        photosData = {};
        clearAllCameraButtonBadges();
    }
});

// タブナビゲーション設定
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// タブ切り替え
function switchTab(tabName) {
    // タブボタンの状態更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');

    // コンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`.tab-content[data-content="${tabName}"]`).classList.add('active');

    // タイトル更新
    const titles = {
        vehicle: '車両情報登録',
        engine: 'エンジン・ルーム点検',
        interior: '室内点検',
        undercarriage: '足廻り点検',
        bottom: '下廻り点検',
        obd: '車載式故障診断装置点検',
        daily: '日常点検',
        additional: '追加項目'
    };
    document.getElementById('section-title').textContent = titles[tabName];

    currentTab = tabName;
}

// 点検項目を描画
function renderInspectionItems() {
    ['engine', 'interior', 'undercarriage', 'bottom', 'obd', 'daily'].forEach(section => {
        const container = document.getElementById(`${section}-items`);
        if (!container) return;

        const items = inspectionItems[section];
        let html = '';

        items.forEach(group => {
            html += `
                <div class="inspection-card">
                    <div class="card-header">■ ${group.category}</div>
                    <div class="card-content">
                        ${group.items.map(item => `
                            <div class="inspection-item" data-item-id="${item.id}">
                                <div class="item-row">
                                    <div class="item-name ${item.required ? 'required' : ''}">${item.name}</div>
                                    <div class="item-actions">
                                        <select class="mark-select" data-item-id="${item.id}" onchange="selectMark('${item.id}', this.value)">
                                            <option value="">選択してください</option>
                                            ${Object.entries(markDefinitions).map(([code, description]) => `
                                                <option value="${code}">${code} - ${description}</option>
                                            `).join('')}
                                        </select>
                                        <button class="camera-btn" onclick="openPhotoModal('${item.id}', '${item.name}')">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    });
}

// 交換部品を描画
function renderReplacementParts() {
    const container = document.getElementById('replacement-parts');
    if (!container) return;

    const html = replacementParts.map(part => `
        <div class="replacement-item" data-item-id="part_${part.id}">
            <label for="${part.id}" class="replacement-label">${part.name}</label>
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="number" class="replacement-quantity" id="${part.id}" placeholder="${part.unit}" min="0" step="0.1" data-part-id="${part.id}" data-part-name="${part.name}" data-part-unit="${part.unit}">
                <button class="camera-btn" onclick="openPhotoModal('part_${part.id}', '${part.name}')" title="写真撮影">
                    <i class="fas fa-camera"></i>
                </button>
                ${part.custom ? `<button class="delete-part-btn" onclick="deleteCustomPart('${part.id}')" title="削除"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    
    // 既存の写真がある場合、カメラボタンを更新
    replacementParts.forEach(part => {
        const itemId = `part_${part.id}`;
        if (photosData[itemId] && photosData[itemId].length > 0) {
            updateCameraButton(itemId);
        }
    });
}

// 測定値を描画
function renderMeasurements() {
    const container = document.getElementById('measurements');
    if (!container) return;

    const html = measurements.map(m => `
        <div class="measurement-item">
            <label class="measurement-label">${m.name}</label>
            <input type="text" class="measurement-input" id="${m.id}" placeholder="${m.placeholder} ${m.unit}">
        </div>
    `).join('');

    container.innerHTML = html;
}

// マークを選択（セレクトボックス用）
function selectMark(itemId, code) {
    const itemElement = document.querySelector(`.inspection-item[data-item-id="${itemId}"]`);
    if (!itemElement) return;

    if (code) {
        // 選択された場合
        itemElement.classList.add('checked');
        
        // データを保存
        inspectionData[itemId] = {
            code: code,
            timestamp: new Date().toISOString()
        };
    } else {
        // 「選択してください」に戻された場合
        itemElement.classList.remove('checked');
        delete inspectionData[itemId];
    }

    // 進捗を更新
    updateProgress();

    // 振動フィードバック
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

// 進捗を更新
function updateProgress() {
    // 実際の項目数を動的に計算
    const sections = {
        engine: { total: inspectionItems.engine.reduce((sum, g) => sum + g.items.length, 0), checked: 0 },
        interior: { total: inspectionItems.interior.reduce((sum, g) => sum + g.items.length, 0), checked: 0 },
        undercarriage: { total: inspectionItems.undercarriage.reduce((sum, g) => sum + g.items.length, 0), checked: 0 },
        bottom: { total: inspectionItems.bottom.reduce((sum, g) => sum + g.items.length, 0), checked: 0 },
        obd: { total: inspectionItems.obd.reduce((sum, g) => sum + g.items.length, 0), checked: 0 },
        daily: { total: inspectionItems.daily.reduce((sum, g) => sum + g.items.length, 0), checked: 0 }
    };

    // チェック済み項目をカウント
    Object.keys(inspectionData).forEach(itemId => {
        // IDプレフィックスからセクションを判定
        let section = itemId.split('_')[0];
        // "under" を "undercarriage" にマッピング
        if (section === 'under') {
            section = 'undercarriage';
        }
        if (sections[section]) {
            sections[section].checked++;
        }
    });

    // 全体の進捗
    const totalItems = Object.values(sections).reduce((sum, s) => sum + s.total, 0);
    const checkedItems = Object.values(sections).reduce((sum, s) => sum + s.checked, 0);
    document.getElementById('progress-text').textContent = `${checkedItems} / ${totalItems} 完了`;

    // タブバッジを更新
    Object.keys(sections).forEach(section => {
        const badge = document.querySelector(`.tab-btn[data-tab="${section}"] .tab-badge`);
        if (badge) {
            badge.textContent = `${sections[section].checked}/${sections[section].total}`;
        }
    });
}

// QRコードスキャン
function scanQRCode() {
    showToast('📷 カメラを起動中...');

    setTimeout(() => {
        // デモ用：サンプルデータを自動入力
        document.getElementById('registration-number').value = '四谷 330 せ 6098';
        document.getElementById('car-model').value = 'GAA-SNT33';
        document.getElementById('chassis-number').value = 'SNT33-028686';
        document.getElementById('engine-model').value = 'MA03';
        document.getElementById('first-registration').value = '令和6年3月';
        document.getElementById('address').value = '東京都新宿区西新宿2-8-1';
        document.getElementById('vehicle-display').textContent = '四谷 330 せ 6098';

        showToast('✅ 車検証情報を読み取りました');
    }, 1500);
}

// 写真モーダルを開く
let currentPhotoItemId = null;
let currentPhotoItemName = null;

function openPhotoModal(itemId, itemName) {
    currentPhotoItemId = itemId;
    currentPhotoItemName = itemName;

    document.getElementById('photoModalTitle').textContent = `写真管理 - ${itemName}`;
    document.getElementById('photoModal').classList.add('show');

    // 既存の写真を表示
    renderPhotoGallery();
}

function closePhotoModal() {
    document.getElementById('photoModal').classList.remove('show');
    currentPhotoItemId = null;
    currentPhotoItemName = null;
}

// 写真アップロード設定
function setupPhotoUpload() {
    const input = document.getElementById('photoInput');
    if (!input) return;

    input.addEventListener('change', function(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                // 写真を圧縮してから追加
                compressAndAddPhoto(currentPhotoItemId, event.target.result);
            };
            reader.readAsDataURL(file);
        });

        // 入力をリセット
        e.target.value = '';
    });
}

// 写真を圧縮してから追加
function compressAndAddPhoto(itemId, dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        
        // より小さいサイズに変更（LocalStorage容量対策）
        const maxWidth = 800;   // 1280 → 800に変更
        const maxHeight = 800;  // 1280 → 800に変更
        
        let width = img.width;
        let height = img.height;
        
        // サイズ調整
        if (width > maxWidth || height > maxHeight) {
            if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG品質をさらに下げる（70% → 60%）
        let compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        // それでも大きすぎる場合はさらに圧縮
        if (compressedDataUrl.length > 200000) { // 200KB以上の場合
            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // 品質50%
        }
        if (compressedDataUrl.length > 300000) { // 300KB以上の場合
            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4); // 品質40%
        }
        
        // 圧縮後の写真を追加
        addPhoto(itemId, compressedDataUrl);
        
        // 圧縮率をログ出力
        const originalSize = (dataUrl.length / 1024).toFixed(2);
        const compressedSize = (compressedDataUrl.length / 1024).toFixed(2);
        const compressionRate = ((1 - compressedDataUrl.length / dataUrl.length) * 100).toFixed(1);
        console.log(`写真圧縮: ${originalSize}KB → ${compressedSize}KB (${compressionRate}%削減)`);
    };
    
    img.onerror = function() {
        console.error('画像の読み込みに失敗しました');
        showToast('❌ 画像の読み込みに失敗しました');
    };
}

// 写真を追加
function addPhoto(itemId, dataUrl) {
    if (!photosData[itemId]) {
        photosData[itemId] = [];
    }

    const photoId = generateUUID();
    photosData[itemId].push({
        id: photoId,
        url: dataUrl,
        beforeAfter: 'before',
        timestamp: new Date().toISOString()
    });

    // カメラボタンにバッジを追加
    updateCameraButton(itemId);

    // ギャラリーを更新
    renderPhotoGallery();

    showToast('✅ 写真を追加しました');
}

// 写真ギャラリーを描画
function renderPhotoGallery() {
    const container = document.getElementById('photoGallery');
    if (!container || !currentPhotoItemId) return;

    const photos = photosData[currentPhotoItemId] || [];

    if (photos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">写真がまだありません</p>';
        return;
    }

    const html = photos.map(photo => `
        <div class="photo-item">
            <img src="${photo.url}" alt="点検写真">
            <span class="photo-badge ${photo.beforeAfter}">${photo.beforeAfter === 'before' ? '前' : '後'}</span>
            <button class="photo-delete" onclick="deletePhoto('${currentPhotoItemId}', '${photo.id}')">
                <i class="fas fa-times"></i>
            </button>
            <div class="photo-controls">
                <button class="photo-control-btn" onclick="toggleBeforeAfter('${currentPhotoItemId}', '${photo.id}')">
                    ${photo.beforeAfter === 'before' ? '後に変更' : '前に変更'}
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// 写真を削除
function deletePhoto(itemId, photoId) {
    if (!photosData[itemId]) return;

    photosData[itemId] = photosData[itemId].filter(p => p.id !== photoId);

    updateCameraButton(itemId);
    renderPhotoGallery();
    showToast('🗑️ 写真を削除しました');
}

// Before/Afterを切り替え
function toggleBeforeAfter(itemId, photoId) {
    const photo = photosData[itemId]?.find(p => p.id === photoId);
    if (!photo) return;

    photo.beforeAfter = photo.beforeAfter === 'before' ? 'after' : 'before';
    renderPhotoGallery();
}



// カメラボタンを更新
function updateCameraButton(itemId) {
    const button = document.querySelector(`[data-item-id="${itemId}"] .camera-btn`);
    if (!button) return;

    const hasPhotos = photosData[itemId] && photosData[itemId].length > 0;
    if (hasPhotos) {
        button.classList.add('has-photos');
    } else {
        button.classList.remove('has-photos');
    }
}

// すべてのカメラボタンのバッジをクリア
function clearAllCameraButtonBadges() {
    document.querySelectorAll('.camera-btn').forEach(button => {
        button.classList.remove('has-photos');
    });
}

// LocalStorageの使用状況をチェック
function checkLocalStorageCapacity() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        const totalSizeKB = (totalSize / 1024).toFixed(2);
        const limitKB = 5120; // 約5MB
        const usagePercent = ((totalSize / 1024 / limitKB) * 100).toFixed(1);
        
        console.log(`LocalStorage使用量: ${totalSizeKB}KB / ${limitKB}KB (${usagePercent}%)`);
        
        if (totalSize / 1024 > limitKB * 0.8) { // 80%以上使用
            showToast(`⚠️ LocalStorage容量が ${usagePercent}% 使用されています`, 'warning');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('容量チェックエラー:', error);
        return true;
    }
}

// 下書き保存
async function saveAsDraft() {
    try {
        // LocalStorage容量チェック
        checkLocalStorageCapacity();
        
        const data = collectFormData();
        data.status = 'draft';

        if (currentRecordId) {
            // 更新
            await updateRecord(currentRecordId, data);
            showToast('✅ 下書きを保存しました');
        } else {
            // 新規作成
            const record = await createRecord(data);
            currentRecordId = record.id;
            showToast('✅ 下書きを保存しました');
            // URLを更新
            history.replaceState(null, '', `?id=${currentRecordId}`);
        }
    } catch (error) {
        console.error('下書き保存エラー:', error);
        // エラーの詳細をトーストで表示
        const errorMsg = error.message || error.toString();
        showToast(`❌ 下書き保存に失敗: ${errorMsg.substring(0, 50)}`);
    }
}

// 点検完了
async function completeInspection() {
    // 必須項目のバリデーション
    const requiredFields = [
        { id: 'client-name', name: '依頼者の氏名又は名称' },
        { id: 'registration-number', name: '自動車登録番号' },
        { id: 'total-mileage', name: '点検(整備)時の総走行距離' },
        { id: 'inspection-date', name: '点検の年月日' }
    ];

    for (const field of requiredFields) {
        const value = document.getElementById(field.id)?.value;
        if (!value || value.trim() === '') {
            showToast(`❌ ${field.name}は必須項目です`);
            return;
        }
    }

    try {
        const data = collectFormData();
        data.status = 'completed';
        data.access_token = generateAccessToken();
        data.qr_code = `${window.location.origin}/customer.html?token=${data.access_token}`;

        if (currentRecordId) {
            await updateRecord(currentRecordId, data);
        } else {
            const record = await createRecord(data);
            currentRecordId = record.id;
        }

        // 既存の写真を削除してから新しい写真を保存
        await deleteExistingPhotos(currentRecordId);
        await savePhotos();

        showToast('✅ 整備記録を完了しました');

        // 確認ダイアログ
        if (confirm('整備記録を保存しました。\n帳票を出力しますか?')) {
            // PDF出力ページに遷移
            window.location.href = `pdf-output.html?id=${currentRecordId}`;
        } else {
            // 検索ページに戻る
            setTimeout(() => {
                window.location.href = 'search.html';
            }, 1000);
        }
    } catch (error) {
        console.error('完了保存エラー:', error);
        // エラーの詳細をトーストで表示
        const errorMsg = error.message || error.toString();
        showToast(`❌ 保存に失敗: ${errorMsg.substring(0, 50)}`);
    }
}

// フォームデータを収集
function collectFormData() {
    // 車両情報
    const vehicleData = {
        client_name: document.getElementById('client-name')?.value || '',
        registration_number: document.getElementById('registration-number')?.value || '',
        car_model: document.getElementById('car-model')?.value || '',
        chassis_number: document.getElementById('chassis-number')?.value || '',
        engine_model: document.getElementById('engine-model')?.value || '',
        first_registration: document.getElementById('first-registration')?.value || '',
        address: document.getElementById('address')?.value || '',
        inspector_name: document.getElementById('inspector-name')?.value || '',
        workshop_address: document.getElementById('workshop-address')?.value || '',
        certification_number: document.getElementById('certification-number')?.value || '',
        inspection_date: document.getElementById('inspection-date')?.value || '',
        completion_date: document.getElementById('completion-date')?.value || '',
        chief_mechanic_name: document.getElementById('chief-mechanic-name')?.value || '',
        total_mileage: parseFloat(document.getElementById('total-mileage')?.value) || 0
    };

    // 点検データ
    vehicleData.inspection_data = JSON.stringify(inspectionData);

    // 交換部品（数量が入力されているもののみ）
    const parts = {};
    document.querySelectorAll('.replacement-quantity').forEach(input => {
        const partId = input.getAttribute('data-part-id');
        const quantity = input.value;
        if (quantity && parseFloat(quantity) > 0) {
            const partName = input.getAttribute('data-part-name') || '';
            const unit = input.getAttribute('data-part-unit') || '';
            parts[partName] = `${quantity} ${unit}`;
        }
    });
    vehicleData.replacement_parts = JSON.stringify(parts);
    
    // カスタム部品リストを保存
    const customParts = replacementParts.filter(p => p.custom);
    vehicleData.custom_parts = JSON.stringify(customParts);

    // アドバイス
    vehicleData.advice = document.getElementById('advice')?.value || '';

    // 測定値
    const measurementData = {};
    measurements.forEach(m => {
        const value = document.getElementById(m.id)?.value;
        if (value) {
            measurementData[m.name] = value;
        }
    });
    vehicleData.measurements = JSON.stringify(measurementData);

    // タグ（JSON文字列として保存）
    const tagsInput = document.getElementById('tags')?.value || '';
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    vehicleData.tags = JSON.stringify(tagsArray);

    // カスタム点検項目を保存
    vehicleData.custom_inspection_items = JSON.stringify(customInspectionItems);

    return vehicleData;
}

// レコードを作成
async function createRecord(data) {
    return await API.createRecord('maintenance_records', data);
}

// レコードを更新
async function updateRecord(id, data) {
    return await API.updateRecord('maintenance_records', id, data);
}

// レコードを読み込み
async function loadRecord(id) {
    try {
        const record = await API.getRecord('maintenance_records', id);

        // フォームに値を設定
        document.getElementById('client-name').value = record.client_name || '';
        document.getElementById('registration-number').value = record.registration_number || '';
        document.getElementById('car-model').value = record.car_model || '';
        document.getElementById('chassis-number').value = record.chassis_number || '';
        document.getElementById('engine-model').value = record.engine_model || '';
        document.getElementById('first-registration').value = record.first_registration || '';
        document.getElementById('address').value = record.address || '';
        document.getElementById('inspector-name').value = record.inspector_name || '';
        document.getElementById('workshop-address').value = record.workshop_address || '';
        document.getElementById('certification-number').value = record.certification_number || '';
        document.getElementById('inspection-date').value = record.inspection_date || '';
        document.getElementById('completion-date').value = record.completion_date || '';
        document.getElementById('chief-mechanic-name').value = record.chief_mechanic_name || '';
        document.getElementById('total-mileage').value = record.total_mileage || '';
        // タグを復元（JSON文字列または配列に対応）
        let tagsArray = [];
        if (record.tags) {
            try {
                tagsArray = typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags;
            } catch (e) {
                tagsArray = [];
            }
        }
        document.getElementById('tags').value = tagsArray.join(', ');
        document.getElementById('advice').value = record.advice || '';

        // 車両番号を表示
        document.getElementById('vehicle-display').textContent = record.registration_number || '未登録';

        // カスタム部品を復元（点検データより先に）
        if (record.custom_parts) {
            try {
                const customParts = JSON.parse(record.custom_parts);
                customParts.forEach(part => {
                    // 既存の部品リストに存在しない場合のみ追加
                    const exists = replacementParts.some(p => p.id === part.id);
                    if (!exists) {
                        replacementParts.push(part);
                    }
                });
                // 部品リストを再描画
                renderReplacementParts();
            } catch (e) {
                console.error('カスタム部品の復元エラー:', e);
            }
        }

        // カスタム点検項目を復元（点検データより先に）
        if (record.custom_inspection_items) {
            try {
                customInspectionItems = JSON.parse(record.custom_inspection_items);
                // カスタム点検項目を描画
                renderCustomInspectionItems();
            } catch (e) {
                console.error('カスタム点検項目の復元エラー:', e);
                customInspectionItems = [];
            }
        }

        // 点検データを復元
        if (record.inspection_data) {
            inspectionData = JSON.parse(record.inspection_data);
            Object.keys(inspectionData).forEach(itemId => {
                const data = inspectionData[itemId];
                const itemElement = document.querySelector(`.inspection-item[data-item-id="${itemId}"]`);
                if (itemElement) {
                    // セレクトボックスの値を設定
                    const select = itemElement.querySelector('.mark-select');
                    if (select) {
                        select.value = data.code;
                        itemElement.classList.add('checked');
                    }
                }
            });
        }

        // 測定値を復元
        if (record.measurements) {
            const measurementData = JSON.parse(record.measurements);
            Object.keys(measurementData).forEach(name => {
                const m = measurements.find(m => m.name === name);
                if (m) {
                    document.getElementById(m.id).value = measurementData[name];
                }
            });
        }

        // 交換部品を復元
        if (record.replacement_parts) {
            const parts = JSON.parse(record.replacement_parts);
            Object.keys(parts).forEach(partName => {
                const part = replacementParts.find(p => p.name === partName);
                if (part) {
                    // "数量 単位" 形式から数量のみを抽出
                    const quantityStr = parts[partName].toString();
                    const quantity = quantityStr.split(' ')[0];
                    const input = document.querySelector(`.replacement-quantity[data-part-id="${part.id}"]`);
                    if (input) {
                        input.value = quantity;
                    }
                }
            });
        }

        // 写真を読み込み
        await loadPhotos(id);

        updateProgress();
        updateSummary(); // サマリーも更新
        showToast('✅ レコードを読み込みました');
    } catch (error) {
        console.error('読み込みエラー:', error);
        showToast('❌ レコードの読み込みに失敗しました');
    }
}

// 写真を保存
async function savePhotos() {
    if (!currentRecordId) {
        console.warn('savePhotos: currentRecordIdが未設定');
        return;
    }

    console.log('写真保存開始:', { recordId: currentRecordId, photosCount: Object.keys(photosData).length });

    for (const itemId of Object.keys(photosData)) {
        const photos = photosData[itemId];
        
        // itemIdから項目名を取得
        const itemName = getItemNameById(itemId);
        console.log('項目写真保存:', { itemId, itemName, photoCount: photos.length });
        
        for (const photo of photos) {
            const photoData = {
                record_id: currentRecordId,
                item_id: itemId,
                item_name: itemName,
                photo_url: photo.url,
                thumbnail_url: photo.url, // 実装では圧縮版を作成
                before_after: photo.beforeAfter,
                is_cover: false,
                caption: '',
                photographer: document.getElementById('mechanic-name')?.value || '',
                photo_date: photo.timestamp,
                sort_order: photos.indexOf(photo)
            };

            try {
                await API.createRecord('inspection_photos', photoData);
                console.log('写真保存成功:', { itemId, itemName });
            } catch (error) {
                console.error('写真保存エラー:', { itemId, itemName, error });
                throw error; // エラーを再スロー
            }
        }
    }
    
    console.log('写真保存完了');
}

// itemIdから項目名を取得
function getItemNameById(itemId) {
    // 全体写真の場合
    if (itemId === 'parts_overall') {
        return '交換部品全体';
    }
    
    // 点検項目を検索
    const sections = ['engine', 'interior', 'undercarriage', 'bottom', 'obd', 'daily'];
    
    for (const section of sections) {
        const items = inspectionItems[section];
        if (!items) continue;
        
        for (const group of items) {
            for (const item of group.items) {
                if (item.id === itemId) {
                    return item.name;
                }
            }
        }
    }
    
    // カスタム点検項目を検索
    const customItem = customInspectionItems.find(item => item.id === itemId);
    if (customItem) {
        return customItem.name;
    }
    
    // 標準交換部品を検索
    const standardPart = replacementParts.find(p => p.id === itemId);
    if (standardPart) {
        return standardPart.name;
    }
    
    // カスタム部品の場合（part_で始まる）
    if (itemId.startsWith('part_')) {
        const customPart = replacementParts.find(p => p.id === itemId);
        if (customPart) {
            return customPart.name;
        }
        // カスタム部品が見つからない場合はIDから推測
        return itemId.replace('part_', '');
    }
    
    return itemId; // 見つからない場合はIDを返す
}

// 既存の写真を削除
async function deleteExistingPhotos(recordId) {
    try {
        const result = await API.getRecords('inspection_photos', { limit: 1000 });
        const allPhotos = result.data || [];
        
        // このレコードの写真のみをフィルタリング
        const photos = allPhotos.filter(photo => photo.record_id === recordId);
        
        for (const photo of photos) {
            try {
                await API.deleteRecord('inspection_photos', photo.id);
            } catch (error) {
                console.error('写真削除エラー:', error);
            }
        }
    } catch (error) {
        console.error('既存写真の取得エラー:', error);
    }
}

// 写真を読み込み
async function loadPhotos(recordId) {
    try {
        const result = await API.getRecords('inspection_photos', { limit: 1000 });
        const allPhotos = result.data || [];
        
        // このレコードの写真のみをフィルタリング
        const photos = allPhotos.filter(photo => photo.record_id === recordId);

        // photosDataを完全にクリア
        photosData = {};
        
        photos.forEach(photo => {
            if (!photosData[photo.item_id]) {
                photosData[photo.item_id] = [];
            }
            photosData[photo.item_id].push({
                id: photo.id,
                url: photo.photo_url,
                beforeAfter: photo.before_after,
                timestamp: photo.photo_date
            });

            // カメラボタンを更新
            updateCameraButton(photo.item_id);
        });
    } catch (error) {
        console.error('写真読み込みエラー:', error);
        // エラー時も初期化
        photosData = {};
    }
}

// 記号説明パネルの開閉
// 記号説明モーダルを開く
function openLegendModal() {
    const modal = document.getElementById('legendModal');
    modal.style.display = 'flex';
}

// 記号説明モーダルを閉じる
function closeLegendModal() {
    const modal = document.getElementById('legendModal');
    modal.style.display = 'none';
}

// モーダル外クリックで閉じる
window.addEventListener('click', function(event) {
    const legendModal = document.getElementById('legendModal');
    if (event.target === legendModal) {
        closeLegendModal();
    }
});

// トースト通知
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ユーティリティ関数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateAccessToken() {
    return Array.from({length: 32}, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

// 部品追加モーダルを表示
function showAddPartModal() {
    document.getElementById('addPartModal').classList.add('show');
    document.getElementById('newPartName').value = '';
    document.getElementById('newPartUnit').value = '個';
    setTimeout(() => {
        document.getElementById('newPartName').focus();
    }, 100);
}

// 部品追加モーダルを閉じる
function closeAddPartModal() {
    document.getElementById('addPartModal').classList.remove('show');
}

// カスタム部品を追加
function addCustomPart() {
    const name = document.getElementById('newPartName').value.trim();
    const unit = document.getElementById('newPartUnit').value;

    if (!name) {
        showToast('❌ 部品名を入力してください');
        return;
    }

    // 重複チェック
    const exists = replacementParts.some(p => p.name === name);
    if (exists) {
        showToast('❌ 同じ名前の部品が既に存在します');
        return;
    }

    // 新しい部品を追加
    const partId = 'custom_' + Date.now();
    replacementParts.push({
        id: partId,
        name: name,
        unit: unit,
        custom: true
    });

    // 再描画
    renderReplacementParts();
    closeAddPartModal();
    showToast('✅ 部品を追加しました');

    // 追加した部品の入力欄にフォーカス
    setTimeout(() => {
        const input = document.getElementById(partId);
        if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
        }
    }, 100);
}

// カスタム部品を削除
function deleteCustomPart(partId) {
    if (!confirm('この部品を削除してもよろしいですか？')) {
        return;
    }

    const index = replacementParts.findIndex(p => p.id === partId);
    if (index > -1) {
        replacementParts.splice(index, 1);
        renderReplacementParts();
        showToast('🗑️ 部品を削除しました');
    }
}

// カスタム点検項目の管理
let customInspectionItems = [];

// カスタム点検項目追加モーダルを表示
function showAddCustomItemModal() {
    document.getElementById('addCustomItemModal').classList.add('show');
    document.getElementById('newCustomItemName').value = '';
    setTimeout(() => {
        document.getElementById('newCustomItemName').focus();
    }, 100);
}

// カスタム点検項目追加モーダルを閉じる
function closeAddCustomItemModal() {
    document.getElementById('addCustomItemModal').classList.remove('show');
}

// カスタム点検項目を追加
function addCustomInspectionItem() {
    const name = document.getElementById('newCustomItemName').value.trim();

    if (!name) {
        showToast('❌ 点検項目名を入力してください');
        return;
    }

    // 重複チェック
    const exists = customInspectionItems.some(item => item.name === name);
    if (exists) {
        showToast('❌ 同じ名前の点検項目が既に存在します');
        return;
    }

    // 新しい点検項目を追加
    const itemId = 'custom_item_' + Date.now();
    customInspectionItems.push({
        id: itemId,
        name: name,
        addedDate: Date.now()
    });

    // 再描画
    renderCustomInspectionItems();
    closeAddCustomItemModal();
    showToast('✅ 点検項目を追加しました');

    // 追加した項目にスクロール
    setTimeout(() => {
        const item = document.querySelector(`[data-item-id="${itemId}"]`);
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// カスタム点検項目を削除
function deleteCustomInspectionItem(itemId) {
    if (!confirm('この点検項目を削除してもよろしいですか？')) {
        return;
    }

    const index = customInspectionItems.findIndex(item => item.id === itemId);
    if (index > -1) {
        customInspectionItems.splice(index, 1);
        
        // 点検データからも削除
        if (inspectionData[itemId]) {
            delete inspectionData[itemId];
        }
        
        // 写真データからも削除
        if (photosData[itemId]) {
            delete photosData[itemId];
        }
        
        renderCustomInspectionItems();
        updateProgress();
        showToast('🗑️ 点検項目を削除しました');
    }
}

// カスタム点検項目を描画
function renderCustomInspectionItems() {
    const container = document.getElementById('custom-inspection-items');
    if (!container) return;

    if (customInspectionItems.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">カスタム点検項目はまだありません</p>';
        return;
    }

    const html = customInspectionItems.map(item => `
        <div class="inspection-item" data-item-id="${item.id}">
            <div class="item-row">
                <div class="item-name">${item.name}</div>
                <div class="item-actions">
                    <select class="mark-select" data-item-id="${item.id}" onchange="selectMark('${item.id}', this.value)">
                        <option value="">選択してください</option>
                        ${Object.entries(markDefinitions).map(([code, description]) => `
                            <option value="${code}">${code} - ${description}</option>
                        `).join('')}
                    </select>
                    <button class="camera-btn" onclick="openPhotoModal('${item.id}', '${item.name}')">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="delete-item-btn" onclick="deleteCustomInspectionItem('${item.id}')" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    
    // 既存のチェックと写真を復元
    customInspectionItems.forEach(item => {
        if (inspectionData[item.id]) {
            const data = inspectionData[item.id];
            const itemElement = document.querySelector(`.inspection-item[data-item-id="${item.id}"]`);
            if (itemElement) {
                const select = itemElement.querySelector('.mark-select');
                if (select) {
                    select.value = data.code || data;
                    itemElement.classList.add('checked');
                }
            }
        }
        
        if (photosData[item.id] && photosData[item.id].length > 0) {
            updateCameraButton(item.id);
        }
    });
}

// 整備情報サマリーの自動更新設定
function setupSummaryAutoUpdate() {
    const fields = [
        'inspector-name',
        'workshop-address',
        'certification-number',
        'inspection-date',
        'completion-date',
        'chief-mechanic-name',
        'total-mileage'
    ];

    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateSummary);
            element.addEventListener('change', updateSummary);
        }
    });

    // 初回更新
    updateSummary();
}

// 整備情報サマリーを更新
function updateSummary() {
    const summaryFields = {
        'summary-inspector-name': document.getElementById('inspector-name')?.value || '-',
        'summary-workshop-address': document.getElementById('workshop-address')?.value || '-',
        'summary-certification-number': document.getElementById('certification-number')?.value || '-',
        'summary-inspection-date': document.getElementById('inspection-date')?.value || '-',
        'summary-completion-date': document.getElementById('completion-date')?.value || '-',
        'summary-chief-mechanic-name': document.getElementById('chief-mechanic-name')?.value || '-',
        'summary-total-mileage': document.getElementById('total-mileage')?.value 
            ? `${parseFloat(document.getElementById('total-mileage').value).toLocaleString()} km` 
            : '-'
    };

    Object.entries(summaryFields).forEach(([summaryId, value]) => {
        const element = document.getElementById(summaryId);
        if (element) {
            element.textContent = value;
        }
    });
}
