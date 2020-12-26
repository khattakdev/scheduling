const Table = require("cli-table");

function merge(left, right, prop, isAscending) {
  let arr = [];
  // Break out of loop if any one of the array gets empty
  while (left.length && right.length) {
    // Pick the smaller among the smallest element of left and right sub arrays
    if (isAscending) {
      if (left[0][prop] < right[0][prop]) {
        arr.push(left.shift());
      } else {
        arr.push(right.shift());
      }
    } else {
      if (left[0][prop] > right[0][prop]) {
        arr.push(left.shift());
      } else {
        arr.push(right.shift());
      }
    }
  }

  // Concatenating the leftover elements
  // (in case we didn't go through the entire left or right array)
  return [...arr, ...left, ...right];
}

function sortWithProp(array, prop, isAscending) {
  const half = array.length / 2;

  // Base case or terminating case
  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);
  return merge(
    sortWithProp(left, prop, isAscending),
    sortWithProp(array, prop, isAscending),
    prop,
    isAscending
  );
}

function fcfs(processTimes, hasPriority) {
  let averageTAT = 0,
    averageWT = 0;
  const waitingTime = [];
  const turnAroundTime = [];
  const ganttChartTable = new Table({
    head: ["Processor", "Timing"],
  });
  let processTable = new Table({
    head: [
      "Processor",
      "Burst Time",
      "Arrival Time",
      "Completion Time",
      "Turn Around Time",
      "Waiting Time",
    ],
  });

  if (hasPriority) {
    processTable = new Table({
      head: [
        "Processor",
        "Burst Time",
        "Arrival Time",
        "Priority",
        "Completion Time",
        "Turn Around Time",
        "Waiting Time",
      ],
    });
  }

  let completionTime = 0;
  for (let i = 0; i < processTimes.length; i++) {
    waitingTime[i] = completionTime - processTimes[i].arrivalTime;
    completionTime += processTimes[i].burstTime;
    turnAroundTime[i] = waitingTime[i] + processTimes[i].burstTime;
    averageTAT += turnAroundTime[i];
    averageWT += waitingTime[i];

    ganttChartTable.push([processTimes[i].process, completionTime]);
    let processRow = [
      processTimes[i].process,
      processTimes[i].burstTime,
      processTimes[i].arrivalTime,
      completionTime,
      turnAroundTime[i],
      waitingTime[i],
    ];
    if (hasPriority) {
      processRow = [
        processTimes[i].process,
        processTimes[i].burstTime,
        processTimes[i].arrivalTime,
        processTimes[i].priority,
        completionTime,
        turnAroundTime[i],
        waitingTime[i],
      ];
    }
    processTable.push(processRow);
  }

  averageTAT /= processTimes.length;
  averageTAT = averageTAT.toFixed(2);

  averageWT /= processTimes.length;
  averageWT = averageWT.toFixed(2);

  return {
    averageTAT,
    averageWT,
    ganttChartTable,
    processTable,
  };
}

module.exports = {
  sortWithProp,
  fcfs,
};
