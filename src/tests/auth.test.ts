import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'

const userEmail = "user1@gmail.com"
const userName = "User Name"
const userPassword = "12345"

const SecondUserEmail = "user2@gmail.com"
const SecondUserName = "Name User"
const SecondUserPassword = "54321"

let accessToken = ''
let refreshToken = ''

beforeAll(async ()=>{
    await Post.remove()
    await User.remove()
})

afterAll(async ()=>{
    await Post.remove()
    await User.remove()
    mongoose.connection.close()
})

describe("Auth Tests", ()=>{
    test("Not aquthorized attempt test",async ()=>{
        const response = await request(app).get('/post');
        expect(response.statusCode).not.toEqual(200)
    })

    test("Register test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "email": userEmail,
            "username": userName,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
    })

    test("Register with taken email test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "email": userEmail,
            "username": SecondUserName,
            "password": SecondUserPassword 
        })
        expect(response.statusCode).toEqual(400)
    })

    test("Register with taken username test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "email": SecondUserEmail,
            "username": userName,
            "password": SecondUserPassword 
        })
        expect(response.statusCode).toEqual(400)
    })

    test("Login with email test",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "identifier": userEmail,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
        accessToken = response.body.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.refreshToken
        expect(refreshToken).not.toBeNull()
    })

    test("Login with username test",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "identifier": userName,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
        accessToken = response.body.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.refreshToken
        expect(refreshToken).not.toBeNull()
    })

    test("Login test wrong password",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "identifier": userEmail,
            "password": SecondUserPassword
        })
        expect(response.statusCode).not.toEqual(200)
        const access = response.body.accesstoken
        expect(access).toBeUndefined()
    })

    test("test request with valid access token",async ()=>{
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)
    })

    test("test request with invalid access token",async ()=>{
        const response = await request(app).get('/post').set('Authorization', 'JWT 1' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    jest.setTimeout(15000)

    test("test expiered token",async ()=>{
        let response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)
        await new Promise(r => setTimeout(r,6000))
        response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    test("test refresh token",async ()=>{
        let response = await request(app).get('/auth/refresh').set('Authorization', 'JWT ' + refreshToken);
        expect(response.statusCode).toEqual(200)

        accessToken = response.body.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.refreshToken
        expect(refreshToken).not.toBeNull()
        
        response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)

    })

    test("Logout test",async ()=>{
        const response = await request(app).get('/auth/logout').set('Authorization', 'JWT ' + refreshToken)
        expect(response.statusCode).toEqual(200)
    })
    
})