const mongoose = require('mongoose');
//referencing using singleton in mongoose
const Store = mongoose.model('Store');
const User = mongoose.model('User');

const multer = require('multer');
//resizing image
const jimp = require('jimp');
//for creating unique image names
const uuid = require('uuid');
const multerOptions = {
  storage:multer.memoryStorage(),
  fileFilter(req,file,next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null,true);
    }
    else{
      next({message: 'That filetype is not allowed'},false);
    }
  }
};
//multer middleware
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req,res,next)=> {
  //check if there is no new file to resize
  if(!req.file)
  {
    next();
    return;
  }
  // console.log(req.file);
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800,jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();

};

exports.addStore = (req,res) => {
  res.render("editStore",{title:'Add a new Store'});
};

exports.createStore = async (req,res) => {
  req.body.author = req.user._id;
 const store = await (new Store(req.body)).save();
 req.flash('warning',`Successfull created store ${store.name}. Care to leave a review ?`);

 res.redirect(`/store/${store.slug}`);
};


exports.getStores = async (req,res) =>{
  const page = req.params.page || 1;
  const limit = 4;
  const skip = page * limit - limit;
  const storesPromise = Store
    .find()
    .skip(skip)
    .limit(limit)
    .sort({created:'desc'});
    const countPromise = Store.count();
    const [stores,count] = await Promise.all([storesPromise,countPromise]);
    const pages = Math.ceil(count/limit);
    if(!stores.length && skip){
    req.flash('info',`HEy u asked for ${page},But that doesnt exist`)
     res.redirect(`/stores/page/${pages}`);
     return;
    }
  // console.log(stores);
  res.render('stores',{title:'Gustoes',stores,count,pages,page})
};

const confirmOwner = (store,user)=>{
  if(!store.author.equals(user._id)){
    // req.flash('error','You are not authorized to do it');
    // res.redirect('back');
    throw Error('You are not authorized to do it');

  }
}

exports.editStore = async (req,res) =>{
  //1 find store with the given id
  const store = await Store.findById(req.params.id);
  confirmOwner(store,req.user);
  res.render('editStore',{title:`Edit ${store.name}`,store});
  //2 confirm user permission
  //3 render edit form

};
exports.updateStore = async (req,res) =>{
  //req.body.location.type = 'Point';
//1 find and update the store with id
const store = await Store.findOneAndUpdate({_id:req.params.id},req.body,
  //returns the new store instead of the old store
  {
    new:true,
    runValidators:true,
  }).exec();

  req.flash('success',`Successfull updated <strong>${store.name}. <a href="/store/${store.slug}">View Store </a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req,res) =>{
  const store = await Store.findOne({slug:req.params.slug}).populate('author');
  // res.json(store);
  if(!store)
  return next();
  res.render('store',{store,title:store.name});
};

exports.getStoresByTag = async (req,res) =>{
  const tagsPromise =  Store.getTagsList();
  const tagQuery = req.params.tag || { $exists:true };
  const storesPromise = Store.find({tags:tagQuery})
  const [tags,stores] = await Promise.all([tagsPromise,storesPromise]);
  res.render('tag',{tags,title:'Tags',stores});

}

exports.searchStores = async (req,res) =>{
  const stores = await Store.find({
    $text:{
      $search:req.query.q
    }
  },{
    score:{
      $meta:'textScore',
    }
  }).sort({
    score:{
      $meta:'textScore'
    }
  }).limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [ req.query.lng , req.query.lat ].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type:'Point',
          coordinates,
        },
        $maxDistance: 10000, // = 10km
      }
    }
  };

  const stores = await Store.find(q)
    // chain on the '.select' to specify which fields you want
    // use '-' to exclude
    .select('slug name description location photo')
    .limit(10)
  res.json(stores);
  }

  exports.mapPage = (req,res)=>{
    res.render('map',{title:'Map'});
  };


  exports.heartStore = async(req,res)=>{
    const hearts = req.user.hearts.map(obj=> obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull':'$addToSet';
  const user = await User.findByIdAndUpdate(req.user._id,
  {[operator]:{hearts:req.params.id}},
    {new:true}
  )
  res.json(user);
  };

  exports.getHearts = async(req,res)=>{
    const stores = await Store.find({
      _id:{$in:req.user.hearts}
    });
    //res.json(stores);
    res.render('stores',{title:'Hearted Stores',stores});
  }

  exports.getTopStores = async(req,res)=>{
    const stores = await Store.getTopStores();
    res.render('topStores',{title:`Top ${stores.length} stores`,stores});
  };