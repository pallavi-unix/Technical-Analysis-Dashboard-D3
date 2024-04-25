function genType(d) {

 
  d.TIMESTAMP  = parseDate(d.Date);
  d.LOW        = +d.Low;
  d.HIGH       = +d.High; 
  d.OPEN       = +d.Open;
  d.CLOSE      = +d.Close;
  d.Date= d3.timeParse("%Y-%m-%d")(d.Date);
  d.AdjClose= +d["Adj Close"];
  d.Volume =  +d.Volume;


  return d;
}



function timeCompare(date, interval) {
  if (interval === "week") {
    return d3.timeMonday(date);
  } else if (interval === "month") {
    return d3.timeMonth(date);
  } else if (interval === "quarter") {
    // Calculate the start of the quarter
    var quarterStart = d3.timeMonth(date);
    quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3);
    return quarterStart;
  } else {
    return d3.timeDay(date);
  }
}



function dataCompress(data, interval) {


  var nestedData = d3.group(data, function(d) {
    return timeCompare(d.TIMESTAMP, interval);
  });
  var compressedData = Array.from(nestedData, function([key, values]) {
    var rollupResult = {
      TIMESTAMP: timeCompare(values[values.length - 1].TIMESTAMP, interval),
      OPEN: values[0].OPEN,
      LOW: d3.min(values, function(d) { return d.LOW; }),
      HIGH: d3.max(values, function(d) { return d.HIGH; }),
      CLOSE: values[values.length - 1].CLOSE,
    };
    
    return rollupResult;
  });

  

  return compressedData;
}

