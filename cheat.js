const SUPA_URL = "https://gnjcmrqfooalhynogeyt.supabase.co";

const SUPA_KEY = "sb_publishable_0vh5J0rfiHxGOxkwGZuBYA_YBo-xblo";

const USER_AGENT_ASLI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";



let AUTH_BEARER = "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjlmNmRiY2ExLWIzOTItNDY4YS1iZWNiLTE0MjgzZjI0N2JlOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2duamNtcnFmb29hbGh5bm9nZXl0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTc4ODIyZi01MWVlLTQzMDItOGVhOC1jMGM4NjBjNTIyNGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTQ0MjY0LCJpYXQiOjE3ODIxNDA6NjQsImVtYWlsIjoic2V2ZW5rbmlnaHRhcGlzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sYXVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJzZXZlbmtuaWdodGFwaXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E3ODgyMmYtNTFlZS00MzAyLThlYTgtYzBjODYwYzUyMjRhIiwidXNlcm5hbWUiOiJhcGlzMyJ9LCJyb2xlIjoiYXV0aGVudGifikFkIiwiYWFsIjoiYWFsaSIsImFtcilbXX0sInNlc3NiproiOiJkN2ZlNzIzNS03MzNiLTQwZmUtOWRlZi00Y2FiNzViOGMzNDAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.lCmelW-8h5jVIAFQUiL3Ypgn_CykcvU7O7ULLEUksSjcZ7mlGY1hP1zgl82NweUJ4D2_ID0-dEB1Ip38Wy12FA";

let REFRESH_TOKEN = "7t3zgivo5f7v"; 



const TIPE_PACK_GACHA = "bronze"; 

const HARGA_PACK_GACHA = 600; 

let matchCounter = 1;

const SBC_BLACKLIST = new Set(); 



const HEADERS_SILUMAN = {

    "accept": "*/*",

    "apikey": SUPA_KEY,

    "authorization": AUTH_BEARER,

    "content-type": "application/json",

    "origin": "https://34-0.xyz",

    "referer": "https://34-0.xyz/",

    "user-agent": USER_AGENT_ASLI

};



async function autoRefreshToken() {

    console.log(`\n🔄 [SYSTEM AUTO-HEAL] Token expired! Meminta tiket akses baru...`);

    try {

        const response = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {

            method: 'POST',

            headers: { "apikey": SUPA_KEY, "Content-Type": "application/json", "origin": "https://34-0.xyz", "referer": "https://34-0.xyz/", "user-agent": USER_AGENT_ASLI },

            body: JSON.stringify({ refresh_token: REFRESH_TOKEN })

        });

        if (response.ok) {

            const data = await response.json();

            AUTH_BEARER = `Bearer ${data.access_token}`; 

            REFRESH_TOKEN = data.refresh_token; 

            HEADERS_SILUMAN.authorization = AUTH_BEARER; 

            console.log(`\x1b[32m✅ [HEAL SUKSES] Tiket diperbarui!\x1b[0m\n`);

            return true;

        } else {

            console.log(`❌ [HEAL GAGAL] Server menolak refresh token.`);

        }

    } catch (e) {}

    return false;

}



// 🧠 LOGIKA ULTRA-CERDAS: Ambil ID, scan kelelahan, lakukan auto-rotasi, dan cetak info squad

async function dapatkanIdSkuadUtamaDanRotasi() {

    const idStarter = new Set();

    try {

        // 1. Tarik semua data amunisi pemain lu dari database

        const res = await fetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`, { headers: HEADERS_SILUMAN });

        if (!res.ok) return idStarter;

        

        const rosterMentah = await res.json();

        

        // Klasifikasi pemain inti vs cadangan di brankas lu

        let starters = rosterMentah.filter(p => p.slot !== null && p.slot !== undefined);

        let bench = rosterMentah.filter(p => p.slot === null || p.slot === undefined);

        

        // Deteksi apakah ada pemain inti yang staminanya drop parah / cedera (form <= -25)

        let adaPemainCapek = starters.some(p => (p.form ?? 0) <= -25);

        

        if (adaPemainCapek) {

            console.log(`\n🔄 [AUTO-ROTATION] Mendeteksi pemain gempor (Form <= -25) di Skuad Utama! Menyiapkan pergantian...`);

            

            // Tarik info katalog nama publik biar log rotasinya gak polosan ID angka doang

            const playerIds = rosterMentah.map(r => r.player_id);

            const resKat = await fetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`, { headers: HEADERS_SILUMAN });

            const katalog = await resKat.json();

            const mapKat = new Map(katalog.map(p => [p.id, p]));

            

            // Ambil semua pemain cadangan yang staminanya masih bugar (form di atas -25)

            let sisaBenchSehat = bench.filter(b => (b.form ?? 0) > -25);

            

            // Urutkan cadangan sehat dari total OVR paling sangar/tinggi biar performa tim gak anjlok

            sisaBenchSehat.sort((a, b) => {

                const cA = mapKat.get(a.player_id);

                const cB = mapKat.get(b.player_id);

                const ovrA = (cA?.ovr ?? 60) + ((a.star || 1) - 1) * 3;

                const ovrB = (cB?.ovr ?? 60) + ((b.star || 1) - 1) * 3;

                return ovrB - ovrA;

            });

            

            let jumlahRotasiBerhasil = 0;

            

            for (let i = 0; i < starters.length; i++) {

                if ((starters[i].form ?? 0) <= -25) {

                    if (sisaBenchSehat.length > 0) {

                        let pemainSehatPengganti = sisaBenchSehat.shift(); // Tarik pemain sehat terbaik

                        

                        const namaCapek = mapKat.get(starters[i].player_id)?.name || `ID ${starters[i].player_id}`;

                        const namaSehat = mapKat.get(pemainSehatPengganti.player_id)?.name || `ID ${pemainSehatPengganti.player_id}`;

                        

                        console.log(`   🔁 Rotasi: [Slot ${starters[i].slot}] ❌ ${namaCapek} (Form: ${starters[i].form}) OUT -> 🔥 ${namaSehat} (Form: ${pemainSehatPengganti.form}) IN`);

                        

                        // Eksekusi penukaran posisi slot sirkulasi roster lokal

                        pemainSehatPengganti.slot = starters[i].slot;

                        starters[i].slot = null; 

                        

                        jumlahRotasiBerhasil++;

                    } else {

                        console.log(`   ⚠️ [WARNING] Gudang cadangan sehat lu habis total! Gak bisa dipaksain rotasi lagi.`);

                        break;

                    }

                }

            }

            

            // Jika ada perubahan formasi, sinkronisasikan susunan skuad baru lu langsung ke server game!

            if (jumlahRotasiBerhasil > 0) {

                const listSkuadBaru = rosterMentah.filter(p => p.slot !== null && p.slot !== undefined).map(p => ({

                    player_id: Number(p.player_id),

                    slot: Number(p.slot)

                }));

                

                console.log(`📡 Mengirim taktik susunan skuad baru ke server via Edge Function...`);

                // Catatan: Jika server lu butuh format payload mentah tanpa objek pembungkus, 

                // lu bisa ganti body-nya menjadi: JSON.stringify(listSkuadBaru)

                const response = await fetch(`${SUPA_URL}/functions/v1/set-squad`, {

                    method: 'POST',

                    headers: HEADERS_SILUMAN,

                    body: JSON.stringify({ squad: listSkuadBaru }) 

                });

                

                if (response.ok) {

                    console.log(`\x1b[32m✅ [SQUAD UPDATED] Formasi bugar berhasil disinkronisasi ke server!\x1b[0m`);

                } else {

                    console.log(`❌ [SQUAD FAILED] Server menolak formasi baru. Status: ${response.status}`);

                }

            }

        }

        

        // 2. Ambil data ulang (Re-fetch) demi keaslian log status squad di konsol

        const resRosterTerbaru = await fetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`, { headers: HEADERS_SILUMAN });

        const rosterTerbaru = await resRosterTerbaru.json();

        const starterPemain = rosterTerbaru.filter(p => p.slot !== null && p.slot !== undefined);

        

        if (starterPemain.length > 0) {

            const playerIds = starterPemain.map(r => r.player_id);

            const resKat = await fetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`, { headers: HEADERS_SILUMAN });

            const katalog = await resKat.json();

            const mapKat = new Map(katalog.map(p => [p.id, p]));



            console.log(`\n📋 [SQUAD STATUS] Daftar Pemain Utama Aktif (Active XI):`);

            starterPemain.forEach((p) => {

                const c = mapKat.get(p.player_id);

                idStarter.add(Number(p.player_id));

                if (c) {

                    const totalOvr = (c.ovr != null ? c.ovr : 60) + ((p.star || 1) - 1) * 3;

                    const kasta = String(c.tier || "bronze").toUpperCase();

                    let warna = "\x1b[37m"; 

                    if (kasta.includes("GOLD")) warna = "\x1b[33m";      

                    else if (kasta.includes("SILVER")) warna = "\x1b[34m";  

                    else if (kasta.includes("LEGEN") || kasta.includes("ICON")) warna = "\x1b[35m"; 



                    console.log(`   ├─ ⚽ [Slot ${p.slot}] ${warna}${c.name}\x1b[0m (OVR: ${totalOvr} | Form: ${p.form ?? 0} | TIER: ${kasta})`);

                }

            });

            console.log(``);

        }

    } catch (e) {

        console.log(`⚠️ [WARNING] Kendala sistem saat membaca/mengatur rotasi skuad otomatis: ${e.message}`);

    }

    return idStarter;

}



function logDaftarPemainBaru(prefix, dataMurni) {

    try {

        const listKartu = dataMurni.cards || dataMurni.players || dataMurni.reward || (Array.isArray(dataMurni) ? dataMurni : [dataMurni]);

        

        if (Array.isArray(listKartu)) {

            listKartu.forEach((k, idx) => {

                const nama = k.name || k.player_name || k.player?.name || `Unknown Player (ID: ${k.player_id || '?'})`;

                const rating = k.ovr || k.player?.ovr || '??';

                const kasta = String(k.tier || k.player?.tier || 'unknown').toUpperCase();

                

                let warna = "\x1b[37m"; 

                if (kasta.includes("GOLD")) warna = "\x1b[33m";      

                else if (kasta.includes("SILVER")) warna = "\x1b[34m";  

                else if (kasta.includes("LEGEN") || kasta.includes("ICON")) warna = "\x1b[35m"; 



                console.log(`   └─ 🏃 [${idx + 1}] ${warna}${nama}\x1b[0m (OVR: ${rating} | TIER: ${kasta})`);

            });

        } else {

            console.log(`   └─ 📦 Paket dibuka tetapi gagal membaca rincian nama.`);

        }

    } catch (err) {

        console.log(`   └─ ⚠️ Gagal mem-parsing info pemain baru.`);

    }

}



async function jalankanProsesSbcOtomatis(idParaStarter = new Set()) {

    console.log(`⚙️ [SBC INSPECTOR] Memindai gudang ampas dengan rumus valid: 5 Silver + 3 Bronze...`);

    try {

        const resRos = await fetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`, { headers: HEADERS_SILUMAN });

        const rosterMentah = await resRos.json();

        if (!rosterMentah || rosterMentah.length === 0) return;



        const playerIds = [...new Set(rosterMentah.map(r => r.player_id))];

        const resKat = await fetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`, { headers: HEADERS_SILUMAN });

        const katalog = await resKat.json();

        const mapKat = new Map(katalog.map(p => [p.id, p]));



        let countGoldProtected = 0;

        let countOvrProtected = 0;

        let countStarterProtected = 0;

        let countBlacklistedProtected = 0;

        const kandidatSbc = [];



        rosterMentah.forEach(o => {

            const c = mapKat.get(o.player_id);

            if (c) {

                const pId = Number(o.player_id);

                const isStarter = idParaStarter.has(pId);

                const isBlacklisted = SBC_BLACKLIST.has(pId);

                

                const totalOvr = (c.ovr != null ? c.ovr : 60) + ((o.star || 1) - 1) * 3;

                const isGoldAtauDeity = c.tier === "gold" || c.tier === "legendary";

                const isOvrTinggi = totalOvr >= 75;



                if (isStarter) countStarterProtected++;

                else if (isBlacklisted) countBlacklistedProtected++;

                else if (isGoldAtauDeity) countGoldProtected++;

                else if (isOvrTinggi) countOvrProtected++;



                const isAsetBerharga = isStarter || isBlacklisted || isOvrTinggi || isGoldAtauDeity;



                if (!isAsetBerharga) {

                    kandidatSbc.push({ player_id: pId, name: c.name, ovr: totalOvr, tier: String(c.tier || "bronze").toLowerCase() });

                }

            }

        });



        console.log(`🛡️ [BRANKAS SECURE] Terkunci Aman: \x1b[33m${countGoldProtected} Gold\x1b[0m | \x1b[36m${countOvrProtected} OVR 75+\x1b[0m | \x1b[32m${countStarterProtected} Skuad Utama\x1b[0m | \x1b[35m${countBlacklistedProtected} Auto-Blacklist\x1b[0m`);



        const silverSampah = kandidatSbc.filter(p => p.ovr >= 67);

        const bronzeSampah = kandidatSbc.filter(p => p.ovr <= 66);



        console.log(`📊 [SBC STATS] Keranjang Sampah -> Punya: \x1b[34m${silverSampah.length}/5 Silver\x1b[0m | \x1b[31m${bronzeSampah.length}/3 Bronze\x1b[0m`);



        if (silverSampah.length >= 5 && bronzeSampah.length >= 3) {

            const listTumbalResmi = [];

            

            for (let i = 0; i < 5; i++) listTumbalResmi.push({ player_id: silverSampah[i].player_id, star: 1 });

            for (let i = 0; i < 3; i++) listTumbalResmi.push({ player_id: bronzeSampah[i].player_id, star: 1 });



            console.log(`🔥 [AUTO-SBC EXECUTE] Mengirim paket tumbal (5 Silver + 3 Bronze) ke server...`);

            const response = await fetch(`${SUPA_URL}/functions/v1/submit-sbc`, { method: 'POST', headers: HEADERS_SILUMAN, body: JSON.stringify({ sbc_id: "silver_exch", cards: listTumbalResmi }) });

            

            if (response.ok) {

                const sbcResult = await response.json();

                console.log(`\x1b[32m🎁 [SBC SUCCESS] LEGENDA! Racikan 5 Silver + 3 Bronze tembus, 1 SILVER PACK cair!\x1b[0m`);

                logDaftarPemainBaru("SBC", sbcResult);

            } else {

                const errorText = await response.text();

                console.log(`❌ [SBC FAILED] Server nolak. Alasan: ${errorText}`);

                

                if (errorText.includes("active XI") || errorText.includes("sacrifice")) {

                    console.log(`⚠️ [ANTI-CRASH] Mendeteksi kartu skuad menyelinap. Mem-blacklist ${listTumbalResmi.length} ID kartu dari list SBC putaran depan...`);

                    listTumbalResmi.forEach(t => SBC_BLACKLIST.add(t.player_id));

                }

            }

        } else {

            console.log(`📋 [SBC SKIP] Dilewati, kuota gudang sampah belum genap.`);

        }

    } catch (e) {

        console.log(`💥 [SBC ERROR] Gagal scan gudang: ${e.message}`);

    }

}



async function klaimMisiKoin() {

    try { await fetch(`${SUPA_URL}/functions/v1/claim-mission`, { method: 'POST', headers: HEADERS_SILUMAN }); } catch (e) {}

}



async function autoBukaPackGachaSultan() {

    try {

        const response = await fetch(`${SUPA_URL}/functions/v1/draft-spin`, { method: 'POST', headers: HEADERS_SILUMAN, body: JSON.stringify({ pack: TIPE_PACK_GACHA }) });

        if (response.ok) {

            const packResult = await response.json();

            console.log(`\x1b[33m🎁 [SHOP] Sukses membuka 1 ${TIPE_PACK_GACHA.toUpperCase()} PACK!\x1b[0m`);

            logDaftarPemainBaru("SHOP", packResult);

            return true;

        }

    } catch (e) {}

    return false;

}



async function jalankanLoopMatchGame() {

    console.log(`\n\x1b[35m⚽ [ENGINE] PC LOKAL MODE V29 (100% PURE MANUAL SQUAD MODE) RUNNING...\x1b[0m\n`);

    while (true) {

        console.log(`--------------------------------------------------`);

        

        try {

            // 🛡️ TAHAP 1: Cek kebugaran & rotasi skuad duluan sebelum kickoff agar terhindar dari MATCH FAILED

            const skuadUtama = await dapatkanIdSkuadUtamaJuara();



            console.log(`🚀 [MATCH #${matchCounter}] Menembak Kickoff Pertandingan...`);

            const response = await fetch(`${SUPA_URL}/functions/v1/resolve-match`, { method: 'POST', headers: HEADERS_SILUMAN });

            

            if (response.status === 401) { 

                const suksesHeal = await autoRefreshToken(); 

                if (!suksesHeal) {

                    console.log(`🛑 [FATAL] Tiket gagal diperbarui. Menunggu jeda 10 detik...`);

                    await new Promise(r => setTimeout(r, 10000));

                }

                continue; 

            }



            if (response.ok) {

                const res = await response.json();

                await klaimMisiKoin();

                const statusWarna = res.won ? "\x1b[32mMENANG 🏆\x1b[0m" : "\x1b[31mKALAH 💔\x1b[0m";

                console.log(`⚽ Hasil: ${statusWarna} [ ${res.ga ?? 0} - ${res.gb ?? 0} ] | MMR: \x1b[36m${res.newMmr}\x1b[0m`);

                matchCounter++;

            } else {

                console.log(`❌ [MATCH FAILED] Server menolak kalkulasi pertandingan.`);

            }



            // 🪙 TAHAP 2: Log isi saldo dompet & auto gacha pack

            const checkProf = await fetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`, { headers: HEADERS_SILUMAN });

            if (checkProf.ok) {

                const profData = await checkProf.json();

                const totalCoinSekarang = profData[0]?.coins ?? 0;

                console.log(`💰 [WALLET] Total saldo koin lu saat ini: \x1b[33m${totalCoinSekarang.toLocaleString()} Coin\x1b[0m`);



                if (totalCoinSekarang >= HARGA_PACK_GACHA) {

                    await autoBukaPackGachaSultan();

                }

            }



            // 🔥 TAHAP 3: Eksekusi pembersihan gudang sisa sampah ke SBC

            await jalankanProsesSbcOtomatis(skuadUtama);



        } catch (e) {

            console.log(`💥 [LOOP ERROR] Koneksi interupsi: ${e.message}`);

        }

        

        await new Promise(r => setTimeout(r, 3000));

    }

}



// Shortcut alias agar pemanggilan loop tetap berjalan lancar sesuai fungsi utama

const dapatkanIdSkuadUtamaJuara = dapatkanIdSkuadUtamaDanRotasi;



jalankanLoopMatchGame();
