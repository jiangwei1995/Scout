import fetch from 'node-fetch'
import {inspect} from 'util'
import arrayToHeaders from '../utils/arrayToHeaders'

export = (server) => {
  server.post('/request', (req, res) => {
    let statusCode
    let statusText
    let responseTime
    const start = Date.now()
    Promise.resolve().then(() => (
      fetch(req.body.URL, {
        method: req.body.method,
        body: req.body.body,
        headers: arrayToHeaders(req.body.headers),
      })
    ))
      .then((_res) => {
        statusCode = _res.status
        statusText = _res.statusText
        responseTime = Date.now() - start
        return _res.text()
      })
      .then((_body) => {
        const isJSON = req.body.readType === 'json'
        const body = isJSON ? JSON.parse(_body) : _body
        const beautifiedBody = isJSON ? inspect(body, {colors: true}) : body
        if (Math.round(statusCode / 100) === 2 || Math.round(statusCode / 100) === 3) {
          res.send({
            status: 'OK',
            statusCode,
            statusText,
            responseTime,
            body,
            beautifiedBody,
          })
        } else if (Math.round(statusCode / 100) === 4 || Math.round(statusCode / 100) === 5) {
          res.send({
            status: 'Error',
            name: statusText,
            message: body,
          })
        }else {
          res.send({
            status: 'Error',
            name: statusText,
            message: body,
          })
        }

      })
      .catch((err) => {
        res.send({
          status: 'Error',
          name: err.name,
          message: err.message,
        })
      })
  })
}
