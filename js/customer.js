$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    let currentCustomers = [ // Dữ liệu mẫu (Backend sẽ cung cấp)
        { id: 1, avatar: '1.png', name: 'Trần Văn An', phone: '0905123456', email: 'an.tv@example.com', cardType: 'Bạc', points: 150, status: 'Hoạt động' },
        { id: 2, avatar: '2.png', name: 'Nguyễn Thị Bình', phone: '0913654321', email: 'binh.nt@example.com', cardType: 'Vàng', points: 1250, status: 'Hoạt động' },
        { id: 3, avatar: '3.png', name: 'Lê Minh Cường', phone: '0988789123', email: 'cuong.lm@example.com', cardType: 'Bạch kim', points: 3500, status: 'Hoạt động' },
        { id: 4, avatar: '4.png', name: 'Phạm Thuỳ Dung', phone: '0935111222', email: 'dung.pt@example.com', cardType: 'Bạc', points: 50, status: 'Bị khoá' },
        { id: 5, avatar: '5.png', name: 'Hoàng Văn Em', phone: '0977333444', email: 'em.hv@example.com', cardType: 'Vàng', points: 850, status: 'Hoạt động' },
        { id: 6, avatar: '6.png', name: 'Vũ Thị Giang', phone: '0902555666', email: 'giang.vt@example.com', cardType: 'Bạc', points: 230, status: 'Hoạt động' },
    ];

    // Lựa chọn các element
    const $tableBody = $('#customer-table-body');
    const $pagination = $('#pagination');
    const $modalEl = $('#customerModal'); // Modal Thêm/Sửa KH
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#customer-form');
    const $modalTitle = $('#customerModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal');
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $nameToDeleteEl = $('#promo-name-to-delete'); // Dùng tạm ID modal xóa
    const $idToDeleteInput = $('#promo-id-to-delete'); // Dùng tạm ID modal xóa
    const $searchInput = $('#search-customer'); // Ô tìm kiếm KH
    const $typeFilter = $('#filter-customer-type'); // Bộ lọc loại thẻ
    // const $tableHeaders = $('thead th.sortable'); // Bật nếu có cột sortable

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 5; // Số dòng mỗi trang
    // let sortColumn = 'name'; // Ví dụ cột sort mặc định
    // let sortDirection = 'asc';

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
     function showToast(message, isSuccess = true) { /* ... (Giống promotion.js) ... */ }

     // Hàm lấy badge Trạng thái KH
    function getStatusBadge(status) {
        return status === 'Hoạt động'
            ? `<span class="badge bg-label-success">${status}</span>`
            : `<span class="badge bg-label-danger">${status}</span>`;
    }

     // Hàm lấy badge Loại thẻ KH
    function getCardTypeBadge(cardType) {
        if (!cardType) return ''; // Trả về rỗng nếu không có loại thẻ
        if (cardType === 'Bạch kim') return `<span class="badge bg-label-info">${cardType}</span>`;
        if (cardType === 'Vàng') return `<span class="badge bg-label-warning">${cardType}</span>`;
        return `<span class="badge bg-label-secondary">${cardType}</span>`; // Mặc định là Bạc hoặc loại khác
    }

    // Hàm cập nhật icon sắp xếp (nếu có sort)
    // function updateSortIcons() { /* ... (Giống promotion.js) ... */ }

    // Hàm render bảng khách hàng
    function renderTable(customersData) {
        $tableBody.empty();

        if (!customersData || customersData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterType = $typeFilter.val();
            let message = 'Chưa có khách hàng nào.';
            if(searchTerm || filterType) { message = 'Không tìm thấy khách hàng phù hợp.'; }
            $tableBody.html(`
                <tr>
                    <td colspan="6"> <div class="empty-state">
                            <i class='bx bx-user-x'></i>
                            <p>${message}</p>
                             ${!searchTerm && !filterType ? '<button class="btn btn-sm btn-primary" id="add-customer-empty-btn">Thêm khách hàng đầu tiên</button>' : ''}
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        $.each(customersData, function(i, customer) {
            const avatarUrl = customer.avatar ? `https://demos.themeselection.com/sneat-bootstrap-html-admin-template-free/assets/img/avatars/${customer.avatar}` : 'img/default-avatar.png'; // Thêm ảnh avatar mặc định
            const rowHTML = `
                <tr>
                    <td>
                        <div class="customer-info-cell">
                            <div class="avatar avatar-md flex-shrink-0 me-3">
                                <img src="${avatarUrl}" alt="Avatar" class="rounded-circle" onerror="this.onerror=null;this.src='img/default-avatar.png';">
                            </div>
                            <div class="customer-details">
                                <span class="customer-name">${customer.name}</span>
                                <small class="customer-phone">${customer.phone || 'Chưa có SĐT'}</small>
                            </div>
                        </div>
                    </td>
                    <td>${customer.email || '-'}</td>
                    <td>${getCardTypeBadge(customer.cardType)}</td>
                    <td><i class="bx bx-star text-warning me-1"></i>${customer.points || 0}</td>
                    <td>${getStatusBadge(customer.status)}</td>
                    <td>
                        <div class="table-actions">
                             <button class="btn btn-sm btn-icon btn-outline-primary btn-edit" data-id="${customer.id}" data-bs-toggle="tooltip" title="Sửa"><i class="bx bx-edit-alt"></i></button>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete" data-id="${customer.id}" data-bs-toggle="tooltip" title="Xóa"><i class="bx bx-trash"></i></button>
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
        $tableBody.html(`<tr><td colspan="6"><div class="text-center p-3"><div class="spinner-border spinner-border-sm text-primary" role="status">...</div><span class="ms-2">Đang tải...</span></div></td></tr>`);
        $pagination.empty();

        const searchTerm = $searchInput.val();
        const filterType = $typeFilter.val();
        const page = currentPage;
        const limit = recordsPerPage;
        // const sortBy = sortColumn;
        // const sortDir = sortDirection;

        console.log("FRONTEND (Customer): Gửi yêu cầu đến Backend:", { searchTerm, filterType, page, limit /*, sortBy, sortDir */ });

        // ---- GIẢ LẬP GỌI API ----
        setTimeout(() => {
            // Logic lọc MẪU (Backend làm thật)
            let filtered = currentCustomers.filter(c =>
                (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm) || (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                (!filterType || c.cardType === filterType)
            );
            // Logic sort MẪU (Backend làm thật)
            // filtered.sort(...)

            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { customers: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Customer): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderTable(responseData.customers);
            setupPagination(responseData.totalPages);
            // updateSortIcons();
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
    $typeFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    // $tableHeaders.on('click', function() { /* ... (logic gọi API sort) ... */ });
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

    // Click nút "Thêm mới"
    $('body').on('click', '#add-customer-btn, #add-customer-empty-btn', function() {
         $modalTitle.text('Thêm Khách hàng');
         $modalForm[0].reset(); // Xóa form
         $('#customer-id').val(''); // Đảm bảo ID trống
         $('#customer-status-modal').val('Hoạt động'); // Mặc định trạng thái
         $modal.show();
     });

    // Click nút "Sửa"
    $tableBody.on('click', '.btn-edit', function() {
        const customerId = $(this).data('id');
        console.log("FRONTEND (Customer): Yêu cầu Backend lấy chi tiết KH ID:", customerId);
        // --- Giả lập lấy từ mảng mẫu ---
        const customerData = currentCustomers.find(c => c.id === customerId);
        if (customerData) {
            $modalTitle.text('Sửa Khách hàng');
            $('#customer-id').val(customerData.id);
            $('#customer-name-modal').val(customerData.name);
            $('#customer-phone-modal').val(customerData.phone);
            $('#customer-email-modal').val(customerData.email);
            $('#customer-card-type-modal').val(customerData.cardType || 'Bạc'); // Mặc định nếu null
            $('#customer-points-modal').val(customerData.points || 0);
            $('#customer-status-modal').val(customerData.status);
            // $('#customer-avatar-modal').val(customerData.avatar); // Nếu có
            $modal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu khách hàng.", false); }
    });

    // Submit Form Thêm/Sửa
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        const customerId = $('#customer-id').val();
        const customerData = {
             id: customerId ? parseInt(customerId) : null,
             name: $('#customer-name-modal').val(),
             phone: $('#customer-phone-modal').val(),
             email: $('#customer-email-modal').val(),
             cardType: $('#customer-card-type-modal').val(),
             points: parseInt($('#customer-points-modal').val()) || 0,
             status: $('#customer-status-modal').val(),
             // avatar: $('#customer-avatar-modal').val() // Nếu có
         };

        let message = '';
        // --- Giả lập gọi API Thêm/Sửa ---
        if (customerId) {
            console.log("FRONTEND (Customer): Gửi yêu cầu CẬP NHẬT:", customerData);
            message = `Đã cập nhật khách hàng "${customerData.name}"`;
             const index = currentCustomers.findIndex(c => c.id === customerData.id);
             if (index !== -1) currentCustomers[index] = customerData;
        } else {
             console.log("FRONTEND (Customer): Gửi yêu cầu THÊM MỚI:", customerData);
            message = `Đã thêm khách hàng "${customerData.name}"`;
             customerData.id = new Date().getTime(); // ID tạm
             currentCustomers.push(customerData);
        }
        // --- Kết thúc giả lập ---

        $modal.hide();
        fetchDataFromBackend(); // Tải lại
        showToast(message, true);
    });

    // Click nút "Xóa" TRONG BẢNG
    $tableBody.on('click', '.btn-delete', function() {
        const customerId = $(this).data('id');
        console.log("FRONTEND (Customer): Yêu cầu Backend lấy tên KH ID:", customerId);
        // --- Giả lập ---
        const customerToDelete = currentCustomers.find(c => c.id === customerId);
        if (customerToDelete) {
             $nameToDeleteEl.text(`"${customerToDelete.name}"`); // Hiển thị tên
             $idToDeleteInput.val(customerId); // Lưu ID
             $deleteModal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu khách hàng.", false); }
     });

    // Click nút "XÁC NHẬN XÓA" TRONG MODAL
    $('#confirm-delete-btn').on('click', function() {
        const customerId = parseInt($idToDeleteInput.val());
        const customerToDelete = currentCustomers.find(c => c.id === customerId);

        // --- Giả lập gọi API Xóa ---
        console.log("FRONTEND (Customer): Gửi yêu cầu XÓA ID:", customerId);
         currentCustomers = currentCustomers.filter(c => c.id !== customerId);
        // --- Kết thúc giả lập ---

        $deleteModal.hide();
        fetchDataFromBackend(); // Tải lại
        if (customerToDelete) { showToast(`Đã xóa khách hàng "${customerToDelete.name}"`, true); }
    });

    // Xử lý nút Sáng/Tối
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});