'use strict';

var _ = require('lodash');
var https = require('https');
var Translator = require('./translator.model');

// Get list of translations
exports.index = function(req, res) {
  Translator.find({result: {'$ne': '' }}, 'search total', {sort: {'total': -1}}, function (err, translators) {
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

function makeGoogleQuery(search, sl, tl, callback) {
    var params = [
        ['q', search],
        ['client', 't'],
        ['sl', sl],
        ['tl', tl],
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
            eval('parsedData = ' + data);
            callback(null, parsedData);
        })
    }).on('error', function(err) {
        return callback(err);
    });
};

// Creates a new translator in the DB.
exports.translate = function(req, res) {
    var found = false;
    Translator.find({search: req.query.search}, function(err, translator) {
        if(err) { return; }
        console.log(translator);
        try {
            translator = JSON.parse(translator[0].result);
            found = true;
            return res.json(200, translator);
        } catch (e) {

        }
        if (!found) {
            makeGoogleQuery(req.query.search, 'hu', 'ru', function(err, ruParsedData) {
                makeGoogleQuery(req.query.search, 'hu', 'en', function(err, parsedData) {
                    if (err) return handleError(res, err);
                    var translations = parsedData[1];
                    if (parsedData[0] && parsedData[0][0] && parsedData[0][0][0] != parsedData[0][0][1] && ruParsedData[0] && ruParsedData[0][0])
                        Translator.findAndModify({search: req.query.search, ru: ruParsedData[0][0][0], main: parsedData[0][0][0], result: JSON.stringify(parsedData)}, [], { $inc: { total: 1 } }, {upsert: true}, function(err, translator) {
                            if(err) { return handleError(res, err); }
                            parsedData[0][0][2] = ruParsedData[0][0][0];
                            return res.json(200, parsedData);
                        });
                    else res.json(200, parsedData);
                });
            });
        }
    });
};

function handleError(res, err) {
  return res.send(500, err);
}

