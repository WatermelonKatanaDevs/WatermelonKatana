const connectDB = require("./Database/connect");
connectDB();

var Projects =  require("./Database/model/Projects");
var Posts =  require("./Database/model/Posts");
var Users =  require("./Database/model/Users");

(async function(){try{

  var ulist = await Users.find({ });
  for (var u of ulist) {
    // Check if the user has a default avatar and banner
    if (u.avatar == "https://fakeimg.pl/300x300") u.avatar = "https://watermelonkatana.com/images/default_pfp.png";
    if (u.banner == "https://fakeimg.pl/720x360") u.banner = "https://watermelonkatana.com/images/default_banner.png";


    //u.avatar = "https://fakeimg.pl/300x300";
    //u.banner = "https://fakeimg.pl/720x360";
    //u.biography = "This user has not added a biography yet.";
    //u.joinedAt = Date.now();
    //u.mature = false;
    console.log(u);
    await u.save();
  }
  
  //Projects.updateMany({ },{views:0,thumbnail:""}).then(console.log);

  //* Run when converting to ref
  
  var list = await Projects.find({ });
  for (var p of list) {
    //var u = await Users.findById(p[i].posterId);
    //p[i].poster = u;
    //delete p[i].posterId;
    delete p.iscdo;
    delete p.iskhan;
    delete p.isscratch;
    if (!p.activeAt) p.activeAt = p.postedAt;
    p.mature = false;
    p.hidden = false;
    p.privateRecipients = [];
    p.title = p.name;
    delete p.name;
    p.content = p.desc;
    delete p.desc;
    console.log(p);
    await p.save();
  }

  var list = await Posts.find({ });
  for (var p of list) {
    //var u = await Users.findById(p[i].posterId);
    //p[i].poster = u;
    //delete p[i].posterId;
    if (!p.activeAt) p.activeAt = p.postedAt;
    p.mature = false;
    p.hidden = false;
    p.privateRecipients = [];
    p.title = p.name;
    delete p.name;
    console.log(p);
    await p.save();
  }


  //*/

// Update all users who have a default avatar and banner to the new placeholders

  
console.log("Done!")}catch(e){console.log(e);}})();