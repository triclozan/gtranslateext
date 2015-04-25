'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TranslatorSchema = new Schema({
  search: String,
  result: String,
  count: Number
});

TranslatorSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

module.exports = mongoose.model('Translator', TranslatorSchema);