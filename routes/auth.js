import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'

const router = express.Router()

// Redirect to Google for authentication
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Handle the callback after Google has authenticated the user
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to your desired location.
    const email = req.user.emails[0].value
    console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} User ${email} logged in successfully uisng Google`)

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.cookie('token', token)
    res.redirect('/')
  }
)

router.get('/auth/test', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.send('success')
})

export default router
