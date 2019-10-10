const chalk = require("chalk");
const logUpdate = require("log-update");
const { dots } = require("cli-spinners");

const logPromise = async (promise, text, completedLabel = "") => {
  const { frames, interval } = dots;
  let index = 0;

  const id = setInterval(() => {
    index = ++index % frames.length;
    logUpdate(
      `${chalk.yellow(frames[index])} ${text} ${chalk.gray(
        "- pending, this may take a few seconds"
      )}`
    );
  }, interval);

  const result = await promise;

  clearInterval(id);

  logUpdate(`${chalk.green("√")} ${text} ${chalk.gray(completedLabel)}`);
  logUpdate.done();

  return result;
};

module.exports = logPromise;