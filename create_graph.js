/* Insert Documentation Here
 *
 */
// input_files = ["2013_December.csv","2013_November.csv"];
input_file = "demo_ecg.csv";

// For single file
function parseData(createGraph) {

    Papa.parse(input_file, {
        download: true,
        complete: function(results) {
            console.log("Done");
            createGraph(results.data)
        }
    });
}

// For single file
function createGraph(data) {
    // Line Plot.. start at line 10 (start of actual data in the CSV)
    start_at = 0; //10;
    index = [];
    //wind_speed = [];
    signal = [];

    for (var i = start_at; i < data.length; i++) {
        
        //index.push(data[i][1]);
        fs = 250;
        index.push(i / fs);
        //wind_speed.push(data[i][7]);
        signal.push(data[i][0]);
        
        var trace = {
            x: index,
            y: signal, //wind_speed,
            type: "scatter"

        };  
    }

    data = [trace];
    layout = {
        height: 600,
        title: 'Sample ECG Data',
        xaxis: {
            title: 'Time (s)',
            rangeslider: {}
        },
        yaxis: {
            title: 'Electric Potential (mV)',
            fixedrange: true
        }
    };
    Plotly.newPlot("chart", data, layout); 

}

parseData(createGraph)
