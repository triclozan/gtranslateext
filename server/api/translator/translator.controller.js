'use strict';

var _ = require('lodash');
var https = require('https');
var Translator = require('./translator.model');

// Get list of translations
exports.index = function(req, res) {
  Translator.find({}, function (err, translators) {
    if(err) { return handleError(res, err); }
    return res.json(200, translators);
  });
};

// Get translation details
exports.show = function(req, res) {
  Translator.find({search: req.params.id}, function (err, translator) {
    if(err) { return handleError(res, err); }
    if(!translator) { return res.send(404); }
    return res.json(translator);
  });
};

// Creates a new translator in the DB.
exports.create = function(req, res) {
  Translator.create(req.body, function(err, translator) {
    if(err) { return handleError(res, err); }
    return res.json(201, translator);
  });
};

// Updates an existing translator in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Translator.findById(req.params.id, function (err, translator) {
    if (err) { return handleError(res, err); }
    if(!translator) { return res.send(404); }
    var updated = _.merge(translator, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, translator);
    });
  });
};

// Deletes a translator from the DB.
exports.destroy = function(req, res) {
  Translator.findById(req.params.id, function (err, translator) {
    if(err) { return handleError(res, err); }
    if(!translator) { return res.send(404); }
    translator.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Creates a new translator in the DB.
exports.translate = function(req, res) {
    var params = [
        ['q', req.query.search],
        ['client', 't'],
        ['sl', 'hu'],
        ['tl', 'en'],
        ['hl', 'en'],
        ['ie', 'UTF-8'],
        ['oe', 'UTF-8'],

        ['hl', 'en'],

        ['dt', 'bd'],
        ['dt', 'ex'],
        ['dt', 'ld'],
        ['dt', 'md'],
        ['dt', 'qca'],
        ['dt', 'rw'],
        ['dt', 'rm'],
        ['dt', 'ss'],
        ['dt', 't'],
        ['dt', 'at'],

        ['otf', 1],
        ['rom', 0],
        ['ssel', 3],
        ['tsel', 3],
        ['kc', 5]
    ];

    var stringParams = '';
    var data = '';
    var parsedData;

    for (var i = 0; i < params.length; i++) {
        if (i) {
            stringParams = stringParams + '&' + params[i][0] + '=' + params[i][1];
        } else {
            stringParams = stringParams + params[i][0] + '=' + params[i][1];
        }
    }

    var url = 'https://translate.google.com/translate_a/single?' + stringParams;
    https.get(url, function(response) {
        response.on('data', function(chunk) {
            data = data + chunk;
        }).on('end', function() {
            //console.log(data);
            eval('parsedData = ' + data);
            var translations = parsedData[1];
            if (parsedData[1])
            Translator.findAndModify({search: req.query.search, result: JSON.stringify(parsedData[1])}, [], { $inc: { total: 1 } }, {upsert: true}, function(err, translator) {
                if(err) { return handleError(res, err); }
                return res.json(200, JSON.stringify(parsedData[1]));
            });
        })
    }).on('error', function(err) {
        return handleError(res, err);
    });
};

function handleError(res, err) {
  return res.send(500, err);
}

