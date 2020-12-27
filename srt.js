const prompt = require("prompt");
const chalk = require("chalk");
const Table = require("cli-table");
const { fcfs, sortWithProp } = require("./utils");
prompt.start();

init();
async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("Shortest Remaining Job CPU Scheduling")
    // "-",
    // chalk.red("Without Arrival Time")
  );

  let processTimes = [];
  //     {
  //       processs: "P1",
  //       arrivalTime: 2,
  //       burstTime: 1,
  //       index: 0,
  //     },
  //     {
  //       processs: "P2",
  //       arrivalTime: 1,
  //       burstTime: 5,
  //       index: 1,
  //     },
  //     {
  //       processs: "P3",
  //       arrivalTime: 4,
  //       burstTime: 1,
  //       index: 2,
  //     },
  //     {
  //       processs: "P4",
  //       arrivalTime: 0,
  //       burstTime: 6,
  //       index: 3,
  //     },
  //     {
  //       processs: "P5",
  //       arrivalTime: 2,
  //       burstTime: 3,
  //       index: 4,
  //     },
  //   ];

  const completionTimes = [];
  const burstTimes = [];
  const initialInput = await prompt.get(["processors", "Arrival Time(Y/N)"]);
  const processors = Number(initialInput.processors);
  const arrivalInput = initialInput[Object.keys(initialInput)[1]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));
  let totalBurstTimes = processors;
  let isRemaining = true;
  // Take Burst Times
  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);

    processTimes[i] = {
      process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      // priority: Number(getInput[Object.keys(getInput)[1]]),
      arrivalTime: 0,
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

  processTimes = sortforSJF(processTimes, ["burstTime"], true);

  const readyQueue = [];
  const clonedProcessTimes = [...processTimes];
  console.log(processTimes);
  let tempCT = 0;
  while (isRemaining) {
    isRemaining = false;
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
        } else if (
          processToPush.arrivalTime > clonedProcessTimes[i].arrivalTime &&
          processToPush.burstTime >= clonedProcessTimes[i].burstTime
        ) {
          processToPush = newProcess;
        }
        isRemaining = true;
      }
    }
    if (processToPush) {
      processToPush.arrivalTime = tempCT;
      readyQueue.push(processToPush);
      clonedProcessTimes[processToPush.processIndex].burstTime -= 1;
      completionTimes[processToPush.processIndex] = tempCT;
      //   clonedProcessTimes[[processToPush.processIndex]].turnAroundTime = processToPush.arrivalTime
    }
  }

  for (let i = 0; i < processTimes.length; i++) {
    // console.log(processTimes[clonedProcessTimes[i].index].burstTime);
    clonedProcessTimes[i].burstTime =
      processTimes[clonedProcessTimes[i].index].burstTime;
  }
  console.log(clonedProcessTimes);
  console.log(completionTimes);
  process.exit(0);
  for (let i = 0; i < processTimes.length; i++) {
    readyQueue[i].burstTime *= -1;
  }
  console.log(readyQueue);
  const { averageTAT, averageWT, ganttChartTable, processTable } = fcfs(
    readyQueue,
    true
  );

  console.log(chalk.red.bold("Gantt Chart"));
  console.log(ganttChartTable.toString());

  console.log(chalk.red.bold("Process Table"));
  console.log(processTable.toString());

  console.log(chalk.green("Average TAT: "), averageTAT);
  console.log(chalk.green("Average WT: "), averageWT);
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

//TODO: Fix Completion Time Index, Add Turn Around Time, Print the Table
