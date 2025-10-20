// Với trang Dashboard, logic chủ yếu là khởi tạo các thư viện.
// Việc dùng jQuery hay JS thuần không khác biệt nhiều.
// Dưới đây là ví dụ sử dụng jQuery selector, nhưng phần lõi vẫn là của thư viện ApexCharts.
$(document).ready(function () {

    // --- KHỞI TẠO BIỂU ĐỒ DOANH THU ---
    const $revenueChart = $('#revenueChart');

    if ($revenueChart.length) { // .length > 0 để kiểm tra element có tồn tại không
        const revenueChartOptions = {
            series: [{
                name: 'Doanh thu (triệu VND)',
                data: [18, 7, 15, 29, 18, 12, 9, 25, 17, 10, 14, 22]
            }],
            chart: {
                height: 350,
                type: 'area',
                toolbar: { show: false }
            },
            // Các cấu hình khác giữ nguyên như bản vanilla.js
            // ...
            xaxis: {
                categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            },
            colors: ['#696cff'],
        };
        
        // $revenueChart[0] để lấy ra DOM element gốc từ đối tượng jQuery
        const revenueChart = new ApexCharts($revenueChart[0], revenueChartOptions);
        revenueChart.render();
    }
});