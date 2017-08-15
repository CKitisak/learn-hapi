'use strict';

const Hapi = require('hapi');
const jwtPlugin = require('hapi-auth-jwt2');
const authPlugin = require('../auth');
const usersPlugin = require('../api/users');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;

describe('API: Users', function () {
    const url    = '/api/users';

    let token;
    let newUserId;
    let newUserToken;
    let server;

    before(function (done) {
        const plugins = [jwtPlugin, authPlugin, usersPlugin];

        server = new Hapi.Server();
        server.connection({ host: 'localhost', port: 3000 });
        server.register(plugins, function (err) {
            if (err) {
                return done(err);
            }

            server.initialize(done);
        });
    });

    it('Login should return http status 200 and token', function(done) {
        const option = {
            method: 'POST',
            url: url + '/login',
            payload: 'username=game&password=$uperP@ssw0rd',
            headers: { 
                'content-type': 'application/x-www-form-urlencoded' 
            }
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result.token).to.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
            token = response.result.token;
            done();
        });
    });

    it('Get users with token should return http status 200 and array of users', function (done) {
        const option = {
            method: 'GET',
            url: url,
            headers: {
                'Authorization': token
            }
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.instanceof(Array);
            expect(response.result.length).to.greaterThan(0);
            done();
        });
    });

    it('Get users without token should return http status 401 Unauthorized', function (done) {
        const option = {
            method: 'GET',
            url: url
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(401);
            expect(response.result.error).to.equal('Unauthorized');
            done();
        });
    });

    it('Create user should return http status 200', function(done) {
        const option = {
            method: 'POST',
            url: url,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            payload: 'username=tester&password=Te$t8888&email=test@mail.com'
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.an.instanceof(Object);
            expect(response.result.userId).to.be.a.string();
            newUserId = response.result.userId;
            done();
        });
    });

    it('Create exist user should return http status 400', function(done) {
        const option = {
            method: 'POST',
            url: url,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            payload: 'username=tester&password=Te$t8888&email=test@mail.com'
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(400);
            expect(response.result.error).to.equal('Bad Request');
            done();
        });
    });

    it('Update user should return http status 200', function(done) {
        const option = {
            method: 'PATCH',
            url: url + '/' + newUserId,
            headers: {
                'Authorization': token,
                'content-type': 'application/x-www-form-urlencoded'
            },
            payload: 'email=tester@email.com'
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.an.instanceof(Object);
            expect(response.result.email).to.equal('tester@email.com');
            done();
        });
    });

    it('Delete user should return http status 200 and success=true', function(done) {
        const option = {
            method: 'DELETE',
            url: url + '/' + newUserId,
            headers: {
                'Authorization': token
            }
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.an.instanceof(Object);
            expect(response.result.success).to.equal(true);
            done();
        });
    });

    it('Logout should return http status 200 and success=true', function(done) {
        const option = {
            method: 'GET',
            url: url + '/logout',
            headers: {
                'Authorization': token
            }
        };

        server.inject(option, function (response) {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.an.instanceof(Object);
            expect(response.result.success).to.equal(true);
            done();
        });
    });
});