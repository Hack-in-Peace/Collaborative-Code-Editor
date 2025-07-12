const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = function runJavaScript(code) {
  return new Promise((resolve, reject) => {
    const jobId = uuidv4();
    const filename = `${jobId}.js`;
    const tempDir = path.join(__dirname, '..', 'temp');
    const filepath = path.join(tempDir, filename);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    fs.writeFileSync(filepath, code);

    exec(`node ${filename}`, { cwd: tempDir }, (err, stdout, stderr) => {
      fs.unlinkSync(filepath);

      if (err || stderr) return reject(new Error(stderr || err.message));
      return resolve(stdout);
    });
  });
};
