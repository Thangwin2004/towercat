/**
 * Map configurations & Level data for "Mèo Chiến Đảo"
 * Virtual reference coordinate space: 800 x 600 (auto-scaled dynamically to viewport)
 * 50 Balanced Campaign Levels across 5 Clear Difficulty Tiers (Cực Dễ -> Dễ -> Bình Thường -> Khó -> Siêu Khó)
 */

export const FACTIONS = {
  player: {
    id: 'player',
    species: 'cat',
    name: 'Mèo Xanh',
    colorHex: 0x2563eb,      // Royal Blue
    lightColorHex: 0x38bdf8, // Sky Cyan
    darkColorHex: 0x1d4ed8,
    shadowColorHex: 0x0f2a63,
    ringColorHex: 0x7dd3fc,
    bannerColor: '#38bdf8',
    troopColor: 0x2563eb,
    landColorHex: 0x5eb4ff,  // Vivid sky-blue realm
    landLightHex: 0x9fd3ff,
  },
  enemy_red: {
    id: 'enemy_red',
    species: 'fox',
    name: 'Cáo Đỏ',
    colorHex: 0xdc2626,      // Crimson Red
    lightColorHex: 0xf87171, // Coral Flame
    darkColorHex: 0xb91c1c,
    shadowColorHex: 0x5f0f0f,
    ringColorHex: 0xfca5a5,
    bannerColor: '#ef4444',
    troopColor: 0xdc2626,
    landColorHex: 0xff8a80,
    landLightHex: 0xffb8b1,
  },
  enemy_gold: {
    id: 'enemy_gold',
    species: 'bear',
    name: 'Gấu Vàng',
    colorHex: 0xd97706,      // Deep Amber
    lightColorHex: 0xfbbf24, // Bright Gold
    darkColorHex: 0xb45309,
    shadowColorHex: 0x592804,
    ringColorHex: 0xfde68a,
    bannerColor: '#f59e0b',
    troopColor: 0xd97706,
    landColorHex: 0xffcf5c,
    landLightHex: 0xffe29a,
  },
  enemy_purple: {
    id: 'enemy_purple',
    species: 'owl',
    name: 'Cú Tím',
    colorHex: 0x7c3aed,      // Electric Violet
    lightColorHex: 0xa78bfa, // Orchid
    darkColorHex: 0x6d28d9,
    shadowColorHex: 0x3b0764,
    ringColorHex: 0xddd6fe,
    bannerColor: '#8b5cf6',
    troopColor: 0x7c3aed,
    landColorHex: 0xbc9cff,
    landLightHex: 0xd9c8ff,
  },
  neutral: {
    id: 'neutral',
    species: 'cat',
    name: 'Đảo Hoang',
    colorHex: 0x475569,      // Slate Slate
    lightColorHex: 0x94a3b8, // Light Stone
    darkColorHex: 0x334155,
    shadowColorHex: 0x0f172a,
    ringColorHex: 0xcbd5e1,
    bannerColor: '#94a3b8',
    troopColor: 0x64748b,
    landColorHex: 0x8fdc5e,  // Lush meadow green (unclaimed land)
    landLightHex: 0xbaf08f,
  },
};

export const BASE_TYPES = {
  village: {
    type: 'village',
    title: 'Ổ Mèo Con',
    radius: 30,
    maxUnits: 40,
    productionRate: 1.2, // units per second
    defense: 1.0,
  },
  stronghold: {
    type: 'stronghold',
    title: 'Trạm Cá Khô',
    radius: 38,
    maxUnits: 65,
    productionRate: 1.8,
    defense: 1.2,
  },
  citadel: {
    type: 'citadel',
    title: 'Cung Điện Cá Hồi',
    radius: 48,
    maxUnits: 95,
    productionRate: 2.8,
    defense: 1.4,
  }
};

export const DIFFICULTY_TIERS = [
  { id: 1, key: 'very_easy', name: 'CỰC DỄ', start: 1, end: 10, colorHex: 0x22c55e, badgeColor: 0x15803d, desc: 'Làm quen biển đảo & Thao tác căn bản' },
  { id: 2, key: 'easy', name: 'DỄ', start: 11, end: 20, colorHex: 0x0284c7, badgeColor: 0x0369a1, desc: 'Đánh chiếm tiền đồn & Điều quân ven biển' },
  { id: 3, key: 'normal', name: 'BÌNH THƯỜNG', start: 21, end: 30, colorHex: 0xd97706, badgeColor: 0xb45309, desc: 'Chiến thuật giằng co ba phe & Chiếm pháo đài' },
  { id: 4, key: 'hard', name: 'KHÓ', start: 31, end: 40, colorHex: 0xea580c, badgeColor: 0xc2410c, desc: 'Bốn bề thọ địch & Phản kích chớp nhoáng' },
  { id: 5, key: 'nightmare', name: 'SIÊU KHÓ', start: 41, end: 50, colorHex: 0xdc2626, badgeColor: 0x991b1b, desc: 'Đại chiến vương quyền & Thống nhất quần đảo' },
];

const TITLES = [
  // Tier 1: Cực Dễ (1..10)
  { title: 'Tập Đánh Chiếm', sub: 'Chỉ cần kéo quân sang đảo hoang rồi tấn công căn cứ địch!' },
  { title: 'Hai Nhánh Tiến Quân', sub: 'Chiếm cứ điểm trung gian để nhân đôi quân số xuất kích!' },
  { title: 'Băng Đèo Núi', sub: 'Hẻm núi ngăn đôi, đi men theo bờ suối để đột kích!' },
  { title: 'Đường Biển Ven Bờ', sub: 'Đường biển rộng mở, chèo thuyền đánh chiếm trạm cá khô!' },
  { title: 'Kho Lương Bờ Tây', sub: 'Chiếm trạm cá khô trung tâm để tăng tốc độ sinh quân!' },
  { title: 'Hai Cánh Xuất Kích', sub: 'Bạn sở hữu 2 căn cứ, xuất quân đồng thời để dồn ép địch!' },
  { title: 'Đảo San Hô Xanh', sub: 'Các đảo nằm gần nhau, mở rộng nhanh chóng để áp đảo!' },
  { title: 'Hẻm Núi Đôi', sub: 'Giữ chặt hai bên cánh rồi cùng tổng tấn công vào sào huyệt địch!' },
  { title: 'Vịnh Cá Chuồn', sub: 'Thu phục các đảo hoang trước khi Cáo Đỏ kịp hành động!' },
  { title: 'Tiền Đồn Cáo Đỏ', sub: 'Trận thử lửa đầu tiên! Quét sạch tiền đồn của Cáo Đỏ!' },

  // Tier 2: Dễ (11..20)
  { title: 'Bờ Cát Vàng', sub: 'Cáo Đỏ bắt đầu mở rộng, hãy nhanh tay chiếm các đảo hoang!' },
  { title: 'Eo Biển Rùa Xanh', sub: 'Đường biển dài hơn, phân bố quân hợp lý để không bị hụt hơi!' },
  { title: 'Đồi Gió Lộng', sub: 'Cứ điểm trên đồi phòng thủ vững chắc, tích đủ quân rồi tràn lên!' },
  { title: 'Pháo Đài Bờ Đông', sub: 'Bạn có 2 đảo hậu cần, viện binh liên tục cho tiền tuyến!' },
  { title: 'Quần Đảo Hải Âu', sub: 'Đảo rải rác khắp vịnh, lựa chọn mục tiêu gần nhất để chiếm trước!' },
  { title: 'Móng Vuốt Rừng Sâu', sub: 'Địch bắt đầu biết chi viện qua lại, cắt đứt đường tiếp tế của chúng!' },
  { title: 'Cửa Biển Hiểm Trở', sub: 'Địa hình hẹp chỉ có 2 ngả đường, ai giữ được chốt chặn sẽ thắng!' },
  { title: 'Trạm Gác Tiền Tiêu', sub: 'Dùng kỹ năng Tốc Biến khi quân đang hành quân để bứt tốc!' },
  { title: 'Vòng Xoáy Thủy Triều', sub: 'Chiếm lấy pháo đài trung tâm để khống chế toàn bộ vùng vịnh!' },
  { title: 'Pháo Đài Cáo Lửa', sub: 'Thủ lĩnh Cáo Đỏ đích thân trấn giữ! Dồn toàn lực công phá!' },

  // Tier 3: Bình Thường (21..30)
  { title: 'Tam Quốc Tranh Hùng', sub: 'Gấu Vàng tham chiến! Cẩn thận bị cả hai phe cùng nhắm tới!' },
  { title: 'Cung Điện Cá Hồi', sub: 'Cung điện giữa đảo là chìa khóa chiến thắng, ai chiếm sẽ làm trùm!' },
  { title: 'Đèo Sương Mù', sub: 'Hẻm núi hiểm trở che khuất tầm nhìn, cẩn thận phục kích!' },
  { title: 'Eo Biển Cá Ngừ', sub: 'Đại chiến hai bờ đại dương, mở rộng hạm đội thuyền chiến!' },
  { title: 'Bốn Bề Móng Vuốt', sub: 'Căn cứ nằm giữa tâm bão, bật Khiên Kiên Cố để chặn đứng đợt tấn công!' },
  { title: 'Quần Đảo Cá Mòi', sub: 'Mạng lưới đường biển chằng chịt, tận dụng thế trận gọng kìm!' },
  { title: 'Hai Phe Giằng Co', sub: 'Trận địa đối xứng, chỉ một sai lầm nhỏ cũng có thể đổi chiều!' },
  { title: 'Thung Lũng Đá Vôi', sub: 'Các mỏm đá tự nhiên chia cắt căn cứ, kiểm soát lối đi hẹp!' },
  { title: 'Cầu Nối Ba Đảo', sub: 'Cáo Đỏ và Gấu Vàng tranh giành dữ dội, tọa sơn quan hổ đấu!' },
  { title: 'Gấu Vàng Xuất Trận', sub: 'Quân đoàn Gấu Vàng cực kỳ lỳ lợm! Kích hoạt Tiếp Ứng để tăng viện!' },

  // Tier 4: Khó (31..40)
  { title: 'Cú Tím Gia Nhập', sub: 'Tộc Cú Tím xuất hiện với tốc độ đánh úp thần tốc! Cực kỳ cảnh giác!' },
  { title: 'Mê Cung Hải Tặc', sub: 'Đường sá ngoằn ngoèo, đối phương liên tục tấn công nhiều hướng!' },
  { title: 'Đảo Đầu Lâu', sub: 'Tử địa đá ngầm, các căn cứ địch phối hợp vây ráp gắt gao!' },
  { title: 'Hẻm Núi Tử Thần', sub: 'Chỉ có thể vượt qua hẻm núi hẹp, dùng Khiên Kiên Cố chặn đầu cầu!' },
  { title: 'Chiến Lũy Răng Sói', sub: 'Cả ba thế lực thù địch cùng nhắm vào lãnh thổ Mèo Xanh!' },
  { title: 'Đầm Lầy Bẫy Rập', sub: 'Tốc độ di chuyển chậm, tính toán từng bước xuất quân chuẩn xác!' },
  { title: 'Vịnh Bão Táp', sub: 'Sóng gió biển sâu, đối thủ xuất quân với tần suất dồn dập!' },
  { title: 'Pháo Đài Thép', sub: 'Hàng loạt pháo đài kiên cố của địch, cần kết hợp cả 3 kỹ năng!' },
  { title: 'Lửa Thiêu Bờ Cõi', sub: 'Địch không ngừng tràn quân, giữ vững căn cứ chủ chốt bằng mọi giá!' },
  { title: 'Cú Tím Thống Lĩnh', sub: 'Chủ tướng Cú Tím với chiến thuật biển người! Đột kích sào huyệt!' },

  // Tier 5: Siêu Khó (41..50)
  { title: 'Tử Địa Rực Lửa', sub: 'Độ khó ác mộng! Địch xuất quân gần như tức thì, không một giây lơi lỏng!' },
  { title: 'Quần Đảo Sấm Sét', sub: 'Chiến trường rộng lớn với 10 căn cứ, áp lực đè nặng mọi phòng tuyến!' },
  { title: 'Ngũ Hành Phục Kích', sub: 'Đối phương kiểm soát hầu hết các cung điện, lật ngược thế cờ trong gang tấc!' },
  { title: 'Hỏa Ngục Đảo', sub: 'Biển lửa rực cháy, sai một bước xuất quân là mất cả cứ điểm!' },
  { title: 'Vực Thẳm Vô Tận', sub: 'Bị bao vây bốn phía, bắt buộc phải phản công chớp nhoáng diệt từng phe!' },
  { title: 'Vòng Xoáy Cuộn Len', sub: 'Bản đồ xoắn ốc cực đại, kẻ thù kéo quân liên tục không ngừng nghỉ!' },
  { title: 'Bão Biển Huyết Nguyệt', sub: 'Áp lực cực độ! Ba đạo quân Cáo, Gấu, Cú tổng lực tấn công!' },
  { title: 'Cung Điện Hắc Ám', sub: 'Thành lũy cuối cùng trước thềm trận chiến sinh tử của loài mèo!' },
  { title: 'Tiền Đồn Diệt Vong', sub: 'Cửa ải thử thách giới hạn phản xạ và tư duy chiến lược đỉnh cao!' },
  { title: 'ĐẠI CHIẾN HUYỀN THOẠI', sub: 'Trận chiến cuối cùng! Đánh bại liên minh ba tộc thú, thống nhất quần đảo!' },
];

function buildLevelData(lvl) {
  const meta = TITLES[lvl - 1];
  const tier = lvl <= 10 ? 1 : lvl <= 20 ? 2 : lvl <= 30 ? 3 : lvl <= 40 ? 4 : 5;

  let bases = [];
  let routes = [];
  let terrain = null;

  // Tier 1: Cực Dễ (Levels 1..10)
  if (lvl === 1) {
    bases = [
      { id: 'b1', x: 200, y: 300, owner: 'player', units: 35, type: 'village' },
      { id: 'b2', x: 400, y: 300, owner: 'neutral', units: 5, type: 'village' },
      { id: 'b3', x: 600, y: 300, owner: 'enemy_red', units: 8, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b2', to: 'b3', type: 'land' },
    ];
  } else if (lvl === 2) {
    bases = [
      { id: 'b1', x: 180, y: 300, owner: 'player', units: 35, type: 'village' },
      { id: 'b2', x: 390, y: 200, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b3', x: 390, y: 400, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b4', x: 620, y: 300, owner: 'enemy_red', units: 10, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'land' },
      { from: 'b3', to: 'b4', type: 'land' },
    ];
  } else if (lvl === 3) {
    bases = [
      { id: 'b1', x: 180, y: 300, owner: 'player', units: 35, type: 'village' },
      { id: 'b2', x: 390, y: 190, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b3', x: 390, y: 410, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b4', x: 620, y: 300, owner: 'enemy_red', units: 12, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'mountain' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'mountain' },
      { from: 'b3', to: 'b4', type: 'land' },
    ];
    terrain = { mountains: [{ x: 390, y: 300, count: 4, scale: 1.1 }] };
  } else if (lvl === 4) {
    bases = [
      { id: 'b1', x: 180, y: 300, owner: 'player', units: 40, type: 'stronghold' },
      { id: 'b2', x: 380, y: 180, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b3', x: 380, y: 420, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b4', x: 620, y: 300, owner: 'enemy_red', units: 12, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'sea' },
      { from: 'b1', to: 'b3', type: 'sea' },
      { from: 'b2', to: 'b4', type: 'sea' },
      { from: 'b3', to: 'b4', type: 'land' },
    ];
  } else if (lvl === 5) {
    bases = [
      { id: 'b1', x: 170, y: 300, owner: 'player', units: 35, type: 'village' },
      { id: 'b2', x: 400, y: 300, owner: 'neutral', units: 10, type: 'stronghold' },
      { id: 'b3', x: 400, y: 170, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b4', x: 400, y: 430, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b5', x: 630, y: 300, owner: 'enemy_red', units: 14, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b1', to: 'b4', type: 'land' },
      { from: 'b2', to: 'b5', type: 'land' },
      { from: 'b3', to: 'b5', type: 'land' },
      { from: 'b4', to: 'b5', type: 'land' },
    ];
  } else if (lvl === 6) {
    bases = [
      { id: 'b1', x: 170, y: 200, owner: 'player', units: 25, type: 'village' },
      { id: 'b2', x: 170, y: 400, owner: 'player', units: 25, type: 'village' },
      { id: 'b3', x: 380, y: 200, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b4', x: 380, y: 400, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b5', x: 630, y: 300, owner: 'enemy_red', units: 14, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'land' },
      { from: 'b3', to: 'b5', type: 'land' },
      { from: 'b4', to: 'b5', type: 'land' },
    ];
  } else if (lvl === 7) {
    bases = [
      { id: 'b1', x: 170, y: 430, owner: 'player', units: 35, type: 'village' },
      { id: 'b2', x: 260, y: 220, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b3', x: 430, y: 300, owner: 'neutral', units: 8, type: 'stronghold' },
      { id: 'b4', x: 430, y: 450, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b5', x: 630, y: 220, owner: 'enemy_red', units: 15, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b4', type: 'land' },
      { from: 'b2', to: 'b3', type: 'mountain' },
      { from: 'b4', to: 'b3', type: 'land' },
      { from: 'b3', to: 'b5', type: 'mountain' },
      { from: 'b2', to: 'b5', type: 'sea' },
    ];
  } else if (lvl === 8) {
    bases = [
      { id: 'b1', x: 160, y: 210, owner: 'player', units: 25, type: 'village' },
      { id: 'b2', x: 160, y: 390, owner: 'player', units: 25, type: 'village' },
      { id: 'b3', x: 390, y: 200, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b4', x: 390, y: 400, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b5', x: 630, y: 300, owner: 'enemy_red', units: 16, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'mountain' },
      { from: 'b2', to: 'b4', type: 'mountain' },
      { from: 'b3', to: 'b5', type: 'land' },
      { from: 'b4', to: 'b5', type: 'land' },
    ];
    terrain = { mountains: [{ x: 390, y: 300, count: 4, scale: 1.0 }] };
  } else if (lvl === 9) {
    bases = [
      { id: 'b1', x: 160, y: 300, owner: 'player', units: 40, type: 'stronghold' },
      { id: 'b2', x: 300, y: 190, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b3', x: 300, y: 410, owner: 'neutral', units: 6, type: 'village' },
      { id: 'b4', x: 470, y: 210, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b5', x: 470, y: 390, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b6', x: 640, y: 300, owner: 'enemy_red', units: 16, type: 'village' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'sea' },
      { from: 'b2', to: 'b4', type: 'land' },
      { from: 'b3', to: 'b5', type: 'sea' },
      { from: 'b4', to: 'b6', type: 'land' },
      { from: 'b5', to: 'b6', type: 'land' },
      { from: 'b2', to: 'b3', type: 'mountain' },
    ];
  } else if (lvl === 10) {
    // Mini-boss Tier 1
    bases = [
      { id: 'b1', x: 150, y: 200, owner: 'player', units: 30, type: 'stronghold' },
      { id: 'b2', x: 150, y: 400, owner: 'player', units: 30, type: 'village' },
      { id: 'b3', x: 340, y: 200, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b4', x: 340, y: 400, owner: 'neutral', units: 8, type: 'village' },
      { id: 'b5', x: 460, y: 300, owner: 'neutral', units: 10, type: 'village' },
      { id: 'b6', x: 640, y: 300, owner: 'enemy_red', units: 22, type: 'stronghold' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'land' },
      { from: 'b3', to: 'b5', type: 'mountain' },
      { from: 'b4', to: 'b5', type: 'mountain' },
      { from: 'b3', to: 'b6', type: 'land' },
      { from: 'b4', to: 'b6', type: 'land' },
      { from: 'b5', to: 'b6', type: 'land' },
    ];
  }
  // Tier 2: Dễ (Levels 11..20)
  else if (tier === 2) {
    const pUnits = 30 + (lvl % 3) * 2;
    const eUnits = 18 + (lvl - 11);
    const nUnits = 8 + (lvl % 4);

    bases = [
      { id: 'b1', x: 160, y: 200, owner: 'player', units: pUnits, type: 'village' },
      { id: 'b2', x: 160, y: 400, owner: 'player', units: 25, type: 'village' },
      { id: 'b3', x: 330, y: 180, owner: 'neutral', units: nUnits, type: 'village' },
      { id: 'b4', x: 330, y: 420, owner: 'neutral', units: nUnits, type: 'village' },
      { id: 'b5', x: 470, y: 300, owner: 'neutral', units: nUnits + 4, type: lvl >= 15 ? 'stronghold' : 'village' },
      { id: 'b6', x: 640, y: lvl % 2 === 0 ? 300 : 220, owner: 'enemy_red', units: eUnits, type: lvl === 20 ? 'citadel' : 'stronghold' },
    ];
    if (lvl >= 16) {
      bases.push({ id: 'b7', x: 640, y: 420, owner: 'neutral', units: nUnits + 2, type: 'village' });
    }
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'sea' },
      { from: 'b3', to: 'b5', type: 'mountain' },
      { from: 'b4', to: 'b5', type: 'mountain' },
      { from: 'b3', to: 'b6', type: 'land' },
      { from: 'b5', to: 'b6', type: 'land' },
    ];
    if (lvl >= 16) {
      routes.push({ from: 'b4', to: 'b7', type: 'sea' });
      routes.push({ from: 'b6', to: 'b7', type: 'land' });
    }
  }
  // Tier 3: Bình Thường (Levels 21..30)
  else if (tier === 3) {
    const e1Units = 22 + (lvl - 21);
    const e2Units = 20 + (lvl - 21);
    bases = [
      { id: 'b1', x: 160, y: 420, owner: 'player', units: 32, type: 'stronghold' },
      { id: 'b2', x: 260, y: 220, owner: 'neutral', units: 12, type: 'village' },
      { id: 'b3', x: 400, y: 300, owner: 'neutral', units: 20, type: 'citadel' }, // Central Citadel
      { id: 'b4', x: 400, y: 150, owner: 'enemy_red', units: e1Units, type: 'stronghold' },
      { id: 'b5', x: 400, y: 460, owner: 'neutral', units: 14, type: 'village' },
      { id: 'b6', x: 640, y: 220, owner: 'neutral', units: 14, type: 'village' },
      { id: 'b7', x: 640, y: 420, owner: 'enemy_gold', units: e2Units, type: lvl === 30 ? 'citadel' : 'stronghold' },
    ];
    if (lvl >= 25) {
      bases.push({ id: 'b8', x: 260, y: 420, owner: 'neutral', units: 12, type: 'village' });
    }
    routes = [
      { from: 'b1', to: 'b2', type: 'mountain' },
      { from: 'b1', to: 'b5', type: 'land' },
      { from: 'b2', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'mountain' },
      { from: 'b4', to: 'b3', type: 'mountain' },
      { from: 'b4', to: 'b6', type: 'land' },
      { from: 'b3', to: 'b5', type: 'land' },
      { from: 'b3', to: 'b7', type: 'land' },
      { from: 'b5', to: 'b7', type: 'sea' },
      { from: 'b6', to: 'b7', type: 'land' },
    ];
    if (lvl >= 25) {
      routes.push({ from: 'b1', to: 'b8', type: 'land' });
      routes.push({ from: 'b8', to: 'b5', type: 'land' });
    }
  }
  // Tier 4: Khó (Levels 31..40)
  else if (tier === 4) {
    const eUnits = 26 + (lvl - 31);
    bases = [
      { id: 'b1', x: 150, y: 300, owner: 'player', units: 30, type: 'stronghold' },
      { id: 'b2', x: 270, y: 180, owner: 'neutral', units: 16, type: 'village' },
      { id: 'b3', x: 270, y: 420, owner: 'neutral', units: 16, type: 'village' },
      { id: 'b4', x: 400, y: 160, owner: 'enemy_red', units: eUnits, type: 'stronghold' },
      { id: 'b5', x: 400, y: 440, owner: 'enemy_gold', units: eUnits, type: 'stronghold' },
      { id: 'b6', x: 400, y: 300, owner: 'neutral', units: 25, type: 'citadel' },
      { id: 'b7', x: 530, y: 180, owner: 'neutral', units: 16, type: 'village' },
      { id: 'b8', x: 530, y: 420, owner: 'neutral', units: 16, type: 'village' },
      { id: 'b9', x: 650, y: 300, owner: 'enemy_purple', units: eUnits + 2, type: lvl === 40 ? 'citadel' : 'stronghold' },
    ];
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'sea' },
      { from: 'b2', to: 'b4', type: 'mountain' },
      { from: 'b3', to: 'b5', type: 'sea' },
      { from: 'b1', to: 'b6', type: 'mountain' },
      { from: 'b4', to: 'b6', type: 'land' },
      { from: 'b5', to: 'b6', type: 'land' },
      { from: 'b4', to: 'b7', type: 'land' },
      { from: 'b5', to: 'b8', type: 'land' },
      { from: 'b6', to: 'b9', type: 'mountain' },
      { from: 'b7', to: 'b9', type: 'land' },
      { from: 'b8', to: 'b9', type: 'sea' },
    ];
  }
  // Tier 5: Siêu Khó (Levels 41..50)
  else {
    const eUnits = 35 + (lvl - 41) * 2;
    bases = [
      { id: 'b1', x: 140, y: 160, owner: 'player', units: 35, type: 'citadel' },
      { id: 'b2', x: 140, y: 440, owner: 'player', units: 32, type: 'stronghold' },
      { id: 'b3', x: 280, y: 220, owner: 'neutral', units: 20, type: 'village' },
      { id: 'b4', x: 280, y: 380, owner: 'neutral', units: 20, type: 'village' },
      { id: 'b5', x: 400, y: 150, owner: 'enemy_red', units: eUnits, type: 'citadel' },
      { id: 'b6', x: 400, y: 300, owner: 'neutral', units: 30, type: 'citadel' },
      { id: 'b7', x: 400, y: 450, owner: 'enemy_gold', units: eUnits, type: 'citadel' },
      { id: 'b8', x: 520, y: 220, owner: 'neutral', units: 22, type: 'stronghold' },
      { id: 'b9', x: 520, y: 380, owner: 'neutral', units: 22, type: 'stronghold' },
      { id: 'b10', x: 660, y: 300, owner: 'enemy_purple', units: eUnits + 4, type: 'citadel' },
    ];
    if (lvl >= 45) {
      bases.push({ id: 'b11', x: 660, y: 160, owner: 'enemy_red', units: eUnits - 4, type: 'stronghold' });
      bases.push({ id: 'b12', x: 660, y: 440, owner: 'enemy_gold', units: eUnits - 4, type: 'stronghold' });
    }
    routes = [
      { from: 'b1', to: 'b2', type: 'land' },
      { from: 'b1', to: 'b3', type: 'land' },
      { from: 'b2', to: 'b4', type: 'sea' },
      { from: 'b3', to: 'b5', type: 'mountain' },
      { from: 'b3', to: 'b6', type: 'land' },
      { from: 'b4', to: 'b6', type: 'land' },
      { from: 'b4', to: 'b7', type: 'mountain' },
      { from: 'b5', to: 'b8', type: 'land' },
      { from: 'b6', to: 'b8', type: 'land' },
      { from: 'b6', to: 'b9', type: 'land' },
      { from: 'b7', to: 'b9', type: 'land' },
      { from: 'b8', to: 'b10', type: 'mountain' },
      { from: 'b9', to: 'b10', type: 'sea' },
    ];
    if (lvl >= 45) {
      routes.push({ from: 'b8', to: 'b11', type: 'land' });
      routes.push({ from: 'b9', to: 'b12', type: 'land' });
      routes.push({ from: 'b11', to: 'b10', type: 'land' });
      routes.push({ from: 'b12', to: 'b10', type: 'land' });
    }
  }

  return {
    level: lvl,
    tier,
    title: meta.title,
    subtitle: meta.sub,
    targetScore: 1000 + lvl * 250,
    timeLimit3Stars: 45 + Math.min(60, Math.floor(lvl * 1.5)),
    bases,
    routes,
    terrain: terrain || undefined,
  };
}

export const CAMPAIGN_LEVELS = Array.from({ length: 50 }, (_, i) => buildLevelData(i + 1));

export function getLevelConfig(levelNumber = 1) {
  let config = CAMPAIGN_LEVELS.find(l => l.level === levelNumber);
  if (!config) {
    config = generateRandomMap(levelNumber);
  }
  return config;
}

/** Procedurally generates a balanced random conquest map for endless mode beyond level 50 */
export function generateRandomMap(levelSeed = 51) {
  const nodeCount = 8 + (levelSeed % 5);
  const bases = [];
  const minDistance = 100;
  
  // 1. Player base (Left side)
  bases.push({
    id: 'b1',
    x: 160,
    y: 250 + (Math.random() * 100 - 50),
    owner: 'player',
    units: 35,
    type: 'stronghold',
  });

  // 2. Primary enemy base (Right side)
  bases.push({
    id: 'b2',
    x: 640,
    y: 250 + (Math.random() * 100 - 50),
    owner: 'enemy_red',
    units: 35,
    type: 'stronghold',
  });

  // 3. 2nd enemy
  if (nodeCount >= 9) {
    bases.push({
      id: 'b3',
      x: 400,
      y: 470,
      owner: 'enemy_gold',
      units: 30,
      type: 'village',
    });
  }

  // 4. Fill in neutrals
  let attempts = 0;
  while (bases.length < nodeCount && attempts < 100) {
    attempts++;
    const candX = 220 + Math.random() * 360;
    const candY = 160 + Math.random() * 280;
    
    let tooClose = false;
    for (const b of bases) {
      const dx = b.x - candX;
      const dy = b.y - candY;
      if (Math.hypot(dx, dy) < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      const isCitadel = bases.length === 3;
      bases.push({
        id: `b${bases.length + 1}`,
        x: Math.round(candX),
        y: Math.round(candY),
        owner: 'neutral',
        units: isCitadel ? 28 : Math.floor(12 + Math.random() * 15),
        type: isCitadel ? 'citadel' : (Math.random() > 0.5 ? 'stronghold' : 'village'),
      });
    }
  }

  return {
    level: levelSeed,
    tier: 5,
    title: `Đảo Bí Ẩn #${levelSeed}`,
    subtitle: 'Hòn đảo ngẫu nhiên với địa hình hoàn toàn mới!',
    targetScore: 2500 + levelSeed * 200,
    timeLimit3Stars: 75,
    bases,
  };
}
