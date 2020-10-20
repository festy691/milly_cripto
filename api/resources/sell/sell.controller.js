const url = require("url");
const path = require("path");
const cloudinary = require('./cloudinary');
const fs = require('fs');
var resizeImage = require('resize-image');

const SellModel = require("./sell.model");

module.exports =  {
    async createSale(req,res){
        try {
            var sell = new SellModel();

            var data = req.body;

            if (req.file){
                sell.image = await uploadImage(req.file);
            }

            if (!req.file || !data.user)
                return res.status(400).send("image and user is required");
            
            sell.user = data.user;

            sell.save((err, docs)=>{
                if (!err){
                    res.status(200).send("Submitted, awaiting confirmation");
                }
                else{
                    res.status(400).send("An error occured while trying to submit payment");
                }
            });
        } catch (err) {
            res.status(400).send(err);
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
            SellModel.findOne(({_id : req.params.id}),(err, doc)=>{
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
            SellModel.find((err, docs)=>{
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

    async getAllMine(req,res){
        try {
            SellModel.find(({user:req.params.id}),(err, docs)=>{
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
        SellModel.findOne(({_id: req.params.id}),(err, doc)=>{
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