const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    id: String,
    name: String,
    caption: String,
    url: String,
    Dtime: String
});

module.exports = mongoose.model('Posts',PostSchema);