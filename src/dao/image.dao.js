const VolcanoDAO = require('../dao/volcano.dao');
const HttpException = require('../exceptions/HttpException');

// Image Data Access Object
class ImageDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        super(db, authenticated);
        this.db = db('images');
    }

    // Post an image for a volcano
    async postImage(volcanoId, imageUrl, userEmail) {
        try {
            // Check if volcano ID, image URL and user email are provided
            if (!volcanoId || !imageUrl || !userEmail) {
                throw new HttpException(400, 'Volcano ID, image URL and user email are required parameters');
            }

            // Check if the volcano exists
            const volcanoExists = await this.db('volcanoes').where({ id: volcanoId }).first();

            // Return an error if the volcano does not exist
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);

            // Save the image to the database
            return this.db.insert({ volcanoId, imageUrl, userEmail });
        } catch (err) {
            // Return an error if failed to save image
            throw new HttpException(err.status || 500, err.message || 'Failed to save image');
        }
    }

    // Get all images for a volcano
    async getImages(volcanoId) {
        try {
            // Check if volcano ID is provided
            if (!volcanoId) throw new HttpException(400, 'Volcano ID is a required parameter');

            // Get the images for the volcano
            const images = await this.db.select('imageUrl').where({ volcanoId });

            // Return an error if no images are found
            if (!images.length) throw new HttpException(404, `No images found for volcano with ID ${volcanoId}`);

            // Return the images
            return images;
        } catch (err) {
            // Return an error if failed to get images
            throw new HttpException(err.status || 500, err.message || 'Failed to get images');
        }
    }

    // Post a report for a volcano image (Checking if the image has been reported 3 times, if so, delete the image)
    async postReport(volcanoId, imageId, reporterEmail) {
        try {
            // Check if volcano ID, image ID, and reporter email are provided
            if (!volcanoId || !imageId || !reporterEmail) {
                throw new HttpException(400, 'Volcano ID, image ID, and reporter email are required parameters');
            }

            // Check if the image exists
            const imageExists = await this.db('images').where({ id: imageId, volcanoId }).first();

            // Return an error if the image does not exist
            if (!imageExists) throw new HttpException(404, `Image with ID ${imageId} for volcano with ID ${volcanoId} not found`);

            // Check if the user has already reported this image
            const alreadyReported = await this.db('image_reports').where({ imageId, reporterEmail }).first();

            // Return an error if the user has already reported this image
            if (alreadyReported) throw new HttpException(409, `User ${reporterEmail} has already reported image with ID ${imageId}`);

            // Increment the report count for the image
            await this.db('images').where({ id: imageId }).increment('reports', 1);

            // Add the report to the image_reports table
            await this.db('image_reports').insert({ imageId, reporterEmail });

            // Delete the image if it has 3 or more reports
            const updatedImage = await this.db('images').select('reports').where({ id: imageId }).first();

            if (updatedImage.reports >= 3) {
                await this.db('images').where({ id: imageId }).del();
            }

        } catch (err) {
            // Return an error if failed to post report
            throw new HttpException(err.status || 500, err.message || 'Failed to post report');
        }
    }
}

module.exports = ImageDAO;

// // Post an image for a volcano
// async postImage(volcanoId, imageUrl, userEmail) {
//     try {
//         // Check if volcano ID, image URL and user email are provided
//         if (!volcanoId || !imageUrl || !userEmail) {
//             throw new HttpException(400, 'Volcano ID, image URL and user email are required parameters');
//         }

//         // Check if the volcano exists
//         const volcanoExists = await this.db('volcanoes').where({ id: volcanoId }).first();
//         if (!volcanoExists) {
//             throw new HttpException(404, `Volcano with ID ${volcanoId} not found`);
//         }

//         // Post the image
//         return this.db('volcano_images').insert({
//             volcano_id: volcanoId,
//             image_url: imageUrl,
//             posted_by: userEmail
//         });
//     } catch (err) {
//         // Return an error if failed to post image
//         throw new HttpException(err.status || 500, err.message || 'Failed to post image');
//     }
// }

// // Get all images for a volcano
// async getImages(volcanoId) {
//     try {
//         // Check if volcano ID is provided
//         if (!volcanoId) {
//             throw new HttpException(400, 'Volcano ID is a required parameter');
//         }

//         // Get the images for the volcano
//         const images = await this.db('volcano_images')
//             .select('id', 'image_url', 'posted_by', 'reports')
//             .where({ volcano_id: volcanoId });

//         // Return the images
//         return images;
//     } catch (err) {
//         // Return an error if failed to get images
//         throw new HttpException(err.status || 500, err.message || 'Failed to get images');
//     }
// }

// // Post a report for a volcano image
// async postReport(volcanoId, imageId, reporterEmail) {
//     try {
//         // Check if volcano ID, image ID, and reporter email are provided
//         if (!volcanoId || !imageId || !reporterEmail) {
//             throw new HttpException(400, 'Volcano ID, image ID, and reporter email are required parameters');
//         }

//         // Check if the image exists
//         const imageExists = await this.db('volcano_images')
//             .where({ id: imageId, volcano_id: volcanoId })
//             .first();

//         if (!imageExists) {
//             throw new HttpException(404, `Image with ID ${imageId} for volcano with ID ${volcanoId} not found`);
//         }

//         // Check if the user has already reported this image
//         const alreadyReported = await this.db('image_reports')
//             .where({ image_id: imageId, reporter_email: reporterEmail })
//             .first();

//         if (alreadyReported) {
//             throw new HttpException(409, `User ${reporterEmail} has already reported image with ID ${imageId}`);
//         }

//         // Increment the report count for the image
//         await this.db('volcano_images')
//             .where({ id: imageId })
//             .increment('reports', 1);

//         // Add the report to the image_reports table
//         await this.db('image_reports').insert({
//             image_id: imageId,
//             reporter_email: reporterEmail
//         });

//         // Delete the image if it has 3 or more reports
//         const updatedImage = await this.db('volcano_images')
//             .select('reports')
//             .where({ id: imageId })
//             .first();

//         if (updatedImage.reports >= 3) {
//             await this.db('volcano_images')
//                 .where({ id: imageId })
//                 .del();
//         }

//     } catch (err) {
//         // Return an error if failed to post report
//         throw new HttpException(err.status || 500, err.message || 'Failed to submit report');
//     }
// }
