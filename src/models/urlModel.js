const mongoose = require('mongoose')

const urlSchema = mongoose.Schema({
    
    urlCode: { type : String , unique:true , required:true, trim:true }, 

    longUrl: {type:String , required:true }, 
    
    shortUrl: {type :String , required:true, unique:true} 
})

module.exports = mongoose.model('UrlShortner',urlSchema)