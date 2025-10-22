$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    // Dữ liệu mẫu ban đầu (Backend sẽ cung cấp)
    let currentRentals = [
        { id: 1, customer: { name: 'Trần Văn An', phone: '0905123456' }, bike: 'Vitus Substance 2', total: 120000, date: '2025-10-20', status: 'Đã hoàn thành' },
        { id: 2, customer: { name: 'Nguyễn Thị Bình', phone: '0913654321' }, bike: 'Giant Contend 3', total: 225000, date: '2025-10-20', status: 'Đang thuê' },
        { id: 3, customer: { name: 'Lê Minh Cường', phone: '0988789123' }, bike: 'Specialized Diverge', total: 65000, date: '2025-10-19', status: 'Đã hoàn thành' },
        { id: 4, customer: { name: 'Phạm Thuỳ Dung', phone: '0935111222' }, bike: 'Trek Domane AL 2', total: 50000, date: '2025-10-19', status: 'Đã hủy' },
        { id: 5, customer: { name: 'Hoàng Văn Em', phone: '0977333444' }, bike: 'Cannondale Topstone', total: 186000, date: '2025-10-18', status: 'Đã hoàn thành' },
        { id: 6, customer: { name: 'Trần Văn An', phone: '0905123456' }, bike: 'Vitus Substance 2', total: 120000, date: '2025-10-20', status: 'Đã hoàn thành' },
        { id: 7, customer: { name: 'Nguyễn Thị Bình', phone: '0913654321' }, bike: 'Giant Contend 3', total: 225000, date: '2025-10-20', status: 'Đang thuê' },
        { id: 8, customer: { name: 'Lê Minh Cường', phone: '0988789123' }, bike: 'Specialized Diverge', total: 65000, date: '2025-10-19', status: 'Đã hoàn thành' },
        { id: 9, customer: { name: 'Phạm Thuỳ Dung', phone: '0935111222' }, bike: 'Trek Domane AL 2', total: 50000, date: '2025-10-19', status: 'Đã hủy' },
        { id: 10, customer: { name: 'Hoàng Văn Em', phone: '0977333444' }, bike: 'Cannondale Topstone', total: 186000, date: '2025-10-18', status: 'Đã hoàn thành' },
    ];

    // Lựa chọn các element
    const $tableBody = $('#rental-table-body');
    const $pagination = $('#pagination');
    const $searchInput = $('#searchOrderId'); // Tìm theo Mã đơn/Tên KH
    const $statusFilter = $('#filterStatus');
    const $dateFilter = $('#filterDate');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 5; // Số dòng mỗi trang (Backend quyết định)
    // Sort (Nếu cần thêm sort cho bảng này)
    // let sortColumn = 'id';
    // let sortDirection = 'asc';

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
    function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
    function showToast(message, isSuccess = true) { /* ... (Giống các file js khác) ... */ }

    // Hàm lấy badge trạng thái đơn thuê
    function getStatusBadge(status) {
        if (status === 'Đã hoàn thành') return `<span class="badge bg-label-success">${status}</span>`;
        if (status === 'Đang thuê') return `<span class="badge bg-label-info">${status}</span>`;
        if (status === 'Đã hủy') return `<span class="badge bg-label-danger">${status}</span>`;
        return `<span class="badge bg-label-secondary">${status}</span>`;
    }

    // Hàm render bảng (KHÔNG LỌC/SẮP XẾP)
    function renderTable(rentalsData) {
        $tableBody.empty(); // Xóa trạng thái loading/dữ liệu cũ

        if (!rentalsData || rentalsData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterStatus = $statusFilter.val();
            const filterDate = $dateFilter.val();
            let message = 'Chưa có đơn thuê nào.';
            if(searchTerm || filterStatus || filterDate) {
                message = 'Không tìm thấy đơn thuê phù hợp.';
            }
            $tableBody.append(`
                <tr>
                    <td colspan="7"> <div class="empty-state">
                            <i class='bx bx-file-blank'></i>
                            <p>${message}</p>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        $.each(rentalsData, function(i, rental) {
            const rowHTML = `
                <tr>
                    <td><strong>#${rental.id}</strong></td>
                    <td>
                        <div>${rental.customer.name}</div>
                        <small class="text-muted">${rental.customer.phone}</small>
                    </td>
                    <td>${rental.bike}</td>
                    <td>${formatCurrency(rental.total)}</td>
                    <td>${rental.date}</td>
                    <td>${getStatusBadge(rental.status)}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown" aria-expanded="false"><i class="bx bx-dots-vertical-rounded"></i></button>
                            <div class="dropdown-menu dropdown-menu-end" style="">
                                <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-show me-1"></i> Xem chi tiết</a>
                                <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-check-circle me-1"></i> Hoàn thành</a>
                                <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-x-circle me-1"></i> Hủy đơn</a>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            $tableBody.append(rowHTML);
        });

        // Kích hoạt Tooltip nếu có
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) { return new bootstrap.Tooltip(tooltipTriggerEl); });
    }

    // Hàm render phân trang (Giả sử backend trả về tổng số trang)
    function setupPagination(totalPages = 1) {
        $pagination.empty();
        if (totalPages <= 1) return;
        for (let i = 1; i <= totalPages; i++) {
            $pagination.append(`<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`);
        }
     }

    // === HÀM GỌI API (GIẢ LẬP) ===
    function fetchDataFromBackend() {
        // Hiển thị trạng thái loading
        $tableBody.html(`
            <tr>
                <td colspan="7">
                    <div class="text-center p-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
                        <span class="ms-2">Đang tải dữ liệu đơn thuê...</span>
                    </div>
                </td>
            </tr>
        `);
        $pagination.empty();

        // Lấy giá trị tìm kiếm, lọc, phân trang từ UI state
        const searchTerm = $searchInput.val();
        const filterStatus = $statusFilter.val();
        const filterDate = $dateFilter.val();
        const page = currentPage;
        const limit = recordsPerPage;
        // const sortBy = sortColumn; // Nếu có sort
        // const sortDir = sortDirection; // Nếu có sort

        console.log("FRONTEND (Rental): Gửi yêu cầu đến Backend:", { searchTerm, filterStatus, filterDate, page, limit });

        // ---- GIẢ LẬP GỌI API (setTimeout) ----
        setTimeout(() => {
            // Logic lọc MẪU (Backend sẽ làm thật)
            let filtered = currentRentals.filter(r =>
                (r.id.toString().includes(searchTerm) || r.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterStatus || r.status === filterStatus) &&
                (!filterDate || r.date === filterDate)
            );
            // Thêm logic sort nếu có
            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { rentals: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Rental): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderTable(responseData.rentals);
            setupPagination(responseData.totalPages);
            // updateSortIcons(); // Nếu có sort
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
    $statusFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    $dateFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    // Thêm sự kiện sort nếu có
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

    // === CÁC SỰ KIỆN KHÁC (NẾU CÓ) ===
    // Ví dụ: Click nút "Hủy đơn" -> Mở modal xác nhận hủy
    // $tableBody.on('click', '.btn-cancel', function() { ... });

    // Xử lý nút Sáng/Tối (giữ nguyên)
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... (logic đổi class) ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});