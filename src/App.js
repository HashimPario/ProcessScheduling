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
      case 'SJF-NonPreemptive':
        setResults(sjfNonPreemptiveScheduling(processes));
        break;
      case 'Priority':
        setResults(priorityPreemptiveScheduling(processes)); // Use priorityPreemptiveScheduling here
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
          <option value="SJF-NonPreemptive">Shortest Job First (Non-Preemptive)</option>
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


const priorityPreemptiveScheduling = (processes) => {
  // Sort processes by arrival time first
  const sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
  let currentTime = 0;
  const results = [];
  const remainingBurst = {};
  const startTimes = {};

  // Initialize remaining burst times
  sortedProcesses.forEach((process) => {
    remainingBurst[process.id] = process.burst;
  });

  while (sortedProcesses.length > 0) {
    // Filter processes that have arrived and not yet completed
    const availableProcesses = sortedProcesses.filter(
      (p) => p.arrival <= currentTime && remainingBurst[p.id] > 0
    );

    if (availableProcesses.length === 0) {
      currentTime++;
      continue;
    }

    // Select the process with the highest priority (higher number means higher priority)
    const highestPriorityProcess = availableProcesses.reduce((a, b) =>
      a.priority > b.priority ? a : b
    );

    // Set start time if it's the first time the process is being executed
    if (!(highestPriorityProcess.id in startTimes)) {
      startTimes[highestPriorityProcess.id] = currentTime;
    }

    // Execute the process for 1 unit of time (preemptive)
    remainingBurst[highestPriorityProcess.id]--;
    currentTime++;

    // If the process is completed
    if (remainingBurst[highestPriorityProcess.id] === 0) {
      const end = currentTime;
      const turnaround = end - highestPriorityProcess.arrival;
      const waiting = turnaround - highestPriorityProcess.burst;
      const response = startTimes[highestPriorityProcess.id] - highestPriorityProcess.arrival;

      results.push({
        id: highestPriorityProcess.id,
        start: startTimes[highestPriorityProcess.id],
        end,
        waiting,
        turnaround,
        response,
      });

      // Remove the process from the list as it is completed
      sortedProcesses.splice(sortedProcesses.indexOf(highestPriorityProcess), 1);
    }
  }

  return results;
};

export default App;

