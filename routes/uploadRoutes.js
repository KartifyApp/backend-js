import express from 'express'
import path from 'path'
import multer from 'multer'
import { UPLOAD_DIR } from '../constants.js'

const router = express.Router()

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename(req, file, cb) {
        cb(null, `${file.filename}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

function checkFileType(file, cb) {
    const filetypes = /jpg|png|jpeg/
    const extname = filetypes.test(path.extname(file.originalname))
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        return cb('Images Only')
    }
}

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
})

router.post('/', upload.single('image'), (req, res) => {
    res.send(`/${req.file.path}`)
})

export default router
