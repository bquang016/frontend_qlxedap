$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    // Dữ liệu này chỉ để hiển thị mẫu ban đầu, backend sẽ cung cấp dữ liệu thật
    let currentPromotions = [
        { id: 1, name: "Giảm giá Chào hè", code: "GIAMGIA10", type: "percentage", value: 10, expiry: "2025-12-31", status: "active" },
        { id: 2, name: "Khách hàng mới", code: "WELCOME50", type: "fixed", value: 50000, expiry: "2025-11-30", status: "active" },
        { id: 3, name: "Thứ 6 vui vẻ", code: "FRIDAY20", type: "percentage", value: 20, expiry: "2024-10-31", status: "expired" },
        { id: 4, name: "Sinh nhật bạn", code: "HAPPYBD", type: "fixed", value: 100000, expiry: "2025-12-31", status: "inactive" },
    ];

    // Lựa chọn các element
    const $tableBody = $('#promotion-table-body');
    const $pagination = $('#pagination');
    const $modalEl = $('#promotionModal');
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#promotion-form');
    const $modalTitle = $('#promotionModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal');
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $promoNameToDeleteEl = $('#promo-name-to-delete');
    const $promoIdToDeleteInput = $('#promo-id-to-delete');
    const $searchInput = $('#search-promotion');
    const $typeFilter = $('#filter-promo-type'); // Bộ lọc loại
    const $tableHeaders = $('thead th.sortable'); // Header có thể sắp xếp

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 5; // Số dòng mỗi trang (Backend sẽ quyết định)
    let sortColumn = 'id'; // Cột sắp xếp mặc định (Backend có thể có mặc định khác)
    let sortDirection = 'asc'; // Chiều sắp xếp mặc định

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
    function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
    function formatDiscountValue(promo) { return promo.type === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value); }

    function getStatusBadge(status) {
        switch (status) {
            case 'active': return '<span class="badge bg-label-success">Hoạt động</span>';
            case 'inactive': return '<span class="badge bg-label-secondary">Không hoạt động</span>';
            case 'expired': return '<span class="badge bg-label-danger">Đã hết hạn</span>';
            default: return '<span class="badge bg-label-secondary">Không xác định</span>';
        }
    }

    function showToast(message, isSuccess = true) {
        $liveToast.find('.toast-body').text(message);
        const headerClass = isSuccess ? 'bg-success text-white' : 'bg-danger text-white';
        const removeClass = isSuccess ? 'bg-danger text-white' : 'bg-success text-white';
        $liveToast.find('.toast-header').removeClass(removeClass).addClass(headerClass);
        toast.show();
    }

    // === HÀM CẬP NHẬT ICON SẮP XẾP (CHỈ UI) ===
    function updateSortIcons() {
        $tableHeaders.removeClass('sort-asc sort-desc');
        const $currentHeader = $tableHeaders.filter(`[data-column="${sortColumn}"]`);
        if ($currentHeader.length) {
            $currentHeader.addClass(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
    // ===========================================

    // Hàm render bảng (KHÔNG LỌC/SẮP XẾP)
    // Chỉ hiển thị dữ liệu được truyền vào (từ backend)
    function renderTable(promotionsData) {
        $tableBody.empty(); // Xóa trạng thái loading cũ

        if (!promotionsData || promotionsData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterType = $typeFilter.val();
            let message = 'Chưa có khuyến mãi nào.';
            if(searchTerm || filterType) {
                message = 'Không tìm thấy kết quả phù hợp.';
            }
            $tableBody.append(`
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <i class='bx bx-search-alt'></i>
                            <p>${message}</p>
                             ${!searchTerm && !filterType ? '<button class="btn btn-sm btn-primary" id="add-promo-empty-btn">Tạo khuyến mãi đầu tiên</button>' : ''}
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        $.each(promotionsData, function(i, promo) {
            const rowHTML = `
                <tr>
                    <td><strong>#${promo.id}</strong></td>
                    <td>${promo.name}</td>
                    <td><span class="badge bg-label-secondary">${promo.code}</span></td>
                    <td>${promo.type === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                    <td class="text-success fw-semibold">${formatDiscountValue(promo)}</td>
                    <td>${promo.expiry}</td>
                    <td>${getStatusBadge(promo.status)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-icon btn-outline-primary btn-edit" data-id="${promo.id}" data-bs-toggle="tooltip" title="Sửa"><i class="bx bx-edit-alt"></i></button>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete" data-id="${promo.id}" data-bs-toggle="tooltip" title="Xóa"><i class="bx bx-trash"></i></button>
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

    // Hàm render phân trang (Giả sử backend trả về tổng số trang/bản ghi)
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
                <td colspan="8">
                    <div class="text-center p-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
                        <span class="ms-2">Đang tải dữ liệu...</span>
                    </div>
                </td>
            </tr>
        `);
        $pagination.empty(); // Xóa phân trang cũ

        // Lấy giá trị tìm kiếm, lọc, sắp xếp từ UI state
        const searchTerm = $searchInput.val();
        const filterType = $typeFilter.val();
        const sortBy = sortColumn;
        const sortDir = sortDirection;
        const page = currentPage;
        const limit = recordsPerPage;

        console.log("FRONTEND: Gửi yêu cầu đến Backend với các tham số:", { searchTerm, filterType, sortBy, sortDir, page, limit });

        // ---- GIẢ LẬP GỌI API (setTimeout để có độ trễ) ----
        // Trong thực tế, bạn sẽ dùng $.ajax() hoặc fetch() ở đây để gọi API thật
        setTimeout(() => {
            // Backend sẽ thực hiện logic lọc/sắp xếp dựa trên tham số và trả về kết quả
            // Dưới đây chỉ là ví dụ trả về dữ liệu mẫu cố định
            const responseData = {
                 promotions: currentPromotions.slice(0, limit), // Lấy dữ liệu mẫu
                 totalPages: Math.ceil(currentPromotions.length / limit) // Tính tổng số trang mẫu
            };
             console.log("FRONTEND: Đã nhận dữ liệu giả lập từ Backend:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            // Render dữ liệu và phân trang nhận được
            renderTable(responseData.promotions);
            setupPagination(responseData.totalPages);
            updateSortIcons(); // Cập nhật icon sắp xếp sau khi render
        }, 500); // Giả lập độ trễ mạng 500ms
    }
    // =============================

    /**
     * ==================================
     * GẮN CÁC SỰ KIỆN
     * ==================================
     */

    // --- SỰ KIỆN KÍCH HOẠT GỌI API ---
    // Tìm kiếm (khi người dùng dừng gõ)
    let searchTimeout;
    $searchInput.on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Luôn reset về trang 1 khi tìm kiếm
            fetchDataFromBackend(); // Gọi backend với từ khóa mới
        }, 500);
    });

    // Lọc theo loại
    $typeFilter.on('change', function() {
        currentPage = 1; // Luôn reset về trang 1 khi lọc
        fetchDataFromBackend(); // Gọi backend với bộ lọc mới
    });

    // Sắp xếp
    $tableHeaders.on('click', function() {
        const clickedColumn = $(this).data('column');
        if (!clickedColumn) return;

        if (sortColumn === clickedColumn) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = clickedColumn;
            sortDirection = 'asc';
        }
        currentPage = 1; // Luôn reset về trang 1 khi sắp xếp
        fetchDataFromBackend(); // Gọi backend với thông tin sắp xếp mới
    });

    // Phân trang
    $pagination.on('click', '.page-link', function(e) {
        e.preventDefault();
        const clickedPage = parseInt($(this).text());
        if(clickedPage !== currentPage){
            currentPage = clickedPage;
            fetchDataFromBackend(); // Gọi backend để lấy dữ liệu trang mới
        }
    });
    // ------------------------------------

    // Click nút "Thêm mới"
    $('body').on('click', '#add-promo-btn, #add-promo-empty-btn', function() {
         $modalTitle.text('Thêm Khuyến mãi');
         $modalForm[0].reset();
         $('#promotion-id').val('');
         $('#promo-status').val('active');
         $modal.show();
     });

    // Click nút "Sửa" (Cần gọi API lấy chi tiết nếu cần)
    $tableBody.on('click', '.btn-edit', function() {
        const promoId = $(this).data('id');
        // --- Gọi API lấy chi tiết KM theo ID ---
        console.log("FRONTEND: Yêu cầu Backend lấy chi tiết KM ID:", promoId);
        // --- Giả lập lấy từ mảng mẫu (để điền form) ---
        const promoData = currentPromotions.find(p => p.id === promoId);
        if (promoData) {
            $modalTitle.text('Sửa Khuyến mãi');
             $('#promotion-id').val(promoData.id);
             $('#promo-name').val(promoData.name);
             $('#promo-code').val(promoData.code);
             $('#promo-type').val(promoData.type);
             $('#promo-value').val(promoData.value);
             $('#promo-expiry').val(promoData.expiry);
             $('#promo-status').val(promoData.status);
            $modal.show();
        } else {
            showToast("Lỗi: Không tìm thấy dữ liệu để sửa.", false);
        }
     });

    // Submit Form (Giả lập gửi lên backend và tải lại dữ liệu)
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        const promoId = $('#promotion-id').val();
        const promoData = {
            id: promoId ? parseInt(promoId) : null,
            name: $('#promo-name').val(),
            code: $('#promo-code').val(),
            type: $('#promo-type').val(),
            value: parseInt($('#promo-value').val()),
            expiry: $('#promo-expiry').val(),
            status: $('#promo-status').val()
         };

        let apiEndpoint = '/api/promotions'; // Endpoint thêm mới
        let method = 'POST';
        let message = '';

        if (promoId) {
            apiEndpoint = `/api/promotions/${promoId}`; // Endpoint cập nhật
            method = 'PUT';
            console.log(`FRONTEND: Gửi yêu cầu ${method} đến ${apiEndpoint} với data:`, promoData);
            message = `Đã cập nhật khuyến mãi "${promoData.name}"`;
            // Cập nhật mảng mẫu để demo (Backend sẽ làm thật)
             const index = currentPromotions.findIndex(p => p.id === promoData.id);
             if (index !== -1) currentPromotions[index] = promoData;
        } else {
             console.log(`FRONTEND: Gửi yêu cầu ${method} đến ${apiEndpoint} với data:`, promoData);
            message = `Đã thêm khuyến mãi "${promoData.name}"`;
             // Cập nhật mảng mẫu để demo (Backend sẽ làm thật)
             promoData.id = new Date().getTime(); // Tạo ID tạm
             currentPromotions.push(promoData);
        }
        // --- Trong thực tế sẽ gọi API thật ở đây ---
        // $.ajax({ url: apiEndpoint, method: method, data: promoData, success: function(response){...}})

        $modal.hide();
        fetchDataFromBackend(); // Tải lại dữ liệu từ backend sau khi thành công
        showToast(message, true);
    });

    // Click nút "Xóa" TRONG BẢNG
    $tableBody.on('click', '.btn-delete', function() {
        const promoId = $(this).data('id');
        // --- Gọi API lấy tên KM nếu cần ---
        console.log("FRONTEND: Yêu cầu Backend lấy tên KM ID:", promoId);
        // --- Giả lập ---
        const promoToDelete = currentPromotions.find(p => p.id === promoId);
        if (promoToDelete) {
             $promoNameToDeleteEl.text(`"${promoToDelete.name}"`);
             $promoIdToDeleteInput.val(promoId);
             $deleteModal.show();
        } else {
             showToast("Lỗi: Không tìm thấy dữ liệu để xóa.", false);
        }
     });

    // Click nút "XÁC NHẬN XÓA" TRONG MODAL
    $('#confirm-delete-btn').on('click', function() {
        const promoId = parseInt($promoIdToDeleteInput.val());
        const promoToDelete = currentPromotions.find(p => p.id === promoId); // Lấy lại tên để hiển thị toast

        // --- Giả lập gọi API Xóa ---
        const apiEndpoint = `/api/promotions/${promoId}`;
        console.log(`FRONTEND: Gửi yêu cầu DELETE đến ${apiEndpoint}`);
        // $.ajax({ url: apiEndpoint, method: 'DELETE', success: function(response){...}})
         // Cập nhật mảng mẫu để demo (Backend sẽ làm thật)
         currentPromotions = currentPromotions.filter(p => p.id !== promoId);
        // --- Kết thúc giả lập ---

        $deleteModal.hide();
        // Sau khi xóa, tải lại dữ liệu trang hiện tại
        fetchDataFromBackend();
        if (promoToDelete) {
             showToast(`Đã xóa khuyến mãi "${promoToDelete.name}"`, true);
        }
    });

    // Xử lý nút Sáng/Tối
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').on('click', function() {
       if (html.classList.contains('dark-style')) { html.classList.remove('dark-style'); html.classList.add('light-style'); styleSwitcherToggle.classList.remove('bx-sun'); styleSwitcherToggle.classList.add('bx-moon'); }
       else { html.classList.remove('light-style'); html.classList.add('dark-style'); styleSwitcherToggle.classList.remove('bx-moon'); styleSwitcherToggle.classList.add('bx-sun'); }
    });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Gọi hàm này để tải dữ liệu lần đầu
});