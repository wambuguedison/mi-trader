import * as tf from "@tensorflow/tfjs-node";

export const getSnDs = (candles: any[]) => {
	// Preprocess the data
	const data = candles.map((candle) => [
		candle.open,
		candle.high,
		candle.low,
		candle.close,
	]);

	const labels = candles.map((candle, index) => {
		if (index === 0 || index === candles.length - 1) return 0;
		const prevCandle = candles[index - 1];
		const nextCandle = candles[index + 1];
		if (candle.high > prevCandle.high && candle.high > nextCandle.high)
			return 1; // Supply zone
		if (candle.low < prevCandle.low && candle.low < nextCandle.low) return -1; // Demand zone
		return 0;
	});

	// Convert data to tensors
	const xs = tf.tensor2d(data);
	const ys = tf.tensor1d(labels, "int32");

	// Build the model
	const model = tf.sequential();
	model.add(
		tf.layers.dense({ units: 64, activation: "relu", inputShape: [4] })
	);
	model.add(tf.layers.dense({ units: 32, activation: "relu" }));
	model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

	model.compile({
		optimizer: tf.train.adam(),
		loss: "sparseCategoricalCrossentropy",
		metrics: ["accuracy"],
	});

	// Train the model
	async function trainModel() {
		await model.fit(xs, ys, {
			epochs: 50,
			batchSize: 4,
			validationSplit: 0.2,
			callbacks: tf.callbacks.earlyStopping({ monitor: "val_loss" }),
		});
		console.log("Model trained");
	}

	// Make predictions
	async function predict() {
		const predictions = model.predict(xs) as tf.Tensor;
		predictions.print();
	}

	// Execute training and prediction
	trainModel().then(() => {
		predict();
	});
};

// @tensorflow/tfjs
