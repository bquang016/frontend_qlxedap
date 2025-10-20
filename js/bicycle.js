// Sự kiện 'DOMContentLoaded' đảm bảo code chỉ chạy sau khi toàn bộ cây DOM (HTML) đã được tải xong.
// Điều này rất quan trọng để tránh lỗi "element not found".
document.addEventListener('DOMContentLoaded', function () {
    
    // --- DỮ LIỆU MẪU ---
    // Trong thực tế, dữ liệu này sẽ được lấy từ backend thông qua API.
    // Ở đây, chúng ta tạo một mảng các đối tượng để giả lập.
    const allBikes = [
        { id: 1, img: 'URL_ANH_1', name: 'Vitus Substance 2', type: 'Xe địa hình', price: 60000, status: 'Đang có sẵn' },
        { id: 2, img: 'URL_ANH_2', name: 'Giant Contend 3', type: 'Xe đua', price: 75000, status: 'Đang cho thuê' },
        { id: 3, img: 'URL_ANH_3', name: 'Specialized Diverge', type: 'Xe địa hình', price: 65000, status: 'Đang có sẵn' },
        { id: 4, img: 'URL_ANH_4', name: 'Trek Domane AL 2', type: 'Xe thành phố', price: 50000, status: 'Bảo trì' },
        { id: 5, img: 'URL_ANH_5', name: 'Cannondale Topstone', type: 'Xe địa hình', price: 62000, status: 'Đang có sẵn' },
        { id: 6, img: 'URL_ANH_6', name: 'Scott Speedster 50', type: 'Xe đua', price: 72000, status: 'Đang có sẵn' },
    ];

    // --- KHAI BÁO BIẾN ---
    const tableBody = document.getElementById('bike-table-body');
    const paginationContainer = document.getElementById('pagination');
    const recordsPerPage = 4; // Số xe đạp hiển thị trên mỗi trang
    let currentPage = 1; // Trang hiện tại, mặc định là trang 1

    /**
     * Hàm này nhận vào trạng thái (string) và trả về một đoạn HTML của badge tương ứng.
     * Giúp code trong hàm renderTable gọn gàng hơn.
     */
    function getStatusBadge(status) {
        if (status === 'Đang có sẵn') return `<span class="badge bg-label-success me-1">${status}</span>`;
        if (status === 'Đang cho thuê') return `<span class="badge bg-label-warning me-1">${status}</span>`;
        return `<span class="badge bg-label-danger me-1">${status}</span>`;
    }

    /**
     * Hàm chính để hiển thị dữ liệu lên bảng.
     * @param {number} page - Số trang cần hiển thị.
     */
    function renderTable(page) {
        // Xóa hết các dòng cũ trong bảng trước khi vẽ dòng mới
        tableBody.innerHTML = '';

        // Tính toán vị trí bắt đầu và kết thúc của dữ liệu trong mảng allBikes
        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedItems = allBikes.slice(start, end);

        // Lặp qua mảng dữ liệu của trang hiện tại và tạo HTML cho mỗi dòng
        paginatedItems.forEach(bike => {
            const row = document.createElement('tr'); // Tạo thẻ <tr>
            // Dùng template literal (dấu `) để tạo chuỗi HTML dễ dàng hơn.
            row.innerHTML = `
                <td><strong>#${bike.id}</strong></td>
                <td><img src="${bike.img}" alt="${bike.name}" class="rounded-circle bike-avatar" /></td>
                <td>${bike.name}</td>
                <td>${bike.type}</td>
                <td>${bike.price.toLocaleString('vi-VN')} VND</td>
                <td>${getStatusBadge(bike.status)}</td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" href="#"><i class="bx bx-edit-alt me-1"></i> Sửa</a>
                            <a class="dropdown-item" href="#"><i class="bx bx-trash me-1"></i> Xóa</a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row); // Thêm dòng vừa tạo vào thân bảng
        });
    }

    /**
     * Hàm để tạo các nút phân trang.
     */
    function setupPagination() {
        paginationContainer.innerHTML = ''; // Xóa các nút phân trang cũ
        const pageCount = Math.ceil(allBikes.length / recordsPerPage); // Tính tổng số trang

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`; // Thêm class 'active' cho trang hiện tại
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;

            // Thêm sự kiện 'click' cho mỗi nút trang
            li.addEventListener('click', (e) => {
                e.preventDefault(); // Ngăn trình duyệt tải lại trang khi bấm vào thẻ <a>
                currentPage = i; // Cập nhật trang hiện tại
                renderTable(currentPage); // Vẽ lại bảng với dữ liệu của trang mới
                
                // Cập nhật lại class 'active' cho đúng nút vừa bấm
                const currentActive = paginationContainer.querySelector('.active');
                if (currentActive) currentActive.classList.remove('active');
                li.classList.add('active');
            });

            paginationContainer.appendChild(li); // Thêm nút trang vào container
        }
    }

    // --- LỜI GỌI HÀM KHỞI TẠO ---
    // Lần đầu tải trang, hiển thị dữ liệu của trang 1 và tạo các nút phân trang.
    renderTable(currentPage);
    setupPagination();
});