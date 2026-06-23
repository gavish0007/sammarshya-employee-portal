const ctx = document.getElementById('attendanceChart');

new Chart(ctx, {
    type: 'bar',

    data: {

        labels: [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
        ],

        datasets: [{

            label: 'Hours Worked',

            data: [
                8,
                7.5,
                8.5,
                9,
                8,
                6
            ],

            borderRadius: 12,

            backgroundColor: [
                '#4A7DFF',
                '#55D6FF',
                '#4A7DFF',
                '#55D6FF',
                '#4A7DFF',
                '#E23A8E'
            ]

        }]
    },

    options: {

        responsive: true,

        plugins: {

            legend: {
                display: false
            }
        },

        scales: {

            y: {

                beginAtZero: true,

                max: 10,

                grid: {
                    color: '#EEF2F7'
                }
            },

            x: {

                grid: {
                    display: false
                }
            }
        }
    }
});