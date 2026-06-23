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

// ─────────────────────────────────────────────
// HELPER: safe fetch with 401 auto-heal
// ─────────────────────────────────────────────
async function safeFetch(url, options = {}) {
    const method = options.method || "GET";
    console.log(`[HTTP Request] ${method} ${url}`);
    if (options.body) {
        console.log(`[HTTP Request Body]`, options.body);
    }
    const res = await fetch(url, { ...options, headers: HEADERS_SILUMAN });
    console.log(`[HTTP Response] Status: ${res.status} for ${method} ${url}`);
    if (res.status === 401) {
        console.log(`[HTTP Response] 401 Detected. Triggering autoRefreshToken...`);
        const healed = await autoRefreshToken();
        if (healed) {
            console.log(`[HTTP Request Retry] ${method} ${url}`);
            const retryRes = await fetch(url, { ...options, headers: HEADERS_SILUMAN });
            console.log(`[HTTP Response Retry] Status: ${retryRes.status} for ${method} ${url}`);
            return retryRes;
        } else {
            console.log(`[HTTP Request Retry] Skip retry because token healing failed.`);
        }
    }
    return res;
}

// ─────────────────────────────────────────────
// HELPER: normalize ID ke Number (fix bug string vs number)
// ─────────────────────────────────────────────
const toNum = v => Number(v);

// ─────────────────────────────────────────────
// AUTO REFRESH TOKEN
// ─────────────────────────────────────────────
async function autoRefreshToken() {
    console.log(`\n🔄 [SYSTEM AUTO-HEAL] Token expired! Meminta tiket akses baru...`);
    console.log(`[autoRefreshToken] Sending Refresh Token: ${REFRESH_TOKEN}`);
    try {
        const response = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                "apikey": SUPA_KEY, "Content-Type": "application/json",
                "origin": "https://34-0.xyz", "referer": "https://34-0.xyz/",
                "user-agent": USER_AGENT_ASLI
            },
            body: JSON.stringify({ refresh_token: REFRESH_TOKEN })
        });
        console.log(`[autoRefreshToken] Response status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            AUTH_BEARER = `Bearer ${data.access_token}`;
            REFRESH_TOKEN = data.refresh_token;
            HEADERS_SILUMAN.authorization = AUTH_BEARER;
            console.log(`\x1b[32m✅ [HEAL SUKSES] Tiket diperbarui!\x1b[0m\n`);
            return true;
        }
        const errBody = await response.text();
        console.log(`❌ [HEAL FAILED] Status: ${response.status}. Body: ${errBody}`);
    } catch (e) {
        console.log(`❌ [HEAL ERROR] ${e.message}`);
    }
    return false;
}

// ─────────────────────────────────────────────
// WARNA TIER
// ─────────────────────────────────────────────
function warnaTier(tier = "") {
    const t = tier.toUpperCase();
    if (t.includes("GOLD")) return "\x1b[33m";
    if (t.includes("SILVER")) return "\x1b[34m";
    if (t.includes("LEGEN") || t.includes("ICON")) return "\x1b[35m";
    return "\x1b[37m";
}

// ─────────────────────────────────────────────
// LOG DAFTAR PEMAIN BARU (dari gacha/SBC)
// ─────────────────────────────────────────────
function logDaftarPemainBaru(prefix, dataMurni) {
    try {
        const listKartu = dataMurni?.cards || dataMurni?.players || dataMurni?.reward
            || (Array.isArray(dataMurni) ? dataMurni : [dataMurni]);
        if (Array.isArray(listKartu) && listKartu.length > 0) {
            listKartu.forEach((k, idx) => {
                const nama = k.name || k.player_name || k.player?.name || `Unknown (ID: ${k.player_id || '?'})`;
                const rating = k.ovr || k.player?.ovr || '??';
                const kasta = String(k.tier || k.player?.tier || 'unknown').toUpperCase();
                console.log(`   └─ 🏃 [${idx + 1}] ${warnaTier(kasta)}${nama}\x1b[0m (OVR: ${rating} | TIER: ${kasta})`);
            });
        }
    } catch (err) { }
}

// ─────────────────────────────────────────────
// AMBIL STARTER IDs DENGAN 3 STRATEGI FALLBACK
// ─────────────────────────────────────────────
async function ambilIdStarter(rosterMentah, mapKat) {
    const idStarter = new Set();

    // ── Strategi 1: endpoint lc_lineup ──
    try {
        console.log(`[ambilIdStarter] Strategi 1: Mencoba ambil dari lc_lineup...`);
        const res = await safeFetch(`${SUPA_URL}/rest/v1/lc_lineup?select=*`);
        if (res.ok) {
            const data = await res.json();
            console.log(`[ambilIdStarter] Strategi 1: Data lc_lineup:`, JSON.stringify(data));
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(p => { if (p.player_id != null) idStarter.add(toNum(p.player_id)); });
                if (idStarter.size > 0) {
                    console.log(`✅ [LINEUP] Berhasil dari lc_lineup (${idStarter.size} pemain)`);
                    return idStarter;
                }
            } else {
                console.log(`[ambilIdStarter] Strategi 1: Data lc_lineup kosong atau bukan array.`);
            }
        } else {
            console.log(`[ambilIdStarter] Strategi 1: Gagal HTTP ${res.status}. Body: ${await res.text()}`);
        }
    } catch (e) {
        console.log(`[ambilIdStarter] Strategi 1: Error: ${e.message}`);
    }

    // ── Strategi 2: endpoint lc_squad ──
    try {
        console.log(`[ambilIdStarter] Strategi 2: Mencoba ambil dari lc_squad...`);
        const res = await safeFetch(`${SUPA_URL}/rest/v1/lc_squad?select=*`);
        if (res.ok) {
            const data = await res.json();
            console.log(`[ambilIdStarter] Strategi 2: Data lc_squad:`, JSON.stringify(data));
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(p => { if (p.player_id != null) idStarter.add(toNum(p.player_id)); });
                if (idStarter.size > 0) {
                    console.log(`✅ [LINEUP] Berhasil dari lc_squad (${idStarter.size} pemain)`);
                    return idStarter;
                }
            } else {
                console.log(`[ambilIdStarter] Strategi 2: Data lc_squad kosong atau bukan array.`);
            }
        } else {
            console.log(`[ambilIdStarter] Strategi 2: Gagal HTTP ${res.status}. Body: ${await res.text()}`);
        }
    } catch (e) {
        console.log(`[ambilIdStarter] Strategi 2: Error: ${e.message}`);
    }

    // ── Strategi 3: kolom is_starter / in_lineup / position di lc_roster ──
    console.log(`[ambilIdStarter] Strategi 3: Mencoba filter flag starter dari lc_roster...`);
    const STARTER_FLAGS = ['is_starter', 'in_lineup', 'is_lineup', 'starter', 'active', 'in_squad'];
    const rosterDenganFlag = rosterMentah.filter(r =>
        STARTER_FLAGS.some(flag => {
            const match = r[flag] === true || r[flag] === 1 || r[flag] === "1";
            if (match) {
                console.log(`[ambilIdStarter] Strategi 3: Pemain ID ${r.player_id} terdeteksi starter karena flag '${flag}' = ${r[flag]}`);
            }
            return match;
        })
    );
    if (rosterDenganFlag.length > 0) {
        rosterDenganFlag.forEach(r => idStarter.add(toNum(r.player_id)));
        console.log(`✅ [LINEUP] Berhasil dari flag di lc_roster (${idStarter.size} pemain)`);
        return idStarter;
    } else {
        console.log(`[ambilIdStarter] Strategi 3: Tidak menemukan pemain dengan flag starter.`);
    }

    // ── Strategi 4: TOP 11 OVR dari roster sebagai fallback darurat ──
    console.log(`⚠️ [LINEUP FALLBACK] Tidak ada endpoint lineup yang valid! Menggunakan Top-11 OVR sebagai pelindung darurat...`);
    const sorted = [...rosterMentah]
        .map(r => {
            const c = mapKat.get(toNum(r.player_id));
            const ovr = (c?.ovr ?? 60) + ((r.star || 1) - 1) * 3;
            return { player_id: toNum(r.player_id), ovr };
        })
        .sort((a, b) => b.ovr - a.ovr);
    
    console.log(`[ambilIdStarter] Strategi 4: Sorted Roster OVR:`, JSON.stringify(sorted));
    const top11 = sorted.slice(0, 11);
    console.log(`[ambilIdStarter] Strategi 4: Top 11 Terpilih:`, JSON.stringify(top11));

    top11.forEach(p => idStarter.add(p.player_id));
    console.log(`🛡️ [LINEUP FALLBACK] ${idStarter.size} pemain Top-OVR dikunci aman sebagai pengganti.`);
    return idStarter;
}

// ─────────────────────────────────────────────
// KELOLA SKUAD + AUTO ROTASI
// ─────────────────────────────────────────────
async function kelolaSkuadDanRotasi() {
    const idStarter = new Set();
    try {
        console.log(`[kelolaSkuadDanRotasi] Memulai kelolaSkuadDanRotasi...`);
        // Ambil roster dulu — dibutuhkan oleh semua strategi
        const resRoster = await safeFetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`);
        if (!resRoster.ok) {
            console.log(`❌ [SQUAD] Gagal ambil lc_roster: ${resRoster.status}. Body: ${await resRoster.text()}`);
            return idStarter;
        }
        const rosterMentah = await resRoster.json();
        console.log(`[kelolaSkuadDanRotasi] Roster mentah count: ${rosterMentah.length}`);
        if (!Array.isArray(rosterMentah) || rosterMentah.length === 0) {
            console.log(`⚠️ [SQUAD] lc_roster kosong.`);
            return idStarter;
        }

        // Ambil katalog publik
        const allPlayerIds = [...new Set(rosterMentah.map(r => toNum(r.player_id)))];
        console.log(`[kelolaSkuadDanRotasi] Meminta data katalog untuk ${allPlayerIds.length} pemain...`);
        const resKat = await safeFetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${allPlayerIds.join(',')})`);
        const katalog = resKat.ok ? await resKat.json() : [];
        console.log(`[kelolaSkuadDanRotasi] Katalog data received count: ${katalog.length}`);
        const mapKat = new Map((Array.isArray(katalog) ? katalog : []).map(p => [toNum(p.id), p]));
        const mapRoster = new Map(rosterMentah.map(r => [toNum(r.player_id), r]));

        // Ambil ID starter dengan fallback berlapis
        const lineupIds = await ambilIdStarter(rosterMentah, mapKat);
        lineupIds.forEach(id => idStarter.add(id));
        console.log(`[kelolaSkuadDanRotasi] Starter IDs:`, Array.from(idStarter));

        // Buat lineup aktif lengkap dengan data form
        let lineupAktif = [...idStarter].map((pid, index) => {
            const rData = mapRoster.get(pid);
            return {
                player_id: pid,
                slot: rData?.slot || rData?.position || (index + 1),
                form: rData ? (rData.form ?? 0) : 0
            };
        });
        console.log(`[kelolaSkuadDanRotasi] Lineup Aktif (mapped):`, JSON.stringify(lineupAktif));

        // Cek ada yang kelelahan
        const adaCapek = lineupAktif.some(p => p.form <= -25);
        if (adaCapek) {
            console.log(`\n🔄 [AUTO-ROTATION] Mendeteksi pemain kelelahan (Form <= -25) di Active XI!`);

            const idPemainAktif = new Set(lineupAktif.map(p => p.player_id));
            let benchSehat = rosterMentah
                .filter(r => !idPemainAktif.has(toNum(r.player_id)) && (r.form ?? 0) > -25)
                .map(r => {
                    const c = mapKat.get(toNum(r.player_id));
                    return {
                        player_id: toNum(r.player_id),
                        form: r.form ?? 0,
                        ovr: (c?.ovr ?? 60) + ((r.star || 1) - 1) * 3
                    };
                })
                .sort((a, b) => b.ovr - a.ovr);
            console.log(`[kelolaSkuadDanRotasi] Bench Sehat available for rotation:`, JSON.stringify(benchSehat));

            let jumlahRotasi = 0;
            lineupAktif = lineupAktif.map(p => {
                if (p.form <= -25 && benchSehat.length > 0) {
                    const pengganti = benchSehat.shift();
                    const namaOut = mapKat.get(p.player_id)?.name || `ID ${p.player_id}`;
                    const namaIn = mapKat.get(pengganti.player_id)?.name || `ID ${pengganti.player_id}`;
                    console.log(`   🔁 [Slot ${p.slot}] ❌ ${namaOut} (Form:${p.form}) OUT -> 🔥 ${namaIn} (Form:${pengganti.form}) IN`);

                    // Update idStarter dengan ID pengganti
                    idStarter.delete(p.player_id);
                    idStarter.add(pengganti.player_id);

                    jumlahRotasi++;
                    return { player_id: pengganti.player_id, slot: p.slot, form: pengganti.form };
                }
                return p;
            });

            if (jumlahRotasi > 0) {
                const squadBody = { squad: lineupAktif.map(p => ({ player_id: p.player_id, slot: p.slot })) };
                console.log(`📡 Menembak /set-squad dengan squadBody:`, JSON.stringify(squadBody));
                const resSet = await safeFetch(`${SUPA_URL}/functions/v1/set-squad`, {
                    method: 'POST',
                    body: JSON.stringify(squadBody)
                });
                if (resSet.ok) {
                    console.log(`\x1b[32m✅ [SQUAD UPDATED] Formasi bugar disinkronkan!\x1b[0m`);
                } else {
                    console.log(`⚠️ [SQUAD UPDATE FAILED] ${resSet.status}: ${await resSet.text()}`);
                }
            } else {
                console.log(`[kelolaSkuadDanRotasi] Ada pemain capek tapi tidak ada bench yang sehat.`);
            }
        } else {
            console.log(`[kelolaSkuadDanRotasi] Skuad bugar, tidak memerlukan rotasi.`);
        }

        // Log status squad
        console.log(`\n📋 [SQUAD STATUS] Active XI (${idStarter.size} pemain):`);
        lineupAktif.forEach(p => {
            const c = mapKat.get(p.player_id);
            if (c) {
                const rData = mapRoster.get(p.player_id);
                const ovr = (c.ovr ?? 60) + ((rData?.star || 1) - 1) * 3;
                const kasta = String(c.tier || "bronze").toUpperCase();
                console.log(`   ├─ ⚽ [Slot ${p.slot}] ${warnaTier(kasta)}${c.name}\x1b[0m (OVR:${ovr} | Form:${p.form} | ${kasta})`);
            } else {
                console.log(`   ├─ ⚽ [Slot ${p.slot}] ID ${p.player_id} (katalog tidak ditemukan)`);
            }
        });
        console.log(``);

    } catch (e) {
        console.log(`⚠️ [SQUAD ERROR] ${e.message}`);
    }
    return idStarter;
}

// ─────────────────────────────────────────────
// AUTO SBC
// ─────────────────────────────────────────────
async function jalankanProsesSbcOtomatis(idParaStarter = new Set()) {
    console.log(`⚙️ [SBC INSPECTOR] Memindai gudang ampas (5 Silver + 3 Bronze)...`);
    console.log(`🛡️ [SBC GUARD] ID yang dilindungi dari SBC: ${idParaStarter.size} pemain`);

    try {
        console.log(`[jalankanProsesSbcOtomatis] Mengambil lc_roster...`);
        const resRos = await safeFetch(`${SUPA_URL}/rest/v1/lc_roster?select=*`);
        if (!resRos.ok) {
            console.log(`[jalankanProsesSbcOtomatis] Gagal mengambil lc_roster. Status: ${resRos.status}. Body: ${await resRos.text()}`);
            return;
        }
        const rosterMentah = await resRos.json();
        console.log(`[jalankanProsesSbcOtomatis] Roster count: ${rosterMentah.length}`);
        if (!Array.isArray(rosterMentah) || rosterMentah.length === 0) {
            console.log(`[jalankanProsesSbcOtomatis] Roster kosong.`);
            return;
        }

        const playerIds = [...new Set(rosterMentah.map(r => toNum(r.player_id)))];
        console.log(`[jalankanProsesSbcOtomatis] Mengambil data katalog untuk ${playerIds.length} pemain...`);
        const resKat = await safeFetch(`${SUPA_URL}/rest/v1/lc_players_public?id=in.(${playerIds.join(',')})`);
        const katalog = resKat.ok ? await resKat.json() : [];
        console.log(`[jalankanProsesSbcOtomatis] Katalog count: ${katalog.length}`);
        const mapKat = new Map((Array.isArray(katalog) ? katalog : []).map(p => [toNum(p.id), p]));

        let countGoldProtected = 0, countOvrProtected = 0;
        let countStarterProtected = 0, countBlacklistedProtected = 0;
        const kandidatSbc = [];

        rosterMentah.forEach(o => {
            const pid = toNum(o.player_id);
            const c = mapKat.get(pid);
            if (!c) {
                console.log(`[jalankanProsesSbcOtomatis] ID ${pid} tidak ditemukan di katalog.`);
                return;
            }

            const totalOvr = (c.ovr ?? 60) + ((o.star || 1) - 1) * 3;
            const isStarter = idParaStarter.has(pid);
            const isBlacklisted = SBC_BLACKLIST.has(pid);
            const isGoldAtauDeity = c.tier === "gold" || c.tier === "legendary";
            const isOvrTinggi = totalOvr >= 75;

            if (isStarter) countStarterProtected++;
            else if (isBlacklisted) countBlacklistedProtected++;
            else if (isGoldAtauDeity) countGoldProtected++;
            else if (isOvrTinggi) countOvrProtected++;

            const isAman = isStarter || isBlacklisted || isGoldAtauDeity || isOvrTinggi;
            if (!isAman) {
                kandidatSbc.push({ player_id: pid, name: c.name, ovr: totalOvr, tier: String(c.tier || "bronze").toLowerCase() });
            }
        });

        console.log(`🛡️ [BRANKAS SECURE] Terkunci: \x1b[33m${countGoldProtected} Gold\x1b[0m | \x1b[36m${countOvrProtected} OVR 75+\x1b[0m | \x1b[32m${countStarterProtected} Skuad Utama\x1b[0m | \x1b[35m${countBlacklistedProtected} Auto-Blacklist\x1b[0m`);

        // Silver = OVR 67-74, Bronze = OVR ≤ 66
        const silverSampah = kandidatSbc.filter(p => p.ovr >= 67 && p.ovr < 75);
        const bronzeSampah = kandidatSbc.filter(p => p.ovr <= 66);

        console.log(`📊 [SBC STATS] Silver Trash: \x1b[34m${silverSampah.length}\x1b[0m | Bronze Trash: \x1b[31m${bronzeSampah.length}\x1b[0m`);

        if (silverSampah.length >= 5 && bronzeSampah.length >= 3) {
            const listTumbal = [
                ...silverSampah.slice(0, 5).map(p => ({ player_id: p.player_id, star: 1 })),
                ...bronzeSampah.slice(0, 3).map(p => ({ player_id: p.player_id, star: 1 }))
            ];

            // Verifikasi tidak ada starter yang masuk
            const adaStarter = listTumbal.some(t => idParaStarter.has(t.player_id));
            if (adaStarter) {
                console.log(`🚨 [SBC ABORT] Terdeteksi pemain Active XI di list tumbal! Dibatalkan demi keamanan.`);
                return;
            }

            console.log(`🔥 [AUTO-SBC] Mengirim 5 Silver + 3 Bronze...`);
            listTumbal.forEach((t, i) => {
                const c = mapKat.get(t.player_id);
                console.log(`   [${i + 1}] ${c?.name || 'Unknown'} (ID:${t.player_id})`);
            });

            const sbcPayload = { sbc_id: "silver_exch", cards: listTumbal };
            console.log(`[jalankanProsesSbcOtomatis] Mengirim submit-sbc payload:`, JSON.stringify(sbcPayload));
            const response = await safeFetch(`${SUPA_URL}/functions/v1/submit-sbc`, {
                method: 'POST',
                body: JSON.stringify(sbcPayload)
            });
            console.log(`[jalankanProsesSbcOtomatis] submit-sbc Response Status: ${response.status}`);

            if (response.ok) {
                const sbcResult = await response.json();
                console.log(`\x1b[32m🎁 [SBC SUCCESS] 1 SILVER PACK cair!\x1b[0m`);
                console.log(`[jalankanProsesSbcOtomatis] SBC Result:`, JSON.stringify(sbcResult));
                logDaftarPemainBaru("SBC", sbcResult);
            } else {
                const errorText = await response.text();
                console.log(`❌ [SBC FAILED] ${response.status}: ${errorText}`);
                // Blacklist supaya tidak dipakai lagi di putaran depan
                if (errorText.includes("active XI") || errorText.includes("sacrifice") || errorText.includes("lineup")) {
                    console.log(`⚠️ [BLACKLIST] Mem-blacklist ${listTumbal.length} kartu...`);
                    listTumbal.forEach(t => {
                        console.log(`[jalankanProsesSbcOtomatis] Blacklisting player ID: ${t.player_id}`);
                        SBC_BLACKLIST.add(t.player_id);
                    });
                }
            }
        } else {
            console.log(`📋 [SBC SKIP] Belum cukup kartu (butuh 5 Silver + 3 Bronze).`);
        }
    } catch (e) {
        console.log(`💥 [SBC ERROR] ${e.message}`);
    }
}

// ─────────────────────────────────────────────
// KLAIM MISI
// ─────────────────────────────────────────────
async function klaimMisiKoin() {
    try {
        console.log(`[klaimMisiKoin] Mengirim klaim misi koin...`);
        const res = await safeFetch(`${SUPA_URL}/functions/v1/claim-mission`, { method: 'POST' });
        console.log(`[klaimMisiKoin] Response status: ${res.status}`);
        if (res.ok) {
            console.log(`✅ [MISI] Koin misi diklaim!`);
            try {
                const body = await res.json();
                console.log(`[klaimMisiKoin] Result:`, JSON.stringify(body));
            } catch (_) {}
        } else {
            console.log(`⚠️ [MISI FAILED] Status: ${res.status}. Body: ${await res.text()}`);
        }
    } catch (e) {
        console.log(`[klaimMisiKoin] Error: ${e.message}`);
    }
}

// ─────────────────────────────────────────────
// AUTO BUKA PACK GACHA
// ─────────────────────────────────────────────
async function autoBukaPackGachaSultan() {
    try {
        console.log(`[autoBukaPackGachaSultan] Membuka pack gacha tipe: ${TIPE_PACK_GACHA}`);
        const response = await safeFetch(`${SUPA_URL}/functions/v1/draft-spin`, {
            method: 'POST',
            body: JSON.stringify({ pack: TIPE_PACK_GACHA })
        });
        console.log(`[autoBukaPackGachaSultan] Response status: ${response.status}`);
        if (response.ok) {
            const packResult = await response.json();
            console.log(`\x1b[33m🎁 [SHOP] Buka 1 ${TIPE_PACK_GACHA.toUpperCase()} PACK!\x1b[0m`);
            console.log(`[autoBukaPackGachaSultan] Result:`, JSON.stringify(packResult));
            logDaftarPemainBaru("SHOP", packResult);
            return true;
        } else {
            console.log(`⚠️ [SHOP FAILED] ${response.status}: ${await response.text()}`);
        }
    } catch (e) {
        console.log(`💥 [SHOP ERROR] ${e.message}`);
    }
    return false;
}

// ─────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────
async function jalankanLoopMatchGame() {
    console.log(`\n\x1b[35m⚽ [ENGINE] PC LOKAL MODE V30 — SQUAD PROTECTION FIXED\x1b[0m\n`);

    while (true) {
        console.log(`--------------------------------------------------`);
        try {
            console.log(`[Loop Match Game] [Iterasi MATCH #${matchCounter}] Mulai...`);
            
            // TAHAP 1: Ambil + proteksi skuad utama
            console.log(`[Loop Match Game] TAHAP 1: Mengelola skuad dan rotasi...`);
            const skuadUtama = await kelolaSkuadDanRotasi();
            console.log(`🛡️ [PRE-MATCH CHECK] ${skuadUtama.size} ID pemain dikunci aman dari SBC.\n`);

            // TAHAP 2: Mainkan pertandingan
            console.log(`🚀 [MATCH #${matchCounter}] Kickoff...`);
            const response = await safeFetch(`${SUPA_URL}/functions/v1/resolve-match`, { method: 'POST' });
            console.log(`[Loop Match Game] TAHAP 2 Response Status: ${response.status}`);

            if (response.status === 401) {
                console.log(`[Loop Match Game] Token 401. Mencoba refresh token...`);
                const ok = await autoRefreshToken();
                if (!ok) {
                    console.log(`[Loop Match Game] Refresh token gagal. Menunggu 10 detik sebelum mengulangi loop...`);
                    await new Promise(r => setTimeout(r, 10000));
                }
                continue;
            }

            if (response.ok) {
                const res = await response.json();
                console.log(`[Loop Match Game] TAHAP 2 Response Body:`, JSON.stringify(res));
                console.log(`[Loop Match Game] TAHAP 2: Klaim misi...`);
                await klaimMisiKoin();
                const statusWarna = res.won
                    ? "\x1b[32mMENANG 🏆\x1b[0m"
                    : "\x1b[31mKALAH 💔\x1b[0m";
                console.log(`⚽ Hasil: ${statusWarna} [ ${res.ga ?? 0} - ${res.gb ?? 0} ] | MMR: \x1b[36m${res.newMmr}\x1b[0m`);
                matchCounter++;
            } else {
                const errText = await response.text();
                console.log(`❌ [MATCH FAILED] ${response.status}: ${errText}`);
            }

            // TAHAP 3: Cek koin & gacha
            console.log(`[Loop Match Game] TAHAP 3: Cek Wallet & Gacha...`);
            const checkProf = await safeFetch(`${SUPA_URL}/rest/v1/lc_profiles?select=coins`);
            console.log(`[Loop Match Game] TAHAP 3 Response Status: ${checkProf.status}`);
            if (checkProf.ok) {
                const profData = await checkProf.json();
                console.log(`[Loop Match Game] Profile Data:`, JSON.stringify(profData));
                const totalCoin = profData[0]?.coins ?? 0;
                console.log(`💰 [WALLET] Saldo: \x1b[33m${totalCoin.toLocaleString()} Coin\x1b[0m`);
                if (totalCoin >= HARGA_PACK_GACHA) {
                    console.log(`[Loop Match Game] Saldo koin cukup untuk gacha (${totalCoin} >= ${HARGA_PACK_GACHA}).`);
                    await autoBukaPackGachaSultan();
                } else {
                    console.log(`[Loop Match Game] Saldo koin tidak cukup untuk gacha (${totalCoin} < ${HARGA_PACK_GACHA}).`);
                }
            } else {
                console.log(`[Loop Match Game] Gagal mendapatkan profil. Status: ${checkProf.status}. Body: ${await checkProf.text()}`);
            }

            // TAHAP 4: SBC dengan proteksi skuad terbaru
            console.log(`[Loop Match Game] TAHAP 4: Menjalankan proses SBC otomatis...`);
            await jalankanProsesSbcOtomatis(skuadUtama);

        } catch (e) {
            console.log(`💥 [LOOP ERROR] ${e.message}`);
        }

        console.log(`[Loop Match Game] Iterasi selesai. Menunggu 3 detik...`);
        await new Promise(r => setTimeout(r, 3000));
    }
}

jalankanLoopMatchGame();
