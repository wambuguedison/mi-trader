import * as React from "react";
import Ticks from "./modules/Ticks";
import HistoricalTicks from "./modules/TicksGraph";
import ChartComponent from "./modules/SND";

const App: React.FC = () => {
	return (
		<>
			{/* <Ticks /> */}

			{/* <HistoricalTicks /> */}
			<ChartComponent />
		</>
	);
};

export default App;
