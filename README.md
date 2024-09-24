# Tutorial Instalasi: Proyek ReactJS dengan Bun dan TypeScript untuk SIMA APP Web Instansi

## 1. Instal Bun dan NodeJS

Pastikan Anda sudah menginstal Bun dan NodeJS. Jika belum, Anda dapat menginstalnya dengan perintah berikut melalui terminal atau command prompt:

### Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### NodeJS

Kunjungi [NodeJS](https://nodejs.org/en) untuk mengunduh dan menginstal.

## 2. Unduh Proyek

Anda dapat mengunduh proyek dengan dua cara:

### Menggunakan Git

Jika Anda memiliki Git terinstal, jalankan perintah berikut untuk meng-clone repository:

```bash
git clone git@github.com:dimassfeb-09/sima-app-web.git
```

### Mengunduh File ZIP

Jika Anda lebih memilih, Anda juga dapat mengunduh proyek sebagai file ZIP. Kunjungi halaman repository dan klik tombol "Code", kemudian pilih "Download ZIP".

## 3. Ekstrak File Proyek

Jika Anda mengunduh file ZIP, ekstrak file `sima-app-web-main.zip` ke folder yang Anda inginkan.

## 4. Masuk ke dalam Folder Proyek

Masuk ke dalam folder hasil ekstrak:

```bash
cd sima-app-web
```

## 5. Buka Terminal

Buka terminal di dalam folder proyek yang telah Anda masuki.

## 6. Struktur Folder Proyek

Struktur folder proyek Anda seharusnya terlihat seperti ini:

```
sima-app-instansi/
├── src/
│   ├── utils/
│   ├── App.tsx
│   └── index.css
│   └── main.tsx
│   └── vite-env.d.ts
├── tsconfig.json
└── package.json
```

## 7. Instal Dependency

Jalankan perintah berikut untuk menginstal semua dependency yang diperlukan:

```bash
bun install
```

## 8. Menjalankan Proyek

Untuk menjalankan proyek, gunakan perintah berikut:

```bash
bun dev
```

Aplikasi Anda akan berjalan di [http://localhost:5173](http://localhost:5173).

## Catatan

- Pastikan Bun dan NodeJS terinstal dengan benar agar proyek dapat berjalan tanpa masalah.
- Jika Anda mengalami masalah, periksa kembali langkah-langkah instalasi atau buka dokumentasi resmi Bun dan NodeJS.

Selamat mencoba dan semoga berhasil!
