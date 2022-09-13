const authorModel = require("../Models/authorModels");
const validation = require("email-validator");
const jwt = require("jsonwebtoken")
const isvalidTitle=function(title){

}

const createAuthor = async function (req, res) {
  let author = req.body;
  let fname = req.body.fname;
  let lname = req.body.lname;
  let title = req.body.title;
  let email = req.body.email;
  let pw = req.body.password;
  try {
    if (Object.keys(author).length == 0) {
      return res.status(400).send({ status: false, msg: "Invalid request Please provide valid Author details" });
    } else if (!fname) {
      res.status(400).send({ status: false, msg: "The request is missing a mandatory First Name !" });
    } else if (!lname) {
      res.status(400).send({ status: false, msg: "The request is missing a mandatory Last Name !" });
    } else if (!title) {
      res.status(400).send({ status: false, msg: "The request is missing a mandatory Title !" });
    } 
    let validTitle = ['Mr', 'Mrs', 'Miss']; //validating the title
    //checking if the title is valid
    if (!validTitle.includes(title)) {
      return res.status(400).send({ status: false, msg: "title should be one of Mr, Mrs, Miss" });
    }
    
    else if (!email) {
      res.status(400).send({ status: false, msg: "The request is missing a mandatory email !" });
    } else if (!validation.validate(email)) {
      res.status(400).send({ status: false, msg: "please use right format in your email ID" });
    } else if (email ==await authorModel.find({email})) {
      res.status(400).send({ status: false, msg: "Please give another email Id, email id is already present" });
    } else if (!pw) {
      res.status(400).send({ status: false, msg: "The request is missing a mandatory Password" });
    } else {
      let authorCreated = await authorModel.create(author);
      res.status(201).send({status:true, data: authorCreated });
    }
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};


const loginUser = async function (req, res) {
  try {
    let userName = req.body.email;
    let password = req.body.password;
    let user = await authorModel.findOne({ email: userName });
    if (!user) {
      return res.status(400).send({ status: false, msg: "username is not corerct", });
    }
    let pass = await authorModel.findOne({ password: password });
    if (!pass) {
      return res.status(400).send({ status: false, msg: "password is not corerct", });
    }
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        batch: "project1",
        organisation: "group36",
      },
      "functionup-plutonium"
    );
    // res.status(200).setHeader("x-api-key", token);
    res.status(200).send({ status: true, data: token });

  } catch (err) {
    res.status(500).send({ msg: "server error", error: err })
  }

}

module.exports.loginUser = loginUser
module.exports.createAuthor = createAuthor;
