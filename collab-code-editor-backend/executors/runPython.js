const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const runPython = (code) => {
  return new Promise((resolve, reject) => {
    const jobId = uuidv4();
    const filename = `${jobId}.py`;
    const tempDir = path.join(__dirname, '..', 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filepath = path.join(tempDir, filename);
    fs.writeFileSync(filepath, code);

    // Use 'python3' if you're on Linux/Mac or if 'python' isn't working
    const cmd = `python ${filename}`;  // change to `python3` if needed

    exec(cmd, { cwd: tempDir }, (err, stdout, stderr) => {
      fs.unlinkSync(filepath); // clean up .py file

      if (err || stderr) {
        return reject(new Error(stderr || err.message));
      }

      return resolve(stdout);
    });
  });
};

module.exports = runPython;
