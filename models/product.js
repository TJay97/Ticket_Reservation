/*Mongoose is an Object Data Modeling library for MongoDB and Node.js*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*Setting up the schema for the ticket details to be saved in the db*/

var schema = new Schema({
    imagePath: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);