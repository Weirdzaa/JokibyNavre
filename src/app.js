document.addEventListener('alpine:init', () => {
    Alpine.data('joki', () => ({
        items: [
            { id: 1, name: 'Joki Rank Epic', img: 'epic.JPEG', price: 7000},
            { id: 2, name: 'Joki Rank Legend', img: 'legend.JPEG', price: 9000},
            { id: 3, name: 'Joki Rank Mythic', img: 'mythic.JPEG', price: 12000},
            { id: 4, name: 'Joki Rank Honor', img: 'honor.JPEG', price: 14000},
            { id: 5, name: 'Joki Rank Glory', img: 'glory.JPEG', price: 17000},
            { id: 6, name: 'Joki Rank Immortal', img: 'immo.JPEG', price: 20000},
        ],
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {

            // Cek barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // Jika cart masih kosong
            if (!cartItem) {
                this.items.push({...newItem, quantity: 1, total: newItem.price});
                this.quantity++;
                this.total += newItem.price;
            } else {
                // jika barang sudah ada, Cek barang berbeda atau sama
                this.items = this.items.map((item) => {
                    // Jika barang berbeda
                    if (item.id !== newItem.id){
                        return item;
                    } else {
                        // Jika barang sama
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            // Item yang akan di remove
            const cartItem = this.items.find((item) => item.id === id);

            // Jika lebih dari 1
            if(cartItem.quantity > 1) {
                // Telusuri satu per satu
                this.items = this.items.map((item) => {
                    // Jika bukan barang yang di pilih
                    if (item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                });
            } else if (cartItem.quantity === 1) {
                // Jika barang sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        },
    });
});

// Validasi untuk form

document.addEventListener('DOMContentLoaded', function () {
    const checkoutButton = document.querySelector('.checkout-button');
    const form = document.querySelector('#checkoutForm');

    // Awalnya tombol checkout dinonaktifkan
    checkoutButton.disabled = true;

    function checkFormValidity() {
        let allFieldsFilled = true;

        // Validasi untuk semua elemen form
        Array.from(form.elements).forEach(element => {
            if (element.type !== 'submit' && element.type !== 'hidden' && element.value.trim() === '') {
                allFieldsFilled = false;
            }
        });

        if (allFieldsFilled) {
            checkoutButton.disabled = false;
            checkoutButton.classList.remove('disabled');
        } else {
            checkoutButton.disabled = true;
            checkoutButton.classList.add('disabled');
        }
    }

    // Periksa validasi form setiap kali input berubah
    form.addEventListener('input', checkFormValidity);

    // Kirim data ketika checkout
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Mencegah reload halaman

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const message = formatMessage(data);

        // Kirim pesan WhatsApp
        window.open('https://wa.me/6282128474290?text=' + encodeURIComponent(message));

        // Log data di konsol
        console.log("Data yang dikirim:", data);

        // Kirim data ke server menggunakan fetch
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => {
                console.log("Response dari server:", result);
                // Tambahkan logika setelah berhasil checkout
                alert('Checkout berhasil!');
            })
    });
});

// Format pesan untuk WhatsApp
const formatMessage = (data) => {
    try {
        const items = JSON.parse(data.items);
        const itemsList = items.map(item => `${item.name} (${item.quantity} x ${rupiah(item.total)})`).join('\n');

        return `Data Customer:\n` +
               `Nama: ${data.name}\n` +
               `Email: ${data.email}\n` +
               `Phone: ${data.phone}\n\n` +
               `Data Pesanan:\n${itemsList}\n` +
               `Total: ${rupiah(data.total)}\n\n` +
               `Terima Kasih.`;
    } catch (error) {
        console.error('Kesalahan parsing data items:', error);
        return 'Kesalahan dalam format data pesanan.';
    }
};

// Fungsi untuk format ke Rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};
