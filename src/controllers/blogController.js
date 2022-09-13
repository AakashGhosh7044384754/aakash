const blogModel = require("../models/blogModels");
const mongoose = require("mongoose");

//-------------------------------------------------------------------------------------------------------------------//
const createBlog = async (req, res) => {
  try {
    let Blog = req.body;
    if (Object.keys(Blog).length == 0) {
      return res.status(400).send({ status: false, msg: "Invalid request Please provide valid blog details", });
    }
    let { title, body, authorId, category, isPublished } = Blog;
    if (!title) return res.status(400).send({ status: false ,msg: " title is required " });
    if (!body) return res.status(400).send({status: false , msg: "body is required " });
    if (!authorId) return res.status(400).send({status: false, msg: " authorId is required " });
    if (!category) return res.status(400).send({status: false, msg: " category is require" });
  
    let requestUserId =authorId
    if (requestUserId !== req.loggedInUser) {
      return res.status(401).send({ status: false, msg: "Permission Denied for this User" })
  }
  if (isPublished === true) {
    Blog['publishedAt'] = new Date()
}


    let blogCreated = await blogModel.create(Blog);
    res.status(201).send({ status: true, data: blogCreated });
  } catch (error) {
    res.status(500).send({status: false, msg: error.message });
  }
};

//-------------------------------------------------------------------------------------------------------------------//
const getBlogs = async function (req, res) {
  try {
  
    let obj = { isDeleted: false, isPublished: true }
    let { authorId, category, tags, subcategory: subcategory } = req.query
    
   
    if (authorId) { obj.authorId = authorId }
    if (category) { obj.category = category }
    if (tags) { obj.tags = { $in: [tags] } }
    if (subcategory) { obj.subcategory = { $in: [subcategory] } }
    

    let savedData = await blogModel.find(obj)
    if (savedData.length == 0) {
      return res.status(404).send({ status: false, msg: "no document found" })
    }
    return res.status(200).send({ status: true, msg: savedData })
  }
  catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
}

//-------------------------------------------------------------------------------------------------------------------//
const updateBlog = async function(req, res){
  try {

    let inputId = req.params.blogId;
    let isValid = mongoose.Types.ObjectId.isValid(inputId);
    if (!isValid) return res.status(400).send({status: false, msg: "enter valid objectID" });

    let reqBody = req.body;
    let title = req.body.title;
    let body = req.body.body;
    let tags = req.body.tags;
    let subcategory = req.body.subcategory;

    if (Object.keys(reqBody).length == 0) {
      return res.status(400).send({status: false,msg: "Invalid request Please provide valid Author  details"});
    }

    let date = Date.now();
    let allDate = date.toString();

    let alert = await blogModel.findOne({ _id: inputId, isDeleted: true });
    if (alert) return res.status(400).send({status: false, msg: "Blog is already deleted" });

    let blogs = await blogModel.findOneAndUpdate(
      { _id: inputId },
      {
        $set: {
          title: title,
          body: body,
          isPublished: true,
          publishedAt: allDate,
        },
        $push: { tags: tags, subcategory: subcategory },
      },
      { new: true }
    );

    if (!blogs) return res.status(404).send({ msg: "no blog found" });
    res.status(200).send({status: true, msg: blogs });
  } catch (error) {
    res.status(500).send({status: false, msg: error.message });
  }
};
//-------------------------------------------------------------------------------------------------------------------//
const deleteBlog = async (req, res) => {
  try {
    let inputId = req.params.blogId;

    let isValid = mongoose.Types.ObjectId.isValid(inputId);
    if (!isValid) return res.status(400).send({status: false, msg: "enter valid object tid" });

    let date = Date.now();
    let alltdate = date.toString();

    let deleteAlert = await blogModel.findOne({
      _id: inputId,
      isDeleted: true,
    });
    if (deleteAlert)
      return res.status(404).send({status: false, msg: "This blog is already deleted" });

    let updateData = await blogModel.findOneAndUpdate(
      { _id: inputId },
      { $set: { isDeleted: true, deletedAt: alltdate } },
      { new: true }
    );

    if (!updateData)
      return res.status(404).send({status: false, msg: "This document dose not exist" });

    res.status(200).send({ status: true, msg: updateData });
  } catch (error) {
    res.status(500).send({status: false, msg: error.message });
  }
};
//-------------------------------------------------------------------------------------------------------------------//
const deleteBlogByCategory = async (req, res) => {
  try {
    let { category, authorId, tags, subcategory, isPublished } = req.query

    let deleteData = await blogModel.updateMany({

      authorId: req.loggedInUser,
      isDeleted: false, $or: [{ authorId: authorId },
      { isPublished: isPublished },
      { tags: tags },
      { category: category },
      { subcategory: subcategory }]
    },
      { $set: { isDeleted: true }, deletedAt: Date.now() },
      { new: true })

    if (deleteData.modifiedCount == 0) {
      return res.status(404).send({ status: false, msg: "All documents are already deleted" })
    }

    return res.status(200).send({ status: true, data: deleteData, msg: "Now, following blogs are deleted " })
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
};
//---------------------------------------------------------------------------------------------------------------//
module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteBlogByCategory = deleteBlogByCategory;

//----------------------------------------------------------------------------------------------------------------//
