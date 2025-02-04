const express = require('express')
const path = require('path')
const router = require('./router')
const hbs = require('hbs')
const config = require('config')
const env = config.get('env')

require('dotenv').config()
require('./db/sequelize')
require('./modules/models/index')
require('../playground/sample')
require('./cron')

// Setup express
const app = express()

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname, './templates/partials')

// Only use for react.js dashboard
const rootBuildPath = path.join(__dirname, 'build', 'root')
app.use(express.static(rootBuildPath))
const adminBuildPath = path.join(__dirname, 'build', 'admin')
app.use(express.static(adminBuildPath))

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup directory for documents
app.use(`/${env.FILE_DIRECTORY}`, express.static(env.FILE_DIRECTORY))

// Setup static directory to server
app.use(express.static(publicDirectoryPath))
app.use(express.json())

// Add route
router(app)

module.exports = app