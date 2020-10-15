const mongoose = require('mongoose');

var GiftcardSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class',
        required : true
    },
    price : {
        type : Number,
        required : true
    },
});

module.exports = mongoose.model("Giftcards", GiftcardSchema);