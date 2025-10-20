$(document).ready(function () {
    // --- DỮ LIỆU MẪU ---
    const allCustomers = [
        { id: 1, avatar: '1.png', name: 'Trần Văn An', phone: '0905123456', email: 'an.tv@example.com', cardType: 'Bạc', points: 150, status: 'Hoạt động' },
        { id: 2, avatar: '2.png', name: 'Nguyễn Thị Bình', phone: '0913654321', email: 'binh.nt@example.com', cardType: 'Vàng', points: 1250, status: 'Hoạt động' },
        // ... (dữ liệu tương tự)
    ];

    // --- KHAI BÁO BIẾN JQUERY ---
    const $tableBody = $('#customer-table-body');
    const $pagination = $('#pagination');
    const recordsPerPage = 5;
    let currentPage = 1;

    function getStatusBadge(status) {
        return status === 'Hoạt động'
            ? `<span class="badge bg-label-success me-1">${status}</span>`
            : `<span class="badge bg-label-danger me-1">${status}</span>`;
    }

    function getCardTypeBadge(cardType) {
        if (cardType === 'Bạch kim') return `<span class="badge bg-label-info">${cardType}</span>`;
        if (cardType === 'Vàng') return `<span class="badge bg-label-warning">${cardType}</span>`;
        return `<span class="badge bg-label-secondary">${cardType}</span>`;
    }

    /**
     * Hàm render bảng, phiên bản jQuery
     */
    function renderTable(page) {
        $tableBody.empty(); // Xóa sạch nội dung cũ
        const paginatedItems = allCustomers.slice((page - 1) * recordsPerPage, page * recordsPerPage);

        // Vòng lặp $.each của jQuery
        $.each(paginatedItems, function (index, customer) {
            const rowHTML = `
                <tr>
                    <td>
                        <div class="customer-info-cell">
                            <div class="avatar avatar-md"><img src="https://demos.themeselection.com/sneat-bootstrap-html-admin-template-free/assets/img/avatars/${customer.avatar}" alt="Avatar" class="rounded-circle"></div>
                            <div class="customer-details">
                                <div class="customer-name">${customer.name}</div>
                                <small class="customer-phone">${customer.phone}</small>
                            </div>
                        </div>
                    </td>
                    <td>${customer.email}</td>
                    <td>${getCardTypeBadge(customer.cardType)}</td>
                    <td><i class="bx bx-star text-warning"></i> ${customer.points}</td>
                    <td>${getStatusBadge(customer.status)}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="#"><i class="bx bx-show me-1"></i> Xem chi tiết</a>
                                <a class="dropdown-item" href="#"><i class="bx bx-edit-alt me-1"></i> Sửa</a>
                                <a class="dropdown-item" href="#"><i class="bx bx-trash me-1"></i> Xóa</a>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            $tableBody.append(rowHTML); // Thêm dòng mới vào bảng
        });
    }

    /**
     * Hàm tạo phân trang, phiên bản jQuery
     */
    function setupPagination() {
        $pagination.empty();
        const pageCount = Math.ceil(allCustomers.length / recordsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            $pagination.append(`<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`);
        }

        // Gắn sự kiện click bằng phương thức .on() của jQuery
        $pagination.on('click', '.page-item', function (e) {
            e.preventDefault();
            currentPage = parseInt($(this).text());
            renderTable(currentPage);
            $(this).addClass('active').siblings().removeClass('active');
        });
    }

    // --- KHỞI TẠO ---
    renderTable(currentPage);
    setupPagination();
});