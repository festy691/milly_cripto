const url = require("url");
const path = require("path");
const cloudinary = require('./cloudinary');
const fs = require('fs');
var resizeImage = require('resize-image');

const SellModel = require("./sell.model");

let globalVersion = 0;

module.exports =  {
    async createSale(req,res){
        try {
            var sell = new SellModel();

            var data = req.body;
            var image = null;

            if (req.file){
                image = await uploadImage(req.file);
            }
            else {
                return res.status(400).send("image is required");
            }

            if(!image)
                return res.status(400).send("image is null");

            if (!req.file || !data.user)
                return res.status(400).send("image and user is required");
            
            sell.user = data.user;
            sell.image = image;

            await sell.save((err, docs)=>{
                if (!err){
                    globalVersion = globalVersion + 1;
                    return res.status(200).send("Submitted, awaiting confirmation");
                }
                else{
                    return res.status(400).send(err);
                }
            });
        } catch (err) {
            return res.status(400).send(err);
        }
    },

    async updateSale(req,res){
        try {
            
            var data = req.body;

            SellModel.findOne({_id : req.params.id},(err, doc)=>{
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
                                return res.status(200).send(`Added to ${data.status} list`);
                            }
                            else{
                                return res.status(400).send("An error occured while trying to update item in database");
                            }
                        });
                    }
                    updateThis();
                }
                else{
                    return res.status(400).send("An error occured while locating item");
                }
            });
        } catch (err) {
            return res.status(400).send("Something went wrong");
        }
    },

    async getOneSale(req,res){
        try {
            SellModel.findOne(({_id : req.params.id}),(err, doc)=>{
                if(!err){
                    if (!doc) 
                    return res.status(404).send("not found");
                    return res.status(200).send(doc);
                }
                else{
                    return res.status(400).send("An error has occured "+err);
                }
            }).populate('user', '_id firstname referer lastname accountname accountnumber bankname phonenumber email date');
        } catch (err) {
            return res.status(400).send("Something went wrong");
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
            SellModel.paginate({},options,(err, docs)=>{
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

            SellModel.paginate({status : status},options,(err, docs)=>{
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
            SellModel.find(({user:req.params.id}),null,{sort: {date: -1}},(err, docs)=>{
                if(!err){
                    return res.status(200).send(docs);
                }
                else{
                    return res.status(400).send("An error occured "+err);
                }
            }).populate('user', '_id firstname lastname accountname accountnumber bankname phonenumber email');
        } catch (err) {
            return res.status(400).send("Something went wrong");
        }
    },

    async deleteSale(req,res){
      try {
        SellModel.findOne(({_id: req.params.id}),(err, doc)=>{
            if(!err){
                if (!doc) 
                return res.status(404).send("not found");
                
                doc.remove((err, docs)=>{
                    if (!err){
                        if (doc.image) destroy(nameFromUri(doc.image)).catch((result)=>{
                            console.log(result);
                        });
                        return res.status(200).send("Item deleted");
                    }
                    else{
                        return res.status(400).send("An error occured while trying to delete item");
                    }
                });
            }
            else{
                return res.status(400).send("An error occured while locating item");
            }
        });
      } catch (err) {
        return res.status(400).send("Something went wrong");
      }  
    },

    eventsHandler(req, res) {
        // Mandatory headers and http status to keep connection open
        let localVersion = 0;
        const headers = {
          'Content-Type': 'text/event-stream',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        // After client opens connection send all nests as string
        setInterval(function(){
            if (localVersion < globalVersion){
                const data = {data: 'New sales request'};
                res.write(data);
            }
        },1000);
    }
    
}

function nameFromUri(myurl){
    var parsed = url.parse(myurl);
    var image = path.basename(parsed.pathname);
    return "sales/"+path.parse(image).name
}

async function destroy(file) {
    await cloudinary.delete(file);
}

async function uploadImage(file){
    const uploader = async (path) => await cloudinary.uploads(path, 'sales');

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