const mongoose = require('mongoose');



const modelSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const makeSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: [modelSchema],
    created_at: {
        type: Date,
        default: Date.now
    }

});

const MakeModel = mongoose.model('Make', makeSchema);

module.exports = MakeModel;


