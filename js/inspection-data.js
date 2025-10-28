// 点検項目データ定義
const inspectionItems = {
    // エンジン・ルーム点検
    engine: [
        {
            category: 'パワー・ステアリング',
            items: [
                {
                    id: 'engine_ps_belt',
                    name: 'ベルトの緩み、損傷',
                    codes: ['✓', '×', 'A', 'P', '/'],
                    required: false
                }
            ]
        },
        {
            category: '冷却装置',
            items: [
                {
                    id: 'engine_fan_belt',
                    name: 'ファン・ベルトの緩み、損傷',
                    codes: ['✓', '×', 'A', 'P', '/'],
                    required: false
                },
                {
                    id: 'engine_coolant_leak',
                    name: '冷却水の漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: false
                }
            ]
        },
        {
            category: '点火装置',
            items: [
                {
                    id: 'engine_spark_plug',
                    name: '☆◎スパーク・プラグの状態',
                    codes: ['✓', '×', 'C', 'P', '/'],
                    required: true
                },
                {
                    id: 'engine_ignition_timing',
                    name: '点火時期',
                    codes: ['✓', '×', 'A', 'P', '/'],
                    required: false
                },
                {
                    id: 'engine_distributor_cap',
                    name: 'ディストリビュータのキャップの状態',
                    codes: ['✓', '×', 'C', 'P', '/'],
                    required: false
                }
            ]
        },
        {
            category: 'バッテリ',
            items: [
                {
                    id: 'engine_battery_terminal',
                    name: 'ターミナル部の緩み、腐食による接続不良',
                    codes: ['✓', '×', 'C', 'T', '/'],
                    required: false
                }
            ]
        },
        {
            category: 'エンジン',
            items: [
                {
                    id: 'engine_exhaust_color',
                    name: '排気ガスの色',
                    codes: ['✓', '×', '△', 'P', '/'],
                    required: false
                },
                {
                    id: 'engine_co_hc',
                    name: 'CO.HCの濃度',
                    codes: ['✓', '×', 'A', 'P', '/'],
                    required: false
                },
                {
                    id: 'engine_air_cleaner',
                    name: '☆エア・クリーナ・エレメントの汚れ、詰まり、損傷',
                    codes: ['✓', '×', 'C', 'P', '/'],
                    required: true
                }
            ]
        }
    ],
    
    // 室内点検
    interior: [
        {
            category: 'ブレーキ・ペダル',
            items: [
                {
                    id: 'interior_brake_pedal_play',
                    name: '遊び',
                    codes: ['✓', '×', 'A', '△', '/'],
                    required: false
                },
                {
                    id: 'interior_brake_pedal_clearance',
                    name: '踏み込んだときの床板とのすき間',
                    codes: ['✓', '×', 'A', '△', '/'],
                    required: false
                },
                {
                    id: 'interior_brake_effect',
                    name: 'ブレーキの効き具合',
                    codes: ['✓', 'A', '△', 'P'],
                    required: false
                }
            ]
        },
        {
            category: 'パーキング・ブレーキ・レバー(ペダル)',
            items: [
                {
                    id: 'interior_parking_brake_stroke',
                    name: '引きしろ(踏みしろ)',
                    codes: ['✓', '×', 'A', '△', '/'],
                    required: false
                },
                {
                    id: 'interior_parking_brake_effect',
                    name: 'パーキング・ブレーキの効き具合',
                    codes: ['✓', 'A', '△', 'P'],
                    required: false
                }
            ]
        },
        {
            category: 'クラッチ・ペダル',
            items: [
                {
                    id: 'interior_clutch_play',
                    name: '遊び',
                    codes: ['✓', '×', 'A', '△', '/'],
                    required: false
                },
                {
                    id: 'interior_clutch_clearance',
                    name: '切れたときの床板とのすき間',
                    codes: ['✓', '×', 'A', '△', '/'],
                    required: false
                }
            ]
        }
    ],
    
    // 足廻り点検
    undercarriage: [
        {
            category: 'ブレーキ・ディスク、ドラム',
            items: [
                {
                    id: 'under_disk_pad_clearance',
                    name: '☆ディスクとバッドとのすき問',
                    codes: ['✓', '×', 'A', '○', '/'],
                    required: true
                },
                {
                    id: 'under_brake_pad_wear',
                    name: '☆ブレーキパッドの摩耗',
                    codes: ['✓', '×', 'C', '○', '/'],
                    required: true
                },
                {
                    id: 'under_drum_lining_clearance',
                    name: '☆ドラムとライニングとのすき間',
                    codes: ['✓', '×', 'A', '○', '/'],
                    required: true
                },
                {
                    id: 'under_brake_shoe_lining',
                    name: '☆ブレーキ・シューの摺動部分、ライニングの摩耗',
                    codes: ['✓', '×', 'C', '○', '/'],
                    required: true
                }
            ]
        },
        {
            category: 'ホイール',
            items: [
                {
                    id: 'under_tire_pressure',
                    name: '☆タイヤの空気圧(スペアタイヤ含む)',
                    codes: ['✓', 'A', 'L', 'P'],
                    required: true
                },
                {
                    id: 'under_tire_crack',
                    name: '☆タイヤの亀裂、損傷',
                    codes: ['✓', '×', '△', 'P'],
                    required: true
                },
                {
                    id: 'under_tire_tread',
                    name: '☆タイヤの溝の深さ、異常な摩耗',
                    codes: ['✓', '×', '△', 'P'],
                    required: true
                },
                {
                    id: 'under_wheel_bolt_nut',
                    name: '☆ボルト、ナットの緩み',
                    codes: ['✓', '×', 'T', 'P', '/'],
                    required: true
                }
            ]
        },
        {
            category: 'ブレーキのマスタ・シリンダ、ホイール・シリンダ、ディスク・キャリバ',
            items: [
                {
                    id: 'under_master_cylinder_leak',
                    name: 'マスタ・シリンダの液漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: false
                },
                {
                    id: 'under_wheel_cylinder_leak',
                    name: 'ホイール・シリンダの液漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: false
                },
                {
                    id: 'under_disk_caliper_leak',
                    name: 'ディスク・キャリパの液漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: false
                }
            ]
        }
    ],
    
    // 下廻り点検
    bottom: [
        {
            category: 'エンジン・オイル',
            items: [
                {
                    id: 'bottom_engine_oil_leak',
                    name: '漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: false
                }
            ]
        },
        {
            category: 'トランスミッション、トランスファ',
            items: [
                {
                    id: 'bottom_transmission_oil_leak',
                    name: '☆オイルの漏れ',
                    codes: ['✓', '×', 'L', '△', '/'],
                    required: true
                },
                {
                    id: 'bottom_transmission_oil_level',
                    name: '☆オイルの量',
                    codes: ['✓', '×', 'L', 'A', '/'],
                    required: true
                }
            ]
        },
        {
            category: 'ブレーキ・ホース、パイプ',
            items: [
                {
                    id: 'bottom_brake_hose_pipe',
                    name: '漏れ、損傷、取付状態',
                    codes: ['✓', '×', 'L', '△', 'T', '/'],
                    required: false
                }
            ]
        },
        {
            category: 'エグゾースト・バイブ、マフラ',
            items: [
                {
                    id: 'bottom_exhaust_pipe_muffler',
                    name: '☆取付の緩み、損傷、腐食',
                    codes: ['✓', '×', 'T', '△', '/'],
                    required: true
                },
                {
                    id: 'bottom_heat_shield',
                    name: '☆遮熱板の取り付けの緩み、損傷、腐食',
                    codes: ['✓', '×', 'T', '△', '/'],
                    required: true
                }
            ]
        },
        {
            category: 'プロペラ・シャフト、ドライブ・シャフト',
            items: [
                {
                    id: 'bottom_propeller_drive_shaft',
                    name: '☆連結部の緩み',
                    codes: ['✓', '×', 'T', '△', '/'],
                    required: true
                }
            ]
        }
    ],
    
    // 車載式故障診断装置点検
    obd: [
        {
            category: '車載式故障診断装置',
            items: [
                {
                    id: 'obd_diagnostic',
                    name: 'OBDの診断結果',
                    codes: ['✓', '×', 'P'],
                    required: false
                }
            ]
        }
    ],
    
    // 日常点検
    daily: [
        {
            category: '日常点検項目',
            items: [
                {
                    id: 'daily_brake_fluid',
                    name: 'ブレーキ液の量',
                    codes: ['✓', '×', 'L', 'A'],
                    required: false
                },
                {
                    id: 'daily_battery_fluid',
                    name: 'バッテリ液の量',
                    codes: ['✓', '×', 'L', 'A'],
                    required: false
                },
                {
                    id: 'daily_coolant',
                    name: '冷却水の量',
                    codes: ['✓', '×', 'L', 'A'],
                    required: false
                },
                {
                    id: 'daily_engine_oil',
                    name: 'エンジン・オイルの量',
                    codes: ['✓', '×', 'L', 'A'],
                    required: false
                },
                {
                    id: 'daily_engine_start',
                    name: 'エンジンのかかり具合・異音',
                    codes: ['✓', '×', '△'],
                    required: false
                },
                {
                    id: 'daily_acceleration',
                    name: '低速と加速の状態',
                    codes: ['✓', '×', '△'],
                    required: false
                },
                {
                    id: 'daily_lights',
                    name: 'ヘッドランプ、トップ・ランプ、ウインカ・ランプ等の点灯、汚れ、損傷',
                    codes: ['✓', '×', '△'],
                    required: false
                },
                {
                    id: 'daily_brake_effect',
                    name: 'ブレーキの効き具合',
                    codes: ['✓', '×', '△'],
                    required: false
                },
                {
                    id: 'daily_washer',
                    name: 'ウインド・ウオッシャ液のウインド・ウオッシャ液の噴射状態',
                    codes: ['✓', '×', '△'],
                    required: false
                },
                {
                    id: 'daily_wiper',
                    name: 'ワイパの拭き取り状態',
                    codes: ['✓', '×', '△'],
                    required: false
                }
            ]
        }
    ]
};

// 交換部品データ
const replacementParts = [
    { id: 'engine_oil', name: 'エンジン・オイル', unit: 'L' },
    { id: 'oil_filter', name: 'オイル・フィルタ', unit: '個' },
    { id: 'llc', name: 'LLC (ロング・ライフ・クーラント)', unit: 'L' },
    { id: 'brake_fluid', name: 'ブレーキ・フルード', unit: 'L' },
    { id: 'air_filter', name: 'エア・フィルタ', unit: '個' },
    { id: 'spark_plug', name: 'スパーク・プラグ', unit: '本' },
    { id: 'wiper_blade', name: 'ワイパー・ブレード', unit: '本' },
    { id: 'battery', name: 'バッテリ', unit: '個' }
];

// 測定値データ
const measurements = [
    { id: 'co_idle', name: 'CO濃度（アイドリング時）', unit: '%', placeholder: '0.0' },
    { id: 'hc', name: 'HC濃度', unit: 'ppm', placeholder: '0' },
    { id: 'tire_fl', name: 'タイヤ溝の深さ（前輪左）', unit: 'mm', placeholder: '10.0' },
    { id: 'tire_fr', name: 'タイヤ溝の深さ（前輪右）', unit: 'mm', placeholder: '10.0' },
    { id: 'tire_rl', name: 'タイヤ溝の深さ（後輪左）', unit: 'mm', placeholder: '10.0' },
    { id: 'tire_rr', name: 'タイヤ溝の深さ（後輪右）', unit: 'mm', placeholder: '10.0' },
    { id: 'brake_pad_fl', name: 'ブレーキ・パッド厚さ（前輪左）', unit: 'mm', placeholder: '4.4' },
    { id: 'brake_pad_fr', name: 'ブレーキ・パッド厚さ（前輪右）', unit: 'mm', placeholder: '4.4' },
    { id: 'brake_pad_rl', name: 'ブレーキ・パッド厚さ（後輪左）', unit: 'mm', placeholder: '8.4' },
    { id: 'brake_pad_rr', name: 'ブレーキ・パッド厚さ（後輪右）', unit: 'mm', placeholder: '8.7' }
];
