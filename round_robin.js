const prompt = require("prompt");
const Table = require("cli-table");
const chalk = require("chalk");
const { sortWithProp } = require("./utils");
prompt.start();

init();

async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("Round Robin")
    // "-",
    // chalk.red("Without Arrival Time")
  );
  let burstTimes = [];
  let processTimes = [];
  //   {
  //     process: "P1",
  //     burstTime: 2,
  //     arrivalTime: 0,
  //   },
  //   {
  //     process: "P2",
  //     burstTime: 3,
  //     arrivalTime: 0,
  //   },
  //   {
  //     process: "P3",
  //     burstTime: 4,
  //     arrivalTime: 0,
  //   },
  // ];
  let remainigBurstTimes = 0;
  const quantum = 3;
  const ganttChart = [];
  const turnAroundTime = [];
  const waitingTime = [];
  let averageTAT = 0,
    averageWT = 0;
  let isRemaining = true;
  const initialInput = await prompt.get([
    "processors",
    "quantum",
    "Arrival Time(Y/N)",
  ]);
  const processors = Number(initialInput.processors);
  const quantum = Number(initialInput.quantum);
  const arrivalInput = initialInput[Object.keys(initialInput)[2]];
  const isWithArrivalTime = Boolean(arrivalInput.match(/Y/gi));

  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);
    burstTimes[i] = Number(getInput[Object.keys(getInput)[0]]);
    processTimes[i] = {
      process: `P${i + 1}`, // This will help to recognize which process is this after sorting
      burstTime: Number(getInput[Object.keys(getInput)[0]]),
      arrivalTime: 0,
      index: i,
    };
    remainigBurstTimes++;
  }

  if (isWithArrivalTime) {
    for (let i = 0; i < processors; i++) {
      const getInput = await prompt.get([`Arrival Time Time of P${i + 1}`]);
      processTimes[i].arrivalTime = Number(getInput[Object.keys(getInput)[0]]);
    }
    processTimes = sortWithProp(processTimes, ["arrivalTime"], false);
  }
  const ganttChartTable = new Table({
    head: ["Processor", "Timing"],
  });
  const cloneBurstTimes = [...burstTimes];
  let tempCT = 0;
  while (remainigBurstTimes) {
    let processToPush = undefined;
    for (let i = 0; i < processTimes.length; i++) {
      if (processTimes[i].burstTime <= 0) continue;
      // Check if the Process has been arrived
      if (processTimes[i].arrivalTime <= tempCT) {
        processToPush = {
          ...processTimes[i],
          processIndex: i,
        };
        processTimes[i].burstTime -= quantum;
        if (processTimes[i].burstTime <= 0) {
          remainigBurstTimes -= 1;
        }
        break;
      }
    }
    if (processToPush) {
      tempCT += quantum;
      ganttChartTable.push([processToPush.process, tempCT]);
    } else {
      tempCT++;
      ganttChartTable.push(["--", tempCT]);
    }
  }

  const processTable = new Table({
    head: ["Processor", "Completion Time", "Turn Around Time", "Waiting Time"],
  });
  let timing = 0;
  for (let i = 0; i < ganttChart.length; i++) {
    timing += Number(ganttChart[i].value);
    ganttChartTable.push([ganttChart[i].Processor, timing]);
    // Calculate Turn Around Time and Waiting Time
    if (ganttChart[i].isCompleted) {
      turnAroundTime[ganttChart[i].process] = timing;

      waitingTime[ganttChart[i].process] =
        timing - cloneBurstTimes[ganttChart[i].process];

      averageTAT += timing;
      averageWT += waitingTime[ganttChart[i].process];
    }
  }

  for (let i = 0; i < cloneBurstTimes.length; i++) {
    processTable.push([`P${i + 1}`, timing, turnAroundTime[i], waitingTime[i]]);
  }
  averageTAT /= cloneBurstTimes.length;
  averageTAT = averageTAT.toFixed(2);

  averageWT /= cloneBurstTimes.length;
  averageWT = averageWT.toFixed(2);

  console.log(ganttChartTable.toString());
  console.log(processTable.toString());
  console.log("Average TAT: ", averageTAT);
  console.log("Average WT: ", averageWT);
}

/*
Done Case -> Answer is Negative
Remainig Case -> Answer is Positive

burstTime > quantum Time => 5 > 2  = curr = 2(Q) && burstTime = 3
burstTime < quantum Time => 1 < 2 = curr = 1(B) && burstTime = -1
- Take Total processors
- Take Burst Time of Each processor
- Take Quantum Time

- Loop through processors
    - If Burst Time is less than Quantum Time
        - Removes the Processor
    - If Burst Time is more than Quantum Time
        - Quantum Time = Quantime Time - Burst Time
- Once reach the end, loop again until all the Values are Less than 1

P1 -> 4
P2 -> 3
P3 -> 5

P1 -> 2
P2 -> 4
P3 -> 6
P1 -> 8
P2 -> 9
P3 -> 11
P3 -> 11

Turn Around Time = Completion Time - Arrival Time
Waiting Time = Turn Around Time - Burst Time


while (isRemaining) {
    isRemaining = false;
    for (let i = 0; i < burstTimes.length; i++) {
      if (burstTimes[i] < 1) continue;
      let currVal = quantum;
      if (burstTimes[i] <= quantum) {
        currVal = burstTimes[i];
        isCompleted = true;
      }
      if (burstTimes[i] > quantum) {
        isRemaining = true;
        isCompleted = false;
      }
      burstTimes[i] = burstTimes[i] - quantum;
      ganttChart.push({
        Processor: `P${i + 1}`,
        value: currVal,
        isCompleted,
        process: i,
      });
    }
  }
  console.log();

*/
