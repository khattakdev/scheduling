const prompt = require("prompt");
const Table = require("cli-table");
const chalk = require("chalk");
prompt.start();

init();

async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("First Come First Serve"),
    "-",
    chalk.red("Without Arrival Time")
  );

  const burstTimes = [];
  const ganttChart = [];
  const turnAroundTime = [];
  const waitingTime = [];
  let averageTAT = 0,
    averageWT = 0;

  const initialInput = await prompt.get(["processors"]);
  const processors = Number(initialInput.processors);

  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);
    burstTimes[i] = Number(getInput[Object.keys(getInput)[0]]);
  }

  const ganttChartTable = new Table({
    head: ["Processor", "Timing"],
  });
  const processTable = new Table({
    head: ["Processor", "Burst Time", "Turn Around Time", "Waiting Time"],
  });

  let timing = 0;
  for (let i = 0; i < burstTimes.length; i++) {
    waitingTime[i] = timing;
    timing += burstTimes[i];
    turnAroundTime[i] = waitingTime[i] + burstTimes[i];
    averageTAT += turnAroundTime[i];
    averageWT += waitingTime[i];

    ganttChartTable.push([`P${i + 1}`, timing]);
    processTable.push([
      `P${i + 1}`,
      burstTimes[i],
      turnAroundTime[i],
      waitingTime[i],
    ]);
  }

  averageTAT /= burstTimes.length;
  averageTAT = averageTAT.toFixed(2);

  averageWT /= burstTimes.length;
  averageWT = averageWT.toFixed(2);

  console.log(chalk.red.bold("Gantt Chart"));
  console.log(ganttChartTable.toString());

  console.log(chalk.red.bold("Process Table"));
  console.log(processTable.toString());

  console.log(chalk.green("Average TAT: "), averageTAT);
  console.log(chalk.green("Average WT: "), averageWT);
}
