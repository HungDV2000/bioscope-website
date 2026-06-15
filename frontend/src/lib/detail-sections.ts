import type { ContentSection, Bilingual } from "./types";

const p = (vi: string, en: string): Bilingual => ({ vi, en });

/* ========================================================================== */
/*  CÔNG NGHỆ — nội dung chi tiết theo slug                                     */
/* ========================================================================== */
export const techSectionMap: Record<string, { contentLead?: Bilingual; sections: ContentSection[] }> = {
  novaskin: {
    contentLead: p(
      "Novaskin™ là kết quả hơn 8 năm R&D của Bioscope, được thiết kế để giải quyết bài toán cốt lõi của mỹ phẩm và dermocosmetics hiện đại: làm sao đưa hoạt chất qua hàng rào biểu bì và giữ hiệu quả tại lớp đích.",
      "Novaskin™ is the outcome of over 8 years of Bioscope R&D, engineered to solve the core challenge of modern cosmetics and dermocosmetics: how to carry actives across the epidermal barrier and maintain efficacy at the target layer."
    ),
    sections: [
      {
        id: "nguyen-ly",
        level: 2,
        title: p("Nguyên lý vận chuyển", "Delivery principle"),
        paragraphs: [
          p(
            "Cấu trúc lipid kép nano của Novaskin™ mô phỏng thành phần màng tế bào da. Khi tiếp xúc biểu bì, vesicle có xu hướng hợp nhất (fusion) với lipid corneocyte, tạo đường con đi ưu tiên cho hoạt chất thay vì bám trên bề mặt.",
            "Novaskin™'s nano bilayer structure mimics skin cell membrane composition. Upon epidermal contact, vesicles tend to fuse with corneocyte lipids, creating a preferential pathway for actives rather than surface deposition."
          ),
        ],
      },
      {
        id: "ung-dung-my-pham",
        level: 2,
        title: p("Ứng dụng trong mỹ phẩm", "Cosmetic applications"),
        paragraphs: [
          p(
            "Novaskin™ phù hợp serum peptide, retinol bọc, vitamin C tan trong dầu và chiết xuất chống oxy hóa. Trong thử nghiệm nội bộ với công thức serum peptide 3%, nhóm sử dụng Novaskin™ ghi nhận cải thiện độ ẩm TEWL và độ đàn hồi da sau 28 ngày so với mẫu đối chứng không nano.",
            "Novaskin™ suits peptide serums, encapsulated retinol, oil-soluble vitamin C and antioxidant extracts. In internal testing with a 3% peptide serum, the Novaskin™ formula showed improved TEWL hydration and skin elasticity after 28 days versus a non-nano control."
          ),
        ],
      },
      {
        id: "tpcn",
        level: 3,
        title: p("Mở rộng sang TPCN", "Extension to supplements"),
        paragraphs: [
          p(
            "Ngoài bôi, nền tảng có thể điều chỉnh cho hoạt chất tan trong dầu trong softgel và dạng lỏng, hỗ trợ bảo vệ khỏi oxy hóa trong quá trình lưu kho.",
            "Beyond topicals, the platform can be adapted for oil-soluble actives in softgels and liquids, helping protect against oxidation during storage."
          ),
        ],
      },
      {
        id: "hop-tac",
        level: 2,
        title: p("Hợp tác phát triển sản phẩm", "Product development partnership"),
        paragraphs: [
          p(
            "Bioscope cung cấp gói dịch vụ từ chọn hoạt chất, thiết kế công thức mẫu, kiểm nghiệm ổn định đến scale-up sản xuất thử. Đối tác nhận báo cáo kỹ thuật đầy đủ phục vụ claim và hồ sơ công bố.",
            "Bioscope offers a full service package from active selection, prototype formulation, stability testing to pilot scale-up. Partners receive complete technical reports for claims and notification dossiers."
          ),
        ],
      },
    ],
  },
  "phytosome-wet": {
    contentLead: p(
      "Phytosome ướt là quy trình độc quyền của Bioscope, tối ưu cho các hoạt chất thực vật ưa nước — nhóm chiết xuất thường gặp khó khăn nhất về sinh khả dụng.",
      "Wet phytosome is a Bioscope proprietary process optimised for hydrophilic botanical actives — the extract class that most often struggles with bioavailability."
    ),
    sections: [
      {
        id: "sinh-kha-dung",
        level: 2,
        title: p("Sinh khả dụng và hấp thu", "Bioavailability and absorption"),
        paragraphs: [
          p(
            "Phức hợp phospholipid-hoạt chất tạo cấu trúc lưỡng tính, tương thích với màng ruột giàu lipid. Dữ liệu in-vitro cho thấy tăng hấp thu curcumin và silymarin lên 4–6 lần so với bột chiết khô thông thường.",
            "The phospholipid-active complex forms an amphipathic structure compatible with the lipid-rich intestinal membrane. In-vitro data shows 4–6× absorption improvement for curcumin and silymarin versus standard dry extract powders."
          ),
        ],
      },
      {
        id: "quy-trinh",
        level: 2,
        title: p("Quy trình sản xuất", "Manufacturing process"),
        paragraphs: [
          p(
            "Khác với phytosome khô, quy trình ướt giữ hoạt chất trong môi trường aqueous có kiểm soát nhiệt độ, hạn chế phân hủy nhiệt-labile và đạt tỷ lệ phức hợp >90%.",
            "Unlike dry phytosome, the wet process maintains actives in a temperature-controlled aqueous environment, limiting heat-labile degradation and achieving >90% complexation rates."
          ),
        ],
      },
      {
        id: "cong-thuc",
        level: 2,
        title: p("Gợi ý công thức", "Formulation guidance"),
        paragraphs: [
          p(
            "Ứng dụng phổ biến: viên nang mềm gan, viên uống hỗ trợ kháng viêm, serum chiết xuất trà xanh. Bioscope hỗ trợ liều lượng gợi ý và tương thích excipient theo dạng bào chế mục tiêu.",
            "Common applications: liver softgels, anti-inflammatory supplements, green tea extract serums. Bioscope provides suggested dosing and excipient compatibility guidance per target dosage form."
          ),
        ],
      },
    ],
  },
  lipodisq: {
    contentLead: p(
      "Lipodisq® được phát triển cho các hoạt chất cực kỳ nhạy cảm — retinoid, omega-3, vitamin tan trong dầu — cần bảo vệ tối đa trong suốt vòng đời sản phẩm.",
      "Lipodisq® was developed for highly sensitive actives — retinoids, omega-3, fat-soluble vitamins — requiring maximum protection throughout the product lifecycle."
    ),
    sections: [
      {
        id: "cau-truc",
        level: 2,
        title: p("Cấu trúc đĩa nano lipid", "Lipid nanodisc structure"),
        paragraphs: [
          p(
            "Đĩa lipid phẳng được polymer lưỡng tính bao quanh, tạo hạt nano đồng nhất kích thước 10–30 nm. Cấu trúc này ổn định hơn vesicle truyền thống với hoạt chất nhạy cảm.",
            "Flat lipid discs are wrapped by an amphipathic polymer, forming uniform 10–30 nm nanoparticles. This structure is more stable than conventional vesicles for sensitive actives."
          ),
        ],
      },
      {
        id: "bao-ve",
        level: 2,
        title: p("Bảo vệ chống oxy hóa", "Oxidation protection"),
        paragraphs: [
          p(
            "Trong thử nghiệm gia tốc (40°C, 75% RH), mẫu Lipodisq® giữ >85% hoạt chất sau 12 tuần, trong khi mẫu đối chứng không bao gói giảm còn ~60%.",
            "In accelerated testing (40°C, 75% RH), Lipodisq® samples retained >85% active after 12 weeks, while unencapsulated controls dropped to ~60%."
          ),
        ],
      },
      {
        id: "dang-bao-che",
        level: 3,
        title: p("Dạng bào chế phù hợp", "Suitable dosage forms"),
        paragraphs: [
          p(
            "Softgel, serum dầu, cream chống lão hóa và viên bao tan chậm. Lipodisq® hỗ trợ phóng thích kéo dài lên đến 12 giờ tùy công thức.",
            "Softgels, oil serums, anti-ageing creams and sustained-release tablets. Lipodisq® supports sustained release up to 12 hours depending on formulation."
          ),
        ],
      },
    ],
  },
  liposome: {
    contentLead: p(
      "Hệ liposome dược dụng của Bioscope cho phép kết hợp đa hoạt chất trong một vesicle duy nhất — giải pháp lý tưởng cho công thức phức hợp TPCN và mỹ phẩm cao cấp.",
      "Bioscope's pharmaceutical-grade liposome system allows multiple actives in a single vesicle — ideal for complex supplement and premium cosmetic formulas."
    ),
    sections: [
      {
        id: "vận-chuyen-kep",
        level: 2,
        title: p("Vận chuyển kép ưa nước & ưa dầu", "Dual hydro/lipophilic delivery"),
        paragraphs: [
          p(
            "Lõi nước chứa hoạt chất tan trong nước (vitamin nhóm B, peptide); lớp màng lipid chứa hoạt chất tan trong dầu (vitamin E, carotenoid). Một vesicle — hai môi trường bảo vệ.",
            "The aqueous core holds water-soluble actives (B vitamins, peptides); the lipid bilayer holds oil-soluble actives (vitamin E, carotenoids). One vesicle — two protective environments."
          ),
        ],
      },
      {
        id: "chat-luong",
        level: 2,
        title: p("Kiểm soát chất lượng", "Quality control"),
        paragraphs: [
          p(
            "Mỗi lô liposome được kiểm tra kích thước hạt (DLS), PDI <0.2, hiệu suất nạp hoạt chất và sterility theo tiêu chuẩn nội bộ tương đương GMP.",
            "Each liposome batch is tested for particle size (DLS), PDI <0.2, active loading efficiency and sterility per internal GMP-equivalent standards."
          ),
        ],
      },
      {
        id: "vi-du",
        level: 2,
        title: p("Ví dụ ứng dụng thực tế", "Real-world examples"),
        paragraphs: [
          p(
            "Nước uống đa vitamin liposome, serum vitamin C+E đồng vận chuyển, và viên uống khoáng chất hữu cơ. Bioscope tùy chỉnh tỷ lệ lipid/hoạt chất theo profile hấp thu mong muốn.",
            "Multi-vitamin liposomal drinks, vitamin C+E co-delivery serums and organic mineral supplements. Bioscope customises lipid/active ratios to the desired absorption profile."
          ),
        ],
      },
    ],
  },
};

/* ========================================================================== */
/*  NGUYÊN LIỆU — nội dung chi tiết theo slug                                   */
/* ========================================================================== */
export const ingredientSectionMap: Record<string, { contentLead?: Bilingual; sections: ContentSection[] }> = {
  "marine-sweet-nag": {
    contentLead: p(
      "Marine Sweet® là N-Acetyl Glucosamine (NAG) chiết xuất từ vỏ tôm biển sâu Nhật Bản, được Yaizu Suisankagaku tinh chế đạt độ tinh khiết dược dụng. Đây là tiền chất quan trọng của Hyaluronic Acid trong cơ thể, đóng vai trò then chốt trong tái tạo sụn khớp và dưỡng ẩm da.",
      "Marine Sweet® is N-Acetyl Glucosamine (NAG) extracted from deep-sea Japanese shrimp shells, refined by Yaizu Suisankagaku to pharmaceutical-grade purity. It is a key precursor of Hyaluronic Acid in the body, playing a central role in cartilage regeneration and skin hydration."
    ),
    sections: [
      {
        id: "nguon-goc",
        level: 2,
        title: p("Nguồn gốc & chuỗi cung ứng", "Origin & supply chain"),
        paragraphs: [
          p(
            "Nguyên liệu được thu mua từ nguồn tôm biển sâu vùng Yaizu, Nhật Bản — khu vực có truyền thống chế biến hải sản và kiểm soát chất lượng nghiêm ngặt. Mỗi lô có COA đầy đủ: độ tinh khiết, kim loại nặng, vi sinh và dư lượng chitin.",
            "Raw material is sourced from deep-sea shrimp in Yaizu, Japan — a region with strong seafood processing tradition and strict quality control. Every batch includes a full COA: purity, heavy metals, microbiology and chitin residues."
          ),
          p(
            "Bioscope duy trì quan hệ đối tác trực tiếp với nhà sản xuất, đảm bảo nguồn cung ổn định và minh bạch truy xuất cho đối tác Việt Nam.",
            "Bioscope maintains a direct partnership with the manufacturer, ensuring stable supply and transparent traceability for Vietnamese partners."
          ),
        ],
      },
      {
        id: "co-che",
        level: 2,
        title: p("Cơ chế tác dụng", "Mechanism of action"),
        paragraphs: [
          p(
            "NAG là đơn vị cấu thành chondroitin sulfate và hyaluronan. Bổ sung NAG hỗ trợ tế bào sụn tổng hợp matrix ngoại bào, đồng thời kích thích sản xuất HA ở lớp hạ bì — cải thiện độ ẩm và độ đàn hồi da từ bên trong.",
            "NAG is a building block of chondroitin sulfate and hyaluronan. NAG supplementation supports chondrocytes in synthesising extracellular matrix while stimulating HA production in the dermis — improving hydration and elasticity from within."
          ),
        ],
      },
      {
        id: "chung-nhan",
        level: 3,
        title: p("Chứng nhận & tiêu chuẩn", "Certifications & standards"),
        paragraphs: [
          p(
            "Đạt tiêu chuẩn FCC/JECFA, phù hợp công bố TPCN và mỹ phẩm tại Việt Nam. Hỗ trợ hồ sơ an toàn và liều dùng tham khảo theo EFSA và FDA GRAS.",
            "Meets FCC/JECFA standards, suitable for supplement and cosmetic notification in Vietnam. Safety dossier and reference dosing supported per EFSA and FDA GRAS guidance."
          ),
        ],
      },
      {
        id: "cong-thuc",
        level: 2,
        title: p("Gợi ý công thức & liều dùng", "Formulation & dosing guidance"),
        paragraphs: [
          p(
            "Liều phổ biến: 500–1500 mg/ngày cho sản phẩm xương khớp; 150–300 mg/ngày cho nutricosmetic. Kết hợp hiệu quả với collagen peptide, MSM và vitamin C. Có thể phối hợp Phytosome ướt để tăng sinh khả dụng khi dùng cùng chiết xuất kháng viêm.",
            "Common doses: 500–1500 mg/day for joint products; 150–300 mg/day for nutricosmetics. Combines well with collagen peptide, MSM and vitamin C. Can be paired with wet phytosome to boost bioavailability alongside anti-inflammatory extracts."
          ),
        ],
      },
      {
        id: "bao-quan",
        level: 2,
        title: p("Bảo quản & tương thích", "Storage & compatibility"),
        paragraphs: [
          p(
            "Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp, nhiệt độ <25°C. Tương thích với hầu hết excipient viên nén, bột pha và softgel. Tránh phối trực tiếp với đường khử mạnh trong môi trường ẩm cao.",
            "Store dry, away from direct light, below 25°C. Compatible with most tablet, powder and softgel excipients. Avoid direct combination with strong reducing sugars in high-humidity environments."
          ),
        ],
      },
    ],
  },
  "argentina-collagen-peptide": {
    contentLead: p(
      "BioPeptan® là collagen peptide thủy phân từ nguồn bò Argentina, trọng lượng phân tử ~2000 Da — tối ưu cho hấp thu đường tiêu hóa và tích lũy tại mô liên kết da.",
      "BioPeptan® is hydrolysed collagen peptide from Argentine bovine source, ~2000 Da molecular weight — optimised for gastrointestinal absorption and accumulation in skin connective tissue."
    ),
    sections: [
      {
        id: "dac-tinh",
        level: 2,
        title: p("Đặc tính kỹ thuật", "Technical characteristics"),
        paragraphs: [
          p(
            "Hàm lượng protein ≥90%, hòa tan nhanh trong nước ấm, màu trắng ngà, mùi trung tính. Phân tử nhỏ giúp đạt peak huyết tương sau 1–2 giờ uống trong nghiên cứu pharmacokinetic.",
            "Protein content ≥90%, rapidly soluble in warm water, off-white colour, neutral odour. Small peptides reach plasma peak 1–2 hours post-ingestion in pharmacokinetic studies."
          ),
        ],
      },
      {
        id: "loi-ich",
        level: 2,
        title: p("Lợi ích đã được báo cáo", "Reported benefits"),
        paragraphs: [
          p(
            "Các nghiên cứu lâm sàng với collagen peptide thủy phân ghi nhận cải thiện độ ẩm da, giảm độ sâu nếp nhăn và hỗ trợ thoái hóa khớp khi dùng liên tục 8–12 tuần. Liều tham khảo: 2.5–10 g/ngày.",
            "Clinical studies on hydrolysed collagen peptides report improved skin hydration, reduced wrinkle depth and joint support with 8–12 weeks of continuous use. Reference dose: 2.5–10 g/day."
          ),
        ],
      },
      {
        id: "ung-dung",
        level: 2,
        title: p("Ứng dụng thương mại", "Commercial applications"),
        paragraphs: [
          p(
            "Nước uống collagen ready-to-drink, bột pha beauty, thanh protein và viên nén. Bioscope hỗ trợ công thức phối hợp hyaluronic acid, vitamin C và chiết xuất chống oxy hóa.",
            "RTD collagen drinks, beauty powders, protein bars and tablets. Bioscope supports formulas combined with hyaluronic acid, vitamin C and antioxidant extracts."
          ),
        ],
      },
    ],
  },
  "novaskin-retinol": {
    contentLead: p(
      "Retinol bọc Novaskin™ là hoạt chất chống lão hóa flagship của Bioscope R&D — giải quyết bài toán kích ứng và mất hiệu lực của retinol tự do trong công thức mỹ phẩm.",
      "Novaskin™-encapsulated retinol is Bioscope R&D's flagship anti-ageing active — addressing irritation and potency loss of free retinol in cosmetic formulas."
    ),
    sections: [
      {
        id: "bao-goi",
        level: 2,
        title: p("Công nghệ bao gói", "Encapsulation technology"),
        paragraphs: [
          p(
            "Retinol được nhốt trong vesicle nano Novaskin™, phóng thích dần khi tiếp xúc da, giảm erythema ban đầu so với retinol tự do 0.3%. Ổn định hóa học được cải thiện đáng kể trong điều kiện nhiệt độ phòng.",
            "Retinol is trapped in Novaskin™ nano vesicles, releasing gradually on skin contact, reducing initial erythema versus 0.3% free retinol. Chemical stability is significantly improved at room temperature."
          ),
        ],
      },
      {
        id: "su-dung",
        level: 2,
        title: p("Hướng dẫn sử dụng trong công thức", "Formulation guidance"),
        paragraphs: [
          p(
            "Nồng độ khuyến nghị: 0.1–0.3% retinol tương đương trong serum hoặc cream. Thêm vào phase cuối, tránh nhiệt >40°C. Kết hợp peptide, niacinamide và ceramide để tối ưu hiệu quả và dung nạp.",
            "Recommended concentration: 0.1–0.3% equivalent retinol in serum or cream. Add in final phase, avoid heat >40°C. Combine with peptides, niacinamide and ceramides for efficacy and tolerability."
          ),
        ],
      },
      {
        id: "claim",
        level: 2,
        title: p("Claim & truyền thông", "Claims & communication"),
        paragraphs: [
          p(
            "Hỗ trợ claim giảm nếp nhăn, cải thiện kết cấu da và đều màu khi có dữ liệu thử nghiệm sử dụng phù hợp. Bioscope cung cấp brief kỹ thuật cho đội marketing và regulatory.",
            "Supports wrinkle reduction, skin texture and tone claims with appropriate use-test data. Bioscope provides technical briefs for marketing and regulatory teams."
          ),
        ],
      },
    ],
  },
};

export function getTechRichContent(slug: string) {
  return techSectionMap[slug];
}

export function getIngredientRichContent(slug: string) {
  return ingredientSectionMap[slug];
}
