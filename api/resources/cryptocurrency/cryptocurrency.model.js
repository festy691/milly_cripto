const mongoose = require('mongoose');

var CryptoSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    priceDollar : {
        type : Number,
        required : true
    },
    priceNaira : {
        type : Number,
        required : true
    },
});

module.exports = mongoose.model("Cryptos", CryptoSchema);