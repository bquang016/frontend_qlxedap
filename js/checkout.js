$(document).ready(function () {
    /**
     * ==================================
     * DỮ LIỆU GIẢ LẬP (SIMULATED DATA)
     * ==================================
     */
    const simulatedCart = [
        { id: 1, name: 'Vitus Substance 2', price: 60000 },
        { id: 2, name: 'Giant Contend 3', price: 75000 }
    ];
    const simulatedCustomer = {
        name: 'Nguyễn Văn An',
        phone: '0901234567'
    };
    const validCoupons = {
        "GIAMGIA10": { type: "percentage", value: 10 },
        "WELCOME50": { type: "fixed", value: 50000 },
    };

    let subtotal = 0;
    let discountAmount = 0;

    // Lựa chọn các element
    const $customerInfo = $('#customer-info');
    const $orderItemsList = $('#order-items-list');
    const $subtotalEl = $('#subtotal');
    const $discountAmountEl = $('#discount-amount');
    const $finalTotalEl = $('#final-total');
    const $couponCodeInput = $('#coupon-code');
    const $applyCouponBtn = $('#apply-coupon-btn');
    const $couponMessage = $('#coupon-message');
    const $confirmPaymentBtn = $('#confirm-payment-btn');
    
    // === CÁC ELEMENT MỚI ===
    const $backBtn = $('#back-btn');
    const $paymentTransferRadio = $('#paymentTransfer');
    // Khởi tạo đối tượng Modal của Bootstrap 5
    const qrCodeModal = new bootstrap.Modal($('#qrCodeModal')[0]);

    /**
     * ==================================
     * CÁC HÀM XỬ LÝ
     * ==================================
     */

    function formatCurrency(number) {
        return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    function renderOrderDetails() {
        $customerInfo.html(`
            <h6 class="fw-semibold">Khách hàng:</h6>
            <p class="mb-0">${simulatedCustomer.name}</p>
            <p class="mb-0">${simulatedCustomer.phone}</p>
        `);
        $orderItemsList.empty();
        $.each(simulatedCart, function(i, item) {
            $orderItemsList.append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name}
                    <span class="fw-semibold">${formatCurrency(item.price)}</span>
                </li>
            `);
        });
    }

    function calculateTotals() {
        subtotal = simulatedCart.reduce((sum, item) => sum + item.price, 0);
        discountAmount = 0;
        const couponCode = $couponCodeInput.val().trim().toUpperCase();

        if (validCoupons[couponCode]) {
            const coupon = validCoupons[couponCode];
            if (coupon.type === "percentage") {
                discountAmount = (subtotal * coupon.value) / 100;
            } else if (coupon.type === "fixed") {
                discountAmount = coupon.value;
            }
            if (discountAmount > subtotal) discountAmount = subtotal;
            $couponMessage.text(`Áp dụng mã thành công! Bạn được giảm ${formatCurrency(discountAmount)}.`).removeClass('coupon-error').addClass('coupon-success');
        } else if (couponCode !== "") {
            $couponMessage.text('Mã giảm giá không hợp lệ.').removeClass('coupon-success').addClass('coupon-error');
        } else {
            $couponMessage.text('').removeClass('coupon-success coupon-error');
        }

        const finalTotal = subtotal - discountAmount;
        $subtotalEl.text(formatCurrency(subtotal));
        $discountAmountEl.text(`- ${formatCurrency(discountAmount)}`);
        $finalTotalEl.text(formatCurrency(finalTotal));
    }

    /**
     * ==================================
     * GẮN CÁC SỰ KIỆN
     * ==================================
     */

    // Sự kiện click nút "Áp dụng" mã giảm giá
    $applyCouponBtn.on('click', calculateTotals);

    // Sự kiện click nút "Xác nhận Thanh toán"
    $confirmPaymentBtn.on('click', function() {
        const paymentMethod = $('input[name="paymentMethod"]:checked').val();
        alert('Tạo đơn hàng thành công! (Xem chi tiết trong Console)');
        console.log({
            customer: simulatedCustomer,
            cart: simulatedCart,
            subtotal: subtotal,
            discount: discountAmount,
            total: subtotal - discountAmount,
            paymentMethod: paymentMethod
        });
        // Chuyển về trang POS sau khi hoàn tất
        // window.location.href = 'pos.html'; 
    });

    // === SỰ KIỆN MỚI: CLICK NÚT QUAY LẠI ===
    $backBtn.on('click', function() {
        // Quay lại trang trước đó trong lịch sử trình duyệt (là trang pos.html)
        history.back();
    });
    
    // === SỰ KIỆN MỚI: CLICK CHỌN CHUYỂN KHOẢN ===
    $paymentTransferRadio.on('click', function() {
        // Nếu radio "Chuyển khoản" được chọn, hiển thị modal
        if ($(this).is(':checked')) {
            qrCodeModal.show();
        }
    });

    // --- KHỞI TẠO KHI TẢI TRANG ---
    renderOrderDetails();
    calculateTotals();
});