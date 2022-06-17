//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://addyAditya:addyaditya@cluster0.pnwhnuo.mongodb.net/todolistDB",{useNewUrlParser:true});

const app = express();

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const task1 = new Item({
  name:"Buy Food"
});
const task2 = new Item({
  name:"Cook Food"
});
const task3 = new Item({
  name:"Eat Food"
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const defaultItems = [task1,task2,task3];

const listSchema = {
  name: String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find((err,taskItems)=>{
  if(taskItems.length===0){
    Item.insertMany(defaultItems,(err)=>{
      if(err)
      console.log(err);
      else {
      console.log("SuccessFully Inserted!");
      }
    });
    res.redirect("/");
  }else
       res.render("list", {listTitle: "Today", newListItems: taskItems});

  });

});

app.get("/:customListName",(req,res)=>{
  const customListName = req.params.customListName ;

   List.findOne({name:customListName},(err,foundItem)=>{
    if(!err){
      if(!foundItem){
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
      else
       res.render("list",{listTitle:foundItem.name,newListItems:foundItem.items});
    }
  })
});

app.post("/", function(req, res){

  const Todoitem = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:Todoitem
  });
  if(listName=="Today"){
  newItem.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});


app.post("/delete",(req,res)=>{
  const checkedItemID  = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemID,(err)=>{
      if(err)
      console.log(err);
      else{
      console.log("Deleted SuccessFully");
      res.redirect("/");
    }
    });
  }  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},(err,foundList)=>{
      if(!err)
        res.redirect("/"+listName);
       });
    }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
