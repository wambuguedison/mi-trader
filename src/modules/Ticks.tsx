// import DerivAPIBasic from "@deriv/deriv-api";
// "https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic";

import * as React from "react";

import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic.js";
import Button from "antd/es/button";
import Flex from "antd/es/flex";

const Ticks: React.FC = () => {
	const conn = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
	const api2 = new DerivAPIBasic({ connection: conn });

	api2.ping().then(console.log);

	const app_id = 1089; // Replace with your app_id or leave as 1089 for testing.
	const connection = new WebSocket(
		`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`
	);
	const api = new DerivAPIBasic({ connection });

	const tickStream = () => api.subscribe({ ticks: "R_100" });

	const tickResponse = async (res) => {
		const data = JSON.parse(res.data);
		if (data.error !== undefined) {
			console.log("Error : ", data.error.message);
			connection.removeEventListener("message", tickResponse, false);
			await api.disconnect();
		}
		if (data.msg_type === "tick") {
			console.log(data.tick);
		}
	};

	const subscribeTicks = async () => {
		await tickStream();
		connection.addEventListener("message", tickResponse);
	};

	const unsubscribeTicks = () => {
		connection.removeEventListener("message", tickResponse, false);
		tickStream().unsubscribe();
	};

	return (
		<>
			<Flex vertical={false} gap="middle">
				<Button type="primary" onClick={subscribeTicks}>
					Start
				</Button>
				<Button type="primary" onClick={unsubscribeTicks}>
					Stop
				</Button>
			</Flex>
		</>
	);
};

export default Ticks;
