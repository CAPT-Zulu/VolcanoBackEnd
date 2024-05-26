const VolcanoDAO = require('./volcano.dao');
const HttpException = require('../exceptions/HttpException');
const badWords = require('bad-words');

// comment Data Access Object
class commentDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        super(db, authenticated); // Initialize the parent class
        this.db = db('comments'); // Set the table for the DAO
        this.reports_db = db('comment_reports'); // Set the table for comment reports
    }

    // Verify the comment
    // To attempt to prevent inappropriate or harmful comments.
    // This of course is not a foolproof method, and there is no perfect method for this, but it is a start.
    async verifyComment(comment) {
        try {
            // Check if comment is provided
            if (!comment) throw new HttpException(400, 'The comment is a required parameter');

            // Check if comment is inappropriate or harmful
            const filter = new badWords();
            filter.addWords('Test_bad_word_and_or_inappropriate_content') // Test bad word to be used for testing
            if (filter.isProfane(comment)) throw new HttpException(400, 'Comment contains inappropriate or harmful content');

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to verify comment
            throw new HttpException(err.status || 500, err.message || 'Failed to verify comment');
        }
    }

    // Post an comment for a volcano
    async postComment(volcanoId, comment, userEmail) {
        try {
            // Check if volcano ID, comment and user are provided
            if (!volcanoId || !comment) throw new HttpException(400, 'The Volcano ID and the comment are required parameters');
            if (!userEmail) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.db('volcanoes').where({ id: volcanoId }).first();
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Check if user is valid
            const user = await this.db('users').where({ email: userEmail }).first();
            if (!user) throw new HttpException(401, 'Unauthorized');

            // Verify the comment (Attempt to prevent inappropriate or harmful comments)
            await this.verifyComment(comment);

            // Attempt to save the comment
            const commentID = await this.db.insert({ volcanoId, userEmail, comment });

            console.log(commentID);

            // Return the comment ID
            return commentID;
        } catch (err) {
            // Return an error if failed to save comment
            throw new HttpException(err.status || 500, err.message || 'Failed to save comment');
        }
    }

    // Update a comment for a volcano
    async updateComment(commentId, comment, userEmail) {
        try {
            // Check if comment ID, comment and user are provided
            if (!commentId || !comment) throw new HttpException(400, 'The comment ID and the comment are required parameters');
            if (!userEmail) throw new HttpException(401, 'Unauthorized');

            // Check if the comment exists
            const commentExists = await this.db.where({ id: commentId }).first();
            if (!commentExists) throw new HttpException(404, `Comment with ID ${commentId} not found`);

            // Check if user is the author of the comment
            if (commentExists.userEmail !== userEmail) throw new HttpException(403, 'User is not the author of the comment');

            // Verify the comment (Attempt to prevent inappropriate or harmful comments)
            await this.verifyComment(comment);

            // Attempt to update the comment
            await this.db.where({ id: commentId }).update({ comment });

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to update comment
            throw new HttpException(err.status || 500, err.message || 'Failed to update comment');
        }
    }

    // Delete a comment for a volcano
    async deleteComment(commentId, userEmail) {
        try {
            // Check if comment ID and user are provided
            if (!commentId) throw new HttpException(400, 'The comment ID is a required parameter');

            // Check if the comment exists
            const commentExists = await this.db.where({ id: commentId }).first();
            if (!commentExists) throw new HttpException(404, `Comment with ID ${commentId} not found`);

            // Check if user is the author of the comment
            if (commentExists.userEmail !== userEmail) throw new HttpException(403, 'User is not the author of the comment');

            // Attempt to delete the comment
            await this.db.where({ id: commentId }).del();

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to delete comment
            throw new HttpException(err.status || 500, err.message || 'Failed to delete comment');
        }
    }

    // Get all comments for a volcano
    async getComments(volcanoId) {
        try {
            // Check if volcano ID is provided
            if (!volcanoId) throw new HttpException(400, 'Volcano ID is a required parameter');

            // Get the comments for the volcano
            const comments = await this.db.select('commentUrl').where({ volcanoId }); // Add a limit to the number of comments returned

            // Return an error if no comments are found
            if (!comments.length) throw new HttpException(404, `No comments found for volcano with ID ${volcanoId}`);

            // Return the comments
            return comments;
        } catch (err) {
            // Return an error if failed to get comments
            throw new HttpException(err.status || 500, err.message || 'Failed to get comments');
        }
    }

    // Post a report for a volcano comment (Checking if the comment has been reported 3 times, if so, delete the comment)
    async postReport(volcanoId, commentId, reporterEmail) {
        try {
            // Check if volcano ID, comment ID, and reporter email are provided
            if (!volcanoId || !commentId || !reporterEmail) throw new HttpException(400, 'Volcano ID and comment ID are required parameters');
            // Check if user email is provided
            if (!reporterEmail) throw new HttpException(401, 'Unauthorized');

            // Check if the comment exists
            const commentExists = await this.where({ id: commentId, volcanoId }).first();
            if (!commentExists) throw new HttpException(404, `comment with ID ${commentId} for volcano with ID ${volcanoId} not found`);

            // Check if the user has already reported this comment
            const alreadyReported = await this.reports_db.where({ commentId, reporterEmail }).first();
            if (alreadyReported) throw new HttpException(409, `User ${reporterEmail} has already reported comment with ID ${commentId}`);

            // Check if the user is the author of the comment
            if (commentExists.userEmail === reporterEmail) throw new HttpException(403, 'User cannot report their own comment');

            // Add the report to the comment_reports table
            await this.reports_db.insert({ commentId, reporterEmail });

            // Delete the comment if it has 3 or more reports
            const updatedComment = await this.reports_db.select('reports').where({ commentId }).first();
            if (updatedComment.reports >= 3) {
                await this.db.where({ id: commentId }).del();
            }

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to post report
            throw new HttpException(err.status || 500, err.message || 'Failed to post report');
        }
    }
}

module.exports = commentDAO;