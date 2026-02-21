// ===========================
//  Todo List — script.js
// ===========================

// ── Data & State ──
let daftarTugas = JSON.parse(localStorage.getItem('daftar-tugas') || '[]');
let filterAktif = 'semua';
let kataCari = '';
let idEdit = null;

// ── Elemen DOM ──
const inputTugas = document.getElementById('input-tugas');
const inputTanggal = document.getElementById('input-tanggal');
const tombolTambah = document.getElementById('tombol-tambah');
const inputCari = document.getElementById('input-cari');
const tombolFilter = document.getElementById('tombol-filter');
const menuFilter = document.getElementById('menu-filter');
const isiTabel = document.getElementById('isi-tabel');
const tampilanKosong = document.getElementById('tampilan-kosong');
const jmlTotal = document.getElementById('jumlah-total');
const jmlSelesai = document.getElementById('jumlah-selesai');
const jmlBelum = document.getElementById('jumlah-belum');
const teksProgres = document.getElementById('teks-progres');
const batangProgres = document.getElementById('batang-progres');
const latarModal = document.getElementById('latar-modal');
const editNama = document.getElementById('edit-nama');
const editTgl = document.getElementById('edit-tanggal');
const batalModal = document.getElementById('batal-modal');
const simpanModal = document.getElementById('simpan-modal');
const notifToast = document.getElementById('notif-toast');

// ── Utilitas ──
function buatId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function simpanData() {
    localStorage.setItem('daftar-tugas', JSON.stringify(daftarTugas));
}

function formatTanggal(str) {
    if (!str) return 'No due date';
    const tgl = new Date(str + 'T00:00:00');
    return tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function cekTanggal(str) {
    if (!str) return '';
    const sekarang = new Date(); sekarang.setHours(0, 0, 0, 0);
    const jatuhTempo = new Date(str + 'T00:00:00');
    const selisih = Math.ceil((jatuhTempo - sekarang) / 86400000);
    if (selisih < 0) return 'lewat';
    if (selisih <= 3) return 'hampir';
    return '';
}

// ── Toast ──
let timerToast;
function tampilkanToast(pesan) {
    notifToast.textContent = pesan;
    notifToast.classList.remove('tersembunyi');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => notifToast.classList.add('tersembunyi'), 2500);
}

// ── Statistik ──
function perbaruiStat() {
    const total = daftarTugas.length;
    const selesai = daftarTugas.filter(t => t.selesai).length;
    const belum = total - selesai;
    const persen = total === 0 ? 0 : Math.round((selesai / total) * 100);

    function animasiAngka(el, nilai) {
        if (el.textContent !== String(nilai)) {
            el.textContent = nilai;
            el.classList.remove('loncat');
            void el.offsetWidth;
            el.classList.add('loncat');
        }
    }

    animasiAngka(jmlTotal, total);
    animasiAngka(jmlSelesai, selesai);
    animasiAngka(jmlBelum, belum);
    teksProgres.textContent = persen + '%';
    batangProgres.style.width = persen + '%';
}

// ── Render ──
function tampilkan() {
    let daftar = [...daftarTugas];

    if (filterAktif === 'selesai') daftar = daftar.filter(t => t.selesai);
    if (filterAktif === 'belum') daftar = daftar.filter(t => !t.selesai);

    if (kataCari.trim()) {
        const q = kataCari.toLowerCase();
        daftar = daftar.filter(t => t.nama.toLowerCase().includes(q));
    }

    isiTabel.innerHTML = '';

    if (daftar.length === 0) {
        tampilanKosong.classList.remove('tersembunyi');
    } else {
        tampilanKosong.classList.add('tersembunyi');
        daftar.forEach(t => isiTabel.appendChild(buatBaris(t)));
    }

    perbaruiStat();
}

function buatBaris(tugas) {
    const tr = document.createElement('tr');
    tr.className = 'baris-tugas' + (tugas.selesai ? ' sudah-selesai' : '');
    tr.dataset.id = tugas.id;

    const statusTgl = cekTanggal(tugas.tanggal);
    const labelSelesai = tugas.selesai ? 'Undo' : 'Done';

    tr.innerHTML = `
    <td><span class="nama-tugas">${amanHtml(tugas.nama)}</span></td>
    <td><span class="teks-tanggal ${statusTgl}">${formatTanggal(tugas.tanggal)}</span></td>
    <td>
      <span class="badge-status ${tugas.selesai ? 'selesai' : 'belum'}">
        <span class="titik-status"></span>
        ${tugas.selesai ? 'Completed' : 'Pending'}
      </span>
    </td>
    <td>
      <div class="sel-aksi">
        <button class="tombol-aksi tombol-selesai" title="${labelSelesai}">
          ${tugas.selesai
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
        }
        </button>
        <button class="tombol-aksi tombol-edit" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="tombol-aksi tombol-hapus" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </td>
  `;

    tr.querySelector('.tombol-selesai').addEventListener('click', () => tandaiSelesai(tugas.id));
    tr.querySelector('.tombol-edit').addEventListener('click', () => bukaEdit(tugas.id));
    tr.querySelector('.tombol-hapus').addEventListener('click', () => hapusTugas(tugas.id, tr));

    return tr;
}

function amanHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── CRUD ──
function tambahTugas() {
    const nama = inputTugas.value.trim();
    if (!nama) { tampilkanToast('⚠️ Nama tugas tidak boleh kosong!'); inputTugas.focus(); return; }

    daftarTugas.unshift({
        id: buatId(),
        nama,
        tanggal: inputTanggal.value || '',
        selesai: false,
    });

    simpanData();
    tampilkan();
    tampilkanToast('✅ Tugas berhasil ditambahkan!');
    inputTugas.value = '';
    inputTanggal.value = '';
    inputTugas.focus();
}

function tandaiSelesai(id) {
    const tugas = daftarTugas.find(t => t.id === id);
    if (!tugas) return;
    tugas.selesai = !tugas.selesai;
    simpanData();
    tampilkan();
    tampilkanToast(tugas.selesai ? '🎉 Tugas selesai!' : '🔄 Tugas dikembalikan ke pending');
}

function hapusTugas(id, baris) {
    baris.classList.add('keluar');
    baris.addEventListener('animationend', () => {
        daftarTugas = daftarTugas.filter(t => t.id !== id);
        simpanData();
        tampilkan();
        tampilkanToast('🗑️ Tugas dihapus');
    }, { once: true });
}

// ── Edit Modal ──
function bukaEdit(id) {
    const tugas = daftarTugas.find(t => t.id === id);
    if (!tugas) return;
    idEdit = id;
    editNama.value = tugas.nama;
    editTgl.value = tugas.tanggal || '';
    latarModal.classList.remove('tersembunyi');
    editNama.focus();
}

function tutupModal() {
    latarModal.classList.add('tersembunyi');
    idEdit = null;
}

function simpanEdit() {
    const nama = editNama.value.trim();
    if (!nama) { tampilkanToast('⚠️ Nama tugas tidak boleh kosong!'); return; }
    const tugas = daftarTugas.find(t => t.id === idEdit);
    if (!tugas) return;
    tugas.nama = nama;
    tugas.tanggal = editTgl.value || '';
    simpanData();
    tampilkan();
    tutupModal();
    tampilkanToast('✏️ Tugas berhasil diperbarui!');
}

// ── Filter ──
function aturFilter(filter) {
    filterAktif = filter;
    document.querySelectorAll('.opsi-filter').forEach(btn =>
        btn.classList.toggle('aktif', btn.dataset.filter === filter)
    );
    tombolFilter.classList.toggle('aktif', filter !== 'semua');
    menuFilter.classList.add('tersembunyi');
    tampilkan();
}

// ── Event Listeners ──
tombolTambah.addEventListener('click', tambahTugas);
inputTugas.addEventListener('keydown', e => { if (e.key === 'Enter') tambahTugas(); });

inputCari.addEventListener('input', e => { kataCari = e.target.value; tampilkan(); });

tombolFilter.addEventListener('click', e => {
    e.stopPropagation();
    menuFilter.classList.toggle('tersembunyi');
});

menuFilter.addEventListener('click', e => {
    const opsi = e.target.closest('.opsi-filter');
    if (opsi) aturFilter(opsi.dataset.filter);
});

document.addEventListener('click', e => {
    if (!e.target.closest('.bungkus-filter')) menuFilter.classList.add('tersembunyi');
});

batalModal.addEventListener('click', tutupModal);
simpanModal.addEventListener('click', simpanEdit);
latarModal.addEventListener('click', e => { if (e.target === latarModal) tutupModal(); });

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !latarModal.classList.contains('tersembunyi')) tutupModal();
    if (e.key === 'Enter' && !latarModal.classList.contains('tersembunyi')) simpanEdit();
    // Ctrl+F → fokus pencarian
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputCari.focus();
        inputCari.select();
    }
});

// ── Jalankan ──
tampilkan();
