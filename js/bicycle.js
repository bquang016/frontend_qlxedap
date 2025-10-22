$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
     // Dữ liệu mẫu ban đầu (Backend sẽ cung cấp)
    let currentBicycles = [
        { id: 1, name: 'Xe dap', type: 'Xe địa hình', price: 60000, img: 'https://xedapgiakho.com/wp-content/uploads/2024/06/ngoai-hinh-xe-dap-pho-thong-action-24-inch.jpg', status: 'available' },
        { id: 2, name: 'Giant Contend 3', type: 'Xe đua', price: 75000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-P_H-p-1mOa-UjY-4V2V3kF-rT_bX_xZA&s', status: 'rented' },
        { id: 3, name: 'Specialized Diverge', type: 'Xe địa hình', price: 65000, img: 'https://images.immediate.co.uk/production/volatile/sites/21/2021/03/Specialized-Diverge-Comp-Carbon-2021-01-e236614.jpg?quality=90&resize=768,574', status: 'available' },
        { id: 4, name: 'Trek Domane AL 2', type: 'Xe thành phố', price: 50000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x-q_jR7a5Xz-v9z7Y5t6wz_G9rY_xO_k_A&s', status: 'maintenance' },
        { id: 5, name: 'Cannondale Topstone', type: 'Xe địa hình', price: 62000, img: 'https://www.theedgecycles.com/media/catalog/product/cache/b18c64582f3747ea0c1f20c43bb0436a/c/a/cannondale_topstone_4_1.webp', status: 'available' },
        { id: 6, name: 'Scott Speedster 50', type: 'Xe đua', price: 72000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh-B9w_Z-D9V9s4i3_xXw_Z_wV5z-gI_K4A&s', status: 'unavailable' },
    ];

    // Lựa chọn các element
    const $gridContainer = $('#bicycle-grid-container'); // Container chứa các card xe
    const $pagination = $('#pagination');
    const $modalEl = $('#bicycleModal'); // Modal Thêm/Sửa Xe
    const $modal = new bootstrap.Modal($modalEl[0]);
    const $modalForm = $('#bicycle-form');
    const $modalTitle = $('#bicycleModalLabel');
    const $liveToast = $('#liveToast');
    const toast = new bootstrap.Toast($liveToast[0]);
    const $deleteModalEl = $('#deleteConfirmModal'); // Modal Xóa (cần có trong HTML)
    const $deleteModal = new bootstrap.Modal($deleteModalEl[0]);
    const $nameToDeleteEl = $('#promo-name-to-delete'); // Dùng tạm ID modal xóa KM
    const $idToDeleteInput = $('#promo-id-to-delete'); // Dùng tạm ID modal xóa KM
    const $searchInput = $('#search-bicycle'); // Ô tìm kiếm xe
    const $statusFilter = $('#filter-bike-status'); // Bộ lọc trạng thái xe

    // Biến trạng thái
    let currentPage = 1;
    const recordsPerPage = 8; // Số card mỗi trang
    // Sort (Nếu cần thêm giao diện sort cho grid)
    // let sortColumn = 'id';
    // let sortDirection = 'asc';

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ (GIAO DIỆN GRID)
     * ==================================
     */
    function formatCurrency(number) { return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
    function showToast(message, isSuccess = true) { /* ... (Giống promotion.js) ... */ }

    // Hàm lấy class CSS và Text cho badge trạng thái
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'available': return 'bg-label-success';
            case 'rented': return 'bg-label-warning';
            case 'maintenance': return 'bg-label-info';
            case 'unavailable': return 'bg-label-danger';
            default: return 'bg-label-secondary';
        }
    }
     function getStatusText(status) {
        switch (status) {
            case 'available': return 'Có sẵn';
            case 'rented': return 'Đang thuê';
            case 'maintenance': return 'Bảo trì';
            case 'unavailable': return 'Không sẵn sàng';
            default: return 'Không xác định';
        }
    }

    // === HÀM RENDER GRID ===
    // Hiển thị dữ liệu bicyclesData (từ backend) vào grid
    function renderGrid(bicyclesData) {
        $gridContainer.empty(); // Xóa trạng thái loading/dữ liệu cũ

        if (!bicyclesData || bicyclesData.length === 0) {
            const searchTerm = $searchInput.val();
            const filterStatus = $statusFilter.val();
            let message = 'Chưa có xe đạp nào.';
            if(searchTerm || filterStatus) { message = 'Không tìm thấy xe phù hợp.'; }
            $gridContainer.html(`
                <div class="col-12">
                    <div class="empty-state">
                        <i class='bx bx-Cycling'></i>
                        <p>${message}</p>
                        ${!searchTerm && !filterStatus ? '<button class="btn btn-sm btn-primary" id="add-bike-empty-btn">Thêm chiếc xe đầu tiên</button>' : ''}
                    </div>
                </div>
            `);
            return;
        }

        $.each(bicyclesData, function(i, bike) {
            const cardHTML = `
                <div class="col">
                    <div class="card h-100 bicycle-card">
                        <div class="bike-status-badge ${getStatusBadgeClass(bike.status)}">${getStatusText(bike.status)}</div>
                        <img class="card-img-top bicycle-card-img" src="${bike.img || 'img/default-bike.png'}" alt="${bike.name}" onerror="this.onerror=null;this.src='img/default-bike.png';">
                        <div class="card-body">
                            <h5 class="card-title">${bike.name}</h5>
                            <p class="card-text text-muted small mb-2">${bike.type || 'Chưa rõ loại'}</p>
                            <p class="card-text fw-semibold text-primary mb-0">${formatCurrency(bike.price || 0)}/giờ</p>
                        </div>
                        <div class="card-footer bg-transparent border-0 d-flex justify-content-end gap-2 pb-3 px-3">
                             <button class="btn btn-sm btn-icon btn-outline-primary btn-edit" data-id="${bike.id}" data-bs-toggle="tooltip" title="Sửa">
                                <i class="bx bx-edit-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete" data-id="${bike.id}" data-bs-toggle="tooltip" title="Xóa">
                                <i class="bx bx-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $gridContainer.append(cardHTML);
        });

        // Kích hoạt Tooltip
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) { return new bootstrap.Tooltip(tooltipTriggerEl); });
    }
    // ========================

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
        $gridContainer.html(`
            <div class="col-12 text-center p-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
                <p class="mt-2">Đang tải danh sách xe...</p>
            </div>
        `);
        $pagination.empty();

        // Lấy giá trị tìm kiếm, lọc, phân trang từ UI state
        const searchTerm = $searchInput.val();
        const filterStatus = $statusFilter.val();
        const page = currentPage;
        const limit = recordsPerPage;
        // const sortBy = sortColumn; // Nếu có sort
        // const sortDir = sortDirection; // Nếu có sort

        console.log("FRONTEND (Bicycle): Gửi yêu cầu đến Backend:", { searchTerm, filterStatus, page, limit });

        // ---- GIẢ LẬP GỌI API (setTimeout) ----
        setTimeout(() => {
            // Logic lọc MẪU (Backend sẽ làm thật)
            let filtered = currentBicycles.filter(b =>
                (b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterStatus || b.status === filterStatus)
            );
            // Thêm logic sort nếu có
            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const dataForCurrentPage = filtered.slice((page - 1) * limit, page * limit);

            const responseData = { bicycles: dataForCurrentPage, totalPages: totalPages };
            console.log("FRONTEND (Bicycle): Đã nhận dữ liệu giả lập:", responseData);
            // ---- KẾT THÚC GIẢ LẬP ----

            renderGrid(responseData.bicycles); // Render grid
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
    // Thêm sự kiện sort nếu có
    $pagination.on('click', '.page-link', function(e) { e.preventDefault(); const clickedPage = parseInt($(this).text()); if(clickedPage !== currentPage){ currentPage = clickedPage; fetchDataFromBackend(); } });
    // ------------------------------------

    // Click nút "Thêm mới"
    $('body').on('click', '#add-bike-btn, #add-bike-empty-btn', function() {
         $modalTitle.text('Thêm Xe đạp');
         $modalForm[0].reset();
         $('#bicycle-id').val('');
         $('#bike-status-modal').val('available'); // Mặc định trạng thái
         $modal.show();
     });

    // Click nút "Sửa" trên Card
    $gridContainer.on('click', '.btn-edit', function() {
        const bikeId = $(this).data('id');
        console.log("FRONTEND (Bicycle): Yêu cầu Backend lấy chi tiết Xe ID:", bikeId);
        // --- Giả lập lấy từ mảng mẫu ---
        const bikeData = currentBicycles.find(b => b.id === bikeId);
        if (bikeData) {
            $modalTitle.text('Sửa Xe đạp');
            $('#bicycle-id').val(bikeData.id);
            $('#bike-name').val(bikeData.name);
            $('#bike-type').val(bikeData.type);
            $('#bike-price').val(bikeData.price);
            $('#bike-image').val(bikeData.img);
            $('#bike-status-modal').val(bikeData.status);
            $modal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu xe.", false); }
    });

    // Submit Form Thêm/Sửa
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        const bikeId = $('#bicycle-id').val();
        const bikeData = {
            id: bikeId ? parseInt(bikeId) : null,
            name: $('#bike-name').val(),
            type: $('#bike-type').val(),
            price: parseInt($('#bike-price').val()),
            img: $('#bike-image').val(),
            status: $('#bike-status-modal').val(),
         };

        let message = '';
        // --- Giả lập gọi API Thêm/Sửa ---
        if (bikeId) {
            console.log("FRONTEND (Bicycle): Gửi yêu cầu CẬP NHẬT Xe:", bikeData);
            message = `Đã cập nhật xe "${bikeData.name}"`;
             const index = currentBicycles.findIndex(b => b.id === bikeData.id);
             if (index !== -1) currentBicycles[index] = bikeData;
        } else {
             console.log("FRONTEND (Bicycle): Gửi yêu cầu THÊM Xe:", bikeData);
            message = `Đã thêm xe "${bikeData.name}"`;
             bikeData.id = new Date().getTime();
             currentBicycles.push(bikeData);
        }
        // --- Kết thúc giả lập ---

        $modal.hide();
        fetchDataFromBackend(); // Tải lại
        showToast(message, true);
    });

    // Click nút "Xóa" trên Card -> Mở Modal Xác nhận
    $gridContainer.on('click', '.btn-delete', function() {
        const bikeId = $(this).data('id');
        console.log("FRONTEND (Bicycle): Yêu cầu Backend lấy tên Xe ID:", bikeId);
        // --- Giả lập ---
        const bikeToDelete = currentBicycles.find(b => b.id === bikeId);
        if (bikeToDelete) {
             $nameToDeleteEl.text(`"${bikeToDelete.name}"`); // Hiển thị tên xe
             $idToDeleteInput.val(bikeId);
             $deleteModal.show();
        } else { showToast("Lỗi: Không tìm thấy dữ liệu xe.", false); }
     });

    // Click nút "XÁC NHẬN XÓA" TRONG MODAL
    $('#confirm-delete-btn').on('click', function() {
        const bikeId = parseInt($idToDeleteInput.val());
        const bikeToDelete = currentBicycles.find(b => b.id === bikeId);

        // --- Giả lập gọi API Xóa ---
        console.log("FRONTEND (Bicycle): Gửi yêu cầu XÓA Xe ID:", bikeId);
         currentBicycles = currentBicycles.filter(b => b.id !== bikeId);
        // --- Kết thúc giả lập ---

        $deleteModal.hide();
        fetchDataFromBackend(); // Tải lại
        if (bikeToDelete) { showToast(`Đã xóa xe "${bikeToDelete.name}"`, true); }
    });

    // Xử lý nút Sáng/Tối (giữ nguyên)
    const styleSwitcherToggle = document.querySelector('.style-switcher-toggle i');
    const html = document.querySelector('html');
    if (html.classList.contains('dark-style')) { styleSwitcherToggle.classList.add('bx', 'bx-sun'); } else { styleSwitcherToggle.classList.add('bx', 'bx-moon'); }
    $('.style-switcher-toggle').parent().on('click', function(e) { /* ... (logic đổi class) ... */ });

    // --- KHỞI TẠO ---
    fetchDataFromBackend(); // Tải dữ liệu lần đầu
});