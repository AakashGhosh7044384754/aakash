const urlModel = require('../models/urlModel')
const shortId = require('shortid')
const validUrl = require('valid-url');
const redis = require('redis')

const { promisify } = require("util");

// connection
const redisClient = redis.createClient(
    11842,
    "redis-11842.c16.us-east-1-3.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("5ZGqF3t3U7AWR6oyt8Bi6SeOQIlhC3xb", function (err) {
    if (err) throw err;
});
  
redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = function (value) {
    if (typeof value !== "string" || typeof (value) === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const createShortUrl = async function(req, res){
    try {
         const data = req.body
        
        if (Object.keys(data).length == 0) 
            return res.status(400).send({ status: false, message: "Please provide data in request body" })

        const longUrl = data.longUrl
        if(!longUrl) return res.status(400).send({ status: false, message: "longURL is Mandatory" })

        const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
        if(!regex.test(longUrl)) return res.status(400).send({ status: false, message: "Not A Valid URL , Plz Provide valid long URL" })
        
        if (! isValid(longUrl) || !validUrl.isUri(longUrl)){    // validUrl.isUri returns (String) = undefine / longUrl
            return res.status(400).send({ status: false, message: "Not A Valid URL , Plz Provide valid long URL" })
        }
        // .......checking in redis...........

        const checkInRedis = await GET_ASYNC(`${longUrl}`)
        if(checkInRedis) return res.status(200).send({ status: true, message: "URL Already Present in cache", data:JSON.parse(checkInRedis)})

        const urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (urlPresent){
            return res.status(200).send({ status: true, message: "URL Already Present", data: urlPresent })
        }
        const urlCode = shortId.generate()
        const shortUrl = "http://localhost:3000/"+urlCode
        
        data["urlCode"] = urlCode
        data["shortUrl"] = shortUrl
                
        const savedData = await urlModel.create(data)

        const responsedata = { 
            longUrl: savedData.longUrl,
             shortUrl: savedData.shortUrl, 
             urlCode: savedData.urlCode 
        }
        await SET_ASYNC(`${longUrl}`, JSON.stringify(responsedata))
        return res.status(201).send({ status: true, message: "Data Created", data: responsedata })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

const getFullUrl = async function(req,res){
    try{
        let urlCode = req.params.urlCode
      
        const checkInRedis = await GET_ASYNC(`${urlCode}`)
        if(checkInRedis) return res.status(302).redirect(JSON.parse(checkInRedis).longUrl)

        let findData = await urlModel.findOne({urlCode:urlCode})

        if(findData) {   
            await SET_ASYNC(`${findData.urlCode}`,JSON.stringify(findData))
            return res.status(302).redirect(findData.longUrl)
        }
        return res.status(404).send({status: false,message: "Url not found"})
    }
    catch(err){
        res.status(500).send({status:false , message:err.message})
    }
}

module.exports = {createShortUrl , getFullUrl}
