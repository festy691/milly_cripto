const mongoose = require('mongoose');

var AirtimeSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
        required : true
    },
    image : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    phonenumber : {
        type : String,
        required : true
    },
    status : {
        type : String,
        default : 'pending',
        enum: ['pending','processing','completed','rejected']
    },
    date : {
        type : Date,
        default : Date.now()
    },
});

module.exports = mongoose.model("Airtimes", AirtimeSchema);