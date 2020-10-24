const url = require("url");
const path = require("path");
const fs = require('fs');
const cloudinary = require('./cloudinary');

const CryptoModel = require("./cryptocurrency.model");

module.exports =  {
    async createCrypto(req,res){
        try {
            var cryptocurrency = new CryptoModel();

            var data = req.body;

            if (req.file){
                cryptocurrency.image = await uploadImage(req.file);
            }

            if (!data.name || !data.priceDollar || !data.priceNaira || !data.walletAddress || !req.file)
                return res.status(400).send("cryptocurrency type, price in dollar, price in naira, wallet address and image are required");
            
            cryptocurrency.name = data.name;
            cryptocurrency.priceDollar = data.priceDollar;
            cryptocurrency.priceNaira = data.priceNaira;
            cryptocurrency.walletAddress = data.walletAddress;

            cryptocurrency.save((err, docs)=>{
                if (!err){
                    res.status(200).send("Cryptocurrency created");
                }
                else{
                    res.status(400).send("An error occured while trying to create Cryptocurrency");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async updateCrypto(req,res){
        try {
            
            var data = req.body;

            var cryptocurrency = await CryptoModel.findById(req.params.id);
            if (!cryptocurrency) 
                return res.status(404).send("cryptocurrency not found");

            if (!data.name && !data.priceDollar && !data.priceNaira &&!data.walletAddress) 
                return res.status(404).send("Nothing to update");

            if (data.name){
                cryptocurrency.name = data.name;
            }
            if (data.priceDollar){
                cryptocurrency.priceDollar = data.priceDollar;
            }
            if (data.priceNaira){
                cryptocurrency.priceNaira = data.priceNaira;
            }
            if(data.walletAddress){
                cryptocurrency.walletAddress = data.walletAddress;
            }

            cryptocurrency.save((err, docs)=>{
                if (!err){
                    res.status(200).send(`cryptocurrency updated`);
                }
                else{
                    res.status(400).send("An error occured while trying to update cryptocurrency in database");
                }
            });

        } catch (err) {
            res.status(400).send("Something went wrong"+err);
        }
    },

    async getOneCrypto(req,res){
        try {
            CryptoModel.findOne(({_id : req.params.id}),(err, doc)=>{
                if(!err){
                    if (!doc) 
                    return res.status(404).send("Cryptocurrency not found");

                    res.status(200).send(doc);
                }
                else{
                    res.status(400).send("Error, while finding cryptocurrency");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getAllCrypto(req,res){
        try {
            CryptoModel.find((err, docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send("An error occured while loading all cryptocurrency");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async deleteCrypto(req,res){
      try {
        ClassModel.findOne(({_id: req.params.id}),(err, doc)=>{
            if(!err){
                if (!doc) 
                return res.status(404).send("cryptocurrency not found");
                
                doc.remove((err, docs)=>{
                    if (!err){
                        if (doc.image) destroy(nameFromUri(doc.image)).catch((result)=>{
                            console.log(result);
                        });
                        res.status(200).send("Giftcard deleted");
                    }
                    else{
                        res.status(400).send("An error occured while trying to delete cryptocurrency");
                    }
                });
            }
            else{
                res.status(400).send("An error occured while locating cryptocurrency");
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
    return "crpto/"+path.parse(image).name
}

async function destroy(file) {
    await cloudinary.delete(file);
}

async function uploadImage(file){
    const uploader = async (path) => await cloudinary.uploads(path, 'crpto');
    const { path } = file;
    const newPath = await uploader(path);
    const imageUrl = await newPath.url;
    fs.unlinkSync(path);

    return imageUrl;
}