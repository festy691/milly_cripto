const url = require("url");
const path = require("path");
const fs = require('fs');

const GiftcardModel = require("./giftcard.model");

module.exports =  {
    async createGiftcard(req,res){
        try {
            var giftcard = new GiftcardModel();

            var data = req.body;

            if (!data.class || !data.name || !data.price)
                return res.status(400).send("giftcard type, price and name are required");
            
            giftcard.name = data.name;
            giftcard.class = data.class;
            giftcard.price = data.price;

            giftcard.save((err, docs)=>{
                if (!err){
                    res.status(200).send("Giftcard created");
                }
                else{
                    res.status(400).send("An error occured while trying to create Giftcard");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async updateGiftcard(req,res){
        try {
            
            var data = req.body;

            var giftcard = await GiftcardModel.findById(req.params.id);
            if (!giftcard) 
                return res.status(404).send("giftcard not found");

            if (!data.name && !data.price) 
                return res.status(404).send("Nothing to update");

            if (data.name){
                giftcard.name = data.name;
            }
            if (data.price){
                giftcard.price = data.price;
            }

            await giftcard.save((err, docs)=>{
                if (!err){
                    res.status(200).send(`giftcard updated`);
                }
                else{
                    res.status(400).send("An error occured while trying to update giftcard in database");
                }
            });

        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getOneGiftcard(req,res){
        try {
            GiftcardModel.findOne(({_id : req.params.id}),(err, doc)=>{
                if(!err){
                    if (!doc) 
                    return res.status(404).send("Giftcard not found");

                    res.status(200).send(doc);
                }
                else{
                    res.status(400).send("Error, while finding giftcard");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getAllGiftcard(req,res){
        try {
            GiftcardModel.find((err, docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send("An error occured while loading all giftcards");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async getCatGiftcard(req,res){
        try {
            GiftcardModel.find({class:req.params.id},(err, docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send("An error occured while loading all giftcards");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },

    async deleteGiftcard(req,res){
      try {
        ClassModel.findOne(({_id: req.params.id}),(err, doc)=>{
            if(!err){
                if (!doc) 
                return res.status(404).send("giftcard not found");
                
                doc.remove((err, docs)=>{
                    if (!err){
                        res.status(200).send("Giftcard deleted");
                    }
                    else{
                        res.status(400).send("An error occured while trying to delete giftcard");
                    }
                });
            }
            else{
                res.status(400).send("An error occured while locating giftcard");
            }
        });
      } catch (err) {
        res.status(400).send("Something went wrong");
      }  
    }
}