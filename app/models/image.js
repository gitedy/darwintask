var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var imgsch   = new Schema({
	name: String,
	path:Array
});

module.exports = mongoose.model('image', imgsch);