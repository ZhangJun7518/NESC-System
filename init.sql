-- 强制重建数据库，保证绝对干净
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
-- 关闭外键约束，方便重建表
DROP DATABASE IF EXISTS nesc_db;

CREATE DATABASE nesc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nesc_db;

-- 1. 用户表
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `real_name` VARCHAR(50),
    `role` VARCHAR(20) NOT NULL COMMENT 'admin, hq_leader, store_manager, stocker',
    `store_id` INT DEFAULT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    `users` (
        `username`,
        `password`,
        `real_name`,
        `role`,
        `store_id`
    )
VALUES (
        'admin',
        '123456',
        '系统管理员',
        'admin',
        NULL
    ),
    (
        'hq_leader',
        '123456',
        '总部领导',
        'hq_leader',
        NULL
    ),
    (
        'store_1',
        '123456',
        'A店店长',
        'store_manager',
        1
    ),
    (
        'store_2',
        '123456',
        'B店店长',
        'store_manager',
        2
    ),
    (
        'stock_1',
        '123456',
        'A店理货员',
        'stocker',
        1
    );

-- 2. 商品表
CREATE TABLE `goods` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `goods_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50),
    `spec` VARCHAR(50),
    `purchase_price` DECIMAL(10, 2) DEFAULT 0.00,
    `sell_price` DECIMAL(10, 2) DEFAULT 0.00,
    `unit` VARCHAR(20),
    `stock` INT DEFAULT 0,
    `warning_num` INT DEFAULT 10,
    `carbon_saving` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '碳减排(kg)',
    `store_id` INT NOT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    `goods` (
        `goods_name`,
        `category`,
        `spec`,
        `purchase_price`,
        `sell_price`,
        `unit`,
        `stock`,
        `warning_num`,
        `carbon_saving`,
        `store_id`
    )
VALUES (
        '储能电池模组',
        '新能源配件',
        '5kWh',
        2500.00,
        3800.00,
        '组',
        20,
        5,
        15.5,
        1
    ),
    (
        '高效光伏板',
        '新能源配件',
        '550W',
        800.00,
        1200.00,
        '块',
        3,
        10,
        8.2,
        1
    ),
    (
        '可口可乐330ml',
        '饮料',
        '330ml/罐',
        1.80,
        3.00,
        '罐',
        100,
        20,
        0.05,
        1
    ),
    (
        '康师傅红烧牛肉面',
        '速食',
        '142g/包',
        2.30,
        3.50,
        '包',
        8,
        15,
        0.02,
        1
    ),
    (
        '东北大米10kg',
        '粮油',
        '10kg/袋',
        45.00,
        58.00,
        '袋',
        50,
        10,
        0.10,
        2
    ),
    (
        '金龙鱼食用油',
        '粮油',
        '5L/桶',
        42.00,
        52.90,
        '桶',
        6,
        10,
        0.08,
        2
    ),
    (
        '储能电池模组',
        '新能源配件',
        '5kWh',
        2500.00,
        3800.00,
        '组',
        80,
        5,
        15.5,
        2
    );

-- 3. 销售记录表
CREATE TABLE `sales` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `goods_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `carbon_saving_total` DECIMAL(10, 2) DEFAULT 0.00,
    `sale_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `store_id` INT NOT NULL,
    `operator_id` INT NOT NULL
);

-- 4. 审计日志表
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `action` VARCHAR(100),
    `details` TEXT,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 智能补货建议表
CREATE TABLE `replenish_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `goods_id` INT NOT NULL,
    `store_id` INT NOT NULL,
    `suggest_quantity` INT NOT NULL,
    `status` VARCHAR(20) DEFAULT 'pending',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ⚡ 生成过去30天500条模拟销售数据
DROP PROCEDURE IF EXISTS generate_mock_sales;

DELIMITER $$

CREATE PROCEDURE generate_mock_sales()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 500 DO
    INSERT INTO `sales` (`goods_id`, `quantity`, `total_price`, `carbon_saving_total`, `sale_time`, `store_id`, `operator_id`)
    SELECT 
      id, 
      FLOOR(1 + RAND() * 3), 
      sell_price * FLOOR(1 + RAND() * 3), 
      carbon_saving * FLOOR(1 + RAND() * 3),
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY),
      store_id,
      5
    FROM `goods`
    ORDER BY RAND() LIMIT 1;
    SET i = i + 1;
  END WHILE;
END$$

DELIMITER;

CALL generate_mock_sales ();

DROP PROCEDURE generate_mock_sales;

SET FOREIGN_KEY_CHECKS = 1;