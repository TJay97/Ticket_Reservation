/*Mongoose is an Object Data Modeling library for MongoDB and Node.js*/
/*Bcrypt is a secured way to store passwords.*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

/*Setting up the schema for the User details to be saved in the db*/

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});

/*Using bcrypt for password encryption and storing in db for more security*/

userSchema.methods.encryptPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);  
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);  
};

module.exports = mongoose.model('User', userSchema);