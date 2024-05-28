module.exports = {
    apps: [
        {
            name: 'volcano-back-end',
            script: './src/app.js',
            instances: 0,
            autorestart: true,
            watch: false,
        },
    ],
};