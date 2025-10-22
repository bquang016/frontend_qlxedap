$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    let currentEmployees = [ // Dữ liệu mẫu (Backend cung cấp)
        { id: 301, avatar: '5.png', name: 'Hoàng Văn Minh', position: 'Quản lý', salary: 15000000, shift: 'Hành chính', phone: '0911223344' },
        { id: 302, avatar: '6.png', name: 'Trần Thị Ngọc', position: 'Nhân viên thu ngân', salary: 8000000, shift: 'Sáng', phone: '0922334455' },
        { id: 303, avatar: '7.png', name: 'Lê Đình Huy', position: 'Nhân viên kỹ thuật', salary: 10000000, shift: 'Chiều', phone: '0933445566' },
        { id: 304, avatar: '8.png', name: 'Phạm Mai Anh', position: 'Nhân viên thu ngân', salary: 8500000, shift: 'Tối', phone: '0944556677' },
    ];

    // Lựa chọn các element
    const $tableBody = $('#employee-table-body');
    const $pagination = $('#pagination');
    const $modalEl = $('#employeeModal'); // Modal Thêm/Sửa
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#employee-form');
    const $modalTitle = $('#employeeModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal');
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $nameToDeleteEl = $('#promo-name-to-delete');
    const $idToDeleteInput = $('#promo-id-to-delete');
    const $searchInput = $('#search-employee'); // Tìm theo Tên/Chức vụ
    const $shiftFilter = $('#filter-employee-shift'); // Lọc Ca làm việc
    const $tableHeaders = $('thead th.sortable'); // Header sắp xếp (Lương)

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 10;
    let sortColumn = 'name'; // Sắp xếp mặc định theo tên
    let sortDirection = 'asc';

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (CHỈ GIAO DIỆN)
     * ==================================
     */
     function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
     function showToast(message, isSuccess = true) { /* ... */ }
     function updateSortIcons() { /* ... */ }

    // Hàm render bảng nhân viên
    function renderTable(employeesData) {
        $tableBody.empty();

        if (!employeesData || employeesData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterShift = $shiftFilter.val();
            let message = 'Chưa có nhân viên nào.';
            if(searchTerm || filterShift) { message = 'Không tìm thấy nhân viên phù hợp.'; }
            $tableBody.html(`<tr><td colspan="5"><div class="empty-state"><i class='bx bxs-user-detail'></i><p>${message}</p>${!searchTerm && !filterShift ? '<button class="btn btn-sm btn-primary" id="add-employee-empty-btn">Thêm nhân viên đầu tiên</button>' : ''}</div></td></tr>`);
            return;
        }

        $.each(employeesData, function(i, emp) {
            const avatarUrl = emp.avatar ? `https://demos.themeselection.com/sneat-bootstrap-html-admin-template-free/assets/img/avatars/${emp.avatar}` : 'img/default-avatar.png';
            const rowHTML = `
                <tr>
                    <td>
                        <div class="employee-info-cell">
                            <div class="avatar avatar-md flex-shrink-0 me-3">
                                <img src="${avatarUrl}" alt="Avatar" class="rounded-circle" onerror="this.onerror=null;this.src='img/default-avatar.png';">
                            </div>
                            <div class="employee-details">
                                <span class="employee-name">${emp.name}</span>
                                <small class="employee-position">${emp.position || 'Chưa rõ'}</small> </div>
                        </div>
                    </td>
                    <td>${emp.position || '-'}</td>
                    <td class="fw-semibold">${formatCurrency(emp.salary || 0)}</td>
                    <td>${emp.shift || '-'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-icon btn-outline-primary btn-edit" data-id="${emp.id}" data-bs-toggle="tooltip" title="Sửa"><i class="bx bx-edit-alt"></i></button>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete" data-id="${emp.id}" data-bs-toggle="tooltip" title="Xóa"><i class="bx bx-trash"></i></button>
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
        $tableBody.html(`<tr><td colspan="5"><div class="text-center p-3"><div class="spinner-border text-primary spinner-border-sm"></div><span class="ms-2">Đang tải...</span></div></td></tr>`);
        $pagination.empty();

        const searchTerm = $searchInput.val(); // Tìm Tên/Chức vụ
        const filterShift = $shiftFilter.val(); // Lọc Ca
        const page = currentPage;
        const limit = recordsPerPage;
        const sortBy = sortColumn;
        const sortDir = sortDirection;

        console.log("FRONTEND (Employee): Gửi yêu cầu đến Backend:", { searchTerm, filterShift, page, limit, sortBy, sortDir });

        // ---- GIẢ LẬP GỌI API ----
        setTimeout(() => {
            // Logic lọc/sắp xếp MẪU (Backend làm thật)
            let filtered = currentEmployees.filter(e =>
                (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterShift || e.shift === filterShift)
            );
            filtered.sort((a, b) => { /* Logic sort theo name hoặc salary */
                 let valA = a[sortBy]; let valB = b[sortBy];
                 if(typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
                 if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                 if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                 return 0;
            });

            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { employees: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Employee): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderTable(responseData.employees);
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
    $shiftFilter.on('change', function() { currentPage = 1; fetchDataFromBackend(); });
    $tableHeaders.on('click', function() {
        const clickedColumn = $(this).data('column'); if (!clickedColumn) return;
        if (sortColumn === clickedColumn) { sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; }
        else { sortColumn = clickedColumn; sortDirection = 'asc'; }
        currentPage = 1; fetchDataFromBackend();
    });
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

    // Click nút "Thêm mới"
    $('body').on('click', '#add-employee-btn, #add-employee-empty-btn', function() {
         $modalTitle.text('Thêm Nhân viên');
         $modalForm[0].reset();
         $('#employee-id').val('');
         $modal.show();
     });

    // Click nút "Sửa"
    $tableBody.on('click', '.btn-edit', function() {
        const empId = $(this).data('id');
        console.log("FRONTEND (Employee): Yêu cầu Backend lấy chi tiết NV ID:", empId);
        // --- Giả lập lấy từ mảng mẫu ---
        const empData = currentEmployees.find(e => e.id === empId);
        if (empData) {
            $modalTitle.text('Sửa Nhân viên');
            $('#employee-id').val(empData.id);
            $('#employee-name-modal').val(empData.name);
            $('#employee-position-modal').val(empData.position);
            $('#employee-salary-modal').val(empData.salary);
            $('#employee-shift-modal').val(empData.shift);
            $('#employee-phone-modal').val(empData.phone); // Nếu có
            // $('#employee-status-modal').val(empData.status); // Nếu có
            $modal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu nhân viên.", false); }
    });

    // Submit Form Thêm/Sửa
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        const empId = $('#employee-id').val();
        const empData = {
             id: empId ? parseInt(empId) : null,
             name: $('#employee-name-modal').val(),
             position: $('#employee-position-modal').val(),
             salary: parseInt($('#employee-salary-modal').val()) || 0,
             shift: $('#employee-shift-modal').val(),
             phone: $('#employee-phone-modal').val(),
             // status: $('#employee-status-modal').val() // Nếu có
             // avatar: '...' // Backend sẽ xử lý avatar
         };

        let message = '';
        // --- Giả lập gọi API ---
        if (empId) {
            console.log("FRONTEND (Employee): Gửi yêu cầu CẬP NHẬT:", empData);
            message = `Đã cập nhật nhân viên "${empData.name}"`;
             const index = currentEmployees.findIndex(e => e.id === empData.id);
             if (index !== -1) currentEmployees[index] = empData;
        } else {
             console.log("FRONTEND (Employee): Gửi yêu cầu THÊM MỚI:", empData);
            message = `Đã thêm nhân viên "${empData.name}"`;
             empData.id = new Date().getTime();
             currentEmployees.push(empData);
        }
        // --- Kết thúc giả lập ---

        $modal.hide();
        fetchDataFromBackend(); // Tải lại
        showToast(message, true);
    });

    // Click nút "Xóa" TRONG BẢNG
    $tableBody.on('click', '.btn-delete', function() {
        const empId = $(this).data('id');
        console.log("FRONTEND (Employee): Yêu cầu Backend lấy tên NV ID:", empId);
        // --- Giả lập ---
        const empToDelete = currentEmployees.find(e => e.id === empId);
        if (empToDelete) {
             $nameToDeleteEl.text(`"${empToDelete.name}"`);
             $idToDeleteInput.val(empId);
             $deleteModal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu nhân viên.", false); }
     });

    // Click nút "XÁC NHẬN XÓA" TRONG MODAL
    $('#confirm-delete-btn').on('click', function() {
        const empId = parseInt($idToDeleteInput.val());
        const empToDelete = currentEmployees.find(e => e.id === empId);

        // --- Giả lập gọi API Xóa ---
        console.log("FRONTEND (Employee): Gửi yêu cầu XÓA ID:", empId);
         currentEmployees = currentEmployees.filter(e => e.id !== empId);
        // --- Kết thúc giả lập ---

        $deleteModal.hide();
        fetchDataFromBackend(); // Tải lại
        if (empToDelete) { showToast(`Đã xóa nhân viên "${empToDelete.name}"`, true); }
    });

    // Xử lý nút Sáng/Tối
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});