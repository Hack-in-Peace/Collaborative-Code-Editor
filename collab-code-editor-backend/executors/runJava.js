const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = function runJava(code) {
  return new Promise((resolve, reject) => {
    const jobId = uuidv4();
    const className = 'Main'; // 👈 Use fixed class name for now
    const filename = `${className}.java`;
    const tempDir = path.join(__dirname, '..', 'temp');
    const filepath = path.join(tempDir, filename);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Write the code (assumes it contains a public class Main)
    fs.writeFileSync(filepath, code);

    const compileCmd = `javac ${filename}`;
    const runCmd = `java ${className}`;

    exec(compileCmd, { cwd: tempDir }, (compileErr, stdout, stderr) => {
      if (compileErr || stderr) {
        fs.unlinkSync(filepath);
        return reject(new Error(stderr || compileErr.message));
      }

      exec(runCmd, { cwd: tempDir }, (runErr, output, runStderr) => {
        fs.unlinkSync(filepath);
        const classFile = path.join(tempDir, `${className}.class`);
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);

        if (runErr || runStderr) return reject(new Error(runStderr || runErr.message));
        return resolve(output);
      });
    });
  });
};
