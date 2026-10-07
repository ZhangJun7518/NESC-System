-- 使用 nesc_db 数据库
USE nesc_db;

-- ==================== 1. 插入库存流水测试数据 ====================
INSERT INTO
    inventory_logs (
        goods_id,
        store_id,
        change_type,
        change_quantity,
        before_stock,
        after_stock,
        operator_id,
        remark,
        create_time
    )
VALUES (
        1,
        1,
        '入库',
        50,
        20,
        70,
        1,
        '常规补货入库',
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        3,
        1,
        '入库',
        100,
        50,
        150,
        1,
        '可乐批量入库',
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        5,
        1,
        '入库',
        30,
        20,
        50,
        4,
        '光伏板入库',
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    ),
    (
        2,
        1,
        '入库',
        20,
        5,
        25,
        4,
        '方便面补货',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        4,
        1,
        '入库',
        10,
        3,
        13,
        1,
        '食用油补货',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        3,
        1,
        '销售',
        -3,
        150,
        147,
        5,
        '门店扫码销售',
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        3,
        1,
        '销售',
        -5,
        147,
        142,
        5,
        '门店扫码销售',
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        1,
        1,
        '销售',
        -2,
        70,
        68,
        5,
        '电池模组销售',
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    ),
    (
        2,
        1,
        '销售',
        -8,
        25,
        17,
        5,
        '方便面热销',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        5,
        1,
        '销售',
        -1,
        50,
        49,
        5,
        '光伏板销售',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        4,
        1,
        '销售',
        -2,
        13,
        11,
        5,
        '食用油销售',
        NOW()
    ),
    (
        1,
        1,
        '调拨',
        -10,
        68,
        58,
        1,
        '从A店调拨到B店',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        3,
        1,
        '调拨',
        -20,
        142,
        122,
        1,
        '可乐跨店调拨',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        1,
        2,
        '调拨',
        10,
        70,
        80,
        1,
        'A店调入',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        3,
        2,
        '调拨',
        20,
        80,
        100,
        1,
        'A店调入可乐',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );

-- ==================== 2. 插入补货任务单测试数据 ====================
INSERT INTO
    replenish_orders (
        order_no,
        goods_id,
        store_id,
        suggest_quantity,
        actual_quantity,
        supplier,
        expected_date,
        status,
        operator_id
    )
VALUES (
        'RO-20261007-001',
        2,
        1,
        27,
        30,
        '康师傅供应商',
        DATE_ADD(NOW(), INTERVAL 3 DAY),
        'pending',
        1
    ),
    (
        'RO-20261007-002',
        5,
        1,
        20,
        20,
        '金龙鱼供应商',
        DATE_ADD(NOW(), INTERVAL 2 DAY),
        'ordered',
        1
    ),
    (
        'RO-20261007-003',
        4,
        1,
        14,
        15,
        '本地粮油门市',
        DATE_ADD(NOW(), INTERVAL 1 DAY),
        'received',
        1
    ),
    (
        'RO-20261007-004',
        1,
        1,
        18,
        20,
        '宁德时代供应商',
        DATE_ADD(NOW(), INTERVAL 5 DAY),
        'pending',
        1
    );