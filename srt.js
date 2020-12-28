const prompt = require("prompt");
const chalk = require("chalk");
const Table = require("cli-table");
const { fcfs, sortWithProp } = require("./utils");
prompt.start();

init();
async function init() {
  console.clear();
  console.log(chalk.blue.bold("Shortest Remaining Job CPU Scheduling"));

  let processTimes = [];

  const completionTimes = [0, 2];
  const burstTimes = [2, 2];
  const initialInput = await prompt.get(["processors", "Arrival Time(Y/N)"]);
  const processors = Number(initialInput.processors);
  const arrivalInput = initialInput[Object.keys(initialInput)[1]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));
  let averageTAT = 0,
    averageWT = 0;

  let remainingBurstTimes = 2;
  // Take Burst Times
  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);

    processTimes[i] = {
      process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      arrivalTime: 0,
      index: i,
    };
    completionTimes[i] = 0;
    burstTimes[i] = Number(getInput[Object.keys(getInput)[0]]);
  }

  // Take Arrival Times
  if (isWithArrivalTime) {
    for (let i = 0; i < processors; i++) {
      const getInput = await prompt.get([`Arrival Time Time of P${i + 1}`]);
      processTimes[i].arrivalTime = Number(getInput[Object.keys(getInput)[0]]);
    }
  }

  // Sort it Based on burstTime
  processTimes = sortforSJF(processTimes);

  const readyQueue = [];
  const clonedProcessTimes = [...processTimes];

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
    ],
  });
  // A Temporary Variable, which increments everytime one Unit of time is pass.
  let tempCT = 0;
  while (remainingBurstTimes) {
    // Temporary Save the Process, Will push it once loop through whole list
    let processToPush = undefined;
    for (let i = 0; i < processTimes.length; i++) {
      // Ignore if the Process has been executed
      if (clonedProcessTimes[i].burstTime <= 0) continue;

      if (tempCT >= clonedProcessTimes[i].arrivalTime) {
        const newProcess = {
          ...clonedProcessTimes[i],
          //   arrivalTime: tempCT,
          processIndex: i,
        };
        // Pushing for the First Time
        if (!processToPush) {
          tempCT++;
          processToPush = newProcess;
          // If previously process was pushed, and we find another one with same or less burst Time && less Arrival Time, Replace it
        } else if (
          processToPush.arrivalTime > clonedProcessTimes[i].arrivalTime &&
          processToPush.burstTime >= clonedProcessTimes[i].burstTime
        ) {
          processToPush = newProcess;
        }
      }
    }
    // Push the Temporary Saved Process
    if (processToPush) {
      processToPush.arrivalTime = tempCT;
      readyQueue.push(processToPush);
      clonedProcessTimes[processToPush.processIndex].burstTime -= 1;
      if (clonedProcessTimes[processToPush.processIndex].burstTime == 0) {
        remainingBurstTimes--;
      }
      completionTimes[processToPush.processIndex] = tempCT;
      ganttChartTable.push([processToPush.process, tempCT]);
      // In case if No process was found, (All the Process' arrival Time is Greater than current Time)
    } else {
      tempCT++;
      ganttChartTable.push(["--", tempCT]);
    }
  }

  for (let i = 0; i < processTimes.length; i++) {
    const currProcess = processTimes[i];
    currProcess.burstTime = burstTimes[processTimes[i].index];
    currProcess.completionTime = completionTimes[processTimes[i].index];
    currProcess.turnAroundTime =
      currProcess.completionTime - currProcess.burstTime;
    averageTAT += currProcess.turnAroundTime;
    processTable.push([
      currProcess.process,
      currProcess.burstTime,
      currProcess.arrivalTime,
      currProcess.completionTime,
      currProcess.turnAroundTime,
    ]);
  }

  averageTAT /= processTimes.length;
  averageTAT = averageTAT.toFixed(2);

  console.log(chalk.red.bold("Gantt Chart"));
  console.log(ganttChartTable.toString());

  console.log(chalk.red.bold("Process Table"));
  console.log(processTable.toString());

  console.log(chalk.green("Average TAT: "), averageTAT);
}

function merge(left, right) {
  let arr = [];
  // Break out of loop if any one of the array gets empty
  while (left.length && right.length) {
    // Pick the smaller among the smallest element of left and right sub arrays
    if (left[0].burstTime == right[0].burstTime) {
      if (left[0].arrivalTime == right[0].arrivalTime) {
        if (left[0].process > right[0].process) {
          arr.push(left.shift());
        } else {
          arr.push(right.shift());
        }
      } else if (left[0].arrivalTime < right[0].arrivalTime) {
        arr.push(left.shift());
      } else {
        arr.push(right.shift());
      }
    } else if (left[0].burstTime < right[0].burstTime) {
      arr.push(left.shift());
    } else {
      arr.push(right.shift());
    }
  }

  // Concatenating the leftover elements
  // (in case we didn't go through the entire left or right array)
  return [...arr, ...left, ...right];
}

function sortforSJF(array) {
  const half = array.length / 2;

  // Base case or terminating case
  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);
  return merge(sortforSJF(left), sortforSJF(array));
}
