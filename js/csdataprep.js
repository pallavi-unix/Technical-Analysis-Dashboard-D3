// Function to parse and transform dataset entries to appropriate formats and types.
function genType(d) {
  // Parse and format the date from the dataset.
  d.TIMESTAMP  = parseDate(d.Date);
   // Convert string representations of financial data to numbers.
  d.LOW        = +d.Low;
  d.HIGH       = +d.High; 
  d.OPEN       = +d.Open;
  d.CLOSE      = +d.Close;
  // Use D3 to parse the date according to a specified format.
  d.Date= d3.timeParse("%Y-%m-%d")(d.Date);
   // Parse additional adjusted close value and volume.
  d.AdjClose= +d["Adj Close"];
  d.Volume =  +d.Volume;
  // Return the transformed object.
  return d;
}


// Function to align dates to the start of their respective time interval (e.g., week, month).
function timeCompare(date, interval) {
  // Align date to the start of the week.
  if (interval === "week") {
    return d3.timeMonday(date);
    // Align date to the start of the month.
  } else if (interval === "month") {
    return d3.timeMonth(date);
    // Align date to the start of the quarter.
  } else if (interval === "quarter") {
    var quarterStart = d3.timeMonth(date);
    quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3);
    return quarterStart;
     // Default case aligns to the start of the day.
  } else {
    return d3.timeDay(date);
  }
}


// Function to aggregate data based on a specific time interval.
function dataCompress(data, interval) {
  // Group data by the computed start of the interval using the 'timeCompare' function.
  var nestedData = d3.group(data, function(d) {
    return timeCompare(d.TIMESTAMP, interval);
  });

  // Transform groups into a compressed format, keeping key metrics from the group.
  var compressedData = Array.from(nestedData, function([key, values]) {
    // Aggregate values to create a summary for each interval.
    var rollupResult = {
      TIMESTAMP: timeCompare(values[values.length - 1].TIMESTAMP, interval),// Use the last TIMESTAMP of the interval.
      OPEN: values[0].OPEN, // Use the OPEN value of the first entry in the interval.
      LOW: d3.min(values, function(d) { return d.LOW; }), // Get the minimum LOW value in the interval.
      HIGH: d3.max(values, function(d) { return d.HIGH; }), // Get the maximum HIGH value in the interval.
      CLOSE: values[values.length - 1].CLOSE,// Use the CLOSE value of the last entry in the interval.
    };
    
    // Return the summary object for the interval.
    return rollupResult;
  });

  // Return the array of compressed data summaries.
  return compressedData;
}

