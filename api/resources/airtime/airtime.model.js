const mongoose = require('mongoose');
const mongosePaginate = require('mongoose-paginate');

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
    name : {
        type : String,
        enum: ['Airtime','Data'],
        required: true
    },
    date : {
        type : Date,
        default : Date.now()
    },
});

AirtimeSchema.plugin(mongosePaginate);
module.exports = mongoose.model("Airtimes", AirtimeSchema);