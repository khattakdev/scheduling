const prompt = require("prompt");
const Table = require("cli-table");
prompt.start();

init();

async function init() {
  const burstTimes = [];
  const ganttChart = [];
  let isRemaining = true;
  const { processors, quantum } = await prompt.get(["processors", "quantum"]);

  for (let i = 0; i < processors; i++) {
    const getInput = await prompt.get([`Burst Time of P${i + 1}`]);
    burstTimes[i] = getInput[Object.keys(getInput)[0]];
  }

  while (isRemaining) {
    isRemaining = false;
    for (let i = 0; i < burstTimes.length; i++) {
      if (burstTimes[i] < 1) continue;
      let currVal = quantum;
      if (burstTimes[i] < quantum) {
        currVal = burstTimes[i];
      }
      if (burstTimes[i] > quantum) {
        isRemaining = true;
      }
      burstTimes[i] = burstTimes[i] - quantum;
      ganttChart.push({
        Processor: `P${i + 1}`,
        value: currVal,
      });
    }
  }
  console.log();
  const table = new Table({
    head: ["Processor", "Timing"],
    // colWidths: [100, 100],
  });
  let timing = 0;
  for (let i = 0; i < ganttChart.length; i++) {
    timing += Number(ganttChart[i].value);
    table.push([ganttChart[i].Processor, timing]);
  }
  console.log(table.toString());
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

*/
