const SUPA_URL = "https://gnjcmrqfooalhynogeyt.supabase.co";
const SUPA_KEY = "sb_publishable_0vh5J0rfiHxGOxkwGZuBYA_YBo-xblo";
const USER_AGENT_ASLI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

let AUTH_BEARER = "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjlmNmRiY2ExLWIzOTItNDY4YS1iZWNiLTE0MjgzZjI0N2JlOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2duamNtcnFmb29hbGh5bm9nZXl0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTc4ODIyZi01MWVlLTQzMDItOGVhOC1jMGM4NjBjNTIyNGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTQ0MjY0LCJpYXQiOjE3ODIxNDA6NjQsImVtYWlsIjoic2V2ZW5rbmlnaHRhcGlzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sYXVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJzZXZlbmtuaWdodGFwaXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E3ODgyMmYtNTFlZS00MzAyLThlYTgtYzBjODYwYzUyMjRhIiwidXNlcm5hbWUiOiJhcGlzMyJ9LCJyb2xlIjoiYXV0aGVudGifikFkIiwiYWFsIjoiYWFsaSIsImFtcilbXX0sInNlc3NiproiOiJkN2ZlNzIzNS03MzNiLTQwZmUtOWRlZi00Y2FiNzViOGMzNDAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.lCmelW-8h5jVIAFQUiL3Ypgn_CykcvU7O7ULLEUksSjcZ7mlGY1hP1zgl82NweUJ4D2_ID0-dEB1Ip38Wy12FA";
let REFRESH_TOKEN = "7qiuqzebzs7y"; 

const TIPE_PACK_GACHA = "bronze"; 
const HARGA_PACK_GACHA = 600; 
let matchCounter = 1;

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
        }
    } catch (e) {}
    return false;
}

async function klaimMisiKoin() {
    try { 
        const res = await fetch(`${SUPA_URL}/functions/v1/claim-mission`, { method: 'POST', headers: HEADERS_SILUMAN }); 
        if (res.ok) console.log(`🎁 [MISSION] Sukses klaim hadiah misi!`);
    } catch (e) {}
}

async function autoBukaPackGachaSultan() {
    try {
        const response = await fetch(`${SUPA_URL}/functions/v1/draft-spin`, { method: 'POST', headers: HEADERS_SILUMAN, body: JSON.stringify({ pack: TIPE_PACK_GACHA }) });
        if (response.ok) {
            const packResult = await response.json();
            console.log(`\x1b[33m🛒 [SHOP] Sukses buy 1 BRONZE PACK!\x1b[0m`);
            
            // Log ringkas pemain baru hasil gacha
            const listKartu = packResult.cards || packResult.players || packResult.reward || (Array.isArray(packResult) ? packResult : [packResult]);
            if (Array.isArray(listKartu)) {
                listKartu.forEach(k => {
                    const nama = k.name || k.player_name || k.player?.name || 'Unknown';
                    console.log(`   └─ 🏃 Dapet: ${nama} (OVR: ${k.ovr || '??'} | TIER: ${String(k.tier || 'bronze').toUpperCase()})`);
                });
            }
            return true;
        }
    } catch (e) {}
    return false;
}

async function jalankanLoopMatchGame() {
    console.log(`\n\x1b[35m⚽ [ENGINE] BOT MATCH & BUY PACK ONLY V33 RUNNING...\x1b[0m\n`);
    while (true) {
        console.log(`--------------------------------------------------`);
        
        try {
            // 🛡️ TAHAP 0: Proteksi Token Auth
            const checkProf = await fetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`, { headers: HEADERS_SILUMAN });
            if (checkProf.status === 401) {
                const suksesHeal = await autoRefreshToken(); 
                if (!suksesHeal) await new Promise(r => setTimeout(r, 10000));
                continue; 
            }

            // 🚀 TAHAP 1: Kickoff Match
            console.log(`🚀 [MATCH #${matchCounter}] Menembak Kickoff Pertandingan...`);
            const response = await fetch(`${SUPA_URL}/functions/v1/resolve-match`, { method: 'POST', headers: HEADERS_SILUMAN });

            if (response.ok) {
                const res = await response.json();
                console.log(`⚽ Hasil: ${res.won ? "\x1b[32mMENANG 🏆\x1b[0m" : "\x1b[31mKALAH 💔\x1b[0m"} [ ${res.ga ?? 0} - ${res.gb ?? 0} ] | MMR: \x1b[36m${res.newMmr}\x1b[0m`);
                matchCounter++;
                
                // Langsung klaim misi harian/match
                await klaimMisiKoin();
            } else {
                console.log(`❌ [MATCH FAILED] Gagal tanding. Cek stamina / susunan tim lu di web game.`);
            }

            // 🪙 TAHAP 2: Monitor Duit & Auto Gacha
            if (checkProf.ok) {
                // Tarik profil ulang setelah match buat data koin terupdate
                const resProfFresh = await fetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`, { headers: HEADERS_SILUMAN });
                const profData = await resProfFresh.json();
                const totalCoinSekarang = profData[0]?.coins ?? 0;
                console.log(`💰 [WALLET] Saldo koin saat ini: \x1b[33m${totalCoinSekarang.toLocaleString()} Coin\x1b[0m`);

                if (totalCoinSekarang >= HARGA_PACK_GACHA) {
                    await autoBukaPackGachaSultan();
                }
            }

        } catch (e) {
            console.log(`💥 [LOOP ERROR] Koneksi interupsi: ${e.message}`);
        }
        
        await new Promise(r => setTimeout(r, 3000));
    }
}

jalankanLoopMatchGame();
