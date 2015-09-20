var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var swig  = require('swig');
var crypto = require('crypto');
var imagemagick = require('imagemagick');
var express = require('express');
var app = express();
var API_KEY = 'aion3rj349fji0o34re';

app.use(express.static('public'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

function resize(data, width) {
	imagemagick.resize({
		srcPath: "-",
		srcData: data,
		dstPath: __dirname+'/public/'+width+'.jpg',
		width:  width,
		sharpening: 0.2
	});
}

var sha1 = function(input) {
    return crypto.createHash('sha1').update(input).digest('hex')
}

app.get('/', function (req, res) {

	async.waterfall([
		function validateToken (next) {
			var params = _.clone(req.query);
			delete params.token;
			var token = sha1(JSON.stringify(params)+API_KEY);
			console.log('token='+token);

			if( req.query.token != token ) {
				res.status(403).send();
				return;
			}
			next(null);
		},
	    function read (next) {
	       fs.readFile(__dirname+'/ow.jpg', next);
	    },
	    function resize (data, next) {
	    	imagemagick.resize({
  				srcPath: "-",
    			srcData: data,
  				dstPath: __dirname+'/public/small.jpg',
  				width:   300,
  				sharpening: 0.2
			}, function(err, stdout, stderr) {
				next(err, data);
			});
	    },
	    function paraResize (data, next) {
			resize(data, 80);
			resize(data, 100);
			resize(data, 200);
			next(null);
		}
	], function(err) {
		if(err) {
			console.error(err);
			res.status(500).send(err);
			return;
		}

		res.render('index', { /* template locals context */ });
	});
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});




