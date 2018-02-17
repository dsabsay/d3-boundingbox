const path = require('path');

module.exports = {
    entry: './demo/demo.coffee',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.coffee$/,
                use: [ 'coffee-loader' ]
            }
        ]
    }
};
