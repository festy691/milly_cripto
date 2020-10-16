const url = require("url");
const path = require("path");
const cloudinary = require('./cloudinary');
const fs = require('fs');

const ClassModel = require("./class.model");

module.exports =  {
    async createClass(req,res){
        try {
            var product = new ClassModel();

            var data = req.body;

            if (req.file){
                product.image = await uploadImage(req.file);
            }

            if (!req.file || !data.name)
                return res.status(400).send("class image and name is required");
            
            product.name = data.name;

            product.save((err, docs)=>{
                if (!err){
                    res.status(200).send("class created");
                }
                else{
                    res.status(400).send("An error occured while trying to create class"+err);
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },
    async updateClass(req,res){
        try {
            
            var data = req.body;

            ClassModel.findOne({_id : req.params.id},(err, doc)=>{
                if(!err){ 
                    
                    if (!doc) 
                    return res.status(404).send("not found");

                    async function updateThis() {
                        
                        if (req.file){
                            if (doc.image){
                                destroy(nameFromUri(doc.image)).catch((result)=>{
                                    console.log(result);
                                });
                            }
                            doc.image = await uploadImage(req.file);
                        }
                        
                        if (data.name){
                            doc.name = data.name;
                        }

                        doc.save((err, docs)=>{
                            if (!err){
                                res.status(200).send(`updated`);
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
    async getOneClass(req,res){
        try {
            ClassModel.findOne(({_id : req.params.id}),(err, doc)=>{
                if(!err){
                    if (!doc) 
                    return res.status(404).send("not found");
                    res.status(200).send(doc);
                }
                else{
                    res.status(400).send("An error has occured");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },
    async getAllclass(req,res){
        try {
            ClassModel.find((err, docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send("An error occured");
                }
            });
        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },
    async deleteClass(req,res){
      try {
        ClassModel.findOne(({_id: req.params.id}),(err, doc)=>{
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
    return "giftcard/"+path.parse(image).name
}

async function destroy(file) {
    await cloudinary.delete(file);
}

async function uploadImage(file){
    const uploader = async (path) => await cloudinary.uploads(path, 'giftcard');

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