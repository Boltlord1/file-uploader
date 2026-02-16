import path from 'node:path'
import express from 'express'
import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import prisma from './utils/prisma.js'
import passport from './utils/passport.js'
import router from './router.js'

const app = express()
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session({
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    })
}))
app.use(passport.session())
app.use(express.urlencoded({ extended: true }))
app.use('/', router)

const port = process.env.PORT || 3000
app.listen(port, (err) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(`App listening on port ${port}`)
})