const prompt = require("prompt");
const chalk = require("chalk");
const Table = require("cli-table");
const { fcfs, sortWithProp } = require("./utils");
prompt.start();

init();

async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("Priority CPU Scheduling")
    // "-",
    // chalk.red("Without Arrival Time")
  );

  let processTimes = [
    // {
    //   process: "P1",
    //   arrivalTime: 0,
    //   burstTime: 5,
    //   priority: 10,
    // },
    // {
    //   process: "P2",
    //   arrivalTime: 1,
    //   burstTime: 4,
    //   priority: 20,
    // },
    // {
    //   process: "P3",
    //   arrivalTime: 2,
    //   burstTime: 2,
    //   priority: 30,
    // },
    // {
    //   process: "P4",
    //   arrivalTime: 4,
    //   burstTime: 1,
    //   priority: 40,
    // },
  ];
  let completionTimes = [];
  let burstTimes = [];
  let remainingBurstTimes = 0;
  let averageTAT = 0;
  const initialInput = await prompt.get(["processors", "Arrival Time(Y/N)"]);
  const processors = Number(initialInput.processors);
  const arrivalInput = initialInput[Object.keys(initialInput)[1]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));

  // Take Burst Times
  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([
      `Burst Time of P${i + 1}`,
      `Priority of P${i + 1}`,
    ]);

    processTimes[i] = {
      process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      priority: Number(getInput[Object.keys(getInput)[1]]),
      index: i,
      arrivalTime: 0,
    };
    completionTimes[i] = 0;
    burstTimes[i] = Number(getInput[Object.keys(getInput)[0]]);
    remainingBurstTimes++;
  }

  // Take Arrival Times
  if (isWithArrivalTime) {
    for (let i = 0; i < processors; i++) {
      const getInput = await prompt.get([`Arrival Time Time of P${i + 1}`]);
      processTimes[i].arrivalTime = Number(getInput[Object.keys(getInput)[0]]);
    }
    processTimes = sortForPriority(processTimes);
  } else {
    processTimes = sortWithProp(processTimes, ["priority"], false);
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
    ],
  });
  // A Temporary Variable, which increments everytime one Unit of time is pass.
  let tempCT = 0;
  while (remainingBurstTimes) {
    // Temporary Save the Process, Will push it once loop through whole list
    let processToPush = undefined;
    for (let i = 0; i < processTimes.length; i++) {
      // Ignore if the Process has been executed
      if (processTimes[i].burstTime <= 0) continue;

      if (tempCT >= processTimes[i].arrivalTime) {
        const newProcess = {
          ...processTimes[i],
          //   arrivalTime: tempCT,
          processIndex: i,
        };
        // Pushing for the First Time
        if (!processToPush) {
          tempCT++;
          processToPush = newProcess;
        }
      }
    }
    // Push the Temporary Saved Process
    if (processToPush) {
      processToPush.arrivalTime = tempCT;
      processTimes[processToPush.processIndex].burstTime -= 1;
      if (processTimes[processToPush.processIndex].burstTime == 0) {
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
    // Time can never be -ve
    if (currProcess.turnAroundTime < 0) {
      currProcess.turnAroundTime = 0;
    }
    averageTAT += currProcess.turnAroundTime;
    processTable.push([
      currProcess.process,
      currProcess.burstTime,
      currProcess.arrivalTime,
      currProcess.completionTime,
      currProcess.turnAroundTime,
    ]);
  }

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
    if (left[0].priority == right[0].priority) {
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
    } else if (left[0].priority > right[0].priority) {
      arr.push(left.shift());
    } else {
      arr.push(right.shift());
    }
  }

  // Concatenating the leftover elements
  // (in case we didn't go through the entire left or right array)
  return [...arr, ...left, ...right];
}

function sortForPriority(array) {
  const half = array.length / 2;

  // Base case or terminating case
  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);
  return merge(sortForPriority(left), sortForPriority(array));
}
