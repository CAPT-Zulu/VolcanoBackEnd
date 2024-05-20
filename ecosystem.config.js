module.exports = {
    apps: [
        {
            name: 'volcano-back-end',
            script: './src/app.js',
            instances: 'max',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};