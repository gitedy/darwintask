var img = require('./models/image');
var mime = require('mime-types')
var imagemin = require('imagemin');
var imageGrayScale = require('image-grayscale');
var jpeg = require('jpeg-js');
var globby = require('globby');
const del = require('del');
var Scraper = require ('images-scraper')
var https=require('https');
var google = new Scraper.Google();
var fs = require('fs');
var stream=require('stream');
var request = require('request');
var http = require("http");
var URL	 = require('url')
var mimee = require('mime-magic');
var getPixels = require("get-pixels")



function randomString(len, an){
	an = an&&an.toLowerCase();
	var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
	for(;i++<len;){
		var r = Math.random()*(max-min)+min <<0;
		str += String.fromCharCode(r+=r>9?r<36?55:61:48);
	}
	return str;
}




module.exports = function(app) {

	app.get('/api/cas/', function(req, res,next) {

		var search_string= req.query.search_text;
		console.log(search_string)

		var col= {name:search_string};
		var files=[];
		var data1=[];
		var data2='';
		var final_data=[];
		// client.search(''+search_string+'',{page: 3,size:'medium'})
		// 		.then(function (images) {
		google.list({
			keyword: search_string,
			num: 5,
			detail: true,
			nightmare: {
				show: false
			}
		})
			.then(function (images) {

						var list = [];
						for (i = 0; i < images.length; i++) {
							var str = images[i].url;
							// console.log(str);
							var dtr = str.search("\\?,~");
							// console.log(dtr);
							if (dtr != -1) {
								str = str.slice(0, dtr);
								// console.log(str)
							}
							list.push({url: str})
						}
						// console.log(list);

						for (i = 0; i < list.length; i++) {
							var x = list[i].url;
							var options = {
								url: x,
								dest: './upload/',
								done: function (err, filename, image) {
									if (err) {

										files.push("");

									}else {
									var f_slice = filename.slice(7);
									var f_name = 'upload/' + f_slice + '';
									console.log(f_name);
										files.push(f_name);

									}

									if (files.length >= 10) {
										console.log('All files downloaded');

										img.update(col, {path: files}, {upsert: true}, function (err, dat) {
											if (err) {
												res.send(err);
											}
// =========================================================Grayscaling===============================================================================
											globby(['./upload/*.jpg','!./upload/*.ico', '!./upload/*.txt']).then(function (paths) {
												return Promise.all(paths.map(function (e) {
													return imageGrayScale(e, {logProgress: 1});
												}));
											})
												.then(function (val) {
													console.log('grayscale done!');
													del(['./upload/*.*','!./upload/*.txt']).then(function (paths) {
														console.log('Deleted files and folders:\n', paths.join('\n'));
													});
// ==============================================================Compressing=======================================================================================
													imagemin(['./dist/*.{jpg,png,jpeg}','!./upload/*.txt'], './public/upload', {     // compression algorithm
													}).then(function (files) {


														del(['./dist/*.*','!./upload/*.txt']).then(function (paths) {
															console.log('Deleted files and folders:\n', paths.join('\n'));
														});
														res.send('ok');
													})
														.catch(function (err) {
															// fires once even if one error (Promise.all)
															if (err) console.log(err);
														})
												})
												.catch(function (val) {
													// fires once even if one error (Promise.all)
													if (err) console.log(err);
												});


										});
										
									}
								}
							};
							image_downloader(options);
						}

				});

	});

	app.get('/api/list', function(req, res) {
		img.find( { name : { $exists : true } },function (err,result) {
			res.send(result);
		} );

	});

	app.get('/api/fetch', function(req, res) {
		var keywords= req.query.data;
		console.log(keywords);

		img.find( {name:keywords},function (err,result) {

			console.log(JSON.stringify(result))
			res.send(result);

		} );

	});



    app.get('/api/find/',function (req,res) {



	 function download (uri, filename, callback){
		request.head(uri,{timeout:5000}, function(err, red, body){
			var error= new Error('err')
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback).on('error',function (err) {
				callback(err,filename);
			});
		 });
	 };


	var search_string= req.query.search_text;
	console.log(search_string);

	var col= {name:search_string};


	google.list({
		keyword: search_string,
		num: 10,
		detail: true,
		nightmare: {
			show: false
		}
	})
		.then(function (data) {

			var list = [];
			for (i = 0; i < data.length; i++) {
				var str = data[i].url;
				var dtr = str.search("\\?,~");
				if (dtr != -1) {
					str = str.slice(0, dtr);
				}
				list.push({url: str})
			}

        console.log('listing done')

			var pathl=[];
			for (i=0; i<list.length; i++) {
				var uri=list[i].url;
				var name = randomString(10);
				var filename=name+'.'+'jpg';
				var path_url= './upload/'+filename+'';
				pathl.push(path_url);
                var x=0;
				download(uri, path_url, function (err,filename) {
					if(err){
						console.log(err,filename);
					}
					x++;
					console.log('downloaded file No:',x);
					if(x>=10){
						console.log('All Images downloaded')
						globby(['./upload/*.*','!./upload/*.ico','!./upload/*.gif', '!./upload/*.txt']).then(function (paths) {
							console.log('All path has veen patched for grayscaling')
							var pathss=[];
							var l=0;
							paths.map(function (e) {
								mimee(e, function (err, type) {
									if (err) {
										console.error(err.message);
									} else {
										console.log(type)
										if(type==='text/html'){
											l++;
											console.log('Detected mime type not supported');
										}else{

											l++ ;
											pathss.push(e);
											if(l>paths.length-1){
												console.log(pathss)
												function change(arr){
													return new Promise(function (resolve,reject) {
														resolve('temp')
													})
												};

												change(pathss).then(function () {
													return Promise.all(pathss.map(function (e) {
														return imageGrayScale(e, {logProgress: 1});
													}));
												}).then(function () {
													console.log('Image Grayscaling completed')
													del(['./upload/*.*','!./upload/*.txt']).then(function (paths) {
													});

													imagemin(['./dist/*.{jpg,png,jpeg}','!./upload/*.txt'], './public/upload', {     // compression algorithm
													}).then(function (files) {

														del(['./dist/*.*','!./dist/*.txt']).then(function (paths) {
														});


														var paths= [];

														for(i=0;i<files.length;i++){
															paths.push(files[i].path)
														}
														console.log(paths);


														img.update(col, {path: paths}, {upsert: true}, function (err, dat) {
															if (err) {
																console.log(err);
																res.send(err);
															}else {
																console.log('data send');
																del(['./dist/*.*','!./upload/*.txt']).then(function (paths) {
																});

																res.send('ok');
															}
														});
													})
												})
											}
										}
									}
								})
							});
						})



						// });
					}

				});







			}




		}).catch(function(err) {
		console.log('err', err);
	});






});


 // application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};