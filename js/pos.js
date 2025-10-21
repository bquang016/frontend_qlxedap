$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU MẪU VÀ KHAI BÁO BIẾN
     * ==================================
     */
    // Trong thực tế, dữ liệu này sẽ được lấy từ API
    const availableBikes = [
        { id: 1, name: 'Vitus Substance 2', type: 'Xe địa hình', price: 60000, img: 'https://images.immediate.co.uk/production/volatile/sites/21/2023/02/Vitus-Substance-2-GRX-RX600-01-3c58257.jpg?quality=90&resize=768,574', status: 'available' },
        { id: 2, name: 'Giant Contend 3', type: 'Xe đua', price: 75000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-P_H-p-1mOa-UjY-4V2V3kF-rT_bX_xZA&s', status: 'available' },
        { id: 3, name: 'Specialized Diverge', type: 'Xe địa hình', price: 65000, img: 'https://images.immediate.co.uk/production/volatile/sites/21/2021/03/Specialized-Diverge-Comp-Carbon-2021-01-e236614.jpg?quality=90&resize=768,574', status: 'available' },
        { id: 4, name: 'Trek Domane AL 2', type: 'Xe thành phố', price: 50000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x-q_jR7a5Xz-v9z7Y5t6wz_G9rY_xO_k_A&s', status: 'unavailable' },
        { id: 5, name: 'Cannondale Topstone', type: 'Xe địa hình', price: 62000, img: 'https://www.theedgecycles.com/media/catalog/product/cache/b18c64582f3747ea0c1f20c43bb0436a/c/a/cannondale_topstone_4_1.webp', status: 'available' },
        { id: 6, name: 'Scott Speedster 50', type: 'Xe đua', price: 72000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh-B9w_Z-D9V9s4i3_xXw_Z_wV5z-gI_K4A&s', status: 'available' },
    ];
    let cart = []; // Mảng chứa các xe đã được chọn

    // Lựa chọn các element
    const $bikeListContainer = $('#bike-list-container .row');
    const $cartItemsContainer = $('#cart-items');
    const $subtotal = $('#subtotal');
    const $total = $('#total');
    const $addCustomerForm = $('#add-customer-form');
    const $addCustomerModal = $('#addCustomerModal');
    // Lựa chọn các element mới nếu cần tương tác (ví dụ: nút Sáng/Tối)
    const $styleSwitcherToggle = $('.style-switcher-toggle i');
    const $html = $('html');

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ
     * ==================================
     */

    // Hàm định dạng số sang tiền tệ VND
    function formatCurrency(number) {
        return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    // Hàm render (vẽ) danh sách xe đạp
    function renderBikes(bikesToRender) {
        $bikeListContainer.empty();
        if (bikesToRender.length === 0) {
            $bikeListContainer.append('<div class="col-12 text-center text-muted">Không tìm thấy xe phù hợp.</div>');
            return;
        }
        $.each(bikesToRender, function(i, bike){
            const isInCart = cart.some(item => item.id === bike.id);
            const isDisabled = bike.status !== 'available' || isInCart;
            const bikeCardHTML = `
                <div class="col">
                    <div class="card h-100 bike-card ${isDisabled ? 'disabled' : ''}" data-id="${bike.id}">
                        <img class="card-img-top bike-card-img" src="${bike.img}" alt="${bike.name}">
                        <div class="card-body text-center p-2">
                            <h6 class="card-title mb-1">${bike.name}</h6>
                            <p class="card-text text-primary fw-semibold">${formatCurrency(bike.price)}/giờ</p>
                        </div>
                    </div>
                </div>`;
            $bikeListContainer.append(bikeCardHTML);
        });
    }

    // Hàm render giỏ hàng
    function renderCart() {
        $cartItemsContainer.empty();
        if (cart.length === 0) {
            $cartItemsContainer.append('<li class="list-group-item text-center text-muted">Chưa có xe nào được chọn</li>');
        } else {
            $.each(cart, function(i, item){
                const cartItemHTML = `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="my-0 small">${item.name}</h6>
                            <small class="text-muted">${formatCurrency(item.price)}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger btn-remove-cart" data-id="${item.id}"><i class="bx bx-x"></i></button>
                    </li>`;
                $cartItemsContainer.append(cartItemHTML);
            });
        }
        updateTotals();
    }

    // Hàm cập nhật tổng tiền
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        $subtotal.text(formatCurrency(subtotal));
        $total.text(formatCurrency(subtotal)); // Tạm thời chưa có giảm giá
    }

    // Hàm tìm kiếm và render lại
    function filterAndRenderBikes() {
        const searchTerm = $('#bike-search').val().toLowerCase();
        const filteredBikes = availableBikes.filter(bike =>
            bike.name.toLowerCase().includes(searchTerm) ||
            bike.type.toLowerCase().includes(searchTerm)
        );
        renderBikes(filteredBikes);
    }

    /**
     * ==================================
     * GẮN CÁC SỰ KIỆN
     * ==================================
     */

    // Sự kiện click chọn xe để thêm vào giỏ hàng
    $bikeListContainer.on('click', '.bike-card:not(.disabled)', function() {
        const bikeId = $(this).data('id');
        const selectedBike = availableBikes.find(b => b.id === bikeId);
        if (selectedBike) {
            cart.push(selectedBike);
            renderCart();
            // Cập nhật lại danh sách xe để vô hiệu hóa xe vừa chọn
            // (Không cần gọi filterAndRenderBikes nếu renderBikes đã xử lý class disabled dựa trên cart)
             $(this).addClass('disabled'); // Chỉ cần disable thẻ vừa click
        }
    });

    // Sự kiện click xóa xe khỏi giỏ hàng
    $cartItemsContainer.on('click', '.btn-remove-cart', function() {
        const bikeId = $(this).data('id');
        cart = cart.filter(item => item.id !== bikeId);
        renderCart();
        // Kích hoạt lại thẻ xe trong danh sách
        $bikeListContainer.find(`.bike-card[data-id="${bikeId}"]`).removeClass('disabled');
    });

    // Sự kiện tìm kiếm xe
    $('#bike-search').on('input', filterAndRenderBikes);

    // === LOGIC XỬ LÝ MODAL THÊM KHÁCH HÀNG ===
    $addCustomerForm.on('submit', function(e) {
        e.preventDefault(); // Ngăn form gửi đi và tải lại trang

        // Lấy dữ liệu từ form
        const newCustomer = {
            name: $('#customer-name').val(),
            phone: $('#customer-phone').val(),
            email: $('#customer-email').val()
        };

        // Giả lập việc lưu thành công (Trong thực tế sẽ gọi API)
        console.log('Đã lưu khách hàng mới:', newCustomer);
        alert('Thêm khách hàng ' + newCustomer.name + ' thành công!');

        // Đóng modal
        $addCustomerModal.modal('hide');
        $addCustomerForm[0].reset();

        // Cập nhật ô tìm kiếm khách hàng với SĐT vừa nhập (tùy chọn)
        $('.input-group .form-control[placeholder*="SĐT"]').val(newCustomer.phone);
    });

    // === NÚT TẠO ĐƠN THUÊ (Chuyển trang) ===
    $('#checkout-btn').on('click', function() {
        // Lưu giỏ hàng vào localStorage trước khi chuyển trang
        // Kiểm tra xem giỏ hàng có trống không
         if (cart.length === 0) {
            alert('Vui lòng chọn ít nhất một xe để tạo đơn thuê.');
            return; // Ngăn chuyển trang nếu giỏ hàng trống
        }
        localStorage.setItem('posCart', JSON.stringify(cart));
        // Lưu thông tin khách hàng (nếu có)
        // localStorage.setItem('posCustomer', JSON.stringify(currentCustomer));
        window.location.href = 'checkout.html'; // Chuyển đến trang thanh toán
    });

     // === XỬ LÝ NÚT SÁNG/TỐI (Tương tự promotion.js) ===
    // Đặt icon ban đầu
    if ($html.hasClass('dark-style')) { $styleSwitcherToggle.addClass('bx bx-sun'); }
    else { $styleSwitcherToggle.addClass('bx bx-moon'); }

    $('.style-switcher-toggle').parent().on('click', function(e) { // Gắn vào thẻ cha <a>
        e.preventDefault();
       if ($html.hasClass('dark-style')) {
           $html.removeClass('dark-style').addClass('light-style');
           $styleSwitcherToggle.removeClass('bx-sun').addClass('bx-moon');
           // localStorage.setItem('theme', 'light');
       } else {
           $html.removeClass('light-style').addClass('dark-style');
           $styleSwitcherToggle.removeClass('bx-moon').addClass('bx-sun');
           // localStorage.setItem('theme', 'dark');
       }
    });
    // ============================================

    // --- KHỞI TẠO ---
    renderBikes(availableBikes); // Render toàn bộ xe lần đầu
});