'use strict';

var _ = require('lodash');
var https = require('https');
var Translator = require('./translator.model');
var async = require('async');
var XRegExp = require('xregexp').XRegExp;

// Get list of translations
exports.index = function(req, res) {
  Translator.find({hasResult: true}, 'search total', {sort: {'total': -1}}, function (err, translators) {
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
    console.log('QUERY!');
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
            callback(null, {
                direction: sl + ' -> ' + tl,
                data: parsedData
            });
        })
    }).on('error', function(err) {
        return callback(err);
    });
};

// Creates a new translator in the DB.
exports.translate = function(req, res) {
    var entry = Translator.findOne({search: req.query.search}, function(err, translator) {
        if(!err && translator) {
            try {
                var result = JSON.parse(translator.result);
                res.json(200, result);
                Translator.findByIdAndUpdate(translator._id, {$inc: {total: 1}}, function() {
                });
                return;
            } catch (e) {
                console.log(e);
            }
        } else {
            var isRu = false, isHu = false;
            if (XRegExp('[а-яА-Я]').test(req.query.search)) {
                isRu = true;
            } else if (XRegExp('[öűüőí]|sz|zs').test(req.query.search)) {
                isHu = true;
            }
            console.log(isRu, isHu);
            var stub = function(callback) {
                callback();
            }
            var languages = [
                {
                    src: 'hu',
                    dest: 'ru',
                    criterion: isRu
                },
                {
                    src: 'hu',
                    dest: 'en',
                    criterion: isRu
                },
                {
                    src: 'en',
                    dest: 'ru',
                    criterion: isRu || isHu
                },
                {
                    src: 'ru',
                    dest: 'en',
                    criterion: !isRu
                },
                {
                    src: 'en',
                    dest: 'hu',
                    criterion: isRu || isHu
                },
                {
                    src: 'ru',
                    dest: 'hu',
                    criterion: !isRu
                }
            ];
            var startTime = (new Date()).getTime();
            async.parallel(
                languages.map(function(item) {
                    return item.criterion ? stub : function(callback) {
                        makeGoogleQuery(req.query.search, item.src, item.dest, callback);
                    };
                })
            , function(err, results) {
                console.log(((new Date()).getTime() - startTime));
                if (err) return handleError(res, err);
                var needsCaching;
                if (results[1] && results[1].data && results[1].data[0] && results[1].data[0][0] && results[1].data[0][0][0]  && results[1].data[0][0][0] != results[1].data[0][0][1]) {
                    needsCaching = true;
                }
                if (needsCaching) {
                    res.json(200, results);
                    Translator.findAndModify({hasResult: true, search: req.query.search, result: JSON.stringify(results)}, [], { $inc: { total: 1 } }, {upsert: true}, function (err, translator) {
                        /*if (err) {
                            return handleError(res, err);
                        }*/
                    });
                }
                else {
                    console.log(((new Date()).getTime() - startTime));
                    res.json(200, results);
                }
            });
        }
    });
};

function handleError(res, err) {
  return res.send(500, err);
}

