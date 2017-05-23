var mongoose=require("mongoose");
var Schema = mongoose.Schema;

var supervisorDataSchema = new Schema({
id:{
    type:Number,
    required:[true,'No id parameter found in the data sent']
},
firstName: String,
lastName: String,
businessUnit: String,
image: String,
role: String,
unit: String,
email: String
});

var adminDataSchema = new Schema({
id:{
    type:Number,
    required:[true,'No id parameter found in the data sent']
},
firstName: String,
lastName: String,
businessUnit: String,
image: String,
role: String,
unit: String,
email: String
});

var superviseeDataSchema = new Schema({
id: Number,
firstName: String,
lastName: String,
businessUnit: String,
image: String,
role: String,
unit: String,
supervisor: Number,
email: String
});

var loginDataSchema = new Schema({
userName: String,
password: String,
id: Number,
sessionId:String,
admin: Boolean
});

var selectTable = function(table)
{
    if(table==="supervisee")
    {
        return mongoose.model('supervisees',superviseeDataSchema);
    }
    else if(table==="supervisor")
    {
        return mongoose.model('supervisors',supervisorDataSchema);
    }
    else if(table==="login")
    {
        return mongoose.model('logins',loginDataSchema);
    }
    else if(table==="admin")
    {
        return mongoose.model('admins',adminDataSchema);
    }
}

var model={};

model.getData = function(table, callback, limit){
    selectTable(table).find(callback).limit(limit);
}

model.getDataByAttribute = function(table, attribute, callback){
    selectTable(table).find(attribute, callback);
}

model.getDataById = function(table, id, callback){
    var query = {id: id};
    selectTable(table).find(query, callback);
} 


model.addData = function(table, data, callback){
    selectTable(table).create(data, callback);
}

model.updateData = function(table, data, options, callback){
    console.log(data)
    var query = {id: data.id};
  
    selectTable(table).findOneAndUpdate(query, data, {new: true}, callback);
   
}

model.deleteData = function(table, id, callback){
    var query = {id: id};
    selectTable(table).remove(query, callback);
}

model.generateSessionId=function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports=model;