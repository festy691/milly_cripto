const mongoose = require('mongoose');

var SaleSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
        required : true
    },
    image : {
        type : String,
        required : true
    },
    giftcard : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Giftcards',
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

module.exports = mongoose.model("Sales", SaleSchema);