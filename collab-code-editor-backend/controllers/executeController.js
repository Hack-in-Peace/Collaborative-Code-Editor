const runPython = require('../executors/runPython');
const runJava = require('../executors/runJava');
const runJavaScript = require('../executors/runJavaScript');

exports.runCode = async (req, res) => {
  const { language, code } = req.body;

  try {
    let result;

    if (language === 'python') result = await runPython(code);
    else if (language === 'java') result = await runJava(code);
    else if (language === 'javascript') result = await runJavaScript(code);
    else return res.status(400).json({ error: 'Unsupported language' });

    res.json({ output: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
