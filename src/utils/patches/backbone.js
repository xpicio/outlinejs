import Backbone from 'backbone';
import querystring from 'querystring';
import url from 'url';
import http from 'http';
import https from 'https';

let httpMethodMap = {
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
  read: 'GET'
};

export function backboneSync(method, model, options) {
  var p = new Promise(
    (resolve, reject) => {
      var reqUrl = options.url;
      var bodyData;
      var qs;
      var protocol = http;
      var params = {
        method: httpMethodMap[method],
        headers: {
          Accept: 'application/json'
        }
      };

      if (!reqUrl) {
        if (typeof model.url === 'function') {
          reqUrl = model.url();
        } else {
          reqUrl = model.url;
        }
        if (!reqUrl) {
          throw new Error('A "url" property or function must be specified');
        }
      }

      if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify(options.attrs || model.toJSON(options));
        params.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      if (options.headers) {
        params.headers = Object.assign(options.headers, params.headers);
      }

      if (params.method === 'GET') {
        qs = querystring.stringify(options.data);
      }

      reqUrl = url.parse(reqUrl);
      params.protocol = reqUrl.protocol;
      if (params.protocol === 'https:') {
        protocol = https;
      }
      params.hostname = reqUrl.hostname;
      params.port = reqUrl.port;
      params.path = reqUrl.path;
      if (qs) {
        params.path = reqUrl.query ? `${params.path}&${qs}` : `${params.path}?${qs}`;
      }

      var req = protocol.request(params, (res) => {
        var responseText = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          responseText += chunk;
        });
        res.on('end', () => {
          var jData;
          if (res.headers['content-type'].includes('application/json')) {
            jData = JSON.parse(responseText);
          }
          if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304) {
            options.success(jData);
            resolve(model);
          } else {
            options.error(jData);
            reject({
              code: res.statusCode,
              errorText: res.statusMessage,
              errorJSON: jData
            });
          }
        });
      });

      req.on('error', (e) => {
        options.error(e);
        reject({
          code: 0,
          errorText: e.message,
          errorJSON: null
        });
      });

      model.trigger('request', model, p, options);

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  return p;
}

Backbone.sync = backboneSync;
