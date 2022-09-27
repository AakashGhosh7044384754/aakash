const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/booksModel')
const mongoose = require('mongoose')


//-----------> createReview ------------>//
const createReview = async function (req, res) {
    try {
        let reqBookId = req.params.bookId
        if (!reqBookId) { return res.status(400).send({ status: true, message: "bookId is mandatory" }) }

        let book = mongoose.Types.ObjectId.isValid(reqBookId)
        if (!book) {
            return res.status(400).send({ status: false, message: "book id is invalid!" })
        }
        let findBookId = await bookModel.findById(reqBookId)
        if (!findBookId) {
            return res.status(404).send({ status: false, message: "this Book Id is not present in db" })
        }
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "body is empty" })
        }
        let { bookId, rating } = data
        if (reqBookId != bookId) { return res.status(400).send({ status: false, message: "please use the same id in path and inside the body!" }) }
        if (findBookId.isDeleted == true) { return res.status(400).send({ status: false, message: "you can't set review for this book this is deleted" }) }

        if (!bookId) { return res.status(400).send({ status: false, message: "bookId is mandatory" }) }
      
        if (!rating) { return res.status(400).send({ status: false, message: "rating is mandatory" }) }
        if (!/^[1-5]\d{0}$/.test(rating)) { return res.status(400).send({ status: false, message: "rating in number only(1-5)" }) }

        const updatedBooks = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } }, { new: true })

       let createdReview = await reviewModel.create(data)
        let updatedBooksdata = { data:updatedBooks, review:createdReview }

        updatedBooksdata.reviewsData = createReview
        return res.status(201).send({ status: true, message: 'Success', data: updatedBooksdata })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//-----------> updateReviewById ------------>//
const updatereviewbookbybookid = async function (req, res) {

    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "Bookid is not valid" })
        if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, msg: "reviewid is not valid" })

        let { review, rating, reviewedBy } = req.body

        let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookData) return res.status(404).send({ status: false, msg: "Book might be deleted or its not present" })

        let findreviewandupdate = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { reviewedBy: reviewedBy, rating: rating, review: review }, { new: true }).select({ createdAt: 0, updatedAt: 0, _id: 0 })
        if (!findreviewandupdate) return res.status(404).send({ status: false, msg: "Document not found it must be deleted or incorrect" })

        let finalData = {
            title: bookData.title, excerpt: bookData.excerpt, userId: bookData.userId,
            category: bookData.category, subcategory: bookData.subcategory, isDeleted: false, reviews: bookData.reviews,
            reviewsData: findreviewandupdate
        }
        res.status(200).send({ status: true, message: "Data updated Successfully", Data: finalData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}
//-----------> deleteReviewById ------------>//
const deleteReviwsById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let validBook = mongoose.Types.ObjectId.isValid(bookId)
        if (!validBook) {
            return res.status(400).send({ status: false, message: "book id is invalid!" })
        }
        let reviewId = req.params.reviewId;
        let validReview = mongoose.Types.ObjectId.isValid(reviewId)
        if (!validReview) {
            return res.status(400).send({ status: false, message: "review id is invalid!" })
        }

        //finding book and review to be deleted

        let book = await bookModel.findById(bookId)
        if ( book.isDeleted == true) {    //
            return res.status(404).send({ status: false, message: "Book is already deleted." })
        }
        let review = await reviewModel.findById(reviewId)
        if ( review.isDeleted == true) {  //
            return res.status(404).send({ status: false, message: "Review already deleted" })
        }
        if (review.bookId != bookId) {
            return res.status(404).send({ status: false, message: "Review not found for this book" })
        }

        await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, { new: true })
        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })

        return res.status(200).send({ status: true, message: "Review deleted successfully" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




module.exports = {
    createReview, deleteReviwsById,updatereviewbookbybookid
}
