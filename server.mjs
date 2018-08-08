import ugs from 'ultimate-guitar-scraper';
import fetch from 'node-fetch';
import restify from 'restify';
import errors from 'restify-errors';
import cors from 'restify-cors-middleware';

var server = restify.createServer();

// server.use(function(req, res, next) {
//   return next(new errors.NotFoundError('not here!'));
// });
const corsFilter = cors({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:3000'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

// function genericHeaders(req, res, next) {
//   req.header["Access-Control-Allow-Origin"] =  'http://localhost:3000';
//   console.log("corsing");
//   return next();
// }
server.pre((req,res,next) => {
  console.log("req: ", req.path());
  next();
});
server.pre(corsFilter.preflight);
server.use(corsFilter.actual);
//server.use(genericHeaders);
server.get('/search/:query', search);
server.head('/search/:query', search);
server.get('/get/:url', get);
server.head('/get/:url', get);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});


function search(req, res, next) {
  ugSearch(req.params.query).then(tabs => {
//    console.log(tabs);
    res.send(tabs);
    next();
  }).catch(error => console.log("search, ", error));
}

function ugSearch(inputValue){
  return new Promise(
    function(resolve, reject) {
      const query = {
        query: inputValue
      };
      const callback = (error, tabs, response, body) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(tabs);
        }
      };
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
        }
      };
      ugs.search(query, callback, options);
    }
  );
}

function get(req, res, next) {
  ugGet(req.params.url).then(tabs => {
    res.send(tabs);
    next();
  }).catch(error => errors.InternalServerError(error));
}

function ugGet(url){
  return new Promise(
    (resolve, reject) => {
      ugs.get(url, (error, tab) => {
        if (error) {
          console.log("error", error);
          reject(error);
        } else {
          console.log("tab", tab);
          resolve(tab);
        }
      });
    });
};
