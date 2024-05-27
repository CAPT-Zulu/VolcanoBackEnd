const VolcanoDAO = require('./volcano.dao');
const HttpException = require('../exceptions/HttpException');
const badWords = require('bad-words');

// comment Data Access Object
class commentDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        // Call the super class constructor 
        super(db, authenticated);
        // Assign the db and reports_db objects to the class
        this.db_com = () => db.table('comments');
        this.reports_db = () => db.table('comment_reports');
        // Create a new instance of the bad-words filter
        this.badWords = new badWords();
        this.badWords.addWords('Test_bad_word_and_or_inappropriate_content') // Test bad word to be used for testing
    }

    // Verify the comment
    // To attempt to prevent inappropriate or harmful comments.
    // This of course is not a foolproof method, and there is no perfect method for this, but it is a start.
    async verifyComment(comment) {
        try {
            // Check if comment is provided
            if (!comment) throw new HttpException(400, 'The comment is a required parameter');

            // Check if comment is too long (255 characters max)
            if (comment.length > 255) throw new HttpException(400, 'Comment is too long (255 characters max)');

            // Check if comment is inappropriate or harmful
            if (this.badWords.isProfane(comment)) throw new HttpException(400, 'Comment contains inappropriate or harmful content');

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to verify comment
            throw new HttpException(err.status || 500, err.message || 'Failed to verify comment');
        }
    }

    // Post an comment for a volcano
    async postComment(volcanoId, comment) {
        try {
            // Check if volcano ID, comment and user are provided
            if (!volcanoId || !comment) throw new HttpException(400, 'The Volcano ID and the comment are required parameters');

            // Check if user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoId);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Verify the comment (Attempt to prevent inappropriate or harmful comments)
            await this.verifyComment(comment);

            // Attempt to save the comment
            const commentID = await this.db_com()
                .insert({ volcanoId, userEmail: this.authenticated.email, comment });

            // Check if the commentID was returned
            if (!commentID[0]) throw new HttpException(500, 'Failed to save comment');

            // Return the comment ID
            return commentID[0];
        } catch (err) {
            // Return an error if failed to save comment
            throw new HttpException(err.status || 500, err.message || 'Failed to save comment');
        }
    }

    // Update a comment for a volcano
    async updateComment(volcanoId, commentId, comment) {
        try {
            // Check if comment ID, comment and user are provided
            if (!commentId || !comment) throw new HttpException(400, 'The comment ID and the comment are required parameters');

            // Check if user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoId);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Check if the comment exists
            const commentExists = await this.db_com()
                .select('userEmail')
                .where({ commentId })
                .first();
            if (!commentExists) throw new HttpException(404, `Comment with ID ${commentId} not found`);

            // Check if user is the author of the comment
            console.log(this.authenticated.email, commentExists.userEmail)
            if (this.authenticated.email !== commentExists.userEmail) throw new HttpException(403, 'User is not the author of the comment');

            // Verify the comment (Attempt to prevent inappropriate or harmful comments)
            await this.verifyComment(comment);

            // Attempt to update the comment
            await this.db_com()
                .update({ comment })
                .where({ commentId });

            // Return success
            return true;
        } catch (err) {
            // Return an error if failed to update comment
            throw new HttpException(err.status || 500, err.message || 'Failed to update comment');
        }
    }

    // Delete a comment for a volcano
    async deleteComment(volcanoId, commentId) {
        try {
            // Check if comment ID and user are provided
            if (!commentId) throw new HttpException(400, 'The comment ID is a required parameter');

            // Check if user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoId);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Check if the comment exists
            const commentExists = await this.db_com()
                .select('userEmail')
                .where({ commentId })
                .first();
            if (!commentExists) throw new HttpException(404, `Comment with ID ${commentId} not found`);

            // Check if user is the author of the comment
            if (this.authenticated.email !== commentExists.userEmail) throw new HttpException(403, 'User is not the author of the comment');

            // Attempt to delete the comment
            await this.db_com()
                .where({ commentId })
                .del();

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

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoId);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Get the comments for the volcano
            const comments = await this.db_com()
                .select('commentId')
                .where({ volcanoId }); // Add a limit to the number of comments returned

            // Check if any comments are found
            if (!comments.length) {
                return { message: `No comments found for volcano with ID ${volcanoId}` };
            } else {
                // Return the comments
                return comments;
            }
        } catch (err) {
            // Return an error if failed to get comments
            throw new HttpException(err.status || 500, err.message || 'Failed to get comments');
        }
    }

    // Post a report for a volcano comment (Checking if the comment has been reported 3 times, if so, delete the comment)
    async postReport(volcanoId, commentId) {
        try {
            // Check if volcano ID and reporter email are provided
            if (!commentId) throw new HttpException(400, 'comment ID is an required parameter');

            // Check if user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoId);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Check if the comment exists
            const commentExists = await this.db_com()
                .where({ commentId })
                .first();
            if (!commentExists) throw new HttpException(404, `comment with ID ${commentId} not found`);

            // Check if the user has already reported this comment
            const alreadyReported = await this.reports_db()
                .where({ commentId, reporterEmail: this.authenticated.email });
            if (alreadyReported.length > 0) throw new HttpException(409, `User ${this.authenticated.email} has already reported comment with ID ${commentId}`);

            // Check if the user is the author of the comment
            if (commentExists.userEmail === this.authenticated.email) throw new HttpException(403, 'User cannot report their own comment');

            // Add the report to the comment_reports table
            await this.reports_db()
                .insert({ commentId, reporterEmail: this.authenticated.email });

            // Get the updated number of reports for the comment
            const updatedComment = await this.reports_db()
                .count('commentId as reports')
                .where({ commentId })
                .first();
            // Check if the comment has 3 or more reports
            if (updatedComment.reports >= 3) {
                // Delete the comment
                await this.db_com()
                    .where({ commentId })
                    .del();
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