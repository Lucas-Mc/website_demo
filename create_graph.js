// Simple demo to plot sample ECG data
// Lucas McCullum
// MIT-LCP
// 2020

// Determine how to generate the plot
function initPlot() {
    records = document.getElementsByClassName('input_file');
    annotations = document.getElementById('annotations').checked;
    signal_files = [];
    input_files = [];
    github_filepath = '/website_demo/data/';
    for (var i = 0; i < records.length; i++) {
        if (document.getElementById(records[i].id).checked) {
            input_files.push(github_filepath + records[i].value);
            signal_files.push(github_filepath + records[i].value);
            end_string = records[i].value.slice(-5)
            // Select the desired input file
            if (annotations) {
                input_files.push(github_filepath + records[i].value.split('_')[0] + '_ann' + end_string);
            }
        }
    }
    // Clear the plots if none are selected
    if (input_files.length == 0) {
        document.getElementById('chart').innerHTML = '';
    }
    all_results = [];
    data = [];
    shapes = [];
    // Call the data-parser so it can create the graph
    parseData(createGraph);
}

function parseData(createGraph) {
    // Read the input CSV files
    for (var k = 0; k < input_files.length; k++) {
        Papa.parse(input_files[k], {
            download: true,
            complete: function(results) {
                all_results.push(results);
                if (all_results.length == input_files.length) {
                    createGraph(all_results)
                }
            }
        });
    }
}

function createGraph(all_results) {

    var n_sigs = all_results.map(
        function(element) { return element.data[0][0]; }
    );
    var n_sigs = n_sigs.reduce(function(p,c) {
        if (c === "Signal")
           p++;
        return p;
    },0);
    // The starting line number of actual data in the CSV
    const start_at = 1;
    var temp_data = [];
    // Set some initial conditions
    const grid_delta_minor = 0.04
    const grid_delta_major = 0.2
    const fs = {
        'demo_ecg1': 250,
        'demo_ecg2': 250
    }
    const sig_names = {
        'demo_ecg1': 'II',
        'demo_ecg2': 'V'
    }
    const units = {
        'demo_ecg1': 'mV',
        'demo_ecg2': 'mV'
    }
    var layout = {
        // Dynamically determine the HTML figure size
        height: 250 + n_sigs*250,
        title: 'Sample ECG Data',
        grid: {
            rows: n_sigs,
            columns: 1,
            pattern: 'independent'
        },
        showlegend: false
    };

    sig_num = 0;
    for (var i = 0; i < all_results.length; i++) {
        // Pre-allocate some variables for later use
        index = [];
        signal = [];
        input_data = all_results[i].data;
        // Determine what kind of signal to plot
        plot_type = input_data[0][0];
        if (plot_type == 'Signal') {
            // Name the axes to create the subplots
            x_string = 'x' + (sig_num+1).toString();
            y_string = 'y' + (sig_num+1).toString();
            x_axis = 'xaxis' + (sig_num+1).toString();
            y_axis = 'yaxis' + (sig_num+1).toString();
            // Plot the signal
            for (var j = start_at; j < input_data.length; j++) {
                // Determine which signal to use
                record_file = signal_files[sig_num].split('/')[2];
                record_name = record_file.substring(0, record_file.length-4);
                // Determine the time and value of the signal
                index.push(j / fs[record_name]);
                signal.push(input_data[j][0]);
                // Create the signal to plot
                var trace = {
                    x: index,
                    y: signal,
                    xaxis: x_string,
                    yaxis: y_string,
                    row: sig_num+1,
                    column: 1,
                    type: 'scatter',
                    line: {
                        color: 'black',
                        width: 3
                    },
                    name: sig_names[record_name]
                };
            }
            // Append the signal to temp data for analysis
            temp_data.push(trace);
            // Determine the bounds of the signal to draw the ECG grid
            x_max = Math.ceil(Math.max(...temp_data[sig_num].x)/grid_delta_minor)
            y_min = Math.floor(Math.min(...temp_data[sig_num].y)/grid_delta_minor)-1
            y_max = Math.ceil(Math.max(...temp_data[sig_num].y)/grid_delta_minor)+1
            // Create the minor grids going horizontally (every 0.04 seconds)
            for (var j = y_min; j < y_max; j++) {
                shapes.push({
                    type:'rect',
                    layer: 'below',
                    xref: x_string,
                    yref: y_string,
                    x0: 0,
                    x1: x_max*grid_delta_minor,
                    y0: 0+(j*grid_delta_minor),
                    y1: grid_delta_minor+(j*grid_delta_minor),
                    line: {
                        color: 'rgb(255, 212, 212)',
                        width: 1
                    }
                })
            }
            // Create the minor grids going vertically (every grid_delta_minor seconds)
            for (var j = 0; j < x_max; j++) {
                shapes.push({
                    type:'rect',
                    layer: 'below',
                    xref: x_string,
                    yref: y_string,
                    x0: 0+(j*grid_delta_minor),
                    x1: grid_delta_minor+(j*grid_delta_minor),
                    y0: y_min*grid_delta_minor,
                    y1: y_max*grid_delta_minor,
                    line: {
                        color: 'rgb(255, 212, 212)',
                        width: 1
                    }
                })
            }
            // Determine the major grid lines (every grid_delta_major seconds)
            layout[x_axis] = {
                title: 'Time (s)',
                dtick: grid_delta_major,
                gridcolor: 'rgb(255, 60, 60)',
                gridwidth: 1
            }
            layout[y_axis] = {
                title: sig_names[record_name] + ' (' + units[record_name] + ')',
                fixedrange: true,
                dtick: grid_delta_major,
                gridcolor: 'rgb(255, 60, 60)',
                gridwidth: 1
            }
            // Append the temp data to the final data
            data.push(temp_data);
            sig_num += 1;
        } else {
            // Create the annotations if requested
            for (var j = start_at; j < input_data.length; j++) {
                // Determine the time and value of the annotation
                shapes.push({
                    type:'rect',
                    layer: 'above',
                    fill: 'toself',
                    fillcolor: 'rgb(0, 0, 255)',
                    xref: x_string,
                    yref: y_string,
                    x0: parseFloat(input_data[j][0]),
                    x1: parseFloat(input_data[j][0])+0.001,
                    y0: y_min*grid_delta_minor,
                    y1: y_max*grid_delta_minor,
                    line: {
                        color: 'rgb(0, 0, 255)',
                        width: 1,
                    }
                })
            }
        }
    }
    // Add the gridlines
    layout['shapes'] = shapes;
    // Plot the final signal with the desired layout
    Plotly.newPlot("chart", data[0], layout); 
}
