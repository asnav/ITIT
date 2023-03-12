
import User from '../models/user_model'
import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function sendError(res: Response, error: string) {
    //console.log(error);
    res.status(400).send({
        'err': error
    });
}

const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    if (!email || !password || !username) {
        return sendError(res, 'please provide valid email password and username')
    }

    try {
        let existing_user = await User.findOne({ 'email': email });

        if (existing_user != null) {
            return sendError(res, 'Email is already being used')
        }

        existing_user = await User.findOne({ 'username': username });

        if (existing_user != null) {
            return sendError(res, 'Username is already taken')
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            email: email,
            password: encryptedPassword,
            username: username,
        });

        await newUser.save()
        return res.status(200).send({
            'email': email,
            '_id': newUser._id
        })
    } catch (err) {
        return sendError(res, err);
    }
}

async function changeUserPassword(req: Request, res: Response) {
    const { id } = req.params
    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
        sendError(res, 'please provide both old and new password')
    }

    const user = await User.findById(id);
    if (user == null) return sendError(res, 'Incorrect user id');

    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) return sendError(res, 'Incorrect old password');

    const salt = await bcrypt.genSalt(10)
    const encryptedPwd = await bcrypt.hash(newPassword, salt)

    user.set({
        password: encryptedPwd,
    });

    await user.save();

    res.status(200).send({
        'email': user.email,
        '_id': user._id
    });

}

async function generateTokens(userId: string) {
    const accessToken = jwt.sign(
        { 'id': userId },
        process.env.ACCESS_TOKEN_SECRET,
        { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION || "2s" }
    )
    const refreshToken = jwt.sign(
        { 'id': userId },
        process.env.REFRESH_TOKEN_SECRET
    )

    return { 'accessToken': accessToken, 'refreshToken': refreshToken }
}

const login = async (req: Request, res: Response) => {
    const identifier = req.body.identifier //identifier is either email or username
    const password = req.body.password

    if (identifier == null || password == null) {
        return sendError(res, 'please provide valid email or username and password')
    }

    try {
        let user = await User.findOne({ 'email': identifier });
        if (user == null) user = await User.findOne({ 'username': identifier });
        if (user == null) return sendError(res, 'Incorrect user or password');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return sendError(res, 'Incorrect user or password');

        const tokens = await generateTokens(user._id.toString())

        if (user.refresh_tokens == null) user.refresh_tokens = [tokens.refreshToken]
        else user.refresh_tokens.push(tokens.refreshToken)

        await user.save()
        return res.status(200).send({ ...tokens, id: user._id })
    } catch (err) {
        return sendError(res, 'failed validating user')
    }
}

function getTokenFromRequest(req: Request): string {
    const authHeader = req.headers['authorization']
    if (authHeader == null) return null
    return authHeader.split(' ')[1]
}

type TokenInfo = {
    id: string
}

const refresh = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req)
    if (refreshToken == null) return sendError(res, 'missing refresh token')

    try {
        const user: TokenInfo = <TokenInfo>jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res, 'failed validating token')

        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        const tokens = await generateTokens(userObj._id.toString())

        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] = tokens.refreshToken

        await userObj.save()

        return res.status(200).send({ ...tokens, id: userObj._id })
    } catch (err) {
        return sendError(res, 'failed validating token')
    }
}

const logout = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req)
    if (refreshToken == null) return sendError(res, 'missing refresh token')

    try {
        const user = <TokenInfo>jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res, 'failed validating token')

        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        userObj.refresh_tokens.splice(userObj.refresh_tokens.indexOf(refreshToken), 1)
        await userObj.save()
        return res.status(200).send()
    } catch (err) {
        return sendError(res, 'failed validating token')
    }
}

const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req)
    if (token == null) return sendError(res, 'authentication missing')
    try {
        const user = <TokenInfo>jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.body.userId = user.id

        return next()
    } catch (err) {
        return sendError(res, 'fail validating token')
    }

}

export = { changeUserPassword, login, refresh, register, logout, authenticateMiddleware }