const express = require('express');
const router = express.Router();
const { runCode }= require('../controllers/executeController');
// const executeController = require('../controllers/executeController');

const runPython = require('../executors/runPython');
const runJavaScript = require('../executors/runJavaScript');
const runJava = require('../executors/runJava');

// router.post('/run', executeController);
router.post('/', runCode);

router.post('/', (req, res) => {
    const { language, code } = req.body;

    const callback = (output) => res.json({ output });

    if(language === 'python') {
        runPython(code, callback);
    } else if (language === 'javascript') {
        runJavaScript(code, callback);
    } else if (language === 'java') {
        runJava(code, callback);
    } else {
        res.status(400).json({ error: 'Unsupported language ' });
    }
});

module.exports = router;