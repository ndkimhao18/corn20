const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');
const request = require("request");

const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = require('../wrapper/req');

router.get('/dl_img', ash(async (oreq, ores, next) => {
    ores.set('Cache-Control', 'public, max-age=31557600');

    const creq = request(oreq.query.url)
        .on('data', chunk => ores.write(chunk))
        .on('close', () => ores.end())
        .on('end', () => ores.end())
        .on('error', e => {
            // we got an error
            log(oreq, e.message);
            try {
                ores.writeHead(500);
                ores.write(e.message);
            } catch (e) {
            }
            ores.end();
        });

    creq.end();
}));

router.get('/:cid', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    res.json(await rw.get_all_chat(req.params.cid));
}));

router.post('/:cid', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    await rw.add_chat_msg(req.params.cid, req.body.msg);
    res.json({ok: true})
}));