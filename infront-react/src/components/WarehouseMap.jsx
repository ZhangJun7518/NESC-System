/**
 * 2D 仓库平面图（AntV G6 5.x 实现）
 * 支持：分区展示、货位编号、库存状态颜色、点击跳转详情
 */
import React, { useEffect, useRef, useState } from "react";
import { Graph } from "@antv/g6";
import { Modal, Descriptions, Tag, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

// 分区配置
const ZONES = [
  {
    key: "A",
    name: "新能源区",
    categories: ["新能源配件"],
    rowStart: 0,
    colStart: 0,
  },
  { key: "B", name: "粮油区", categories: ["粮油"], rowStart: 0, colStart: 5 },
  { key: "C", name: "饮料区", categories: ["饮料"], rowStart: 5, colStart: 0 },
  {
    key: "D",
    name: "速食日化区",
    categories: ["速食", "日化"],
    rowStart: 5,
    colStart: 5,
  },
];

const CELL_SIZE = 60;
const ZONE_GAP = 30;

const WarehouseMap = ({ goods = [] }) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const isRenderedRef = useRef(false);
  const navigate = useNavigate();
  const [selectedGoods, setSelectedGoods] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 按分类分配商品到分区
  const assignGoodsToZones = () => {
    const result = { A: [], B: [], C: [], D: [] };
    goods.forEach((item) => {
      const zone = ZONES.find((z) => z.categories.includes(item.category));
      if (zone) {
        result[zone.key].push(item);
      }
    });
    // 每个分区补齐到 25 个（不足填 null）
    Object.keys(result).forEach((key) => {
      while (result[key].length < 25) {
        result[key].push(null);
      }
    });
    return result;
  };

  // 生成图数据
  const generateData = () => {
    const nodes = [];
    const zoneGoods = assignGoodsToZones();

    ZONES.forEach((zone) => {
      const items = zoneGoods[zone.key];

      for (let i = 0; i < 25; i++) {
        const rowInZone = Math.floor(i / 5);
        const colInZone = i % 5;
        const row = zone.rowStart + rowInZone;
        const col = zone.colStart + colInZone;

        const x = col * CELL_SIZE + 40 + (col >= 5 ? ZONE_GAP : 0);
        const y = row * CELL_SIZE + 60 + (row >= 5 ? ZONE_GAP : 0);

        const item = items[i];
        let fill = "#f0f0f0";
        let labelText = `${zone.key}-${String(i + 1).padStart(2, "0")}`;

        if (item) {
          if (item.stock === 0) fill = "#ff4d4f";
          else if (item.stock <= item.warning_num) fill = "#faad14";
          else fill = "#52c41a";

          const shortName = item.goods_name
            ? item.goods_name.substring(0, 4)
            : "";
          labelText = `${zone.key}-${String(i + 1).padStart(2, "0")}\n${shortName}\n${item.stock}`;
        }

        nodes.push({
          id: `node-${zone.key}-${i}`,
          data: {
            x,
            y,
            goodsData: item,
            zoneKey: zone.key,
            zoneName: zone.name,
          },
          style: {
            x,
            y,
            size: [CELL_SIZE - 8, CELL_SIZE - 8],
            fill,
            stroke: "#d9d9d9",
            lineWidth: 1,
            radius: 4,
            labelText,
            labelFill: item ? "#fff" : "#999",
            labelFontSize: 10,
            labelPlacement: "center",
          },
        });
      }
    });

    return { nodes, edges: [] };
  };

  // 初始化图
  useEffect(() => {
    if (!containerRef.current || isRenderedRef.current) return;

    const width = containerRef.current.scrollWidth || 900;
    const height = 750;

    const graph = new Graph({
      container: containerRef.current,
      width,
      height,
      autoFit: "view",
      data: generateData(),
      node: {
        type: "rect",
        style: { size: [CELL_SIZE, CELL_SIZE], radius: 4 },
      },
      behaviors: ["drag-canvas", "zoom-canvas"],
    });

    graph.render();
    isRenderedRef.current = true;

    // 👈 点击事件：通过节点 ID 反查商品数据（兼容 G6 5.x）
    graph.on("node:click", (e) => {
      const nodeId = e.target?.id;
      console.log("点击节点:", nodeId);
      if (!nodeId) return;

      const parts = nodeId.split("-");
      if (parts.length < 3) return;

      const zoneKey = parts[1];
      const index = parseInt(parts[2], 10);

      const zoneGoods = assignGoodsToZones();
      const item = zoneGoods[zoneKey]?.[index];

      console.log("解析出商品:", item);
      if (item) {
        setSelectedGoods({
          ...item,
          zoneKey,
          zoneName: ZONES.find((z) => z.key === zoneKey)?.name || "",
        });
        setModalVisible(true);
      }
    });

    graphRef.current = graph;

    return () => {
      if (graphRef.current) {
        try {
          graphRef.current.destroy();
        } catch (err) {
          console.warn("G6 销毁时警告（可忽略）:", err);
        }
        graphRef.current = null;
        isRenderedRef.current = false;
      }
    };
  }, []);

  // 商品数据变化时刷新
  useEffect(() => {
    if (graphRef.current && goods.length > 0 && isRenderedRef.current) {
      try {
        graphRef.current.setData(generateData());
        graphRef.current.render();
      } catch (err) {
        console.warn("平面图刷新失败（可忽略）:", err);
      }
    }
  }, [goods]);

  // 跳转到商品管理页
  const handleViewDetail = () => {
    if (selectedGoods) {
      navigate(
        `/product?search=${encodeURIComponent(selectedGoods.goods_name)}`,
      );
      setModalVisible(false);
    }
  };

  const legend = [
    { color: "#52c41a", label: "库存充足" },
    { color: "#faad14", label: "库存预警" },
    { color: "#ff4d4f", label: "缺货" },
    { color: "#f0f0f0", label: "空货位" },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Space wrap>
          {ZONES.map((z) => (
            <Tag key={z.key} color="blue">
              {z.key}区 · {z.name}
            </Tag>
          ))}
        </Space>
        <Space wrap>
          {legend.map((l) => (
            <span
              key={l.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  background: l.color,
                  borderRadius: 2,
                  display: "inline-block",
                  border: "1px solid #d9d9d9",
                }}
              />
              {l.label}
            </span>
          ))}
        </Space>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: 750,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          overflow: "hidden",
          background: "#fafafa",
        }}
      />

      <Modal
        title={`货位详情 · ${selectedGoods?.zoneName || ""}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
          <Button key="detail" type="primary" onClick={handleViewDetail}>
            查看商品详情
          </Button>,
        ]}
      >
        {selectedGoods && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="商品名称">
              {selectedGoods.goods_name}
            </Descriptions.Item>
            <Descriptions.Item label="分类">
              <Tag color="blue">{selectedGoods.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="规格">
              {selectedGoods.spec}
            </Descriptions.Item>
            <Descriptions.Item label="当前库存">
              <span
                style={{
                  color:
                    selectedGoods.stock <= selectedGoods.warning_num
                      ? "red"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {selectedGoods.stock}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="预警值">
              {selectedGoods.warning_num}
            </Descriptions.Item>
            <Descriptions.Item label="所属门店">
              {selectedGoods.store_id === 1 ? "A店" : "B店"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {selectedGoods.stock === 0 ? (
                <Tag color="red">缺货</Tag>
              ) : selectedGoods.stock <= selectedGoods.warning_num ? (
                <Tag color="orange">预警</Tag>
              ) : (
                <Tag color="green">充足</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseMap;
