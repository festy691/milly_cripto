const mongoose = require('mongoose');

var ClassSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    },
});

module.exports = mongoose.model("Class", ClassSchema);