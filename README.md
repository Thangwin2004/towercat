# Bộ Lạc Tranh Hùng (Tribal Conquest: Territory War)

Game chiến thuật chiếm đất lãnh thổ, điều động quân đội và tính toán đường đi để chinh phục các vùng đất mới phong cách **State.io / Galcon**.

---

## 🎮 Cách Chơi (Gameplay)

1. **Điều Động Quân Đội:**
   - Chạm & giữ chuột / ngón tay vào căn cứ của bạn (màu Xanh Lam).
   - Kéo đường mũi tên đến căn cứ mục tiêu (Trung Lập hoặc Địch) rồi thả tay để xuất quân.
   - Quân lính sẽ di chuyển theo hàng ngũ hướng về mục tiêu.
2. **Chiếm Đóng Vùng Đất:**
   - Khi quân lính đến căn cứ địch hoặc trung lập, mỗi người lính sẽ tiêu hao 1 quân đồn trú của căn cứ đó.
   - Khi quân số phòng thủ về `0`, căn cứ sẽ bị **chiếm đóng**, đổi sang màu cờ của bạn và bắt đầu tự động sinh thêm quân lính.
3. **Phân Cấp Thành Trì:**
   - **Làng Thổ Dân (Village):** Căn cứ nhỏ, sinh 1.0 quân/giây, tối đa 40 quân.
   - **Tiền Đồn Chiến Lược (Stronghold):** Căn cứ vừa, sinh 1.6 quân/giây, tối đa 65 quân.
   - **Đại Pháo Đài (Citadel):** Pháo đài khổng lồ, phòng thủ kiên cố, sinh tới 2.4 quân/giây, tối đa 90 quân!
4. **Kỹ Năng Chiến Thuật:**
   - ⚡ **Hành Quân Thần Tốc (Blitz):** Tăng 100% tốc độ di chuyển của toàn bộ quân đội trong 6s.
   - 🛡️ **Khiên Kiên Cố (Iron Bastion):** Tạo lá chắn hấp thụ 18 đòn đánh cho thành trì yếu nhất.
   - ⚔️ **Tổng Động Viên (War Horn Surge):** Lập tức chi viện +10 quân cho tất cả các căn cứ của bạn.
5. **Tùy Chọn Tỷ Lệ Xuất Quân:**
   - Nút `⚔️ GỬI: 50%` / `⚔️ GỬI: 100%` ở thanh dưới cho phép bạn quyết định giữ lại một nửa quân để thủ thành hoặc dốc toàn lực tổng tấn công!

---

## 🛠️ Công Nghệ & Điểm Nổi Bật

- **Engine:** PixiJS v8 (`pixi.js@^8.19.0`) + Vite.
- **Đồ Họa & UI:** 100% Vector Procedural Graphics với hệ thống nút bấm 3D phẳng, viền đổ bóng nổi theo chuẩn `game-ui-design`. Phông chữ mượt mà hiện đại `Be Vietnam Pro` & `Lilita One`.
- **Âm Thanh:** Bộ tổng hợp âm thanh Web Audio API (`SoundSynth`) không phụ thuộc file ngoài, tự tạo tiếng trống trận, tiếng va chạm binh khí, tiếng kèn chiếm thành và khúc khải hoàn.
- **Chống lỗi phát nhạc sớm:** Áp dụng bài học kinh nghiệm, chỉ kích hoạt âm thanh khi người dùng đã tương tác và tab ở trạng thái hiển thị.
- **Tích hợp:** Wink SDK Lifecycle & Leaderboard, AdManager mock bridge (Rewarded, Interstitial).

---

## 🚀 Hướng Dẫn Chạy & Build

```bash
# Cài đặt thư viện bằng pnpm (theo quy định Rule 6)
pnpm install

# Chạy môi trường phát triển (Dev)
pnpm run dev

# Đóng gói sản phẩm (Build Production)
pnpm run build
```
