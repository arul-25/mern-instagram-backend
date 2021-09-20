const mongoose = require("mongoose")

const instance = mongoose.Schema({
	caption: String,
	user: String,
	image: String,
	comments: []
})

module.exports = Post = mongoose.model("posts", instance)
