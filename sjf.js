const prompt = require("prompt");
const chalk = require("chalk");
const Table = require("cli-table");
const { fcfs, sortWithProp } = require("./utils");
prompt.start();

init();
async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("Shortest Job First CPU Scheduling")
    // "-",
    // chalk.red("Without Arrival Time")
  );

  let processTimes = [];

  const initialInput = await prompt.get(["processors", "Arrival Time(Y/N)"]);
  const processors = Number(initialInput.processors);
  const arrivalInput = initialInput[Object.keys(initialInput)[1]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));

  // Take Burst Times
  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);

    processTimes[i] = {
      process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      priority: Number(getInput[Object.keys(getInput)[1]]),
      arrivalTime: 0,
    };
  }

  // Take Arrival Times
  if (isWithArrivalTime) {
    for (let i = 0; i < processors; i++) {
      const getInput = await prompt.get([`Arrival Time Time of P${i + 1}`]);
      processTimes[i].arrivalTime = Number(getInput[Object.keys(getInput)[0]]);
    }
  }

  processTimes = sortWithProp(processTimes, ["burstTime"], true);

  const clonedProcessTimes = [];

  let tempCT = 0;
  for (let i = 0; i < processTimes.length; i++) {
    for (let j = 0; j < processTimes.length; j++) {
      // Ignore if the Process has been executed
      if (processTimes[j].burstTime <= 0) continue;

      if (tempCT >= processTimes[j].arrivalTime) {
        tempCT += processTimes[j].burstTime;
        clonedProcessTimes.push(processTimes[j]);
        processTimes[j].burstTime *= -1;
      }
    }
  }
  for (let i = 0; i < processTimes.length; i++) {
    clonedProcessTimes[i].burstTime *= -1;
  }
  console.log(clonedProcessTimes);
  const { averageTAT, averageWT, ganttChartTable, processTable } = fcfs(
    clonedProcessTimes,
    true
  );

  console.log(chalk.red.bold("Gantt Chart"));
  console.log(ganttChartTable.toString());

  console.log(chalk.red.bold("Process Table"));
  console.log(processTable.toString());

  console.log(chalk.green("Average TAT: "), averageTAT);
  console.log(chalk.green("Average WT: "), averageWT);
}
