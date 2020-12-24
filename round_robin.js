const prompt = require("prompt");
const Table = require("cli-table");
const chalk = require("chalk");
prompt.start();

init();

async function init() {
  console.clear();
  console.log(
    chalk.blue.bold("Round Robin"),
    "-",
    chalk.red("Without Arrival Time")
  );
  const burstTimes = [24, 3, 3];
  const ganttChart = [];
  const turnAroundTime = [];
  const waitingTime = [];
  let averageTAT = 0,
    averageWT = 0;
  let isRemaining = true;
  let isCompleted = false;
  const initialInput = await prompt.get(["processors", "quantum"]);
  const processors = Number(initialInput.processors);
  const quantum = Number(initialInput.quantum);

  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);
    burstTimes[i] = Number(getInput[Object.keys(getInput)[0]]);
  }

  const cloneBurstTimes = [...burstTimes];

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
  const ganttChartTable = new Table({
    head: ["Processor", "Timing"],
  });
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

*/
