const url = require("url");
const path = require("path");
const cloudinary = require('./cloudinary');
const fs = require('fs');
var resizeImage = require('resize-image');

const AirtimeModel = require("./airtime.model");

module.exports =  {
    async buyAirtime(req,res){
        try {
            var sell = new AirtimeModel();

            var data = req.body;
            var image = null;

            if (req.file){
                image = await uploadImage(req.file);
            }
            else {
                return res.status(400).send("image is required");
            }

            if(!image)
                return res.status(400).send("Please send wallet image");

            if (!req.file || !data.user || !data.phonenumber || !data.amount || !data.name)
                return res.status(400).send("All fields are required");
            
            sell.user = data.user;
            sell.phonenumber = data.phonenumber;
            sell.amount = data.amount;
            sell.image = image;
            sell.name = data.name;

            await sell.save((err, docs)=>{
                if (!err){
                    res.status(200).send("Payment received, we are checking authenticity of your wallet");
                }
                else{
                    res.status(400).send("Validation error "+err);
                }
            });
        } catch (err) {
            res.status(400).send(err);
        }
    },

    async updateSale(req,res){
        try {
            
            var data = req.body;

            AirtimeModel.findOne({_id : req.params.id},(err, doc)=>{
                if(!err){ 
                    
                    if (!doc) 
                    return res.status(404).send("not found");

                    async function updateThis() {
                        
                        if (data.status){
                            doc.status = data.status;
                        }else{
                            return res.status(400).send("Nothing to update");
                        }

                        doc.save((err, docs)=>{
                            if (!err){
                                res.status(200).send(`Added to ${data.status} list`);
                            }
                            else{
                                res.status(400).send("An error occured while trying to update item in database");
                            }
                        });
                    }
                    updateThis();
                }
                else{
                    res.status(400).send("An error occured while locating item");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getOneSale(req,res){
        try {
            AirtimeModel.findOne(({_id : req.params.id}),(err, doc)=>{
                if(!err){
                    if (!doc) 
                    return res.status(404).send("not found");
                    res.status(200).send(doc);
                }
                else{
                    res.status(400).send("An error has occured "+err);
                }
            }).populate('user', '_id firstname lastname accountname accountnumber bankname phonenumber email');
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getAllSales(req,res){
        try {
            
            const {page,perPage} = req.query;
            const options = {
                page: parseInt(page,10) || 1,
                limit: parseInt(perPage,10) || 10,
                populate: {
                    path: 'user',
                    select: '_id firstname referer lastname accountname accountnumber bankname phonenumber email date'
                },
                sort: {date: -1}
            }
            AirtimeModel.paginate({},options,(err, docs)=>{
                if(!err){
                    return res.status(200).send(docs);
                }
                else{
                    return res.status(400).send("Validation error "+err);
                }
            });
        } catch (err) {
            return res.status(400).send("Something went wrong");
        }
    },

    async getsalesStatus(req,res){
        try {

            const {page,perPage} = req.query;
            const options = {
                page: parseInt(page,10) || 1,
                limit: parseInt(perPage,10) || 10,
                populate: {
                    path: 'user',
                    select: '_id firstname referer lastname accountname accountnumber bankname phonenumber email date'
                },
                sort: {date: -1}
            }
            const {status} = req.params;

            AirtimeModel.paginate({status : status},options,(err, docs)=>{
                if(!err){
                    return res.status(200).send(docs);
                }
                else{
                    return res.status(400).send("Validation error "+err);
                }
            });
        } catch (err) {
            return res.status(400).send("Unknown error: "+err);
        }
    },

    async getAllMine(req,res){
        try {
            AirtimeModel.find(({user:req.params.id}),null,{sort: {date: -1}},(err, docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send("An error occured "+err);
                }
            }).populate('user', '_id firstname lastname accountname accountnumber bankname phonenumber email');
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async deleteSale(req,res){
      try {
        AirtimeModel.findOne(({_id: req.params.id}),(err, doc)=>{
            if(!err){
                if (!doc) 
                return res.status(404).send("not found");
                
                doc.remove((err, docs)=>{
                    if (!err){
                        if (doc.image) destroy(nameFromUri(doc.image)).catch((result)=>{
                            console.log(result);
                        });
                        res.status(200).send("Item deleted");
                    }
                    else{
                        res.status(400).send("An error occured while trying to delete item");
                    }
                });
            }
            else{
                res.status(400).send("An error occured while locating item");
            }
        });
      } catch (err) {
        res.status(400).send("Something went wrong");
      }  
    }
}

function nameFromUri(myurl){
    var parsed = url.parse(myurl);
    var image = path.basename(parsed.pathname);
    return "airtime/"+path.parse(image).name
}

async function destroy(file) {
    await cloudinary.delete(file);
}

async function uploadImage(file){
    const uploader = async (path) => await cloudinary.uploads(path, 'airtime');

    // if(process.env.NODE_ENV === 'development'){
    //     const { path } = file;
    //     return __dirname+'/'+path;
    // }

    const { path } = file;
    const newPath = await uploader(path);
    //console.log(newPath);
    const imageUrl = await newPath.url;
    //url.push(newPath);
    fs.unlinkSync(path);

    return imageUrl;
}