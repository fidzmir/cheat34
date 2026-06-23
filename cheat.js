const SUPA_URL = "https://gnjcmrqfooalhynogeyt.supabase.co";
const SUPA_KEY = "sb_publishable_0vh5J0rfiHxGOxkwGZuBYA_YBo-xblo";
const USER_AGENT_ASLI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

let AUTH_BEARER = "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjlmNmRiY2ExLWIzOTItNDY4YS1iZWNiLTE0MjgzZjI0N2JlOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2duamNtcnFmb29hbGh5bm9nZXl0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTc4ODIyZi01MWVlLTQzMDItOGVhOC1jMGM4NjBjNTIyNGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTQ0MjY0LCJpYXQiOjE3ODIxNDA6NjQsImVtYWlsIjoic2V2ZW5rbmlnaHRhcGlzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sYXVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJzZXZlbmtuaWdodGFwaXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E3ODgyMmYtNTFlZS00MzAyLThlYTgtYzBjODYwYzUyMjRhIiwidXNlcm5hbWUiOiJhcGlzMyJ9LCJyb2xlIjoiYXV0aGVudGifikFkIiwiYWFsIjoiYWFsaSIsImFtcilbXX0sInNlc3NiproiOiJkN2ZlNzIzNS03MzNiLTQwZmUtOWRlZi00Y2FiNzViOGMzNDAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.lCmelW-8h5jVIAFQUiL3Ypgn_CykcvU7O7ULLEUksSjcZ7mlGY1hP1zgl82NweUJ4D2_ID0-dEB1Ip38Wy12FA";
let REFRESH_TOKEN = "7qiuqzebzs7y"; 

const TIPE_PACK_GACHA = "bronze"; 
const HARGA_PACK_GACHA = 600; 
let matchCounter = 1;
const SBC_BLACKLIST = new Set(); // 🛡️ Brankas pengunci otomatis jika ada kartu lolos sensor

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
    console.log(`\n🔄 [SYSTEM AUTO-HEAL] Token expired! Mengambil tiket akses fresh...`);
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
            console.log(`\x1b[32m✅ [HEAL SUKSES] Tiket diperbarui! Siap gas poll.\x1b[0m\n`);
            return true;
        }
    } catch (e) {}
    return false;
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

async function jalankanProsesSbcOtomatis() {
    console.log(`⚙️ [SBC INSPECTOR] Memindai gudang ampas khusus cadangan mati (Form === 0)...`);
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
        let countActiveRotationProtected = 0;
        let countBlacklistedProtected = 0;
        const kandidatSbc = [];

        rosterMentah.forEach(o => {
            const c = mapKat.get(o.player_id);
            if (c) {
                const pId = Number(o.player_id);
                const isBlacklisted = SBC_BLACKLIST.has(pId);
                const isRotasiAktif = (o.form ?? 0) !== 0; // 🎯 Jika form berubah dari 0, berarti dia skuad inti/pernah main
                
                const totalOvr = (c.ovr != null ? c.ovr : 60) + ((o.star || 1) - 1) * 3;
                const isGoldAtauDeity = c.tier === "gold" || c.tier === "legendary";
                const isOvrTinggi = totalOvr >= 75;

                if (isBlacklisted) countBlacklistedProtected++;
                else if (isRotasiAktif) countActiveRotationProtected++;
                else if (isGoldAtauDeity) countGoldProtected++;
                else if (isOvrTinggi) countOvrProtected++;

                // Kartu AMAN hanya jika: Cadangan murni (form === 0), bukan Gold+, OVR < 75, dan ga di-blacklist
                const isAsetBerharga = isBlacklisted || isRotasiAktif || isOvrTinggi || isGoldAtauDeity;

                if (!isAsetBerharga) {
                    kandidatSbc.push({ player_id: pId, name: c.name, ovr: totalOvr, tier: String(c.tier || "bronze").toLowerCase() });
                }
            }
        });

        console.log(`🛡️ [BRANKAS SECURE] Terkunci: ${countGoldProtected} Gold | ${countOvrProtected} OVR 75+ | ${countActiveRotationProtected} Skuad Inti (Form ≠ 0) | ${countBlacklistedProtected} Blacklist`);

        const silverSampah = kandidatSbc.filter(p => p.ovr >= 67);
        const bronzeSampah = kandidatSbc.filter(p => p.ovr <= 66);

        console.log(`📊 [SBC STATS] Sampah Bugar -> Punya: \x1b[34m${silverSampah.length}/5 Silver\x1b[0m | \x1b[31m${bronzeSampah.length}/3 Bronze\x1b[0m`);

        if (silverSampah.length >= 5 && bronzeSampah.length >= 3) {
            const listTumbalResmi = [];
            for (let i = 0; i < 5; i++) listTumbalResmi.push({ player_id: silverSampah[i].player_id, star: 1 });
            for (let i = 0; i < 3; i++) listTumbalResmi.push({ player_id: bronzeSampah[i].player_id, star: 1 });

            console.log(`🔥 [AUTO-SBC EXECUTE] Mengirim paket tumbal 100% aman ke server...`);
            const response = await fetch(`${SUPA_URL}/functions/v1/submit-sbc`, { method: 'POST', headers: HEADERS_SILUMAN, body: JSON.stringify({ sbc_id: "silver_exch", cards: listTumbalResmi }) });
            
            if (response.ok) {
                const sbcResult = await response.json();
                console.log(`\x1b[32m🎁 [SBC SUCCESS] LEGENDA! Racikan tembus, 1 SILVER PACK cair!\x1b[0m`);
                logDaftarPemainBaru("SBC", sbcResult);
            } else {
                const errorText = await response.text();
                console.log(`❌ [SBC FAILED] Server nolak. Alasan: ${errorText}`);
                
                // 🧠 MEMORY LEARNING SYSTEM: Jika kecolongan kartu inti, kunci ID-nya permanen
                if (errorText.includes("active XI") || errorText.includes("sacrifice")) {
                    console.log(`⚠️ [AUTO-LEARN] Merekam kartu skuad menyelinap. Mem-blacklist ID tumbal...`);
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
    console.log(`\n\x1b[35m⚽ [ENGINE] PC LOKAL MODE V31 PRO RUNNING (ALUR ANTI-KEBALIK & STEALTH PROTECTION)...\x1b[0m\n`);
    while (true) {
        console.log(`--------------------------------------------------`);
        
        try {
            // 🛡️ TAHAP 1: VALIDASI TOKEN DI AWAL ITERASI (Anti-Kebalik!)
            const checkProf = await fetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`, { headers: HEADERS_SILUMAN });
            if (checkProf.status === 401) {
                const suksesHeal = await autoRefreshToken(); 
                if (!suksesHeal) await new Promise(r => setTimeout(r, 10000));
                continue; // Restart loop dari atas dengan token bugar
            }

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
                console.log(`❌ [MATCH FAILED] Gagal tanding. Cek stamina skuad utama lu di web game.`);
            }

            // 🪙 TAHAP 3: Monitor Wallet & Auto Gacha
            if (checkProf.ok) {
                const profData = await checkProf.json();
                const totalCoinSekarang = profData[0]?.coins ?? 0;
                console.log(`💰 [WALLET] Total saldo koin lu saat ini: \x1b[33m${totalCoinSekarang.toLocaleString()} Coin\x1b[0m`);

                if (totalCoinSekarang >= HARGA_PACK_GACHA) {
                    await autoBukaPackGachaSultan();
                }
            }

            // 🔥 TAHAP 4: Eksekusi SBC Pake Filter Cadangan Mati + Auto-Learn Blacklist
            await jalankanProsesSbcOtomatis();

        } catch (e) {
            console.log(`💥 [LOOP ERROR] Koneksi interupsi: ${e.message}`);
        }
        
        await new Promise(r => setTimeout(r, 3000));
    }
}

jalankanLoopMatchGame();
