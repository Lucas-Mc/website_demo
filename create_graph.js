// Simple demo to plot sample ECG data
// Lucas McCullum
// MIT-LCP
// 2020

// Select the desired input file
input_files = ['demo_ecg1.csv', 'demo_ecg2.csv'];
all_results = [];
data = [];
shapes = [];

function parseData(createGraph) {
    // Read the input CSV files
    for (var k = 0; k < input_files.length; k++) {
        Papa.parse(input_files[k], {
            download: true,
            complete: function(results) {
                all_results.push(results);
                if (all_results.length == input_files.length) {
                    console.log('Done');
                    createGraph(all_results)
                }
            }
        });
    }
}

function createGraph(all_results) {
    // The starting line number of actual data in the CSV
    start_at = 0;
    temp_data = [];
    // Set some initial conditions
    grid_delta_minor = 0.04
    grid_delta_major = 0.2
    fs = [250, 250];
    sig_names = ['II', 'V'];
    units = ['mV', 'mV'];
    layout = {
        // Dynamically determine the HTML figure size
        height: 250 + all_results.length*250,
        title: 'Sample ECG Data',
        grid: {
            rows: input_files.length,
            columns: 1,
            pattern: 'independent'
        },
        showlegend: false
    };

    for (var i = 0; i < all_results.length; i++) {

        index = [];
        signal = [];
        input_data = all_results[i].data;
        // Name the axes to create the subplots
        x_string = 'x' + (i+1).toString();
        y_string = 'y' + (i+1).toString();
        x_axis = 'xaxis' + (i+1).toString();
        y_axis = 'yaxis' + (i+1).toString();

        for (var j = start_at; j < input_data.length; j++) {
            // Determine the time and value of the signal
            index.push(j / fs[i]);
            signal.push(input_data[j][0]);
            // Create the signal to plot
            var trace = {
                x: index,
                y: signal,
                xaxis: x_string,
                yaxis: y_string,
                row: i+1,
                column: 1,
                type: 'scatter',
                line: {
                    color: 'black',
                    width: 3
                },
                name: sig_names[i]
            };
        }
        // Append the signal to temp data for analysis
        temp_data.push(trace);
        // Determine the bounds of the signal to draw the ECG grid
        x_max = Math.ceil(Math.max(...temp_data[i].x)/grid_delta_minor)
        y_min = Math.floor(Math.min(...temp_data[i].y)/grid_delta_minor)-1
        y_max = Math.ceil(Math.max(...temp_data[i].y)/grid_delta_minor)+1
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
            title: sig_names[i] + ' (' + units[i] + ')',
            fixedrange: true,
            dtick: grid_delta_major,
            gridcolor: 'rgb(255, 60, 60)',
            gridwidth: 1
        }
        // Append the temp data to the final data
        data.push(temp_data);
    }
    // Add the gridlines
    layout['shapes'] = shapes;
    // Plot the final signal with the desired layout
    Plotly.newPlot("chart", data[0], layout); 
}
// Call the data-parser so it can create the graph
parseData(createGraph)
