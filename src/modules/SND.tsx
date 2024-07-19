import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic.js";

const ChartComponent = () => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [ticks, setTicks] = React.useState({});

	const [candles, setCandles] = React.useState([]);
	const app_id = 1089; // Replace with your app_id or leave as 1089 for testing.
	const connection = new WebSocket(
		`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`
	);
	const api = new DerivAPIBasic({ connection });

	const ticks_history_request = {
		ticks_history: "R_50",
		adjust_start_time: 1,
		count: 300,
		end: "latest",
		start: 1,
		style: "candles",
	};

	const ticksHistoryResponse = async (res) => {
		setIsLoading(true);
		const data = JSON.parse(res.data);
		if (data.error !== undefined) {
			console.log("Error : ", data.error.message);
			connection.removeEventListener("message", ticksHistoryResponse, false);
			await api.disconnect();
			setIsLoading(false);
			return;
		}
		if (data.candles) {
			setCandles(data.candles);
			// console.log(data.candles);
			// setTicks(data.history);
			setIsLoading(false);
		}
		connection.removeEventListener("message", ticksHistoryResponse, false);
	};

	const getTicksHistory = async () => {
		connection.addEventListener("message", ticksHistoryResponse);
		await api.ticksHistory(ticks_history_request);
	};

	React.useEffect(() => {
		getTicksHistory();
	}, []);

	const chartRef = useRef();
	const data = candles;
	useEffect(() => {
		if (data && data.length > 0) {
			const ctx = chartRef.current.getContext("2d");
			const chartData = {
				labels: data.map((item) =>
					new Date(item.epoch * 1000).toLocaleTimeString()
				),
				datasets: [
					{
						label: "Close Price",
						data: data.map((item) => item.close),
						borderColor: "blue",
						fill: false,
					},
				],
			};

			const chartConfig = {
				type: "line",
				data: chartData,
				options: {
					scales: {
						x: {
							ticks: {
								callback: (value) => new Date(value).toLocaleTimeString(),
							},
						},
					},
				},
			};

			const chart = new Chart(ctx, chartConfig);

			// Identify supply and demand levels
			const supplyLevel = Math.max(...data.map((item) => item.high));
			const demandLevel = Math.min(...data.map((item) => item.low));

			// Find first and last occurrences of supply and demand levels
			let supplyStartIndex = -1,
				supplyEndIndex = -1,
				demandStartIndex = -1,
				demandEndIndex = -1;

			for (let i = 0; i < data.length; i++) {
				if (data[i].high === supplyLevel) {
					if (supplyStartIndex === -1) {
						supplyStartIndex = i;
					}
					supplyEndIndex = i;
				}

				if (data[i].low === demandLevel) {
					if (demandStartIndex === -1) {
						demandStartIndex = i;
					}
					demandEndIndex = i;
				}
			}

			// Plot supply and demand zones as horizontal lines
			if (supplyStartIndex !== -1 && supplyEndIndex !== -1) {
				chart.data.datasets.push({
					label: "Supply Zone",
					data: [
						{
							x: data[supplyStartIndex].epoch,
							y: supplyLevel,
						},
						{
							x: data[supplyEndIndex].epoch,
							y: supplyLevel,
						},
					],
					borderColor: "red",
					borderWidth: 1,
					pointRadius: 0,
					fill: false,
				});
			}

			if (demandStartIndex !== -1 && demandEndIndex !== -1) {
				chart.data.datasets.push({
					label: "Demand Zone",
					data: [
						{
							x: data[demandStartIndex].epoch,
							y: demandLevel,
						},
						{
							x: data[demandEndIndex].epoch,
							y: demandLevel,
						},
					],
					borderColor: "green",
					borderWidth: 1,
					pointRadius: 0,
					fill: false,
				});
			}

			chart.update();

			return () => chart.destroy();
		}
	}, [data]);

	return <canvas ref={chartRef} />;
};

export default ChartComponent;
