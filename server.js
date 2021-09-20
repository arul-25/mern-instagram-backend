const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dbModel = require("./dbModel")
const Pusher = require("pusher")

// App config
const app = express()
const port = process.env.PORT || 8001
require("dotenv").config()

const pusher = new Pusher({
	appId: "1269923",
	key: "461200c3f7ecabc30c02",
	secret: "09d1e9997889bfb0f725",
	cluster: "us2",
	useTLS: true
})

// middleware
app.use(express.json())
app.use(cors())

// DB config
mongoose.connect(process.env.MONGO_ATLAS)
mongoose.connection.once("open", () => {
	const changeStream = mongoose.connection.collection("posts").watch()
	changeStream.on("change", change => {
		if (change.operationType === "insert") {
			const postDetails = change.fullDocument
			pusher.trigger("posts", "inserted", {
				user: postDetails.user,
				caption: postDetails.caption,
				image: postDetails.image
			})
		}
	})
})

// API endpoints

app.get("/", (req, res) => {
	res.send("Hello World")
})

app.post("/upload", (req, res) => {
	const body = req.body

	dbModel.create(body, (err, data) => {
		if (err) return res.status(500).send(err)
		res.status(201).send(data)
	})
})

app.get("/sync", (req, res) => {
	dbModel.find((err, data) => {
		if (err) return res.status(500).send(err)
		res.status(200).send(data)
	})
})

app.listen(port, () => {
	console.log(`Server started on http://localhost:${port}`)
})
