import * as React from "react";
import { Stock } from "@ant-design/plots";

const CandleStickChart = ({ data }) => {
	const identifyZones = (rawdata) => {
		const data = rawdata.map((item) => ({
			...item,
			date: new Date(item.epoch), // Convert date to timestamp
		}));

		const supplyZones = [];
		const demandZones = [];
		for (let i = 1; i < data.length - 1; i++) {
			if (data[i].high > data[i - 1].high && data[i].high > data[i + 1].high) {
				supplyZones.push(data[i]);
			}
			if (data[i].low < data[i - 1].low && data[i].low < data[i + 1].low) {
				demandZones.push(data[i]);
			}
		}
		return { supplyZones, demandZones };
	};

	const { supplyZones, demandZones } = identifyZones(data);

	const annotations = [
		...supplyZones.map((zone) => ({
			type: "line",
			start: ["min", zone.high],
			end: ["max", zone.high],
			style: {
				stroke: "red",
				lineWidth: 2,
				lineDash: [4, 2],
			},
			text: {
				content: "Supply Zone",
				position: "start",
				offsetY: -10,
				style: {
					fill: "red",
					fontSize: 12,
				},
			},
		})),
		...demandZones.map((zone) => ({
			type: "line",
			start: ["min", zone.low],
			end: ["max", zone.low],
			style: {
				stroke: "green",
				lineWidth: 2,
				lineDash: [4, 2],
			},
			text: {
				content: "Demand Zone",
				position: "start",
				offsetY: 10,
				style: {
					fill: "green",
					fontSize: 12,
				},
			},
		})),
	];

	// const annotations = [
	// 	...supplyZones.map((zone) => ({
	// 		type: "region",
	// 		start: [zone.date, zone.high],
	// 		end: [zone.date, zone.low],
	// 		style: {
	// 			fill: "rgba(255, 0, 0, 0.3)",
	// 			stroke: "red",
	// 			lineWidth: 1,
	// 		},
	// 	})),
	// 	...demandZones.map((zone) => ({
	// 		type: "region",
	// 		start: [zone.date, zone.high],
	// 		end: [zone.date, zone.low],
	// 		style: {
	// 			fill: "rgba(0, 255, 0, 0.3)",
	// 			stroke: "green",
	// 			lineWidth: 1,
	// 		},
	// 	})),
	// ];

	console.log(annotations);

	const config = {
		xField: "date",
		yField: ["open", "close", "high", "low"],
		// 绿涨红跌
		fallingFill: "#ef5350",
		risingFill: "#26a69a",
		data: data.map((i) => ({ ...i, date: new Date(i.epoch) })),
		// annotations,
	};

	return <Stock {...config} />;
};

export default CandleStickChart;
