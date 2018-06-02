const passport = require('passport');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local',{
    failureRedirect:'/login',
    failureFlash:'Failed login',
    successFlash:'Welcome!',
    successRedirect:'/',
});

exports.logout = (req,res) =>{
    req.logout();
    req.flash('success','You successfully logged out!');
    res.redirect('/');
};

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
       return next();
    }
    req.flash('error','Please Login in order to do that');
    res.redirect('/login');
};

exports.forgot = async (req,res) =>{
    //1 see if a user with that email already exists
    const user = await User.findOne({email:req.body.email});
    if(!user)
    {
        req.flash('error','An email has been sent to that email account');
        return res.redirect('/login');
    }

    //2. Set a reset token and expiry on that account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;//1 hour from now to reset their account
    await user.save();
    //3. Email them the link to reset
    const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    //req.flash('success',`email reset link ONLY FOR DEVELOPMENT PURPOSE tho${resetUrl}`);
    await mail.send({
        user,
        subject:'Password reset',
        resetUrl,
        filename:'password-reset',
    })
    req.flash('success','A passport reset link has been send to you email')
    res.redirect('/login');
    //4. Redirecting the use who used that link
};
exports.reset = async (req,res) =>{
    //res.json(req.params.token);
    const user = await User.findOne({
        resetPasswordToken:req.params.token,
        resetPasswordExpires:{$gt:Date.now()}
    });
    if(!user){
        req.flash('error','Password reset token is invalid or has expired');
        return res.redirect('/login');
    }
    //if there is a user and token is valid render a template to change username and password
    res.render('reset',{title:'Reset your password'});
};

exports.confirmedPasswords = (req,res,next) =>{
    if(req.body.password === req.body['password-confirm'])
        return next();
    req.flash('error','Passwords do not match');
    res.redirect('back');

};

exports.updatePassword = async (req,res) =>{
    const user = await User.findOne({
        resetPasswordToken:req.params.token,
        resetPasswordExpires:{$gt:Date.now()}
    });
    if(!user){
        req.flash('error','Password reset token is invalid or has expired');
        return res.redirect('/login');
    }
    console.log(user);
    const setPassword = user.setPassword(req.body.password,async ()=>{
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        const updateUser = await user.save();
        await req.login(updateUser);
        req.flash('success','Password has been changed');
        res.redirect('/');
    });
    //not working
    // const setPassword = promisify(user.setPassword,user);
    // await setPassword(req.body.password);

};