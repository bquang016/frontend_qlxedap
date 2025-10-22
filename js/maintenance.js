$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    let currentMaintenance = [ // Dữ liệu mẫu (Backend cung cấp)
        { id: 201, bikeId: 'XE001', maintenanceDate: '2025-10-15', description: 'Thay lốp sau, tra dầu xích', cost: 250000 },
        { id: 202, bikeId: 'XE004', maintenanceDate: '2025-10-18', description: 'Kiểm tra phanh, tăng xích', cost: 50000 },
        { id: 203, bikeId: 'XE001', maintenanceDate: '2025-09-20', description: 'Bảo dưỡng định kỳ', cost: 150000 },
        { id: 204, bikeId: 'XE002', maintenanceDate: '2025-10-21', description: 'Sửa chuông', cost: 20000 },
    ];

    // Lựa chọn các element
    const $tableBody = $('#maintenance-table-body');
    const $pagination = $('#pagination');
    const $modalEl = $('#maintenanceModal'); // Modal Thêm/Sửa
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#maintenance-form');
    const $modalTitle = $('#maintenanceModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal');
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $nameToDeleteEl = $('#promo-name-to-delete'); // Dùng tạm ID modal xóa
    const $idToDeleteInput = $('#promo-id-to-delete'); // Dùng tạm ID modal xóa
    const $searchInput = $('#search-maintenance'); // Tìm theo Mã xe
    const $dateFilter = $('#filter-maintenance-date'); // Lọc Ngày
    const $tableHeaders = $('thead th.sortable'); // Header sắp xếp

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 10;
    let sortColumn = 'maintenanceDate'; // Sắp xếp mặc định theo ngày
    let sortDirection = 'desc'; // Mới nhất lên đầu

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
     function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
     function showToast(message, isSuccess = true) { /* ... */ }
     function updateSortIcons() { /* ... */ }

     // Hàm định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
     function formatDate(dateString) {
        if (!dateString || !dateString.includes('-')) return '-';
        try {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        } catch (e) { return dateString; }
     }

    // Hàm render bảng bảo trì
    function renderTable(maintenanceData) {
        $tableBody.empty();

        if (!maintenanceData || maintenanceData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterDate = $dateFilter.val();
            let message = 'Chưa có lịch sử bảo trì nào.';
            if(searchTerm || filterDate) { message = 'Không tìm thấy lịch sử phù hợp.'; }
            $tableBody.html(`<tr><td colspan="6"><div class="empty-state"><i class='bx bxs-traffic-cone'></i><p>${message}</p>${!searchTerm && !filterDate ? '<button class="btn btn-sm btn-primary" id="add-maintenance-empty-btn">Thêm Lịch Bảo trì</button>' : ''}</div></td></tr>`);
            return;
        }

        $.each(maintenanceData, function(i, item) {
            const rowHTML = `
                <tr>
                    <td><strong>#${item.id}</strong></td>   
                    <td>${item.bikeId || '-'}</td>
                    <td>${formatDate(item.maintenanceDate)}</td>
                    <td>${item.description || '-'}</td>
                    <td class="fw-semibold">${formatCurrency(item.cost || 0)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-icon btn-outline-primary btn-edit" data-id="${item.id}" data-bs-toggle="tooltip" title="Sửa"><i class="bx bx-edit-alt"></i></button>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete" data-id="${item.id}" data-bs-toggle="tooltip" title="Xóa"><i class="bx bx-trash"></i></button>
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

        const searchTerm = $searchInput.val(); // Tìm theo Mã xe
        const filterDate = $dateFilter.val();
        const page = currentPage;
        const limit = recordsPerPage;
        const sortBy = sortColumn;
        const sortDir = sortDirection;

        console.log("FRONTEND (Maintenance): Gửi yêu cầu đến Backend:", { searchTerm, filterDate, page, limit, sortBy, sortDir });

        // ---- GIẢ LẬP GỌI API ----
        setTimeout(() => {
            // Logic lọc/sắp xếp MẪU (Backend làm thật)
            let filtered = currentMaintenance.filter(m =>
                (!searchTerm || m.bikeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterDate || m.maintenanceDate === filterDate)
            );
            filtered.sort((a, b) => { /* Logic sort theo cost hoặc maintenanceDate */
                let valA = a[sortBy]; let valB = b[sortBy];
                if (sortBy === 'maintenanceDate') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { maintenance: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Maintenance): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderTable(responseData.maintenance);
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
    $dateFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    $tableHeaders.on('click', function() {
        const clickedColumn = $(this).data('column'); if (!clickedColumn) return;
        if (sortColumn === clickedColumn) { sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; }
        else { sortColumn = clickedColumn; sortDirection = 'asc'; }
        currentPage = 1; fetchDataFromBackend();
    });
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

    // Click nút "Thêm mới"
    $('body').on('click', '#add-maintenance-btn, #add-maintenance-empty-btn', function() {
         $modalTitle.text('Thêm Lịch Bảo trì');
         $modalForm[0].reset();
         $('#maintenance-id').val('');
         // Đặt ngày mặc định là hôm nay (tùy chọn)
         $('#maintenance-date-modal').val(new Date().toISOString().slice(0, 10));
         $modal.show();
     });

    // Click nút "Sửa"
    $tableBody.on('click', '.btn-edit', function() {
        const itemId = $(this).data('id');
        console.log("FRONTEND (Maintenance): Yêu cầu Backend lấy chi tiết ID:", itemId);
        // --- Giả lập lấy từ mảng mẫu ---
        const itemData = currentMaintenance.find(m => m.id === itemId);
        if (itemData) {
            $modalTitle.text('Sửa Lịch Bảo trì');
            $('#maintenance-id').val(itemData.id);
            $('#maintenance-bike-id').val(itemData.bikeId);
            $('#maintenance-date-modal').val(itemData.maintenanceDate);
            $('#maintenance-cost-modal').val(itemData.cost);
            $('#maintenance-description-modal').val(itemData.description);
            $modal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu.", false); }
    });

    // Submit Form Thêm/Sửa
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        const itemId = $('#maintenance-id').val();
        const itemData = {
             id: itemId ? parseInt(itemId) : null,
             bikeId: $('#maintenance-bike-id').val(),
             maintenanceDate: $('#maintenance-date-modal').val(),
             cost: parseInt($('#maintenance-cost-modal').val()) || 0,
             description: $('#maintenance-description-modal').val()
         };

        let message = '';
        // --- Giả lập gọi API ---
        if (itemId) {
            console.log("FRONTEND (Maintenance): Gửi yêu cầu CẬP NHẬT:", itemData);
            message = `Đã cập nhật lịch bảo trì cho xe ${itemData.bikeId}`;
             const index = currentMaintenance.findIndex(m => m.id === itemData.id);
             if (index !== -1) currentMaintenance[index] = itemData;
        } else {
             console.log("FRONTEND (Maintenance): Gửi yêu cầu THÊM MỚI:", itemData);
            message = `Đã thêm lịch bảo trì cho xe ${itemData.bikeId}`;
             itemData.id = new Date().getTime();
             currentMaintenance.push(itemData);
        }
        // --- Kết thúc giả lập ---

        $modal.hide();
        fetchDataFromBackend(); // Tải lại
        showToast(message, true);
    });

    // Click nút "Xóa" TRONG BẢNG
    $tableBody.on('click', '.btn-delete', function() {
        const itemId = $(this).data('id');
        console.log("FRONTEND (Maintenance): Yêu cầu Backend lấy tên/mã xe ID:", itemId);
        // --- Giả lập ---
        const itemToDelete = currentMaintenance.find(m => m.id === itemId);
        if (itemToDelete) {
             // Hiển thị ID bảo trì hoặc mã xe + ngày
             $nameToDeleteEl.text(`#${itemToDelete.id} (Xe ${itemToDelete.bikeId})`);
             $idToDeleteInput.val(itemId);
             $deleteModal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu.", false); }
     });

    // Click nút "XÁC NHẬN XÓA" TRONG MODAL
    $('#confirm-delete-btn').on('click', function() {
        const itemId = parseInt($idToDeleteInput.val());
        const itemToDelete = currentMaintenance.find(m => m.id === itemId);

        // --- Giả lập gọi API Xóa ---
        console.log("FRONTEND (Maintenance): Gửi yêu cầu XÓA ID:", itemId);
         currentMaintenance = currentMaintenance.filter(m => m.id !== itemId);
        // --- Kết thúc giả lập ---

        $deleteModal.hide();
        fetchDataFromBackend(); // Tải lại
        if (itemToDelete) { showToast(`Đã xóa lịch bảo trì #${itemId}`, true); }
    });

    // Xử lý nút Sáng/Tối
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});