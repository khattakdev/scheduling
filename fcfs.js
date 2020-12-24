const prompt = require("prompt");
const Table = require("cli-table");
const chalk = require("chalk");
const arrivalSort = require("./utils");
prompt.start();

init();

async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("First Come First Serve"),
    "-",
    chalk.red("Without Arrival Time")
  );

  let processTimes = [];
  const arrivalTimes = [];
  const ganttChart = [];
  const turnAroundTime = [];
  const waitingTime = [];
  let averageTAT = 0,
    averageWT = 0;

  const initialInput = await prompt.get(["processors", "Arrival Time(Y/N)"]);
  const processors = Number(initialInput.processors);
  const arrivalInput = initialInput[Object.keys(initialInput)[1]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));

  // Take Burst Times
  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);
    processTimes[i] = {
      Process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      arrivalTime: 0,
    };
  }

  // Take Arrival Times
  if (isWithArrivalTime) {
    for (let i = 0; i < processors; i++) {
      const getInput = await prompt.get([`Arrival Time Time of P${i + 1}`]);
      processTimes[i].arrivalTime = Number(getInput[Object.keys(getInput)[0]]);
    }

    processTimes = arrivalSort(processTimes);
  }

  const ganttChartTable = new Table({
    head: ["Processor", "Timing"],
  });
  const processTable = new Table({
    head: [
      "Processor",
      "Burst Time",
      "Arrival Time",
      "Completion Time",
      "Turn Around Time",
      "Waiting Time",
    ],
  });

  let completionTime = 0;
  for (let i = 0; i < processTimes.length; i++) {
    waitingTime[i] = completionTime - processTimes[i].arrivalTime;
    completionTime += processTimes[i].burstTime;
    turnAroundTime[i] = waitingTime[i] + processTimes[i].burstTime;
    averageTAT += turnAroundTime[i];
    averageWT += waitingTime[i];

    ganttChartTable.push([`P${i + 1}`, completionTime]);
    processTable.push([
      `P${i + 1}`,
      processTimes[i].burstTime,
      processTimes[i].arrivalTime,
      completionTime,
      turnAroundTime[i],
      waitingTime[i],
    ]);
  }

  averageTAT /= processTimes.length;
  averageTAT = averageTAT.toFixed(2);

  averageWT /= processTimes.length;
  averageWT = averageWT.toFixed(2);

  console.log(chalk.red.bold("Gantt Chart"));
  console.log(ganttChartTable.toString());

  console.log(chalk.red.bold("Process Table"));
  console.log(processTable.toString());

  console.log(chalk.green("Average TAT: "), averageTAT);
  console.log(chalk.green("Average WT: "), averageWT);
}

function withOutArrivalTime() {}
