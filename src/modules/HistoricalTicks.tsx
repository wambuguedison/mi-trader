import { Timeline } from "antd";
import * as React from "react";
import { Button } from "@chakra-ui/button";
import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic.js";
import { Flex } from "@chakra-ui/react";
import dayjs from "dayjs";
import CandleStickChart from "../Components/CandleStickChart";
import { getSnDs } from "../utils/snd";

const HistoricalTicks: React.FC = () => {
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

	// const ticks_request = {
	// 	...ticks_history_request,
	// 	subscribe: 1,
	// };

	// const tickSubscriber = () => api.subscribe(ticks_request);

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
			console.log(data.candles);
			// setTicks(data.history);
			setIsLoading(false);
		}
		connection.removeEventListener("message", ticksHistoryResponse, false);
	};

	// const ticksResponse = async (res) => {
	// 	const data = JSON.parse(res.data);
	// 	// This example returns an object with a selected amount of past ticks.
	// 	if (data.error !== undefined) {
	// 		console.log("Error : ", data.error.message);
	// 		connection.removeEventListener("message", ticksResponse, false);
	// 		await api.disconnect();
	// 	}
	// 	// Allows you to monitor ticks.
	// 	if (data.msg_type === "tick") {
	// 		console.log(data.tick);
	// 	}
	// };

	// const subscribeTicks = async () => {
	// 	connection.addEventListener("message", ticksResponse);
	// 	await tickSubscriber();
	// };

	// const unsubscribeTicks = async () => {
	// 	connection.removeEventListener("message", ticksResponse, false);
	// 	await tickSubscriber().unsubscribe();
	// };

	const getTicksHistory = async () => {
		connection.addEventListener("message", ticksHistoryResponse);
		await api.ticksHistory(ticks_history_request);
	};

	// const subscribe_ticks_button = document.querySelector("#ticks");
	// subscribe_ticks_button.addEventListener("click", subscribeTicks);

	// const unsubscribe_ticks_button = document.querySelector("#ticks-unsubscribe");
	// unsubscribe_ticks_button.addEventListener("click", unsubscribeTicks);

	// const ticks_history_button = document.querySelector("#ticks-history");
	// ticks_history_button.addEventListener("click", getTicksHistory);

	return (
		<Flex gap="20px" flexDir="column" p="20px">
			<Flex gap="20px">
				<Button isLoading={isLoading} onClick={getTicksHistory} w="300px">
					Get Historical Ticks
				</Button>
				<Button
					display={candles.length > 0 ? "block" : "none"}
					// onClick={() => getSnDs(candles)}
					// w="300px"
				>
					Get SnDs
				</Button>
			</Flex>

			{/* <Timeline
				items={ticks?.prices?.map((price: number, id: string | number) => ({
					children: `Price was ${price} at ${dayjs(ticks?.times[id]).format(
						"HH: MM: ss"
					)}`,
				}))}
			/>
       */}
			<CandleStickChart data={candles} />
		</Flex>
	);
};

export default HistoricalTicks;
