/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Translator = require('./translator.model');

exports.register = function(socket) {
  Translator.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Translator.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('translator:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('translator:remove', doc);
}