const url = require("url");
const path = require("path");
const cloudinary = require('./cloudinary');
const fs = require('fs');
const bcriptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

const UserModel = require("./user.model");

module.exports = {
    async createUser(req,res){
        try {
            var data = req.body;

            if(data.password.length < 6)
                return res.status(400).send('Password length too short');


            if(!data.firstname || !data.lastname || !data.email || !data.password)
                return res.status(400).send('All fields are required');

            await UserModel.findOne(({email:data.email.toLowerCase()}),(err,doc)=>{
                if (err) return//

                if(doc) return res.status(400).send('Email already exists');

                else {
                    async function  sendEmail() {
                          
                        const firstName = data.firstname;
                        const lastName = data.lastname;
                        const email = data.email.toLowerCase();
                        const phonenumber = data.phonenumber;
                        const password = data.password;
                        const verificationId = makeid(6);

                        var user = new UserModel();
                        user.firstname = firstName;
                        user.lastname = lastName;
                        user.email = email;
                        user.phonenumber = phonenumber;
                        user.verificationExpire = Date.now() + 10 * 60 * 1000;
                        user.verificationCode = verificationId;

                        if(data.referer) user.referer = data.referer;
    
                        //HASHING THE password with bcryptjs
                        const salt = await bcriptjs.genSalt(10);
                        const hashedPassword = await bcriptjs.hash(password,salt);
                        user.password = hashedPassword;

                        var task = false;
        
                        await user.save((err, docs)=>{
                            if (err){
                                return res.status(400).send("Could not create account, try again");
                            }
                        });
                         
                        const message = `<H2>Milly Crypto</H2>
                        <br><h3>Dear ${firstName}</h3><br>
                        <br>You have requested to create a new account, we verify emails to prevent spamming our server
                        <br><br><center>Your activation code is <b><h2>${verificationId}</h2></b></center>`;

                        try {
                            await emailPassword({
                                email: email,
                                subject: 'Create Account',
                                message
                            });

                            return res.status(200).send("A verification mail has been sent to you via the provided email");
                        } catch (error) {

                            return res.status(400).send("Email could not be sent");
                        }
                    }
                    sendEmail();
                }

            });

        } catch (err) {
            res.status(400).send('Something went wrong');
        }
    },
    
    async updateUser(req,res){
        try {
            await UserModel.findOne(({_id:req.params.id}),(err,doc)=>{
                if (!err){
                    if(!doc)
                        return res.status(404).send('User not found');

                    else {
                        var data = req.body;
                        var image = null;

                        if(!data.firstname && !data.lastname && !data.phonenumber && !data.bankname && !data.accountname && !data.accountnumber && !data.walletbalance && !data.passwords && !data.level && !req.file)
                            return res.status(400).send('Nothing to update');
    
                        async function updateThisData(){
                            if (req.file){
                                if (req.file) {
                                    var result = await uploadImage(req.file);
                                    if(result != false) image = result;
                                    else return res.status(400).send('Error uploading image');
                                }
                            }
        
                            if (data.firstname){
                                doc.firstname = data.firstname;
                            }
                            
                            if (data.lastname){
                                doc.lastname = data.lastname;
                            }
                            
                            if (data.phonenumber){
                                doc.phonenumber = data.phonenumber;
                            }
                            
                            if (data.bankname){
                                doc.bankname = data.bankname;
                            }
                            
                            if (data.accountnumber){
                                doc.accountnumber = data.accountnumber;
                            }
                            
                            if (data.accountname){
                                doc.accountname = data.accountname;
                            }
                            
                            if (data.walletbalance){
                                doc.walletbalance = data.walletbalance;
                            }
                            
                            if (image){
                                doc.image = image;
                            }
    
                            await doc.save(({_id:req.params.id}),(err, docs)=>{
                                if (!err){
                                    res.status(200).send("user updated");
                                }
                                else{
                                    res.status(400).send('Error updating user'+err);
                                }
                            });
                        }
                        updateThisData();
                    }
                    
                }
            });
        } catch (err) {
            res.status(400).send('Something went wrong');
        }
    },
    
    async addMoney(req,res){
        try {
            await UserModel.findOne(({_id:req.params.id}),(err,doc)=>{
                if (!err){
                    if(!doc)
                        return res.status(404).send('User not found');

                    else {
                        var data = req.body;

                        if(!data.amount)
                            return res.status(400).send('Please add amount to add');
    
                        async function updateThisData(){
                            
                            if (data.amount){
                                doc.walletbalance = doc.walletbalance + data.amount;
                            }
    
                            await doc.save(({_id:req.params.id}),(err, docs)=>{
                                if (!err){
                                    res.status(200).send("User credicted");
                                }
                                else{
                                    res.status(400).send('Validation error, user not credicted');
                                }
                            });
                        }
                        updateThisData();
                    }
                    
                }
            });
        } catch (err) {
            res.status(400).send('An error occured');
        }
    },
    
    async cashout(req,res){
        try {
            await UserModel.findOne(({_id:req.params.id}),(err,doc)=>{
                if (!err){
                    if(!doc)
                        return res.status(404).send('User not found');

                    else {
    
                        async function updateThisData(){
                            
                            doc.walletbalance = 0.0;
    
                            await doc.save(({_id:req.params.id}),(err, docs)=>{
                                if (!err){
                                    res.status(200).send("User cashed out");
                                }
                                else{
                                    res.status(400).send('Validation error, user not cashed out');
                                }
                            });
                        }
                        updateThisData();
                    }
                    
                }
            });
        } catch (err) {
            res.status(400).send('An error occured');
        }
    },

    async getSingleUser(req,res){
        try {
            await UserModel.findOne(({_id:req.params.id}),(err,doc)=>{
                if(!err){
                    if(!doc)
                        return res.status(404).send('User not found');

                    res.status(200).send(doc);
                }
                else{
                    res.status(400).send('User not found');
                }
            });
        } catch (err) {
            res.status(400).send('An error has occured');
        }
    },
    
    async getAllUsers(req,res){
        try {
            await UserModel.find((err,docs)=>{
                if(!err){
                    res.status(200).send(docs);
                }
                else{
                    res.status(400).send('An error has occured');
                }
            }).populate('user', '_id firstname lastname accountname accountnumber bankname phonenumber email');
        } catch (err) {
            res.status(400).send('An error has occured');
        }
    },
    
    async deleteUser(req,res){
        try {
            await UserModel.findOne(({_id:req.params.id}),(err,doc)=>{
                if(!err){
                    // if(!doc)
                    //     return res.status(404).send({"error":`User not found`});
    
                    try {
                        doc.remove((err, docs)=>{
                            if (!err){
                                if (doc.image){
                                    destroy(nameFromUri(doc.image)).catch((result)=>{
                                        console.log(result);
                                    });
                                }
                                
                                return res.status(200).send('User deleted');
                            }
                            else{
                                return res.status(400).send('Could not delete user');
                            }
                        });
                    } catch (err) {
                        return res.status(400).send('Could not delete user');
                    }
                }
                else{
                    return res.status(400).send('An error has occured');
                }
                
            });
        } catch (err) {
            return res.status(400).send('An error has occured');
        }
    },
    
    async loginUser(req,res){
        try {
            var data = req.body;
           
            const email = data.email.toLowerCase();
            if(!email || !data.password)
            return res.status(400).send('Email and password is required');

            await UserModel.findOne(({email:email}),(err,doc)=>{
                if(!err){
                    if(!doc)
                        return res.status(400).send(`User does not exist`);

                    async function logIn(){
                        const password = await bcriptjs.compare(data.password,doc.password);

                        if (!password) return res.status(400).send(`Email or Password incorrect`);

                        if(!doc.verified) return res.status(400).send('Your Account has not been verified, verify to login');

                        // res.header('auth-token', token).send(token);
                        sendTokenResponse(doc,200,res);
                    }
                    logIn();
                }
                else{
                    return res.status(400).send('An error has occured');
                }
            });

        } catch (err) {
            return res.status(400).send('An error has occured');
        }
    },
    
    async updatePassword(req,res){
        try {
            var data = req.body;
            const id = req.params.id;
            if(!data.newPassword || !data.oldPassword)
            return res.status(400).send('Email and password is required');

            UserModel.findOne(({_id:id}),(err,doc)=>{
                if(!err){
                    if(!doc)
                        return res.status(400).send(`User does not exist`);

                    async function update(){
                        const password = await bcriptjs.compare(data.oldPassword,doc.password);

                        if (!password) return res.status(400).send(`The old password is incorrect`);

                        const salt = await bcriptjs.genSalt(10);
                        const hashedPassword = await bcriptjs.hash(data.newPassword,salt);
                        doc.password = hashedPassword;
                        await doc.save(({_id:req.params.id}),(err, docs)=>{
                            if (!err){
                                res.status(200).send("Password updated");
                            }
                            else{
                                res.status(400).send('Error updating Passwoed');
                            }
                        });
                    }
                    update();
                }
                else{
                    return res.status(400).send('An error has occured'+err);
                }
            });

        } catch (err) {
            return res.status(400).send('An error has occured'+err);
        }
    },
    
    async logoutUser(req,res,next){
        res.cookie('token', 'none', {
            expiresIn: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
    
        res.status(200).send("Logout Success");
    },
    
    async forgotPassword(req,res){
        
        try {
            const user = await UserModel.findOne({email:req.body.email.toLowerCase()});

            if(!user){
                return res.status(404).send('User not found');
            }

            const resetToken = makeid(6);

            const firstname = user.firstname;
            user.resetPasswordToken = resetToken;
            user.resetPassordExpire = Date.now() + 10 * 60 * 1000;

            user.save({validateBeforeSave: false});
             
            const message = `<H2>Milly Crypto</H2>
                            <br><h3>Dear ${firstname}</h3><br>
                            <br>You have requested to reset your password, we verify emails to prevent spamming our server. If you did not request this please igore this message.
                            <br><br><center>Your reset code is <b><h2>${resetToken}</h2></b></center>`;

             try {
                 await emailPassword({
                     email: user.email,
                     subject: 'Password Reset',
                     message
                 });

                 return res.status(200).send("Email sent");
             } catch (error) {
                 user.resetPasswordToken = undefined;
                 user.resetPassordExpire = undefined;

                 user.save({validateBeforeSave: false});

                 return res.status(400).send("Email could not be sent");
             }

        } catch (err) {
            res.status(400).send("Something went wrong");
        }
    },
    
    async getMe(req,res,next){
        const user = await UserModel.findById(req.user.id);
    
        res.status(200).send(user);
    },
    
    async getVerificationMail(req,res){
        try {
            
            var user =  await UserModel.findOne({email:req.body.email});

            if(!user) return res.status(400).send('No account exist with provided email');

            const firstname = user.firstname;
            const verificationId = makeid(6);
            user.verificationCode = verificationId;
            user.verificationExpire = Date.now() + 10 * 60 * 1000;
            
            await user.save({validateBeforeSave: false});

            const message = `<H2>Milly Crypto</H2>
                            <br><h3>Dear ${firstname}</h3><br>
                            <br>You have requested to create a new account, we verify emails to prevent spamming our server
                            <br><br><center>Your activation code is <b><h2>${verificationId}</h2></b></center>`;

            try {
                await emailPassword({
                    email: req.body.email,
                    subject: 'Verify Email',
                    message
                });

                return res.status(200).send("A verification mail has been sent to you via the provided email");
            } catch (error) {

                return res.status(400).send("Email could not be sent");
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    },
    
    async resetPassword(req,res){
        try {
            const user = await UserModel.findOne({
                email:req.body.email,
                resetPasswordToken:req.body.resetPasswordToken,
                resetPassordExpire: { $gt: Date.now() }
            });
    
            if (!user){
                return res.status(400).send('Expired or Invaild link');
            }
    
            //HASHING THE password with bcryptjs
            const salt = await bcriptjs.genSalt(10);
            const hashedPassword = await bcriptjs.hash('default123',salt);
    
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPassordExpire = undefined;
            
            await user.save(({_id:user._id}),(err,doc)=>{
                if(err) return res.status(400).send('An error occured, could not complete password reset');
    
                res.status(200).send("password reset complete, new password is default123, login and change your password");
            });
        } catch (error) {
            return res.status(400).send(`An error has halted the operation`);
        }
    },

    async verifyUserToken(req,res){
        try {
            const user = await UserModel.findOne({email:req.body.email,verificationCode:req.body.verificationCode,verificationExpire: { $gt: Date.now() }});
            if (!user) {
                return res.status(404).send(`Invalid or expired activation link`);
            }
            
            user.verified = true;
            
            console.log(user);
            await user.save({validateBeforeSave: false});
            
            sendTokenResponse(user,200,res);
            
        } catch (err) {
            return res.status(400).send(`An error has halted the operation`+err);
        }
    },

    async getIdFromToken(req,res){
        try {
            const token = req.params.id;
            if(token){
                jwt.verify(token, process.env.AUTH_TOKEN_SECRET,function(err,decodedToken){
                    if (err){
                        return res.status(400).send({"error":err});
                    }
                       async function getId(params) {
                            const id = await decodedToken._id;

                            return res.status(200).send(id);
                        }
                        getId();
                });
            }
            else {
                console.log(token)
                return res.status(400).send({"error":"null token"});
            }

        } catch (err) {
            res.status(400).send({"error":`${err}`});
        }
    }
    
}

function nameFromUri(myurl){
    var parsed = url.parse(myurl);
    var image = path.basename(parsed.pathname);
    return "users/"+path.parse(image).name
}

async function destroy(file) {
    await cloudinary.delete(file);
}

async function uploadImage(file){
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'users');

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
    } catch (error) {
        console.log(error);
        return false;
    }
}

const sendTokenResponse = (user,status,res)=>{
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() * 30 * 60 * 60 * 24 * 1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(status).cookie('token',token,options).send({token});
};

const emailPassword = async (options) => {
    let transporter = nodemailer.createTransport({
        host: `${process.env.EMAIL_HOST}`,
        port: `${process.env.EMAIL_PORT}`,
        secure: true, // true for 465, false for other ports
        auth: {
        user: `${process.env.EMAIL_USER}`, // generated ethereal user
        pass: `${process.env.EMAIL_PASSWORD}`, // generated ethereal password
        },
        tls:{
            rejectUnauthorized :false
        }
    });
    
    // send mail with defined transport object
    const message = {
        from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`, // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        html: options.message
        
        //${token}
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);

};

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }