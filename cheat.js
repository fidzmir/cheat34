const SUPA_URL = "https://gnjcmrqfooalhynogeyt.supabase.co";
const SUPA_KEY = "sb_publishable_0vh5J0rfiHxGOxkwGZuBYA_YBo-xblo";
const USER_AGENT_ASLI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

let AUTH_BEARER = "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjlmNmRiY2ExLWIzOTItNDY4YS1iZWNiLTE0MjgzZjI0N2JlOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2duamNtcnFmb29hbGh5bm9nZXl0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTc4ODIyZi01MWVlLTQzMDItOGVhOC1jMGM4NjBjNTIyNGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTQ0MjY0LCJpYXQiOjE3ODIxNDA6NjQsImVtYWlsIjoic2V2ZW5rbmlnaHRhcGlzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sYXVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJzZXZlbmtuaWdodGFwaXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E3ODgyMmYtNTFlZS00MzAyLThlYTgtYzBjODYwYzUyMjRhIiwidXNlcm5hbWUiOiJhcGlzMyJ9LCJyb2xlIjoiYXV0aGVudGifikFkIiwiYWFsIjoiYWFsaSIsImFtcilbXX0sInNlc3NiproiOiJkN2ZlNzIzNS03MzNiLTQwZmUtOWRlZi00Y2FiNzViOGMzNDAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.lCmelW-8h5jVIAFQUiL3Ypgn_CykcvU7O7ULLEUksSjcZ7mlGY1hP1zgl82NweUJ4D2_ID0-dEB1Ip38Wy12FA";
let REFRESH_TOKEN = "7qiuqzebzs7y"; 

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
        console.log(`[HTTP Request] POST ${SUPA_URL}/auth/v1/token?grant_type=refresh_token`);
        const response = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { "apikey": SUPA_KEY, "Content-Type": "application/json", "origin": "https://34-0.xyz", "referer": "https://34-0.xyz/", "user-agent": USER_AGENT_ASLI },
            body: JSON.stringify({ refresh_token: REFRESH_TOKEN })
        });
        console.log(`[HTTP Response] Status: ${response.status} for auth token refresh`);
        if (response.ok) {
            const data = await response.json();
            AUTH_BEARER = `Bearer ${data.access_token}`; 
            REFRESH_TOKEN = data.refresh_token; 
            HEADERS_SILUMAN.authorization = AUTH_BEARER; 
            console.log(`\x1b[32m✅ [HEAL SUKSES] Tiket diperbarui!\x1b[0m\n`);
            return true;
        }
    } catch (e) {
        console.log(`💥 [REFRESH ERROR] Gagal refresh token: ${e.message}`);
    }
    return false;
}

async function kelolaSkuadDanRotasi() {
    const idStarter = new Set();
    try {
        console.log(`[kelolaSkuadDanRotasi] Memulai kelolaSkuadDanRotasi...`);
        
        // 1. Ambil data Skuad Aktif dari tabel lc_squads
        console.log(`[HTTP Request] GET ${SUPA_URL}/rest/v1/lc_squads?select=*`);
        const resLineup = await fetch(`${SUPA_URL}/rest/v1/lc_squads?select=*`, { headers: HEADERS_SILUMAN });
        console.log(`[HTTP Response] Status: ${resLineup.status} for GET lc_squads`);
        if (!resLineup.ok) return idStarter;
        const lineupMentah = await resLineup.json();

        // 2. Ambil data Roster Gudang
        console.log(`[HTTP Request] GET ${SUPA_URL}/rest/v1/lc_roster?select=*`);
        const resRoster = await fetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`, { headers: HEADERS_SILUMAN });
        console.log(`[HTTP Response] Status: ${resRoster.status} for GET lc_roster`);
        const rosterMentah = await resRoster.json();
        const mapRoster = new Map(rosterMentah.map(r => [Number(r.player_id), r]));

        // 3. Ambil Katalog Publik Pemain
        const allPlayerIds = rosterMentah.map(r => r.player_id);
        console.log(`[HTTP Request] GET ${SUPA_URL}/rest/v1/lc_players_public?id=in.(${allPlayerIds.join(',')})`);
        const resKat = await fetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${allPlayerIds.join(',')})`, { headers: HEADERS_SILUMAN });
        console.log(`[HTTP Response] Status: ${resKat.status} for GET lc_players_public`);
        const katalog = await resKat.json();
        const mapKat = new Map(katalog.map(p => [p.id, p]));

        // Petakan pemain di Active XI saat ini beserta staminanya (form)
        let lineupAktif = lineupMentah.map((p, index) => {
            const rData = mapRoster.get(Number(p.player_id));
            return {
                player_id: Number(p.player_id),
                slot: p.slot || p.position || (index + 1),
                form: rData ? (rData.form ?? 0) : 0
            };
        });

        let adaPemainCapek = lineupAktif.some(p => p.form <= -25);

        if (adaPemainCapek) {
            console.log(`\n🔄 [AUTO-ROTATION] Mendeteksi pemain kelelahan/cedera (Form <= -25) di Active XI!`);
            
            const idPemainAktif = new Set(lineupAktif.map(p => p.player_id));
            let benchSehat = rosterMentah
                .filter(r => !idPemainAktif.has(Number(r.player_id)) && (r.form ?? 0) > -25)
                .map(r => {
                    const c = mapKat.get(r.player_id);
                    const totalOvr = (c?.ovr ?? 60) + ((r.star || 1) - 1) * 3;
                    return { player_id: Number(r.player_id), form: r.form ?? 0, ovr: totalOvr };
                });

            // Urutkan pemain cadangan sehat dari OVR paling tinggi
            benchSehat.sort((a, b) => b.ovr - a.ovr);

            let jumlahRotasi = 0;
            lineupAktif = lineupAktif.map(p => {
                if (p.form <= -25 && benchSehat.length > 0) {
                    const pengganti = benchSehat.shift();
                    const namaCapek = mapKat.get(p.player_id)?.name || `ID ${p.player_id}`;
                    const namaSehat = mapKat.get(pengganti.player_id)?.name || `ID ${pengganti.player_id}`;
                    
                    console.log(`   🔁 [Slot ${p.slot}] ❌ ${namaCapek} (Form:${p.form}) OUT -> 🔥 ${namaSehat} (Form:${pengganti.form}) IN`);
                    jumlahRotasi++;
                    return { player_id: pengganti.player_id, slot: p.slot, form: pengganti.form };
                }
                return p;
            });

            // FIX PAYLOAD UTAMA: Mengirimkan RAW ARRAY langsung tanpa dibungkus objek { squad: [] }
            if (jumlahRotasi > 0) {
                const payloadRawArray = lineupAktif.map(p => ({ player_id: p.player_id, slot: p.slot }));
                console.log(`📡 Menembak /set-squad dengan raw array terbaru...`);
                console.log(`[HTTP Request] POST ${SUPA_URL}/functions/v1/set-squad`);
                
                const resSet = await fetch(`${SUPA_URL}/functions/v1/set-squad`, {
                    method: 'POST',
                    headers: HEADERS_SILUMAN,
                    body: JSON.stringify(payloadRawArray) 
                });
                console.log(`[HTTP Response] Status: ${resSet.status} for POST set-squad`);
                
                if (resSet.ok) {
                    const resStats = await resSet.json();
                    console.log(`\x1b[32m✅ [SQUAD UPDATED] Sukses sinkronisasi formasi bugar ke server!\x1b[0m`);
                    // 🔥 FITUR SQUAD VALUE YANG LU CARI SEKARANG TAMPIL DI SINI:
                    console.log(`📈 [VALUE MONITOR] Squad ID: ${resStats.squadId} | Squad Value: \x1b[36m${resStats.squadValue}\x1b[0m | Batas Cap: \x1b[35m${resStats.cap}\x1b[0m`);
                } else {
                    console.log(`❌ [SQUAD FAILED] Server nolak rotasi. Alasan: ${await resSet.text()}`);
                }
            }
        }

        // 📋 CETAK LOG VERBOSE DETAIL STATUS SQUAD AKTIF LU
        console.log(`\n📋 [SQUAD STATUS] Active XI (11 pemain):`);
        lineupAktif.forEach(p => {
            idStarter.add(p.player_id);
            const c = mapKat.get(p.player_id);
            if (c) {
                const rData = mapRoster.get(p.player_id);
                const totalOvr = (c.ovr != null ? c.ovr : 60) + ((rData?.star || 1) - 1) * 3;
                const kasta = String(c.tier || "bronze").toUpperCase();
                
                let warna = "\x1b[37m"; 
                if (kasta.includes("GOLD")) warna = "\x1b[33m";      
                else if (kasta.includes("SILVER")) warna = "\x1b[34m";  
                else if (kasta.includes("LEGEN") || kasta.includes("ICON")) warna = "\x1b[35m"; 

                console.log(`   ├─ ⚽ [Slot ${p.slot}] ${warna}${c.name}\x1b[0m (OVR:${totalOvr} | Form:${p.form} | ${kasta})`);
            }
        });
        console.log(``);

    } catch (e) {
        console.log(`⚠️ [WARNING] Gagal mengelola status/rotasi skuad: ${e.message}`);
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
        }
    } catch (err) {}
}

async function jalankanProsesSbcOtomatis(idParaStarter = new Set()) {
    console.log(`[Loop Match Game] TAHAP 4: Menjalankan proses SBC otomatis...`);
    console.log(`⚙️ [SBC INSPECTOR] Memindai gudang ampas (5 Silver + 3 Bronze)...`);
    try {
        console.log(`[HTTP Request] GET ${SUPA_URL}/rest/v1/lc_roster?select=*`);
        const resRos = await fetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`, { headers: HEADERS_SILUMAN });
        console.log(`[HTTP Response] Status: ${resRos.status} for GET lc_roster`);
        const rosterMentah = await resRos.json();
        if (!rosterMentah || rosterMentah.length === 0) return;

        const playerIds = [...new Set(rosterMentah.map(r => r.player_id))];
        console.log(`[HTTP Request] GET ${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`);
        const resKat = await fetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`, { headers: HEADERS_SILUMAN });
        console.log(`[HTTP Response] Status: ${resKat.status} for GET lc_players_public`);
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

        console.log(`🛡️ [BRANKAS SECURE] Terkunci: ${countGoldProtected} Gold | ${countOvrProtected} OVR 75+ | ${countStarterProtected} Skuad Utama | ${countBlacklistedProtected} Auto-Blacklist`);

        const silverSampah = kandidatSbc.filter(p => p.ovr >= 67);
        const bronzeSampah = kandidatSbc.filter(p => p.ovr <= 66);

        console.log(`📊 [SBC STATS] Silver Trash: ${silverSampah.length} | Bronze Trash: ${bronzeSampah.length}`);

        if (silverSampah.length >= 5 && bronzeSampah.length >= 3) {
            const listTumbalResmi = [];
            for (let i = 0; i < 5; i++) listTumbalResmi.push({ player_id: silverSampah[i].player_id, star: 1 });
            for (let i = 0; i < 3; i++) listTumbalResmi.push({ player_id: bronzeSampah[i].player_id, star: 1 });

            console.log(`🔥 [AUTO-SBC] Mengirim 5 Silver + 3 Bronze...`);
            listTumbalResmi.forEach((t, idx) => {
                const pNama = mapKat.get(t.player_id)?.name || 'Unknown';
                console.log(`   [${idx + 1}] ${pNama} (ID:${t.player_id})`);
            });

            const response = await fetch(`${SUPA_URL}/functions/v1/submit-sbc`, { method: 'POST', headers: HEADERS_SILUMAN, body: JSON.stringify({ sbc_id: "silver_exch", cards: listTumbalResmi }) });
            
            if (response.ok) {
                const sbcResult = await response.json();
                console.log(`\x1b[32m🎁 [SBC SUCCESS] LEGENDA! Racikan tembus, 1 SILVER PACK cair!\x1b[0m`);
                logDaftarPemainBaru("SBC", sbcResult);
            } else {
                const errorText = await response.text();
                console.log(`❌ [SBC FAILED] Server nolak. Alasan: ${errorText}`);
                if (errorText.includes("active XI") || errorText.includes("sacrifice")) {
                    console.log(`⚠️ [BLACKLIST] Mem-blacklist ${listTumbalResmi.length} kartu...`);
                    listTumbalResmi.forEach(t => SBC_BLACKLIST.add(t.player_id));
                }
            }
        } else {
            console.log(`📋 [SBC SKIP] Belum cukup kartu (butuh 5 Silver + 3 Bronze).`);
        }
    } catch (e) {
        console.log(`💥 [SBC ERROR] Gagal scan gudang: ${e.message}`);
    }
}

async function klaimMisiKoin() {
    console.log(`[Loop Match Game] TAHAP 2: Klaim misi...`);
    try { 
        const res = await fetch(`${SUPA_URL}/functions/v1/claim-mission`, { method: 'POST', headers: HEADERS_SILUMAN }); 
        if (!res.ok) console.log(`⚠️ [MISI FAILED] Status: ${res.status}. Body: ${await res.text()}`);
    } catch (e) {}
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
    console.log(`\n\x1b[35m⚽ [ENGINE] PC LOKAL MODE V32 RUNNING (ALUR VERBOSE & REKONDISI ANTI-KEBALIK)...\x1b[0m\n`);
    while (true) {
        console.log(`--------------------------------------------------`);
        console.log(`[Loop Match Game] [Iterasi MATCH #${matchCounter}] Mulai...`);
        
        try {
            // 🛡️ TAHAP 0 (UTAMA): REFRESH TOKEN SECARA PROAKTIF DI AWAL LOOP SEBELUM APAPUN JALAN
            console.log(`[Loop Match Game] TAHAP 0: Validasi kredensial akses...`);
            const checkProf = await fetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`, { headers: HEADERS_SILUMAN });
            if (checkProf.status === 401) {
                console.log(`[HTTP Response] 401 Detected. Triggering autoRefreshToken...`);
                const suksesHeal = await autoRefreshToken(); 
                if (!suksesHeal) await new Promise(r => setTimeout(r, 10000));
                continue; // Paksa balik ke root loop atas biar dapetin token fresh!
            }

            // 🛡️ TAHAP 1: Eksekusi Fitur In-Out Rotasi Lu
            console.log(`[Loop Match Game] TAHAP 1: Mengelola skuad dan rotasi...`);
            const skuadUtamaAmankan = await kelolaSkuadDanRotasi();

            // 🚀 TAHAP 2: Kickoff Match
            console.log(`🚀 [MATCH #${matchCounter}] Menembak Kickoff Pertandingan...`);
            const response = await fetch(`${SUPA_URL}/functions/v1/resolve-match`, { method: 'POST', headers: HEADERS_SILUMAN });

            if (response.ok) {
                const res = await response.json();
                await klaimMisiKoin();
                const statusWarna = res.won ? "\x1b[32mMENANG 🏆\x1b[0m" : "\x1b[31mKALAH 💔\x1b[0m";
                console.log(`⚽ Hasil: ${statusWarna} [ ${res.ga ?? 0} - ${res.gb ?? 0} ] | MMR: \x1b[36m${res.newMmr}\x1b[0m`);
                matchCounter++;
            } else {
                console.log(`❌ [MATCH FAILED] Gagal tanding.`);
            }

            // 🪙 TAHAP 3: Cek Dompet & Gacha
            console.log(`[Loop Match Game] TAHAP 3: Cek Wallet & Gacha...`);
            if (checkProf.ok) {
                const profData = await checkProf.json();
                const totalCoinSekarang = profData[0]?.coins ?? 0;
                console.log(`💰 [WALLET] Saldo: \x1b[33m${totalCoinSekarang.toLocaleString()} Coin\x1b[0m`);

                if (totalCoinSekarang >= HARGA_PACK_GACHA) {
                    await autoBukaPackGachaSultan();
                } else {
                    console.log(`[Loop Match Game] Saldo koin tidak cukup untuk gacha (${totalCoinSekarang} < ${HARGA_PACK_GACHA}).`);
                }
            }

            // 🔥 TAHAP 4: Jalankan SBC Otomatis dengan proteksi penuh
            await jalankanProsesSbcOtomatis(skuadUtamaAmankan);

        } catch (e) {
            console.log(`💥 [LOOP ERROR] Koneksi interupsi: ${e.message}`);
        }
        
        console.log(`[Loop Match Game] Iterasi selesai. Menunggu 3 detik...`);
        await new Promise(r => setTimeout(r, 3000));
    }
}

jalankanLoopMatchGame();
