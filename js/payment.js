$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    let currentPayments = [ // Dữ liệu mẫu (Backend cung cấp)
        { id: 101, orderId: '#12345', method: 'cash', amount: 120000, paymentDate: '2025-10-20 10:30:00' },
        { id: 102, orderId: '#12346', method: 'transfer', amount: 225000, paymentDate: '2025-10-20 11:15:00' },
        { id: 103, orderId: '#12347', method: 'cash', amount: 65000, paymentDate: '2025-10-19 15:00:00' },
        { id: 104, orderId: '#12349', method: 'transfer', amount: 186000, paymentDate: '2025-10-18 09:45:00' },
        // Thêm dữ liệu để test
    ];

    // Lựa chọn các element
    const $tableBody = $('#payment-table-body');
    const $pagination = $('#pagination');
    const $modalEl = $('#paymentModal'); // Modal Thêm/Sửa (nếu dùng)
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#payment-form');
    const $modalTitle = $('#paymentModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal');
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $nameToDeleteEl = $('#promo-name-to-delete');
    const $idToDeleteInput = $('#promo-id-to-delete');
    const $searchInput = $('#search-payment'); // Tìm theo Mã đơn
    const $methodFilter = $('#filter-payment-method'); // Lọc Phương thức
    const $dateFilter = $('#filter-payment-date'); // Lọc Ngày
    const $tableHeaders = $('thead th.sortable'); // Header sắp xếp

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 10;
    let sortColumn = 'paymentDate'; // Sắp xếp mặc định theo ngày
    let sortDirection = 'desc'; // Mới nhất lên đầu

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
     function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
     function showToast(message, isSuccess = true) { /* ... */ }
     function updateSortIcons() { /* ... */ }

     // Hàm lấy icon và text cho phương thức thanh toán
     function getPaymentMethodDisplay(method) {
        switch(method.toLowerCase()) {
            case 'cash':
                return `<i class='bx bxs-dollar-circle text-success payment-method-icon'></i> Tiền mặt`;
            case 'transfer':
                return `<i class='bx bxs-bank text-info payment-method-icon'></i> Chuyển khoản`;
            // Thêm case khác nếu có
            default:
                return `<i class='bx bx-credit-card text-secondary payment-method-icon'></i> ${method}`; // Hiển thị text gốc nếu không khớp
        }
     }

      // Hàm định dạng ngày giờ (nếu cần)
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return '-';
        try {
            const date = new Date(dateTimeString);
            // Lấy ngày/tháng/năm giờ:phút
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (e) {
            return dateTimeString; // Trả về chuỗi gốc nếu không parse được
        }
    }


    // Hàm render bảng thanh toán
    function renderTable(paymentsData) {
        $tableBody.empty();

        if (!paymentsData || paymentsData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterMethod = $methodFilter.val();
            const filterDate = $dateFilter.val();
            let message = 'Chưa có giao dịch thanh toán nào.';
            if(searchTerm || filterMethod || filterDate) { message = 'Không tìm thấy thanh toán phù hợp.'; }
            $tableBody.html(`<tr><td colspan="6"><div class="empty-state"><i class='bx bx-data'></i><p>${message}</p></div></td></tr>`);
            return;
        }

        $.each(paymentsData, function(i, payment) {
            const rowHTML = `
                <tr>
                    <td><strong>#${payment.id}</strong></td>
                    <td>${payment.orderId || '-'}</td>
                    <td>${getPaymentMethodDisplay(payment.method)}</td>
                    <td class="fw-semibold">${formatCurrency(payment.amount || 0)}</td>
                    <td>${formatDateTime(payment.paymentDate)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-icon btn-outline-info btn-view-order" data-order-id="${payment.orderId}" data-bs-toggle="tooltip" title="Xem đơn hàng ${payment.orderId}">
                                <i class="bx bx-receipt"></i>
                            </button>
                            </div>
                    </td>
                </tr>
            `;
            $tableBody.append(rowHTML);
        });

        // Kích hoạt Tooltip
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) { return new bootstrap.Tooltip(tooltipTriggerEl); });
    }

    // Hàm render phân trang
    function setupPagination(totalPages = 1) { /* ... (Giống promotion.js) ... */ }

    // === HÀM GỌI API (GIẢ LẬP) ===
    function fetchDataFromBackend() {
        $tableBody.html(`<tr><td colspan="6"><div class="text-center p-3"><div class="spinner-border text-primary spinner-border-sm"></div><span class="ms-2">Đang tải...</span></div></td></tr>`);
        $pagination.empty();

        const searchTerm = $searchInput.val(); // Tìm theo Mã đơn
        const filterMethod = $methodFilter.val();
        const filterDate = $dateFilter.val();
        const page = currentPage;
        const limit = recordsPerPage;
        const sortBy = sortColumn;
        const sortDir = sortDirection;

        console.log("FRONTEND (Payment): Gửi yêu cầu đến Backend:", { searchTerm, filterMethod, filterDate, page, limit, sortBy, sortDir });

        // ---- GIẢ LẬP GỌI API ----
        setTimeout(() => {
            // Logic lọc/sắp xếp MẪU (Backend làm thật)
            let filtered = currentPayments.filter(p =>
                (!searchTerm || p.orderId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterMethod || p.method === filterMethod) &&
                (!filterDate || p.paymentDate.startsWith(filterDate)) // Lọc theo ngày (YYYY-MM-DD)
            );
            filtered.sort((a, b) => { /* Logic sort theo amount hoặc paymentDate */
                let valA = a[sortBy]; let valB = b[sortBy];
                if (sortBy === 'paymentDate') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { payments: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Payment): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderTable(responseData.payments);
            setupPagination(responseData.totalPages);
            updateSortIcons();
        }, 500);
    }
    // =============================

    /**
     * ==================================
     * GẮN CÁC SỰ KIỆN
     * ==================================
     */

    // --- SỰ KIỆN KÍCH HOẠT GỌI API ---
    let searchTimeout;
    $searchInput.on('input', function() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage = 1; fetchDataFromBackend(); }, 500); });
    $methodFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    $dateFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    $tableHeaders.on('click', function() {
        const clickedColumn = $(this).data('column'); if (!clickedColumn) return;
        if (sortColumn === clickedColumn) { sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; }
        else { sortColumn = clickedColumn; sortDirection = 'asc'; }
        currentPage = 1; fetchDataFromBackend();
    });
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

     // --- SỰ KIỆN CHO CÁC HÀNH ĐỘNG (NẾU CÓ) ---

     // Click nút "Thêm mới" (nếu bật)
    // $('#add-payment-btn').on('click', function() { /* ... mở modal thêm ... */ });

     // Click nút "Xem đơn hàng" (chuyển hướng hoặc mở modal chi tiết đơn)
     $tableBody.on('click', '.btn-view-order', function() {
        const orderId = $(this).data('order-id');
        if (orderId) {
            console.log("Chuyển đến trang chi tiết đơn hàng:", orderId);
            // Ví dụ chuyển hướng:
            // window.location.href = `rental-detail.html?orderId=${orderId.replace('#','')}`;
            alert("Sẽ chuyển đến trang chi tiết đơn hàng: " + orderId);
        }
     });

    // Click nút "Sửa" (nếu bật)
    // $tableBody.on('click', '.btn-edit', function() { /* ... mở modal sửa ... */ });

    // Submit Form Thêm/Sửa (nếu bật)
    // $modalForm.on('submit', function(e) { /* ... gọi API thêm/sửa, tải lại ... */ });

    // Click nút "Xóa" (nếu bật)
    // $tableBody.on('click', '.btn-delete', function() { /* ... mở modal xác nhận ... */ });

    // Click "Xác nhận xóa" (nếu bật)
    // $('#confirm-delete-btn').on('click', function() { /* ... gọi API xóa, tải lại ... */ });


    // Xử lý nút Sáng/Tối
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});