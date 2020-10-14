/*Mongoose is an Object Data Modeling library for MongoDB and Node.js*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*Setting up the schema for the order details to be saved in the db*/

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String, required: true}
});

module.exports = mongoose.model('Order', schema);