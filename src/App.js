import React, { useState } from 'react';
import './App.css'; // Include CSS for styling

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [results, setResults] = useState([]);
  const [algorithm, setAlgorithm] = useState('FCFS');

  const handleAddProcess = () => {
    setProcesses([...processes, { id: processes.length + 1, arrival: 0, burst: 0, priority: 0 }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    updatedProcesses[index][field] = Number(value);
    setProcesses(updatedProcesses);
  };

  const handleCalculate = () => {
    switch (algorithm) {
      case 'FCFS':
        setResults(fcfsScheduling(processes));
        break;
      case 'SJF-Preemptive':
        setResults(sjfPreemptiveScheduling(processes));
        break;
      case 'SJF-NonPreemptive':
        setResults(sjfNonPreemptiveScheduling(processes));
        break;
      case 'RoundRobin':
        setResults(roundRobinScheduling(processes));
        break;
      case 'Priority':
        setResults(priorityScheduling(processes));
        break;
      default:
        break;
    }
  };

  return (
    <div className="App">
      <h1>Process Scheduling</h1>
      <div>
        <label>Select Scheduling Algorithm:</label>
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <option value="FCFS">FCFS</option>
          <option value="SJF-Preemptive">Shortest Job First (Preemptive)</option>
          <option value="SJF-NonPreemptive">Shortest Job First (Non-Preemptive)</option>
          <option value="RoundRobin">Round Robin</option>
          <option value="Priority">Priority Scheduling</option>
        </select>
      </div>

      <div>
        <button onClick={handleAddProcess}>Add Process</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            {algorithm === 'Priority' && <th>Priority</th>}
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>{process.id}</td>
              <td>
                <input
                  type="number"
                  value={process.arrival}
                  onChange={(e) => handleInputChange(index, 'arrival', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={process.burst}
                  onChange={(e) => handleInputChange(index, 'burst', e.target.value)}
                />
              </td>
              {algorithm === 'Priority' && (
                <td>
                  <input
                    type="number"
                    value={process.priority}
                    onChange={(e) => handleInputChange(index, 'priority', e.target.value)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleCalculate}>Calculate</button>

      <div>
        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th>Process ID</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Waiting Time</th>
              <th>Turnaround Time</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.id}</td>
                <td>{result.start}</td>
                <td>{result.end}</td>
                <td>{result.waiting}</td>
                <td>{result.turnaround}</td>
                <td>{result.response}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Displaying averages */}
        {results.length > 0 && (
          <div>
            <h3>Average Times</h3>
            <p>Average Turnaround Time: {(
              results.reduce((sum, result) => sum + result.turnaround, 0) / results.length
            ).toFixed(2)}</p>
            <p>Average Waiting Time: {(
              results.reduce((sum, result) => sum + result.waiting, 0) / results.length
            ).toFixed(2)}</p>
            <p>Average Response Time: {(
              results.reduce((sum, result) => sum + result.response, 0) / results.length
            ).toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Algorithm implementations
const fcfsScheduling = (processes) => {
  const sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
  let currentTime = 0;
  const results = [];

  sortedProcesses.forEach((process) => {
    const start = Math.max(currentTime, process.arrival);
    const end = start + process.burst;
    const waiting = start - process.arrival;
    const turnaround = end - process.arrival;
    const response = start - process.arrival; // Response time

    results.push({
      id: process.id,
      start,
      end,
      waiting,
      turnaround,
      response, // Include response time
    });

    currentTime = end;
  });

  return results;
};

const sjfPreemptiveScheduling = (processes) => {
  const sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
  const results = [];
  const remainingBurst = {};
  let currentTime = 0;
  let completed = 0;

  sortedProcesses.forEach((p) => {
    remainingBurst[p.id] = p.burst;
  });

  while (completed < processes.length) {
    const availableProcesses = sortedProcesses.filter(
      (p) => p.arrival <= currentTime && remainingBurst[p.id] > 0
    );

    if (availableProcesses.length === 0) {
      currentTime++;
      continue;
    }

    const shortest = availableProcesses.reduce((a, b) =>
      remainingBurst[a.id] < remainingBurst[b.id] ? a : b
    );

    remainingBurst[shortest.id]--;
    currentTime++;

    if (remainingBurst[shortest.id] === 0) {
      const end = currentTime;
      const start = end - shortest.burst;
      const waiting = start - shortest.arrival;
      const turnaround = end - shortest.arrival;
      const response = start - shortest.arrival;

      results.push({
        id: shortest.id,
        start,
        end,
        waiting,
        turnaround,
        response, // Include response time
      });

      completed++;
    }
  }

  return results;
};

const sjfNonPreemptiveScheduling = (processes) => {
  const sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
  let currentTime = 0;
  const results = [];

  while (sortedProcesses.length > 0) {
    // Filter available processes that have arrived by the current time
    const availableProcesses = sortedProcesses.filter((p) => p.arrival <= currentTime);

    if (availableProcesses.length === 0) {
      // If no processes are available, increment time and check again
      currentTime++;
      continue;
    }

    // Select the process with the shortest burst time
    const shortest = availableProcesses.reduce((a, b) => (a.burst < b.burst ? a : b));

    // Calculate the start and end times
    const start = Math.max(currentTime, shortest.arrival);
    const end = start + shortest.burst;
    const waiting = start - shortest.arrival;
    const turnaround = end - shortest.arrival;
    const response = start - shortest.arrival;

    // Store the result for the current process
    results.push({
      id: shortest.id,
      start,
      end,
      waiting,
      turnaround,
      response, // Include response time
    });

    // Update current time
    currentTime = end;

    // Remove the selected process from the list of sorted processes
    sortedProcesses.splice(sortedProcesses.indexOf(shortest), 1);
  }

  return results;
};


const roundRobinScheduling = (processes) => {
  const quantum = 2; // Set a quantum time
  const queue = [...processes];
  const results = [];
  const remainingBurst = {};
  let currentTime = 0;

  queue.forEach((p) => {
    remainingBurst[p.id] = p.burst;
  });

  while (queue.length > 0) {
    const process = queue.shift();

    const executionTime = Math.min(quantum, remainingBurst[process.id]);
    const start = currentTime;
    const end = currentTime + executionTime;

    remainingBurst[process.id] -= executionTime;
    currentTime = end;

    if (remainingBurst[process.id] === 0) {
      const waiting = start - process.arrival;
      const turnaround = end - process.arrival;
      const response = start - process.arrival;

      results.push({
        id: process.id,
        start,
        end,
        waiting,
        turnaround,
        response, // Include response time
      });
    } else {
      queue.push({ ...process, arrival: currentTime });
    }
  }

  return results;
};

const priorityScheduling = (processes) => {
  const sortedProcesses = [...processes].sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
  let currentTime = 0;
  const results = [];

  sortedProcesses.forEach((process) => {
    const start = Math.max(currentTime, process.arrival);
    const end = start + process.burst;
    const waiting = start - process.arrival;
    const turnaround = end - process.arrival;
    const response = start - process.arrival;

    results.push({
      id: process.id,
      start,
      end,
      waiting,
      turnaround,
      response, // Include response time
    });

    currentTime = end;
  });

  return results;
};

export default App;
