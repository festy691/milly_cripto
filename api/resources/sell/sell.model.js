const mongoose = require('mongoose');
const mongosePaginate = require('mongoose-paginate');

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

SaleSchema.plugin(mongosePaginate);
module.exports = mongoose.model("Sales", SaleSchema);