import { Box } from "@chakra-ui/react";
import * as React from "react";

import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic.js";

import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import dayjs from "dayjs";

// Register necessary components for Chart.js
ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
	annotationPlugin
);

const Ticks: React.FC = () => {
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

	const chartData = {
		labels: candles.map((point) => point.epoch),
		datasets: [
			{
				label: "Price",
				data: candles.map((point) => point.close),
				// ... other price data configuration
			},
			// {
			// 	label: "Supply Zone",
			// 	data: calculateZones(candles)["supplyZones"].map((zone) => ({
			// 		x: zone.epoch,
			// 		y: zone.price,
			// 	})),
			// 	borderColor: "red",
			// 	pointRadius: 5,
			// 	pointStyle: "circle",
			// 	// ... other supply zone configuration
			// },
			// {
			// 	label: "Demand Zone",
			// 	data: calculateZones(candles)["demandZones"].map((zone) => ({
			// 		x: zone.epoch,
			// 		y: zone.price,
			// 	})),
			// 	borderColor: "green",
			// 	pointRadius: 5,
			// 	pointStyle: "circle",
			// 	// ... other demand zone configuration
			// },
			// ...zoneSegments,
		],
	};

	return (
		<Box>
			<Line
				data={
					Object.entries(chartData).length > 1
						? chartData
						: {
								labels: [
									"January",
									"February",
									"March",
									"April",
									"May",
									"June",
									"July",
								],
								datasets: [
									{
										label: "My First dataset",
										data: [65, 59, 80, 81, 56, 55, 40],
										fill: false,
										backgroundColor: "rgba(75,192,192,0.4)",
										borderColor: "rgba(75,192,192,1)",
									},
								],
						  }
				}
				// data={chartData}
				// options={{
				// 	// scales: {
				// 	// 	x: {
				// 	// 		beginAtZero: true,
				// 	// 	},
				// 	// 	y: {
				// 	// 		beginAtZero: true,
				// 	// 	},
				// 	// },
				// 	plugins: {
				// 		annotation: {
				// 			annotations: [
				// 				...supplyZones.map((zone) => ({
				// 					type: "line",
				// 					yMin: zone,
				// 					yMax: zone,
				// 					borderColor: "red",
				// 					borderWidth: 2,
				// 					label: {
				// 						content: "Supply Zone",
				// 						enabled: true,
				// 						position: "center",
				// 					},
				// 				})),
				// 				...demandZones.map((zone) => ({
				// 					type: "line",
				// 					yMin: zone,
				// 					yMax: zone,
				// 					borderColor: "green",
				// 					borderWidth: 2,
				// 					label: {
				// 						content: "Demand Zone",
				// 						enabled: true,
				// 						position: "center",
				// 					},
				// 				})),
				// 			],
				// 		},
				// 	},
				// }}
			/>
		</Box>
	);
};

export default Ticks;
