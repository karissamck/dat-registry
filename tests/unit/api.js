const test = require('tape')
const path = require('path')
const TownshipClient = require('township-client')
const request = require('request')
const helpers = require('../helpers')
const config = JSON.parse(JSON.stringify(require('../config')))

var url = 'http://localhost:' + config.port
var api = url + '/api/v1'
test('api', function (t) {
  config.db.connection.filename = path.join(__dirname, 'test-api.sqlite')
  helpers.server(config, function (db, close) {
    var users = JSON.parse(JSON.stringify(helpers.users))
    var dats = JSON.parse(JSON.stringify(helpers.dats))

    var client = TownshipClient({
      server: 'http://localhost:' + config.port,
      config: config.townshipClient,
      routes: {
        register: '/auth/v1/register',
        login: '/auth/v1/login'
      }
    })

    t.end()

    test('api POST users should fail', function (t) {
      request.post({url: api + '/users', body: users.joe, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.statusCode, 400)
        t.end()
      })
    })

    test('api GET users should fail without login', function (t) {
      request({url: api + '/users', json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.statusCode, 400)
        t.end()
      })
    })

    test('api should register users', function (t) {
      client.register(users.joe, function (err, resp, body) {
        t.ifError(err)
        users.joe.id = body.id
        t.same(body.email, users.joe.email, 'email the same')
        t.same(body.username, users.joe.username, 'username the same')
        t.ok(body.token, 'token there')
        client.register(users.bob, function (err, resp, body) {
          t.ifError(err)
          users.bob.id = body.id
          t.same(body.email, users.bob.email)
          t.ok(body.token, 'token there')
          client.register(users.admin, function (err, resp, body) {
            t.ifError(err)
            users.admin.id = body.id
            t.same(body.email, users.admin.email, 'gives back email upon register')
            t.ok(body.token, 'token there')
            t.end()
          })
        })
      })
    })

    test('api usernames should be unique', function (t) {
      client.register(users.joe, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'error status code')
        t.end()
      })
    })

    test('api id should not update even after a failure ', function (t) {
      client.secureRequest({url: '/api/v1/users?id=' + users.joe.id, method: 'GET', json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 1, 'joe is still there')
        t.end()
      })
    })

    test('api should get the users we created', function (t) {
      client.secureRequest({url: '/api/v1/users', method: 'get', json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 3, 'has three users')
        if (body.length) {
          t.same(body[0].email, users.joe.email, 'has joe')
          t.same(body[1].email, users.bob.email, 'has bob')
          t.same(body[2].email, users.admin.email, 'has admin')
        }
        t.end()
      })
    })

    test('api joe should be able to update himself', function (t) {
      client.login(users.joe, function (err, resp, body) {
        t.ifError(err)
        t.same(body.email, users.joe.email, 'has joes email')
        t.ok(body.key, 'has key')
        t.ok(body.token, 'has token')
        client.secureRequest({url: '/api/v1/users', method: 'put', body: {id: users.joe.id, username: 'margaret'}, json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body && body.updated, 1, 'updated one user')
          client.secureRequest({url: '/api/v1/users', json: true}, function (err, resp, body) {
            t.ifError(err)
            t.same(body.length, 3, 'has three users')
            if (body.length) t.same(body[0].username, 'margaret', 'user has new username')
            t.end()
          })
        })
      })
    })

    test('api joe cannot update bob', function (t) {
      client.secureRequest({url: '/api/v1/users', method: 'put', body: {id: users.bob.id, email: 'joebob@email.com'}, json: true}, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({url: '/api/v1/users', json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 3, 'has three users')
          if (body.length) t.same(body[1].email, users.bob.email, 'bob has the same email')
          t.end()
        })
      })
    })

    test('api joe cannot delete bob', function (t) {
      client.secureRequest({method: 'DELETE', url: '/api/v1/users', body: {id: users.bob.id}, json: true}, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({url: '/api/v1/users', json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 3, 'has three users')
          t.end()
        })
      })
    })

    test('api can create a dat', function (t) {
      client.secureRequest({method: 'POST', url: '/api/v1/dats', body: dats.cats, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.cats.id = body.id
        dats.cats.user_id = body.user_id
        client.secureRequest({url: '/api/v1/dats', json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 1)
          t.end()
        })
      })
    })

    test('api can get a dat', function (t) {
      client.secureRequest({url: '/api/v1/dats?id=' + dats.cats.id, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 1, 'has one dat')
        if (body.length) t.same(body[0].name, dats.cats.name, 'is the right dat')
        t.end()
      })
    })

    test('api can create another dat', function (t) {
      client.secureRequest({method: 'POST', url: '/api/v1/dats', body: dats.penguins, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.penguins.id = body.id
        dats.penguins.user_id = body.user_id
        client.secureRequest({url: '/api/v1/dats', json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 2)
          t.end()
        })
      })
    })

    test('api cannot delete a dat that doesnt exist', function (t) {
      client.secureRequest({method: 'DELETE', url: '/api/v1/dats', body: {id: 'notanid'}, json: true}, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        t.end()
      })
    })

    test('api bob cannot delete joes dat', function (t) {
      client.logout(function () {
        client.login(users.bob, function (err) {
          t.ifError(err)
          client.secureRequest({method: 'DELETE', url: '/api/v1/dats', body: {id: dats.cats.id}, json: true}, function (err, resp, body) {
            t.ok(err)
            t.same(err.statusCode, 400, 'request denied')
            t.end()
          })
        })
      })
    })

    test('api bob can delete his own dat', function (t) {
      client.secureRequest({method: 'POST', url: '/api/v1/dats', body: dats.dogs, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.dogs.id = body.id
        dats.dogs.user_id = body.user_id
        t.same(body.name, dats.dogs.name, 'is the right dat')
        client.secureRequest({method: 'DELETE', url: '/api/v1/dats', body: {id: dats.dogs.id}, json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.deleted, 1, 'deletes one row')
          client.secureRequest({url: '/api/v1/dats', json: true}, function (err, resp, body) {
            t.ifError(err)
            t.same(body.length, 2, 'only two dat')
            t.end()
          })
        })
      })
    })

    test('api bob can delete himself', function (t) {
      client.secureRequest({method: 'DELETE', url: '/api/v1/users', body: {id: users.bob.id}, json: true}, function (err, resp, body) {
        t.ifError(err)
        t.same(body.deleted, 1, 'deletes one row')
        client.secureRequest({url: '/api/v1/users', json: true}, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 2, 'has two users')
          t.end()
        })
      })
    })

    test('tear down', function (t) {
      client.logout(function () {
        helpers.tearDown(config, function () {
          close(function () {
            t.end()
          })
        })
      })
    })
  })
})
