// Buying-advice articles (/learn/...): informational pages for long-tail
// questions that few sites answer for Kenya. Each answers its question in
// the first paragraph and is backed by numbers from the live catalogue (price
// premiums are measured within the same model, so the comparison is fair).
// Same quality gates as every guide (900+ words, 3+ FAQs, 5+ internal links).
//
// Facts here are checkable (Windows 11 requirements, model naming); keep any
// claim about the shop's own practices to what the shop has confirmed.

export const ARTICLES = [
  {
    slug: "laptop-processor-generations",
    path: "/learn/laptop-processor-generations-kenya",
    kw: "laptop processor generation explained",
    secondary: ["8th gen vs 10th gen laptop", "which intel generation is my laptop", "windows 11 8th gen laptop", "how to tell laptop generation"],
    h1: "Laptop processor generations explained (8th vs 10th vs 12th gen)",
    title: "Laptop Processor Generations Explained: 8th vs 10th Gen",
    related: ["/best/core-i5-8th-gen-laptops-kenya", "/best/core-i7-8th-gen-laptops-kenya", "/compare/core-i5-vs-core-i7-kenya"],
    write(x) {
      const { L, ksh, median, pct, link, tableMd, SITE, asOf } = x;
      const intel = L.filter((r) => r.sp.gen && /Core i[357]/.test(r.sp.cpu));
      if (intel.length < 40) return null;
      const gens = [...new Set(intel.map((r) => r.sp.gen))].sort((a, b) => a - b);
      const rowsFor = (g) => intel.filter((r) => r.sp.gen === g);
      const table = gens.filter((g) => rowsFor(g).length >= 3).map((g) => {
        const rs = rowsFor(g);
        const i5 = rs.filter((r) => r.sp.cpu === "Core i5").map((r) => r.price);
        return [`${x.ordinal(g)} gen`, String(rs.length), ksh(Math.min(...rs.map((r) => r.price))), ksh(median(rs.map((r) => r.price))), i5.length >= 3 ? ksh(median(i5)) : "few"];
      });
      const win11 = pct(L.filter((r) => x.recency(r.sp) >= 3).length, L.length);
      const p8 = x.premium(L, (r) => r.sp.gen === 8, (r) => r.sp.gen >= 10 && r.sp.gen <= 11, { sameModel: false, sameCpu: true });
      const i5_8 = intel.filter((r) => r.sp.cpu === "Core i5" && r.sp.gen === 8).map((r) => r.price);
      const i5_10 = intel.filter((r) => r.sp.cpu === "Core i5" && (r.sp.gen === 10 || r.sp.gen === 11)).map((r) => r.price);
      return {
        intro: `A laptop's processor generation is the first number after the dash in its Intel model: a Core i5-8350U is 8th gen, an i5-10310U is 10th gen and an i5-1235U is 12th gen. Newer generations are faster and use less power, and Windows 11 officially needs 8th gen or newer. At ECB Technologies, ${win11}% of laptops in stock meet that bar. An 8th-gen Core i5 has a median price of ${i5_8.length >= 3 ? ksh(median(i5_8)) : "n/a"} and a 10th or 11th-gen one ${i5_10.length >= 3 ? ksh(median(i5_10)) : "n/a"} (${asOf}).`,
        description: `How to read a laptop's Intel generation (8th, 10th, 12th gen), what changes between them, Windows 11 support, and what each costs in Kenya.`,
        sections: [
          {
            heading: "How to read the generation from the model number",
            body: [
              "Intel names its processors brand, tier, then a model number. The generation is at the start of the model number:",
              "",
              tableMd(["Processor", "Generation", "How to read it"], [
                ["Core i5-6300U", "6th", "4 digits: the first digit is the generation"],
                ["Core i5-8350U", "8th", "4 digits: 8 = 8th gen"],
                ["Core i7-10610U", "10th", "5 digits starting 10: 10th gen"],
                ["Core i7-1185G7", "11th", "starts 11: 11th gen"],
                ["Core i5-1235U", "12th", "starts 12: 12th gen"],
                ["Core i7-1355U", "13th", "starts 13: 13th gen"],
                ["Core Ultra 7 155H", "Core Ultra (series 1)", "Intel's naming since late 2023"],
              ]),
              "",
              "The letters at the end describe the type: **U** is a low-power chip for thin laptops (most business laptops), **H** and **HQ** are higher-power chips for workstations and gaming laptops, and **G7/G4** marks 11th-gen chips with stronger built-in graphics.",
              "",
              "On a laptop you are looking at, open Settings → System → About: the processor line shows the full model. On our product pages, the generation is in the name (for example \"i5 8th Gen\").",
            ].join("\n"),
          },
          {
            heading: "What changes between generations",
            body: [
              "- **6th and 7th gen (2015–2017):** dual-core chips in most business laptops. Fine for documents and browsing, slow with many browser tabs or video calls. Windows 11 does not officially support them.",
              "- **8th gen (2017–2019):** the big step. Business-laptop chips went from 2 to 4 cores, which makes everyday work noticeably smoother. The oldest generation Windows 11 officially supports.",
              "- **10th and 11th gen (2019–2021):** faster again; 11th gen brought much better built-in graphics (Intel Iris Xe), useful for light photo and video work.",
              "- **12th and 13th gen (2022–2023):** more cores (a mix of performance and efficiency cores) and better battery life under light use.",
              "- **Core Ultra (2023 onwards):** a new naming scheme with an AI accelerator (NPU) and stronger graphics.",
              "",
              `If your budget allows, 8th gen is the practical minimum for a laptop you plan to keep for several years. Compare the options in ${link("8th-gen Core i5 laptops", `${SITE}/best/core-i5-8th-gen-laptops-kenya`)} and ${link("Core i5 vs Core i7", `${SITE}/compare/core-i5-vs-core-i7-kenya`)}.`,
            ].join("\n"),
          },
          {
            heading: "Prices by generation at ECB Technologies",
            body: `Intel Core i3, i5 and i7 laptops in stock, by generation (${asOf}):\n\n` + tableMd(["Generation", "Laptops", "From", "Median", "Core i5 median"], table) + (p8 ? `\n\nComparing like with like (same processor tier, Core i5 with Core i5 and i7 with i7), a 10th or 11th-gen laptop costs a median of ${ksh(p8.diff)} more than an 8th-gen one (${p8.n} matched pairs of groups).` : ""),
          },
          {
            heading: "Windows 11 and older laptops",
            body: [
              "Microsoft's official minimum for Windows 11 ([Windows 11 specifications](https://www.microsoft.com/en-us/windows/windows-11-specifications)) is an Intel 8th-gen processor or newer (plus a small number of 7th-gen chips), TPM 2.0 and Secure Boot. Business laptops from the 8th-gen era usually have TPM 2.0; you can check in Windows with the PC Health Check app.",
              "",
              `Older laptops keep running Windows 10, but Windows 10 stopped getting regular free security updates in October 2025 ([Microsoft: Windows 10 end of support](https://www.microsoft.com/en-us/windows/end-of-support)). For a laptop you will use online every day, that makes 8th gen the sensible minimum. At ECB Technologies, ${win11}% of laptops in stock are 8th gen or newer (or AMD Ryzen, Apple M or Intel Core Ultra).`,
            ].join("\n"),
          },
          {
            heading: "Which generation should you buy?",
            body: [
              "- **Tight budget, office work and browsing:** 8th-gen Core i5. The best value for most buyers.",
              "- **Programming, many browser tabs, light design:** 10th gen or newer with 16 GB RAM.",
              "- **Photo and video editing:** 11th gen or newer for the graphics, or a laptop with a dedicated graphics card.",
              "- **Avoid for daily use:** 6th and 7th gen, unless the laptop is very cheap and only for basic tasks.",
            ].join("\n"),
          },
        ],
        faq: [
          { question: "How do I know which generation my laptop is?", answer: "Open Settings → System → About and read the processor model. The first number after the dash is the generation: i5-8350U is 8th gen, i5-10310U is 10th gen, i5-1235U is 12th gen." },
          { question: "Is an 8th-gen laptop still good?", answer: "Yes, for office work, browsing, school and light multitasking. 8th gen was the first with 4 cores in thin business laptops, and Windows 11 officially supports it." },
          { question: "Can a 7th-gen laptop run Windows 11?", answer: "Not officially, apart from a few 7th-gen chips. It will keep running Windows 10, which no longer gets regular free security updates (since October 2025)." },
          { question: "Is a Core i5 10th gen better than a Core i7 8th gen?", answer: "For everyday work they are close. The 10th-gen i5 is newer and often has better battery life; the 8th-gen i7 has a higher boost speed. Price and condition usually decide." },
        ],
      };
    },
  },
  {
    slug: "how-much-ram",
    path: "/learn/how-much-ram-laptop-kenya",
    kw: "how much ram do i need in a laptop",
    secondary: ["is 8gb ram enough for a laptop", "16gb ram laptop price kenya", "laptop ram upgrade kenya"],
    h1: "How much RAM do you need in a laptop? 8 GB vs 16 GB vs 32 GB",
    title: "How Much RAM Do You Need in a Laptop? 8GB vs 16GB",
    related: ["/compare/8gb-vs-16gb-ram-kenya", "/best/16gb-ram-laptops-kenya", "/best/programming-laptops-kenya"],
    write(x) {
      const { L, ksh, median, pct, link, tableMd, SITE, asOf } = x;
      const by = (f) => L.filter(f).map((r) => r.price);
      const r8 = by((r) => r.sp.ram === 8);
      const r16 = by((r) => r.sp.ram === 16);
      const r32 = by((r) => r.sp.ram >= 32);
      if (r8.length < 10 || r16.length < 10) return null;
      const prem = x.premium(L, (r) => r.sp.ram === 8, (r) => r.sp.ram === 16, { sameModel: true });
      const prem32 = x.premium(L, (r) => r.sp.ram === 16, (r) => r.sp.ram >= 32, { sameModel: true });
      return {
        intro: `How much RAM do you need in a laptop? 8 GB is enough for documents, browsing and video calls; 16 GB is the better choice if you keep many browser tabs open, program, or edit photos; 32 GB is for video editing, virtual machines and heavy design work. At ECB Technologies, ${pct(r16.length + r32.length, L.length)}% of laptops have 16 GB or more. ${prem ? `For the same model, the 16 GB version costs a median of ${ksh(prem.diff)} more than the 8 GB version.` : ""} (${asOf})`,
        description: `8 GB vs 16 GB vs 32 GB laptop RAM: what each is enough for, what the upgrade costs in Kenya for the same model, and whether you can add RAM later.`,
        sections: [
          {
            heading: "What each amount is enough for",
            body: tableMd(["RAM", "Enough for", "Starts to struggle with"], [
              ["8 GB", "Word, Excel, browsing, Zoom/Teams, school work, Netflix", "20+ browser tabs, programming tools, Photoshop with large files"],
              ["16 GB", "All of the above plus programming, many tabs, photo editing, light video editing", "4K video editing, several virtual machines"],
              ["32 GB+", "Video editing, virtual machines, large datasets, 3D work", "Rarely limited by memory"],
            ]),
          },
          {
            heading: "What 16 GB costs over 8 GB",
            body: [
              `The fairest comparison is the same laptop model with different memory. ${prem ? `Across ${prem.n} models we stock in both versions, the 16 GB configuration costs a median of ${ksh(prem.diff)} more.` : "Too few models are in stock in both versions to measure this right now."} ${prem32 ? `Going from 16 GB to 32 GB on the same model adds a median of ${ksh(prem32.diff)} (${prem32.n} models).` : ""}`,
              "",
              tableMd(["Memory", "Laptops in stock", "From", "Median"], [
                ["8 GB", String(r8.length), ksh(Math.min(...r8)), ksh(median(r8))],
                ["16 GB", String(r16.length), ksh(Math.min(...r16)), ksh(median(r16))],
                ...(r32.length >= 3 ? [["32 GB or more", String(r32.length), ksh(Math.min(...r32)), ksh(median(r32))]] : []),
              ]),
              "",
              "The overall medians differ by more than the same-model premium because 16 GB laptops also tend to be newer generations.",
            ].join("\n"),
          },
          {
            heading: "Can you add RAM later?",
            body: [
              "It depends on the model:",
              "",
              "- **Upgradeable (memory in slots):** most standard business laptops such as many HP EliteBook 840 and 850, Dell Latitude 5000 and 7000 (14 and 15-inch), and Lenovo ThinkPad T-series models have one or two memory slots.",
              "- **Partly soldered:** some ThinkPad models (for example the T480s and T490) have part of the memory soldered and one slot free.",
              "- **Fully soldered:** most thin premium models (Dell XPS 13, ThinkPad X1 Carbon, HP EliteBook 1030 and many 2-in-1s) cannot be upgraded; buy the amount you need.",
              "",
              "Ask us on WhatsApp before buying if you plan to upgrade: we can confirm whether the exact laptop has a free slot.",
            ].join("\n"),
          },
          {
            heading: "Which should you buy?",
            body: [
              "- **Students and office work:** 8 GB is enough; put any extra money into a newer processor generation first.",
              `- **Programmers, analysts and heavy multitaskers:** 16 GB. See ${link("16 GB RAM laptops", `${SITE}/best/16gb-ram-laptops-kenya`)} and ${link("laptops for programming", `${SITE}/best/programming-laptops-kenya`)}.`,
              "- **Video editors and engineers:** 32 GB, with a dedicated graphics card if your software uses one.",
              `- **Undecided:** compare the numbers in ${link("8 GB vs 16 GB RAM", `${SITE}/compare/8gb-vs-16gb-ram-kenya`)}.`,
            ].join("\n"),
          },
        ],
        faq: [
          { question: "Is 8 GB RAM enough for a laptop in 2026?", answer: "For documents, browsing, video calls and school work, yes. For programming, many browser tabs, or photo and video editing, 16 GB is noticeably smoother." },
          { question: "How much more does a 16 GB laptop cost in Kenya?", answer: prem ? `For the same model at ECB Technologies, a median of ${ksh(prem.diff)} more than the 8 GB version (${prem.n} models compared, ${asOf}).` : "It depends on the model; ask us on WhatsApp for the exact difference." },
          { question: "Is RAM or a newer processor more important?", answer: "For most buyers, the processor generation first (8th gen or newer), then RAM. A 10th-gen laptop with 8 GB usually feels better than a 6th-gen laptop with 16 GB." },
          { question: "Can I upgrade my laptop's RAM later?", answer: "On many business laptops, yes (one or two memory slots). Thin premium models and many 2-in-1s have soldered memory that cannot be upgraded." },
        ],
      };
    },
  },
  {
    slug: "ssd-size",
    path: "/learn/laptop-ssd-size-kenya",
    kw: "256gb vs 512gb ssd laptop",
    secondary: ["is 256gb ssd enough", "laptop storage size guide", "512gb ssd laptop price kenya"],
    h1: "256 GB vs 512 GB SSD: how much laptop storage do you need?",
    title: "256GB vs 512GB SSD: How Much Laptop Storage You Need",
    related: ["/best/laptops-with-16gb-ram-and-512gb-ssd-kenya", "/best/16gb-ram-laptops-kenya"],
    write(x) {
      const { L, ksh, median, pct, tableMd, asOf } = x;
      const s = (f) => L.filter(f).map((r) => r.price);
      const s256 = s((r) => r.sp.ssd === 256);
      const s512 = s((r) => r.sp.ssd === 512);
      const s1t = s((r) => r.sp.ssd >= 1024);
      if (s256.length < 10 || s512.length < 10) return null;
      const prem = x.premium(L, (r) => r.sp.ssd === 256, (r) => r.sp.ssd === 512, { sameModel: true });
      return {
        intro: `256 GB is enough if you mostly work online and keep files in the cloud; 512 GB is the safer choice if you store photos, videos, music or large programs on the laptop; 1 TB is for video editors and gamers. Windows and basic apps take about 60–80 GB, so a 256 GB laptop leaves roughly 150 GB free. ${prem ? `At ECB Technologies, the 512 GB version of the same model costs a median of ${ksh(prem.diff)} more.` : ""} (${asOf})`,
        description: `Is 256 GB enough or do you need 512 GB? What fits on each, the price difference for the same laptop in Kenya, and whether you can upgrade the SSD later.`,
        sections: [
          {
            heading: "What fits on each size",
            body: tableMd(["SSD", "Free after Windows and apps (about)", "Good for"], [
              ["128 GB", "40–60 GB", "Browsing and cloud work only; fills up quickly"],
              ["256 GB", "150–170 GB", "Office work, school, a few thousand photos"],
              ["512 GB", "400 GB", "Photo libraries, music, programming tools, a few games"],
              ["1 TB", "850 GB", "Video editing, large game libraries, raw photos"],
            ]),
          },
          {
            heading: "What 512 GB costs over 256 GB",
            body: [
              prem ? `Across ${prem.n} models we stock with both sizes, the 512 GB version costs a median of ${ksh(prem.diff)} more than the 256 GB version.` : "Too few models are in stock with both sizes to measure the difference right now.",
              "",
              tableMd(["Storage", "Laptops in stock", "From", "Median"], [
                ["256 GB", String(s256.length), ksh(Math.min(...s256)), ksh(median(s256))],
                ["512 GB", String(s512.length), ksh(Math.min(...s512)), ksh(median(s512))],
                ...(s1t.length >= 3 ? [["1 TB or more", String(s1t.length), ksh(Math.min(...s1t)), ksh(median(s1t))]] : []),
              ]),
              "",
              `${pct(s512.length + s1t.length, L.length)}% of the laptops we stock have 512 GB or more.`,
            ].join("\n"),
          },
          {
            heading: "Can you upgrade the SSD later?",
            body: [
              "Almost all business laptops from the last several years use an M.2 SSD that can be swapped for a bigger one, including thin models like the Dell XPS 13 and ThinkPad X1 Carbon. You then reinstall Windows or clone the old drive. An external SSD or flash drive is the simplest way to add space without opening the laptop.",
              "",
              "If you are unsure, buy 256 GB with a better processor or more RAM, and add storage later: storage is the easiest part to upgrade.",
            ].join("\n"),
          },
          {
            heading: "NVMe vs SATA SSDs",
            body: [
              "Laptop SSDs come in two kinds that can look alike:",
              "",
              "- **NVMe (PCIe) SSDs** are the fast kind, several times quicker than SATA at copying big files. Most business laptops from the 8th-gen era onwards have an NVMe slot.",
              "- **SATA SSDs** (an M.2 stick or a 2.5-inch drive) are slower, but still far faster than a hard drive. Older laptops often use them.",
              "",
              "For office work, browsing and school, you won't feel the difference. For video editing or moving large files every day, prefer NVMe. When upgrading, buy the type your laptop's slot supports: we can check the exact model for you.",
            ].join("\n"),
          },
          {
            heading: "How to see how much space you have",
            body: "Open File Explorer → This PC: each drive shows its free space. Settings → System → Storage shows what is using the space and can clear temporary files. Keep at least 15–20% free: a nearly full SSD slows down and Windows updates may fail.",
          },
          {
            heading: "SSD vs hard drive (HDD)",
            body: "An SSD starts Windows in seconds and opens programs several times faster than a spinning hard drive. Avoid laptops that only have an HDD, even if the capacity is bigger: an SSD makes an older laptop feel much quicker. Every laptop with SSD in its listing at ECB Technologies has a solid-state drive.",
          },
        ],
        faq: [
          { question: "Is 256 GB SSD enough for a student?", answer: "Usually, yes: after Windows and Office, about 150 GB is free, which holds years of documents and thousands of photos. Use cloud storage or a flash drive for videos." },
          { question: "How much more is a 512 GB laptop?", answer: prem ? `For the same model at ECB Technologies, a median of ${ksh(prem.diff)} more (${prem.n} models compared, ${asOf}).` : "It depends on the model; ask us on WhatsApp for the exact difference." },
          { question: "Can I upgrade a laptop from 256 GB to 512 GB?", answer: "On most business laptops, yes: the M.2 SSD can be replaced with a larger one. You then reinstall Windows or copy the old drive across." },
          { question: "Is NVMe better than SATA SSD?", answer: "NVMe is faster for large file copies and video work. For documents and browsing the difference is hard to notice; both are much faster than a hard drive." },
          { question: "Is 128 GB enough?", answer: "Only for browsing and cloud-based work. Windows updates alone can fill much of it; choose 256 GB if you can." },
        ],
      };
    },
  },
  {
    slug: "used-laptop-checklist",
    path: "/learn/check-used-laptop-before-buying",
    kw: "how to check a used laptop before buying",
    secondary: ["ex-uk laptop checklist", "check laptop battery health windows", "refurbished laptop what to check"],
    h1: "How to check a used laptop before buying: a 12-point checklist",
    title: "How to Check a Used Laptop Before Buying: 12 Checks",
    related: ["/laptop-shop-nairobi", "/student-laptops-kenya", "/learn/laptop-processor-generations-kenya"],
    write(x) {
      const { L, pct, link, SITE, PHONE } = x;
      if (L.length < 50) return null; // a shop with stock behind the advice
      const old = pct(L.filter((r) => r.sp.gen && r.sp.gen <= 7).length, L.length);
      return {
        intro: `Before you pay for a used or ex-UK laptop, check four things first: the processor generation (8th gen or newer for Windows 11), the battery's remaining capacity, that the BIOS is not locked with a password, and that every key, port and the screen work. The 12 checks below take about 15 minutes and need nothing but the laptop and its charger.`,
        description: `12 checks before buying a used or ex-UK laptop in Kenya: battery health report, BIOS lock, screen, keyboard, ports, Windows activation and warranty.`,
        sections: [
          {
            heading: "The 12 checks",
            body: [
              "1. **Processor generation.** Settings → System → About. 8th gen or newer runs Windows 11 ([Microsoft's requirements](https://www.microsoft.com/en-us/windows/windows-11-specifications)); older models stay on Windows 10. " + `(${old}% of the laptops we list are 7th gen or older; their listings say so.)`,
              "2. **Battery health.** Open Command Prompt and run `powercfg /batteryreport`, then open the report it saves. Compare *Full charge capacity* with *Design capacity*: above 80% is good, below 60% means a replacement battery soon.",
              "3. **BIOS access.** Restart and press the setup key (F1 on Lenovo ThinkPads, F10 on HP, F2 on Dell). If it asks for a supervisor password you don't have, don't buy: you won't be able to change boot or security settings.",
              "4. **Windows activation.** Settings → System → Activation should say \"Windows is activated\".",
              "5. **Screen.** Open a plain white page and a plain black page full-screen: look for dead pixels, bright spots, lines and yellow patches. Tilt the screen to check the hinges hold it.",
              "6. **Keyboard and touchpad.** Type every key in Notepad (or use an online keyboard tester), including Enter, Shift and the arrow keys. Test both touchpad buttons and two-finger scrolling.",
              "7. **Ports.** Plug a flash drive into each USB port, and test HDMI if you'll use a projector or monitor. Check the charging port holds the plug firmly.",
              "8. **Charger.** Make sure it's the right wattage for the laptop (printed on the charger and on the laptop's label) and that the laptop shows \"charging\".",
              "9. **Wi-Fi, Bluetooth, webcam, microphone and speakers.** Join a Wi-Fi network, open the Camera app, and play a video with sound.",
              "10. **Storage health.** The free CrystalDiskInfo tool shows the drive's health as Good, Caution or Bad. Also confirm the size matches the listing (This PC).",
              "11. **Serial number.** The serial on the bottom sticker should match the one in the BIOS; a mismatch can mean replaced parts.",
              "12. **Warranty and receipt.** Ask what the warranty covers and for how long, and get it on the receipt.",
            ].join("\n"),
          },
          {
            heading: "Signs to walk away",
            body: [
              "- A BIOS or hard-drive password the seller can't remove.",
              "- Battery under 50% of design capacity, unless the price includes a new battery.",
              "- Swollen battery: the touchpad bulges or the case doesn't close flat. This is a safety risk.",
              "- \"Computrace\" or \"Absolute\" enabled in the BIOS on a laptop the seller can't explain (it can mean the laptop is still managed by its former company).",
              "- Windows that isn't activated, or a processor that doesn't match what was advertised.",
            ].join("\n"),
          },
          {
            heading: "Buying from a shop vs a private seller",
            body: [
              "A shop gives you a receipt, a place to return to and usually a warranty; a private sale usually has neither, so the checks above matter even more. Whoever you buy from, test the laptop before paying.",
              "",
              `At ECB Technologies you can see any laptop before paying at our shop on Moi Avenue, Nairobi CBD (${link("address and hours", `${SITE}/laptop-shop-nairobi`)}), or ask for photos and the warranty terms on WhatsApp (${PHONE}).`,
            ].join("\n"),
          },
          {
            heading: "What matters most for the price",
            body: `Processor generation, RAM and storage drive most of the price difference between used laptops of the same model. Read ${link("laptop processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`)}, ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)} and ${link("256 GB vs 512 GB SSD", `${SITE}/learn/laptop-ssd-size-kenya`)} before choosing.`,
          },
        ],
        faq: [
          { question: "How do I check a laptop's battery health?", answer: "Run powercfg /batteryreport in Command Prompt, open the report, and compare Full charge capacity with Design capacity. Above 80% is good; below 60% the battery will need replacing soon." },
          { question: "What is an ex-UK laptop?", answer: "A laptop first used in the UK (often by a company) and then resold in Kenya. Many are business models built for long use; check it like any used laptop before paying." },
          { question: "What does a BIOS password mean on a used laptop?", answer: "It locks the laptop's settings. If the seller can't remove it, you can't change boot or security options, so don't buy it." },
          { question: "Can I test a laptop at ECB Technologies before paying?", answer: "Yes. You can see any laptop at the shop on Moi Avenue, Nairobi CBD before paying, Monday to Saturday, 9am to 7pm." },
        ],
      };
    },
  },
  {
    slug: "thinkpad-models",
    path: "/learn/thinkpad-models-explained",
    kw: "thinkpad models explained",
    secondary: ["thinkpad t vs x vs e series", "thinkpad t480 vs t490", "which thinkpad to buy kenya"],
    h1: "Lenovo ThinkPad models explained: T, X, E, L and P series",
    title: "ThinkPad Models Explained: T, X, E, L and P Series",
    related: ["/series/thinkpad-kenya", "/compare/thinkpad-vs-elitebook-kenya", "/laptops/lenovo-laptops-kenya"],
    write(x) {
      return seriesArticle(x, {
        brand: "Lenovo ThinkPad",
        match: (r) => /-thinkpad-/.test(`-${r.slug}-`),
        letterOf: (k) => (k.match(/^lenovo thinkpad (x1|yoga|[a-z])/) || [])[1],
        letters: { t: "T series", x: "X series", x1: "X1 series", e: "E series", l: "L series", p: "P series", yoga: "Yoga (2-in-1)" },
        roles: [
          ["T series (T480, T490, T14)", "The mainstream business ThinkPad: 14-inch, strong keyboard, good ports. The safe default."],
          ["X series (X280, X390, X13)", "Smaller and lighter: 12.5 to 13.3-inch, for carrying every day."],
          ["X1 Carbon and X1 Yoga", "Premium thin-and-light models; the X1 Yoga folds into a tablet."],
          ["E series (E14, E480)", "Budget business line for small offices; less metal, fewer business features."],
          ["L series (L480, L14)", "Lower-cost corporate line; heavier, but easy to service."],
          ["P series (P52, P1)", "Mobile workstations with professional graphics for CAD and design."],
          ["11e and Yoga 11e", "Small, rugged education laptops with low-power processors; fine for basic schoolwork."],
        ],
        naming: [
          "**Older names (to 2019): letter + 3 digits.** In T480, \"4\" is the 14-inch size and \"8\" the model year; the T470 had 7th-gen processors, the T480 8th gen and the T490 newer 8th-gen chips. X2x0 models are 12.5-inch (X260 6th gen, X270 7th, X280 8th).",
          "**\"s\" means slim:** the T480s is a thinner T480 (with part of its memory soldered).",
          "**Newer names (2020 on): size + Gen.** The T14 Gen 1 replaced the T490 (10th-gen Intel or AMD Ryzen 4000); Gen 2 is 11th gen, Gen 3 12th gen, Gen 4 13th gen. Likewise X13, E14 and L14.",
        ],
        advice: [
          "**Most buyers:** a T480, T490 or T14 Gen 1 with a Core i5: durable, comfortable to type on, and easy to repair.",
          "**Carrying it every day:** an X280, X390 or X13, or an X1 Carbon if the budget allows.",
          "**Note-taking and drawing:** an X1 Yoga or a ThinkPad Yoga model with a pen.",
          "**CAD, 3D and engineering software:** a P-series workstation.",
          "**Very tight budget, basic school work:** an 11e or E-series model, accepting slower performance.",
        ],
        checks: [
          "Press every key, including the red TrackPoint and its three buttons.",
          "On the T480 and T470, check both batteries: these models have an internal and a removable battery.",
          "Make sure the BIOS (F1 at startup) has no supervisor password.",
        ],
        hubPath: "/series/thinkpad-kenya",
        hubName: "ThinkPad laptops in Kenya",
        faq: [
          { question: "Which ThinkPad is best for students?", answer: "A T-series (T480, T490 or T14) with an 8th-gen or newer Core i5: durable, a great keyboard and easy to repair. The X series is better if you carry it all day." },
          { question: "What is the difference between ThinkPad T and X series?", answer: "T series are 14-inch mainstream business laptops; X series are smaller (12.5 to 13.3-inch) and lighter, often with fewer ports." },
          { question: "Is a ThinkPad E series good?", answer: "It's Lenovo's budget business line: fine for office work, but with less durable materials than the T and X series." },
        ],
      });
    },
  },
  {
    slug: "elitebook-models",
    path: "/learn/hp-elitebook-models-explained",
    kw: "hp elitebook models explained",
    secondary: ["elitebook 840 g5 vs g6", "elitebook g number meaning", "elitebook 830 vs 840"],
    h1: "HP EliteBook models explained: 830 vs 840 vs 850 and G numbers",
    title: "HP EliteBook Models Explained: 830, 840, 850 and G5–G9",
    related: ["/series/elitebook-kenya", "/compare/elitebook-vs-probook-kenya", "/laptops/hp-laptops-kenya"],
    write(x) {
      return seriesArticle(x, {
        brand: "HP EliteBook",
        match: (r) => /-elitebook-/.test(`-${r.slug}-`),
        letterOf: (k) => (k.match(/^hp elitebook (x360 )?(\d{3,4})/) || [])[2],
        letters: null,
        roles: [
          ["EliteBook 830", "13.3-inch: the most portable 800-series model."],
          ["EliteBook 840", "14-inch: the most common size and the safe default."],
          ["EliteBook 850", "15.6-inch: bigger screen, usually with a number pad."],
          ["EliteBook x360 830 / 1030 / 1040", "2-in-1 convertibles with touchscreens that fold into a tablet."],
          ["EliteBook 1030 / 1040", "Premium thin models (Folio/Elite line), often with soldered memory."],
          ["EliteBook 7x5 (745, 735)", "AMD Ryzen versions of the 800 series."],
        ],
        naming: [
          "**The number is the size:** 830 = 13.3-inch, 840 = 14-inch, 850 = 15.6-inch.",
          "**The G number is the generation:** G1 4th-gen Intel, G2 5th, G3 6th, G4 7th, G5 8th, G6 8th (a refresh), G7 10th, G8 11th, G9 12th, G10 13th.",
          "**So an EliteBook 840 G5 is a 14-inch laptop with an 8th-gen processor.** Within one G number, Core i5 and i7 versions exist; the listing name says which.",
        ],
        advice: [
          "**Best value for most buyers:** an 840 G5 or G6: 14-inch, 8th-gen processor, Windows 11 support.",
          "**Newer and faster:** an 840 G7 or G8 (10th or 11th gen); the G8's Iris Xe graphics help with photo and light video work.",
          "**Portability:** an 830 of the same generation, or an x360 830 if you want a touchscreen that folds.",
          "**Bigger screen and number pad:** an 850.",
          "**Avoid for daily use:** G3 and older (6th gen and earlier) unless the price is very low.",
        ],
        checks: [
          "Check the hinge: older EliteBooks can loosen where the screen meets the base.",
          "Make sure the BIOS (F10 at startup) has no administrator password, and that \"Absolute persistence\" is not active.",
          "Confirm the G number in the BIOS or on the label under the laptop, not only in the listing.",
        ],
        hubPath: "/series/elitebook-kenya",
        hubName: "HP EliteBook laptops in Kenya",
        faq: [
          { question: "What does G5 mean on an HP EliteBook?", answer: "It's the generation of that model. On 800-series EliteBooks, G5 and G6 have 8th-gen Intel processors, G7 10th gen, G8 11th gen and G9 12th gen." },
          { question: "Which is better, EliteBook 840 G5 or G6?", answer: "Both have 8th-gen processors; the G6 is a slightly newer refresh. Price and condition usually matter more than the G5/G6 difference." },
          { question: "What is the difference between EliteBook 830, 840 and 850?", answer: "The screen size: 830 is 13.3-inch, 840 is 14-inch and 850 is 15.6-inch. Within the same G number, the processors are the same." },
        ],
      });
    },
  },
  {
    slug: "latitude-models",
    path: "/learn/dell-latitude-models-explained",
    kw: "dell latitude models explained",
    secondary: ["dell latitude 5000 vs 7000", "dell latitude 7490 vs 7400", "dell latitude numbers meaning"],
    h1: "Dell Latitude models explained: 3000, 5000 and 7000 series",
    title: "Dell Latitude Models Explained: 3000, 5000, 7000 Series",
    related: ["/series/latitude-kenya", "/laptops/dell-laptops-kenya", "/hp-vs-dell-vs-lenovo-laptops-kenya"],
    write(x) {
      return seriesArticle(x, {
        brand: "Dell Latitude",
        match: (r) => /-latitude-/.test(`-${r.slug}-`),
        letterOf: (k) => (k.match(/^dell latitude e?(\d)\d{3}/) || [])[1],
        letters: { 3: "3000 series", 5: "5000 series", 7: "7000 series", 9: "9000 series" },
        roles: [
          ["Latitude 3000", "Entry-level: plastic body, basic screens, lowest price."],
          ["Latitude 5000", "Mainstream business: sturdy, upgradeable, good value."],
          ["Latitude 7000", "Premium business: thinner, lighter, better screens and materials."],
          ["Latitude 9000", "Flagship models with the best screens and materials."],
          ["Latitude 2-in-1 (e.g. 7389, 7390 2-in-1)", "Convertibles with touchscreens."],
        ],
        naming: [
          "**First digit = class:** 3 entry, 5 mainstream, 7 premium, 9 flagship.",
          "**Second digit = screen size:** 2 = 12.5-inch, 3 = 13.3-inch, 4 = 14-inch, 5 = 15.6-inch. A 7490 is a 14-inch premium model.",
          "**Last digits = model year:** before 2017 the names started with E (E7240 4th gen, E7250 5th, E7270 and E7470 6th). Then 7480 (7th gen), 7490 (8th), 7400 (8th, newer design), 7410 (10th), 7420 (11th), 7430 (12th); the 5000 series follows the same pattern (5490, 5400, 5410…).",
        ],
        advice: [
          "**Best value for most buyers:** a Latitude 5490, 7490, 5400 or 7400: 14-inch with an 8th-gen processor and Windows 11 support.",
          "**Lighter and better screen:** the 7000 series over the 5000 series of the same year.",
          "**Newer and faster:** a 7410 or 5410 (10th gen) or later.",
          "**Touchscreen that folds:** a Latitude 2-in-1, such as the 7389 or 7390 2-in-1.",
          "**Avoid for daily use:** E-series models (E7240, E7250, E7270) unless the price is very low: their processors are 4th to 6th gen.",
        ],
        checks: [
          "Press F2 at startup: the BIOS should open without a password, and the service tag shown there should match the sticker underneath.",
          "Check the battery health (Dell's BIOS shows it under Battery Information).",
          "On 2-in-1 models, test the touchscreen in every corner and fold it into tablet mode.",
        ],
        hubPath: "/series/latitude-kenya",
        hubName: "Dell Latitude laptops in Kenya",
        faq: [
          { question: "What is the difference between Dell Latitude 5000 and 7000?", answer: "The 7000 series is the premium line: thinner and lighter with better screens and materials. The 5000 series is sturdier, more upgradeable and cheaper." },
          { question: "What does the number in Dell Latitude 7490 mean?", answer: "7 = premium 7000 series, 4 = 14-inch screen, 90 = the 2018 model with 8th-gen Intel processors." },
          { question: "Is a Dell Latitude E7240 still worth buying?", answer: "Only for basic tasks on a very small budget: it has a 4th-gen processor, which Windows 11 does not support." },
        ],
      });
    },
  },
  {
    slug: "touchscreen-worth-it",
    path: "/learn/touchscreen-laptop-worth-it-kenya",
    kw: "is a touchscreen laptop worth it",
    secondary: ["2-in-1 laptop vs normal laptop", "x360 laptop meaning", "touchscreen laptop price kenya"],
    h1: "Is a touchscreen or 2-in-1 laptop worth it?",
    title: "Is a Touchscreen or 2-in-1 Laptop Worth It? (Kenya Prices)",
    related: ["/best/touchscreen-laptops-kenya", "/best/2-in-1-laptops-kenya", "/series/x360-kenya"],
    write(x) {
      const { L, ksh, median, pct, link, tableMd, SITE, asOf } = x;
      const plain = L.filter((r) => !r.sp.touch && !r.sp.convertible).map((r) => r.price);
      const touch = L.filter((r) => r.sp.touch && !r.sp.convertible).map((r) => r.price);
      const conv = L.filter((r) => r.sp.convertible).map((r) => r.price);
      if (touch.length < 8 || conv.length < 8) return null;
      const premT = x.premium(L, (r) => !r.sp.touch && !r.sp.convertible, (r) => r.sp.touch && !r.sp.convertible, { sameModel: true });
      return {
        intro: `A touchscreen is worth it if you sign documents, take handwritten notes, sketch or use the laptop like a tablet; for typing, spreadsheets and browsing, a normal screen does the job and costs less. A 2-in-1 (\"x360\") folds all the way back into a tablet. At ECB Technologies, ${pct(touch.length + conv.length, L.length)}% of laptops have a touchscreen${premT ? `, and the touch version of the same model costs a median of ${ksh(premT.diff)} more` : ""} (${asOf}).`,
        description: `Touchscreen vs normal vs 2-in-1 (x360) laptops: who they suit, battery and durability trade-offs, and the price difference for the same model in Kenya.`,
        sections: [
          {
            heading: "Three types of screen",
            body: tableMd(["Type", "What it is", "Good for"], [
              ["Normal (non-touch)", "Standard matte screen", "Typing, spreadsheets, browsing; less glare, best battery"],
              ["Touchscreen", "Touch on a normal clamshell laptop", "Scrolling, signing, quick taps"],
              ["2-in-1 / x360", "Touchscreen that folds 360° into a tablet or tent", "Handwritten notes, sketching, presentations, reading"],
            ]),
          },
          {
            heading: "What it costs",
            body: [
              premT ? `For the same model, the touchscreen version costs a median of ${ksh(premT.diff)} more than the non-touch version (${premT.n} models compared).` : "Too few models are in stock in both versions to measure the difference right now.",
              "",
              tableMd(["Type", "Laptops in stock", "From", "Median"], [
                ["Non-touch", String(plain.length), ksh(Math.min(...plain)), ksh(median(plain))],
                ["Touchscreen (clamshell)", String(touch.length), ksh(Math.min(...touch)), ksh(median(touch))],
                ["2-in-1 / x360", String(conv.length), ksh(Math.min(...conv)), ksh(median(conv))],
              ]),
            ].join("\n"),
          },
          {
            heading: "The trade-offs",
            body: [
              "- **Glare:** touchscreens are glossy, which reflects light outdoors and under office lights.",
              "- **Battery:** the touch layer uses a little more power; the difference is small on recent models.",
              "- **Weight:** 2-in-1s are slightly heavier because of the stronger hinge.",
              "- **Pen:** many 2-in-1s support an active pen (for example HP x360 and ThinkPad Yoga models); check the exact model, as the pen is often sold separately.",
              "- **Repairs:** a touchscreen panel costs more to replace than a normal screen.",
            ].join("\n"),
          },
          {
            heading: "How to check a touchscreen before buying",
            body: [
              "- Drag a finger slowly across every edge and corner in Paint: the line should follow without gaps.",
              "- Leave the screen untouched for a minute: any clicks or cursor jumps on their own (\"ghost touches\") mean a faulty panel.",
              "- On a 2-in-1, fold it into tablet mode and back: the keyboard should switch off in tablet mode and the hinge should hold every angle.",
              "- If you need a pen, try one on the screen before you pay: not every touchscreen supports pens.",
            ].join("\n"),
          },
          {
            heading: "Who should buy which",
            body: [
              `- **Students who write notes by hand, designers, teachers:** a 2-in-1. See ${link("2-in-1 laptops", `${SITE}/best/2-in-1-laptops-kenya`)} and ${link("HP x360 laptops", `${SITE}/series/x360-kenya`)}.`,
              `- **Office workers who sign documents or present:** a touchscreen clamshell. See ${link("touchscreen laptops", `${SITE}/best/touchscreen-laptops-kenya`)}.`,
              "- **Mostly typing, coding or spreadsheets:** non-touch; spend the difference on RAM or a newer processor.",
            ].join("\n"),
          },
        ],
        faq: [
          { question: "What does x360 mean on an HP laptop?", answer: "The screen folds 360° so the laptop works as a tablet or stands like a tent. All x360 models have touchscreens." },
          { question: "Do touchscreen laptops drain the battery faster?", answer: "Slightly, because of the touch layer, but on recent models the difference is small compared with screen brightness and processor." },
          { question: "How much more is a touchscreen laptop in Kenya?", answer: premT ? `For the same model at ECB Technologies, a median of ${ksh(premT.diff)} more than non-touch (${premT.n} models compared, ${asOf}).` : "It depends on the model; ask us on WhatsApp for the exact difference." },
          { question: "Can I use a pen on any touchscreen laptop?", answer: "No. Active pens need a pen-enabled screen, which many 2-in-1s have and most touchscreen clamshells don't. Check the exact model first." },
        ],
      };
    },
  },
];

// Glossary playbook: one page of laptop terms (not one thin page per term),
// each defined in plain words, with how many laptops in stock have it and a
// link to the guide where the term matters.
ARTICLES.push({
  slug: "laptop-glossary",
  path: "/learn/laptop-terms-explained",
  kw: "laptop terms explained",
  secondary: ["laptop specs explained", "what does x360 mean", "what is nvme ssd", "what is tpm 2.0", "what is ex-uk laptop"],
  h1: "Laptop terms explained: a buyer's glossary",
  title: "Laptop Terms Explained: A Buyer's Glossary of Specs",
  related: ["/learn/laptop-processor-generations-kenya", "/learn/how-much-ram-laptop-kenya", "/learn/check-used-laptop-before-buying"],
  write(x) {
    const { L, ksh, median, pct, link, SITE, asOf, recency } = x;
    if (L.length < 50) return null;
    const n = (f) => L.filter(f).length;
    const from = (f) => {
      const ps = L.filter(f).map((r) => r.price);
      return ps.length >= 3 ? ` (from ${ksh(Math.min(...ps))}, median ${ksh(median(ps))})` : "";
    };
    const stock = (f, what, url) => {
      const c = n(f);
      if (!c) return "";
      return ` **In stock:** ${c} ${what}${from(f)}${url ? `; see ${link("the list", `${SITE}${url}`)}` : ""}.`;
    };
    const term = (t, def, extra = "") => `- **${t}:** ${def}${extra}`;
    const groups = [
      ["Processor (CPU)", [
        term("Core i3, i5, i7, i9", "Intel's tiers, from basic (i3) to fastest (i9). For the same generation, an i5 handles office work and study comfortably; i7 adds speed for heavier work.", stock((r) => r.sp.cpu === "Core i5", "Core i5 laptops", "/laptops/core-i5-laptops-kenya")),
        term("Processor generation", "The first digits of the model number (i5-8350U = 8th gen). Newer generations are faster and more efficient; 8th gen is the minimum for Windows 11. Read " + link("processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`) + ".", stock((r) => recency(r.sp) >= 3, "laptops 8th gen or newer")),
        term("U, H, HQ, G7 suffixes", "Letters after the model number. U = low power for thin laptops (most business models), H/HQ = high performance for workstations and gaming, G7 = 11th gen with stronger built-in graphics."),
        term("Intel Core Ultra", "Intel's naming since late 2023 (Core Ultra 5, 7, 9), with a built-in AI accelerator (NPU) and much better integrated graphics.", stock((r) => r.sp.cpu === "Core Ultra", "Core Ultra laptops", "/laptops/core-ultra-laptops-kenya")),
        term("AMD Ryzen", "AMD's processors: Ryzen 3, 5, 7 and 9 match Intel's i3 to i9. Strong multi-core performance and integrated graphics for the price.", stock((r) => r.sp.cpu === "AMD Ryzen", "Ryzen laptops", "/laptops/amd-ryzen-laptops-kenya")),
        term("Apple M-series (M1, M2, M3…)", "Apple's own chips in MacBooks: fast, cool and with very long battery life. They run macOS, not Windows.", stock((r) => r.sp.cpu === "Apple M-series", "MacBooks with Apple chips")),
        term("Celeron and Pentium", "Intel's entry-level chips for basic tasks. Fine for browsing and documents on a tight budget; slow with many tabs.", stock((r) => r.sp.cpu === "Celeron / Pentium", "Celeron or Pentium laptops")),
        term("Snapdragon (Windows on Arm)", "Qualcomm chips in some new Windows laptops: excellent battery life; a few older programs and games don't run on them."),
        term("NPU", "A neural processing unit: a part of newer chips (Core Ultra, Snapdragon X, recent Ryzen) that runs AI features such as background blur and live captions efficiently."),
        term("Cores and threads", "How many tasks the processor works on at once. 8th-gen business laptops jumped from 2 to 4 cores, which is why they feel much smoother than 7th gen."),
      ]],
      ["Memory and storage", [
        term("RAM (memory)", "Short-term working memory. 8 GB is enough for study and office work; 16 GB for programming, many tabs and design. Read " + link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`) + ".", stock((r) => r.sp.ram >= 16, "laptops with 16 GB or more", "/best/16gb-ram-laptops-kenya")),
        term("DDR4, DDR5, LPDDR", "Memory types. DDR5 is newer and faster than DDR4; LPDDR is low-power memory soldered to the board (it can't be upgraded)."),
        term("Soldered vs slotted RAM", "Slotted memory can be upgraded later; soldered memory can't. Thin premium laptops and many 2-in-1s are soldered."),
        term("SSD", "Solid-state drive: storage with no moving parts, much faster than a hard drive. Read " + link("256 GB vs 512 GB", `${SITE}/learn/laptop-ssd-size-kenya`) + ".", stock((r) => r.sp.ssd >= 512, "laptops with 512 GB or more")),
        term("NVMe and M.2", "M.2 is the stick-shaped slot; NVMe is the fast way an SSD talks to the laptop (SATA is the older, slower way). Most business laptops from 8th gen on take NVMe drives."),
        term("HDD", "A spinning hard drive: cheap per gigabyte but slow. Avoid it as the main drive."),
        term("eMMC", "Slow soldered storage in some very cheap laptops and tablets; usually 64–128 GB and not upgradeable."),
      ]],
      ["Screen and design", [
        term("Touchscreen", "A screen you can tap and scroll. Handy for signing and presenting; glossy, so it reflects more light.", stock((r) => r.sp.touch, "touchscreen laptops", "/best/touchscreen-laptops-kenya")),
        term("2-in-1, x360, Yoga, Flip", "A laptop whose touchscreen folds 360° into a tablet or tent. HP calls it x360, Lenovo Yoga, others Flip. Read " + link("is a touchscreen worth it", `${SITE}/learn/touchscreen-laptop-worth-it-kenya`) + ".", stock((r) => r.sp.convertible, "2-in-1 laptops", "/best/2-in-1-laptops-kenya")),
        term("Detachable", "A 2-in-1 whose keyboard comes off completely (like a Surface)."),
        term("FHD, QHD, 4K", "Screen resolution: FHD = 1920×1080 (sharp on 13–15-inch screens), QHD = 2560×1440, 4K = 3840×2160. HD (1366×768) looks grainy; avoid it if you can."),
        term("IPS and OLED", "Panel types. IPS has good colours and viewing angles; OLED has perfect blacks and vivid colour. Older budget panels (TN) wash out from the side."),
        term("Nits", "Screen brightness. 250 nits is fine indoors; 300–400+ is better near windows or outdoors."),
        term("Screen size", "Measured diagonally: 12.5–13.3 inches is easy to carry, 14 inches is the sweet spot, 15.6 inches gives a bigger screen and often a number pad."),
      ]],
      ["Graphics", [
        term("Integrated graphics", "Graphics built into the processor (Intel UHD, Iris Xe, AMD Radeon). Fine for study, video and light photo work; Iris Xe (11th gen and newer) is noticeably stronger."),
        term("Dedicated graphics (GPU)", "A separate graphics chip (NVIDIA GeForce GTX/RTX, Quadro/RTX A, AMD Radeon RX) for gaming, 3D, CAD and video editing.", stock((r) => r.sp.gpu, "laptops with a dedicated graphics card", "/best/gaming-laptops-kenya")),
        term("Quadro / RTX A-series", "NVIDIA's workstation graphics, certified for engineering and design software; found in HP ZBook, Dell Precision and ThinkPad P."),
      ]],
      ["Business-laptop features", [
        term("TrackPoint", "The red pointing nub in the middle of ThinkPad keyboards, with its own buttons; you can use it without lifting your hands."),
        term("TPM 2.0", "A security chip that stores encryption keys. Windows 11 requires it; most business laptops from the 8th-gen era have it (check with Microsoft's PC Health Check)."),
        term("vPro", "Intel's business management features (remote management by an IT department); it doesn't make the laptop faster for you."),
        term("Thunderbolt and USB-C charging", "Thunderbolt is a fast USB-C port for docks and external screens. Many newer laptops charge over USB-C, so one charger fits several laptops."),
        term("Fingerprint reader and IR camera", "Sign in to Windows Hello without a password; common on business laptops."),
        term("Docking station", "One cable connects the laptop to monitors, keyboard, network and power at a desk; business laptops are built for it."),
      ]],
      ["Buying terms", [
        term("Ex-UK laptop", "A laptop first used in the UK (often by a company) and resold in Kenya. Usually a business model built for years of use; check it like any used laptop."),
        term("Refurbished", "A used laptop that has been checked, cleaned and fixed where needed before resale. Ask what was replaced and what the warranty covers."),
        term("G number (G5, G8…)", "HP's generation of a model: an EliteBook 840 G5 has an 8th-gen processor, G8 11th gen. Read " + link("EliteBook models explained", `${SITE}/learn/hp-elitebook-models-explained`) + "."),
        term("Battery health", "How much charge the battery holds compared with when new. Check with powercfg /batteryreport; 80%+ is good. See " + link("the used-laptop checklist", `${SITE}/learn/check-used-laptop-before-buying`) + "."),
        term("BIOS password", "A lock on the laptop's settings. On a used laptop, don't buy if the seller can't remove it."),
        term("Warranty", "What the seller fixes or replaces, and for how long. Get it in writing on the receipt."),
      ]],
    ];
    const total = groups.reduce((a, [, ts]) => a + ts.length, 0);
    return {
      intro: `Laptop terms explained in plain English: ${total} words you'll meet in listings, from processor generations and NVMe SSDs to x360, TPM 2.0 and ex-UK, each with what it means for you. Where it helps, we add how many of the ${L.length} laptops we stock have it, with prices (${asOf}).`,
      description: `${total} laptop terms explained in plain English: processors, RAM, SSD, NVMe, x360, touchscreen, GPU, TPM, ex-UK and more, with live Kenyan prices.`,
      sections: groups.map(([heading, ts]) => ({ heading, body: ts.join("\n") })),
      faq: [
        { question: "What is the most important spec when buying a laptop?", answer: "The processor generation (8th gen or newer for Windows 11), then RAM (8 GB minimum, 16 GB for heavier work), then an SSD. Screen and battery come next." },
        { question: "What does x360 mean on a laptop?", answer: "HP's name for a 2-in-1 whose touchscreen folds all the way back into a tablet. Lenovo calls the same idea Yoga." },
        { question: "What is the difference between an SSD and NVMe?", answer: "NVMe is a type of SSD: it uses a faster connection than older SATA SSDs. Both are far faster than a hard drive." },
        { question: "What does ex-UK mean?", answer: "The laptop was first used in the UK, usually by a company, and is resold in Kenya. Check its battery, BIOS and condition like any used laptop." },
      ],
    };
  },
});

// Shared writer for the "models explained" articles.
function seriesArticle(x, o) {
  const { L, ksh, median, tableMd, link, SITE, asOf } = x;
  const rows = L.filter(o.match);
  if (rows.length < 10) return null;
  const groups = {};
  for (const r of rows) {
    const k = x.modelKey(r.slug);
    const g = k && o.letterOf(k);
    if (g) (groups[g] = groups[g] || []).push(r);
  }
  const label = (g) => (o.letters ? o.letters[g] || g.toUpperCase() : `${o.brand} ${g}`);
  const stock = Object.entries(groups).filter(([, rs]) => rs.length >= 2).sort((a, b) => b[1].length - a[1].length);
  const models = {};
  for (const r of rows) {
    const k = x.modelKey(r.slug);
    if (k) (models[k] = models[k] || []).push(r.price);
  }
  const topModels = Object.entries(models).filter(([, ps]) => ps.length >= 2).sort((a, b) => b[1].length - a[1].length).slice(0, 8);
  const med = median(rows.map((r) => r.price));
  return {
    intro: `${o.brand.replace(/^(Lenovo|HP|Dell) /, "")} models explained: ${o.naming[0].replace(/\*\*/g, "").replace(/^(\w)(?=[a-z])/, (m) => m.toLowerCase())} ${o.naming[1].replace(/\*\*/g, "")} At ECB Technologies we have ${rows.length} ${o.brand} laptops from ${ksh(Math.min(...rows.map((r) => r.price)))} (median ${ksh(med)}, ${asOf}); the tables below show which models are in stock and what they cost.`,
    description: `${o.brand} model names decoded: what the letters and numbers mean, which generation each model has, and what each costs in Kenya.`,
    sections: [
      { heading: `The ${o.brand} lines`, body: tableMd(["Line", "What it is"], o.roles) },
      { heading: "How to read the model name", body: o.naming.map((n) => `- ${n}`).join("\n") + "\n\nModels were sold with several processor options, so always confirm the processor in the listing (our product names include it)." },
      {
        heading: "What we have in stock",
        body:
          (stock.length ? tableMd(["Line", "Laptops", "From", "Median"], stock.map(([g, rs]) => [label(g), String(rs.length), ksh(Math.min(...rs.map((r) => r.price))), rs.length >= 3 ? ksh(median(rs.map((r) => r.price))) : "few"])) + "\n\n" : "") +
          (topModels.length ? `Most common models:\n\n` + tableMd(["Model", "Configurations", "From"], topModels.map(([k, ps]) => [x.modelName(k), String(ps.length), ksh(Math.min(...ps))])) : ""),
      },
      ...(o.advice ? [{ heading: `Which ${o.brand} should you buy?`, body: o.advice.map((a) => `- ${a}`).join("\n") }] : []),
      ...(o.checks ? [{ heading: `What to check on a used ${o.brand}`, body: o.checks.map((a) => `- ${a}`).join("\n") }] : []),
      { heading: "Where to compare them", body: `See every ${o.brand} in stock, ranked by specs, in ${link(o.hubName, `${SITE}${o.hubPath}`)}. Not sure about the processor? Read ${link("laptop processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`)}, and before buying any used laptop, ${link("the 12-point checklist", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
    ],
    faq: o.faq,
  };
}

// ---------- Batch 2 (27 Nov 2026): the 100-question content map ----------
// See docs/seo/question-map.md for which question each article answers.

const bandTable = (x, rows, bands) => x.tableMd(["Budget", "Laptops in stock", "Median price", "Best specified"], bands.map(([lo, hi, label]) => {
  const rs = rows.filter((r) => r.price > lo && r.price <= hi);
  const top = [...rs].sort((a, b) => b.score - a.score || a.price - b.price)[0];
  return [label, String(rs.length), rs.length >= 3 ? x.ksh(x.median(rs.map((r) => r.price))) : "few", top ? `${x.link(top.short, `${x.SITE}/item/${top.slug}`)} – ${x.ksh(top.price)}` : "none"];
}));

ARTICLES.push({
  slug: "laptop-buying-guide",
  path: "/learn/laptop-buying-guide-kenya",
  kw: "laptop buying guide Kenya",
  secondary: ["how to choose a laptop", "what to consider before buying a laptop", "how long should a laptop last", "what laptop screen size should i buy", "best laptop to buy in kenya"],
  h1: "Laptop buying guide for Kenya: how to choose the right laptop",
  title: "Laptop Buying Guide Kenya: How to Choose the Right One",
  related: ["/student-laptops-kenya", "/best/business-laptops-kenya", "/hp-vs-dell-vs-lenovo-laptops-kenya"],
  write(x) {
    const { L, ksh, median, pct, link, tableMd, SITE, asOf, recency } = x;
    if (L.length < 50) return null;
    const bands = [[0, 20000, "KSh 20,000 or less"], [20000, 30000, "KSh 20,001–30,000"], [30000, 40000, "KSh 30,001–40,000"], [40000, 50000, "KSh 40,001–50,000"], [50000, 70000, "KSh 50,001–70,000"], [70000, 100000, "KSh 70,001–100,000"], [100000, 10000000, "Over KSh 100,000"]];
    const med = median(L.map((r) => r.price));
    const brands = ["HP", "Lenovo", "Dell", "Apple"].map((b) => [b, L.filter((r) => x.brandOf(r.slug) === b)]).filter(([, rs]) => rs.length);
    return {
      intro: `This laptop buying guide for Kenya answers the question in the order that matters: set your budget, pick the processor generation, then RAM and storage, then screen size and brand. In short: for most people an 8th-gen or newer Core i5 (or Ryzen 5) with 8 GB RAM and a 256 GB SSD is enough; students in technical courses, programmers and designers should get 16 GB. At ECB Technologies the median laptop costs ${ksh(med)} across ${L.length} in stock (${asOf}).`,
      description: `How to choose a laptop in Kenya: budget, processor, RAM, SSD, screen size, battery, brand and new vs used, with live KSh prices for every budget.`,
      sections: [
        { heading: "Step 1: set your budget (what each budget buys today)", body: `Laptops in stock by price, with the best specified in each band (${asOf}):\n\n` + bandTable(x, L, bands) + `\n\nUnder KSh 20,000 there are few laptops, mostly older or entry-level models; KSh 25,000–40,000 is where 8th-gen business laptops start. Each budget has its own page: ${link("under KSh 30,000", `${SITE}/best/best-laptops-under-30k-kenya`)}, ${link("under KSh 50,000", `${SITE}/best/best-laptops-under-50k-kenya`)}, ${link("under KSh 70,000", `${SITE}/best/best-laptops-under-70k-kenya`)} and ${link("all laptop prices", `${SITE}/research/laptop-prices-kenya`)}.` },
        { heading: "Step 2: choose the processor", body: `The processor decides how fast and how long-lasting the laptop is. Two things matter: the tier (Core i3, i5, i7 or Ryzen 3, 5, 7) and the generation (the first digits of the model number). ${pct(L.filter((r) => recency(r.sp) >= 3).length, L.length)}% of our laptops are 8th gen or newer, the minimum for Windows 11. Read ${link("laptop processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`)} and ${link("Core i3 vs i5 vs i7 vs Ryzen", `${SITE}/learn/core-i3-vs-i5-vs-i7-vs-ryzen`)}.` },
        { heading: "Step 3: RAM and storage", body: `- **RAM:** 8 GB for study and office work, 16 GB for programming, design and heavy multitasking. 4 GB is too little for Windows 11 with a browser and Office open. See ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)}.\n- **Storage:** always an SSD (never a hard drive as the only drive); 256 GB is enough with cloud storage, 512 GB if you keep photos, videos or big programs. See ${link("256 GB vs 512 GB SSD", `${SITE}/learn/laptop-ssd-size-kenya`)}.` },
        { heading: "Step 4: screen size and weight", body: tableMd(["Size", "Weight (typical)", "Best for"], [
          ["12.5–13.3 inch", "1.1–1.4 kg", "Carrying every day: campus, matatu, travel"],
          ["14 inch", "1.3–1.7 kg", "The best balance for most people"],
          ["15.6 inch", "1.7–2.3 kg", "A bigger screen and number pad; mostly used at a desk"],
        ]) + `\n\nChoose a Full HD (1920×1080) screen where you can; older HD (1366×768) screens look grainy. A touchscreen helps for notes and signing (see ${link("is a touchscreen worth it", `${SITE}/learn/touchscreen-laptop-worth-it-kenya`)}).` },
        { heading: "Step 5: battery life and how long a laptop lasts", body: `- **Battery:** 6–8 hours of light use is good for a thin business laptop; gaming laptops often manage far less. On a used laptop, battery wear matters more than the advertised figure: check it with \`powercfg /batteryreport\`.\n- **Lifespan:** business laptops (ThinkPad, EliteBook, Latitude) are built for years of daily use and are easy to repair; the battery is usually the first part to replace. Buying 8th gen or newer keeps the laptop on a supported Windows version for longer.` },
        { heading: "Step 6: brand and model line", body: brands.map(([b, rs]) => `- **${b}** (${rs.length} in stock, median ${ksh(median(rs.map((r) => r.price)))})`).join("\n") + `\n\nThe model line matters more than the brand: business lines (Lenovo ThinkPad, HP EliteBook and ProBook, Dell Latitude) are built tougher and are easier to repair in Nairobi than consumer lines. Compare them in ${link("HP vs Dell vs Lenovo", `${SITE}/hp-vs-dell-vs-lenovo-laptops-kenya`)}, and see ${link("ThinkPad", `${SITE}/learn/thinkpad-models-explained`)}, ${link("EliteBook", `${SITE}/learn/hp-elitebook-models-explained`)} and ${link("Latitude", `${SITE}/learn/dell-latitude-models-explained`)} model names explained.` },
        { heading: "Step 7: new, refurbished or used", body: `New laptops cost the most but come with a manufacturer warranty; refurbished and used business laptops give more performance per shilling. Whichever you choose, check it before paying: ${link("refurbished vs used vs new laptops", `${SITE}/learn/refurbished-vs-used-laptops-kenya`)} and ${link("the 12-point used-laptop checklist", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
        { heading: "Quick picks by need", body: `- **Students:** ${link("best laptops for students", `${SITE}/student-laptops-kenya`)}\n- **Office and business:** ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}\n- **Programming:** ${link("laptops for programming", `${SITE}/best/laptops-for-programming-kenya`)}\n- **Design and video editing:** ${link("laptops for design", `${SITE}/best/laptops-for-graphic-design-and-video-editing-kenya`)}\n- **Gaming:** ${link("gaming laptops", `${SITE}/best/gaming-laptops-kenya`)} and the ${link("gaming laptop guide", `${SITE}/learn/gaming-laptop-guide-kenya`)}` },
      ],
      faq: [
        { question: "What should I consider before buying a laptop?", answer: "Budget first, then the processor generation (8th gen or newer), RAM (8 GB, or 16 GB for heavy work), an SSD, screen size and weight, battery health on used laptops, and the warranty." },
        { question: "How many years should a laptop last?", answer: "Business laptops commonly give five years or more of daily use with care; the battery usually needs replacing first. Buying 8th gen or newer keeps it on Windows 11." },
        { question: "What laptop screen size should I buy?", answer: "14 inches suits most people. 13.3 inches if you carry it all day; 15.6 inches if it mostly stays on a desk." },
        { question: "What is a good battery life for a laptop?", answer: "6–8 hours of light use is good for a thin business laptop. On a used laptop, check the battery's remaining capacity: above 80% is good." },
        { question: "Which is the best laptop to buy in Kenya?", answer: "The one that fits your budget and needs: for most buyers an 8th-gen or newer business laptop (ThinkPad, EliteBook or Latitude) with a Core i5 or Ryzen 5, 8–16 GB RAM and an SSD." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "refurbished-vs-used",
  path: "/learn/refurbished-vs-used-laptops-kenya",
  kw: "refurbished vs used laptops",
  secondary: ["are refurbished laptops worth it in kenya", "ex-uk laptops", "how long does a refurbished laptop last", "how to check if a laptop is genuine", "disadvantages of refurbished laptops"],
  h1: "Refurbished vs used vs new laptops in Kenya: what's the difference?",
  title: "Refurbished vs Used vs New Laptops in Kenya Explained",
  related: ["/learn/check-used-laptop-before-buying", "/best/business-laptops-kenya", "/student-laptops-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, recency } = x;
    const biz = L.filter((r) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${r.slug}-`));
    if (biz.length < 20) return null;
    const biz8 = biz.filter((r) => recency(r.sp) >= 3);
    const eb = L.filter((r) => /-elitebook-/.test(`-${r.slug}-`));
    return {
      intro: `Refurbished vs used laptops: a used laptop is sold as it is; a refurbished laptop has been checked, cleaned and repaired where needed before resale, often with a warranty. "Ex-UK" describes where a laptop came from (usually a UK company), not its condition. Both cost far less than new: at ECB Technologies ${biz8.length} business laptops (ThinkPad, EliteBook, Latitude, ProBook) with 8th-gen or newer processors have a median price of ${ksh(median(biz8.map((r) => r.price)))} (${asOf}). Here's how to tell them apart and buy safely.`,
      description: `Refurbished, used, ex-UK and new laptops compared: price, lifespan, warranty, how to check one is genuine, and the disadvantages to know before buying in Kenya.`,
      sections: [
        { heading: "The four terms", body: x.tableMd(["Term", "What it means", "What to ask"], [
          ["New", "Unused, sealed box, manufacturer warranty", "Is the warranty valid in Kenya?"],
          ["Refurbished", "Used, then tested, cleaned and repaired where needed before resale", "What was replaced? What does the warranty cover and for how long?"],
          ["Used / second-hand", "Sold as it is, with no refurbishing", "Can I test it fully before paying?"],
          ["Ex-UK", "Imported after use in the UK, usually from a company", "Is it refurbished or sold as is?"],
        ]) },
        { heading: "Why refurbished and ex-UK laptops are cheaper", body: `Companies replace their laptops in batches every few years and sell the old ones in bulk. Those are mostly business models built for long use, so a few-year-old ThinkPad or EliteBook can cost a fraction of its new price while still being fast enough for study and office work. The price reflects age and wear, not a fault.` },
        { heading: "Are they worth it?", body: `For most buyers, yes, if the laptop is 8th gen or newer (Windows 11 support), the battery is healthy and there's a warranty. A refurbished business laptop often outlasts a new budget consumer laptop at the same price, because it's built tougher and spare parts are easy to find in Nairobi. Is a refurbished HP EliteBook worth buying? It's one of the most common choices: ${eb.length} EliteBooks are in stock from ${eb.length ? ksh(Math.min(...eb.map((r) => r.price))) : "n/a"}; see ${link("EliteBook models explained", `${SITE}/learn/hp-elitebook-models-explained`)} for which G number to choose.` },
        { heading: "The disadvantages", body: `- **Battery wear:** the battery has already been used; plan for a replacement in a year or two unless it tests above 80%.\n- **Cosmetic marks:** scratches and worn keys are common.\n- **Older technology:** 7th gen and older can't officially run Windows 11.\n- **Shorter warranty** than a new laptop, and none at all on a private used sale.\n- **Variable quality** between sellers: the checks below matter.` },
        { heading: "How to check a laptop is genuine", body: `1. **Serial number:** enter the serial (HP, Lenovo) or service tag (Dell) from the label underneath on the manufacturer's warranty check page; the model shown should match the laptop.\n2. **BIOS details:** the model and serial in the BIOS should match the sticker.\n3. **Specs:** Settings → System → About should show the processor and RAM in the listing.\n4. **Windows:** Settings → System → Activation should say Windows is activated.\n5. **No locks:** no BIOS password, and no company management tools still active.\n\nThe full list: ${link("how to check a used laptop before buying", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
        { heading: "How long does a refurbished laptop last?", body: `A good refurbished business laptop commonly gives several more years of daily use. The battery is the part that wears first; keyboards, SSDs and RAM on business models are easy to replace. Buying 8th gen or newer means Windows 11 keeps getting updates.` },
        { heading: "New or refurbished for university?", body: `On a student budget, an 8th-gen or newer refurbished business laptop usually gives more performance per shilling than a new entry-level laptop. Compare current options in ${link("best laptops for students", `${SITE}/student-laptops-kenya`)} and ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "Are refurbished laptops cheaper than new laptops in Kenya?", answer: `Yes, usually much cheaper for the same model line. Business laptops with 8th-gen or newer processors have a median of ${ksh(median(biz8.map((r) => r.price)))} at ECB Technologies (${asOf}).` },
        { question: "What is the difference between refurbished and used laptops?", answer: "A refurbished laptop has been tested and repaired where needed before resale, usually with a warranty; a used laptop is sold as it is." },
        { question: "Are UK-used laptops good?", answer: "Many are business models built for long use. Judge each one by its processor generation, battery health and condition, and get a warranty." },
        { question: "How do I know if a refurbished laptop is genuine?", answer: "Check the serial number or service tag on the manufacturer's warranty page, compare it with the BIOS, confirm the specs in Windows, and make sure Windows is activated." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "i3-i5-i7-ryzen",
  path: "/learn/core-i3-vs-i5-vs-i7-vs-ryzen",
  kw: "core i3 vs i5 vs i7",
  secondary: ["difference between core i3 i5 and i7", "is amd ryzen better than intel", "which intel processor is best for a laptop"],
  h1: "Core i3 vs i5 vs i7 vs AMD Ryzen: which laptop processor to buy",
  title: "Core i3 vs i5 vs i7 vs Ryzen: Which Laptop Processor?",
  related: ["/compare/core-i5-vs-core-i7-kenya", "/laptops/core-i5-laptops-kenya", "/laptops/amd-ryzen-laptops-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, tableMd, recency } = x;
    const tiers = [["Core i3", (r) => r.sp.cpu === "Core i3"], ["Core i5", (r) => r.sp.cpu === "Core i5"], ["Core i7", (r) => r.sp.cpu === "Core i7"], ["AMD Ryzen", (r) => r.sp.cpu === "AMD Ryzen"], ["Core Ultra", (r) => r.sp.cpu === "Core Ultra"]];
    const rows = tiers.map(([t, f]) => [t, L.filter(f)]).filter(([, rs]) => rs.length);
    if (rows.length < 3) return null;
    const i5r = L.filter((r) => r.sp.cpu === "Core i5" && recency(r.sp) >= 3);
    const i7r = L.filter((r) => r.sp.cpu === "Core i7" && recency(r.sp) >= 3);
    return {
      intro: `Core i3 vs i5 vs i7: an i3 is for basic tasks, an i5 is the right choice for most people (study, office work, multitasking), and an i7 adds speed for programming, design and heavy workloads. AMD's Ryzen 3, 5 and 7 match them tier for tier. But generation matters as much as tier: an 8th-gen i5 beats a 6th-gen i7 for most work. At ECB Technologies, 8th-gen or newer Core i5 laptops have a median price of ${i5r.length >= 3 ? ksh(median(i5r.map((r) => r.price))) : "n/a"} and Core i7 ${i7r.length >= 3 ? ksh(median(i7r.map((r) => r.price))) : "n/a"} (${asOf}).`,
      description: `Intel Core i3 vs i5 vs i7 and AMD Ryzen compared for laptops: what each is for, why generation matters, and what each costs in Kenya today.`,
      sections: [
        { heading: "What each tier is for", body: tableMd(["Processor", "Good for", "In stock", "Median price"], rows.map(([t, rs]) => [t, { "Core i3": "Browsing, documents, video calls", "Core i5": "Study, office work, multitasking, light editing", "Core i7": "Programming, design, heavy multitasking", "AMD Ryzen": "Ryzen 5 ≈ i5, Ryzen 7 ≈ i7; strong integrated graphics", "Core Ultra": "Newest Intel (2023+): AI engine, strong graphics, efficiency" }[t], String(rs.length), rs.length >= 3 ? ksh(median(rs.map((r) => r.price))) : "few"])) },
        { heading: "Generation beats tier", body: `Compare processors of the same generation. From the 8th generation onwards, Intel's thin-laptop i5 and i7 chips have 4 or more cores, a big step up from the 2 cores of most 7th-gen and older i5/i7 U-series chips. So an 8th-gen i5 is the better buy than a 6th-gen i7 for most people. Read ${link("processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`)}.` },
        { heading: "Core i5 vs Core i7: is the i7 worth it?", body: `For documents, browsing and video calls, you won't feel much difference. The i7 helps with long programming builds, large spreadsheets, photo and video work. The full comparison with live prices: ${link("Core i5 vs Core i7 in Kenya", `${SITE}/compare/core-i5-vs-core-i7-kenya`)}.` },
        { heading: "Is AMD Ryzen better than Intel?", body: `Neither is better across the board. Ryzen chips of a similar age often have more cores and stronger built-in graphics for the price; Intel chips are more common in the business laptops sold in Kenya, so there's more choice and spare parts. Compare like with like: Ryzen 5 with Core i5 of the same year. Browse ${link("AMD Ryzen laptops", `${SITE}/laptops/amd-ryzen-laptops-kenya`)} and ${link("Core i5 laptops", `${SITE}/laptops/core-i5-laptops-kenya`)}.` },
        { heading: "Which one should you buy?", body: `- **Basic use on a tight budget:** Core i3 or Ryzen 3, 8th gen or newer.\n- **Most people:** Core i5 or Ryzen 5, 8th gen or newer.\n- **Programming, design, engineering:** Core i7 or Ryzen 7 (10th gen or newer), or a Core Ultra, with 16 GB RAM.\n- **Gaming:** the graphics card matters more than the processor: see the ${link("gaming laptop guide", `${SITE}/learn/gaming-laptop-guide-kenya`)}.` },
      ],
      faq: [
        { question: "What is the difference between Intel Core i3, i5 and i7?", answer: "Speed and number of cores within the same generation: i3 for basic tasks, i5 for most people, i7 for heavier work like programming and design." },
        { question: "Which Intel Core processor is best for a laptop?", answer: "For most buyers, a Core i5 of the 8th generation or newer. Choose an i7 or Core Ultra for programming, design or engineering software." },
        { question: "Is AMD Ryzen better than Intel Core?", answer: "Not across the board. Ryzen often offers more cores and better integrated graphics for the price; Intel is more common in business laptops in Kenya. Compare chips of the same tier and year." },
        { question: "Is a 6th-gen i7 better than an 8th-gen i5?", answer: "Usually not: the 8th-gen i5 has twice the cores of most older i7 laptop chips and runs Windows 11." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "gaming-guide",
  path: "/learn/gaming-laptop-guide-kenya",
  kw: "gaming laptop buying guide Kenya",
  secondary: ["cheapest gaming laptop in kenya", "gtx 1650 good for gaming", "rtx 3050 vs rtx 4050", "how much ram for gaming", "can a normal laptop run games"],
  h1: "Gaming laptop buying guide for Kenya: GPU, RAM and budget",
  title: "Gaming Laptop Buying Guide Kenya: GPU, RAM and Budget",
  related: ["/best/gaming-laptops-kenya", "/best/laptops-for-graphic-design-and-video-editing-kenya", "/learn/how-much-ram-laptop-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, tableMd } = x;
    const g = L.filter((r) => r.sp.gpu || /-(omen|victus|legion|tuf|rog|nitro|predator|alienware|katana|thin-gf)-/.test(`-${r.slug}-`));
    if (g.length < 8) return null;
    const cheapest = [...g].sort((a, b) => a.price - b.price)[0];
    const u = (max) => g.filter((r) => r.price <= max);
    const best = (rs) => [...rs].sort((a, b) => b.score - a.score || a.price - b.price)[0];
    const cell = (r) => (r ? `${link(r.short, `${SITE}/item/${r.slug}`)} – ${ksh(r.price)}` : "none in stock");
    return {
      intro: `In a gaming laptop buying guide for Kenya, one part decides almost everything: the graphics card (GPU). A dedicated NVIDIA GeForce GTX or RTX card (or AMD Radeon RX) runs modern games; laptops with only built-in graphics handle older and lighter games at low settings. Pair it with 16 GB RAM and an SSD. At ECB Technologies ${g.length} laptops have a dedicated graphics card or a gaming line, from ${ksh(cheapest.price)} (median ${ksh(median(g.map((r) => r.price)))}, ${asOf}).`,
      description: `Gaming laptops in Kenya explained: which graphics card (GTX 1650, RTX 3050, RTX 4050), how much RAM, battery life, and what each budget buys today.`,
      sections: [
        { heading: "Graphics cards from entry level up", body: tableMd(["GPU", "What to expect"], [
          ["Built-in (Intel UHD / Iris Xe, AMD Radeon)", "Older and esports titles at low settings; not for new AAA games"],
          ["NVIDIA MX series (MX250–MX550)", "A little better than built-in; still not a gaming GPU"],
          ["GTX 1650 (4 GB)", "1080p at low–medium settings in esports and many older AAA games; no ray tracing or DLSS"],
          ["RTX 3050 (4–6 GB)", "Entry RTX: 1080p medium in many current games; supports DLSS upscaling"],
          ["RTX 4050 (6 GB)", "Noticeably faster and more efficient than the 3050; DLSS 3 frame generation"],
          ["RTX 4060 and up", "1080p high to ultra; comfortable for demanding new games"],
        ]) + `\n\nRTX 3050 vs RTX 4050: the 4050 is the newer generation, faster and cooler, with more video memory on most models; buy it if the price gap is small.` },
        { heading: "What each budget gets you", body: `Gaming-capable laptops in stock (${asOf}):\n\n` + tableMd(["Budget", "In stock", "Best specified"], [[70000, "Up to KSh 70,000"], [100000, "Up to KSh 100,000"], [150000, "Up to KSh 150,000"]].map(([m, l]) => [l, String(u(m).length), cell(best(u(m)))])) + `\n\nThe cheapest gaming-capable laptop right now: ${cell(cheapest)}. All of them: ${link("gaming laptops in Kenya", `${SITE}/best/gaming-laptops-kenya`)}.` },
        { heading: "How much RAM do you need for gaming?", body: `16 GB is the sensible standard for gaming in 2026; 8 GB works for esports and older games but stutters in many new ones. Many gaming laptops have two memory slots, so 8 GB can be upgraded later (check the model). See ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)}.` },
        { heading: "Can a normal laptop run modern games?", body: `Older and lighter games, yes, at low settings: an 11th-gen or newer Intel laptop with Iris Xe graphics, or a recent Ryzen, handles many esports titles. New, demanding games need a dedicated GPU. Check each game's minimum and recommended requirements on its official store page (Steam, EA or the publisher) and compare the GPU listed there with the laptop's.` },
        { heading: "Battery life, heat and noise", body: `Gaming laptops trade battery life for power: expect a few hours of light use, and often only 1–2 hours while gaming on battery; play plugged in. They also run hot and loud under load. Use them on a hard surface, keep the vents clear, and a cooling pad helps in Nairobi's heat.` },
        { heading: "Before you buy a used gaming laptop", body: `Gaming laptops work hard, so check more carefully: run a game or a GPU stress test for 15 minutes and watch for crashes, look at fan noise and temperatures, and check the battery report. The full list: ${link("how to check a used laptop", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
      ],
      faq: [
        { question: "What is the cheapest gaming laptop in Kenya?", answer: `At ECB Technologies today, the ${cheapest.short} at ${ksh(cheapest.price)} (${asOf}). Prices change; the gaming laptops page lists current stock.` },
        { question: "Is a laptop with a GTX 1650 good for gaming?", answer: "For esports and many older games at 1080p low–medium settings, yes. For new demanding games, an RTX 3050 or better is a safer choice." },
        { question: "Which is better for gaming, RTX 3050 or RTX 4050?", answer: "The RTX 4050: it's the newer generation, faster and more efficient, and supports DLSS 3 frame generation." },
        { question: "How much RAM do I need for gaming?", answer: "16 GB for current games; 8 GB is enough only for esports and older titles." },
        { question: "Can I get a gaming laptop under KSh 70,000?", answer: u(70000).length ? `Yes: ${u(70000).length} gaming-capable laptops cost KSh 70,000 or less at ECB Technologies (${asOf}).` : "Not in stock right now; ask us on WhatsApp for the next arrivals." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "battery-overheating",
  path: "/learn/laptop-battery-and-overheating-fixes",
  kw: "laptop battery draining fast",
  secondary: ["why does my laptop battery drain so fast", "laptop overheating what to do", "how to extend laptop battery life", "repair or replace old laptop"],
  h1: "Laptop battery draining fast or overheating? Causes and fixes",
  title: "Laptop Battery Draining Fast or Overheating? How to Fix It",
  related: ["/learn/laptop-upgrade-ram-ssd", "/learn/check-used-laptop-before-buying", "/learn/laptop-buying-guide-kenya"],
  write(x) {
    if (x.L.length < 50) return null; // a shop with stock behind the advice
    const { link, SITE, PHONE } = x;
    return {
      intro: `If your laptop battery is draining fast, the cause is usually one of three things: a worn battery (check its health first), screen brightness and background apps, or a power setting. Overheating usually comes from blocked vents and dust. Most fixes below are free and take a few minutes; the steps tell you when a part really needs replacing.`,
      description: `Why a laptop battery drains fast or a laptop overheats, how to check battery health, free fixes, how to extend battery life, and when to repair or replace.`,
      sections: [
        { heading: "Step 1: check the battery's health", body: "Open Command Prompt and run `powercfg /batteryreport`, then open the report it saves (the path is shown). Compare **Full charge capacity** with **Design capacity**:\n\n- **Above 80%:** the battery is fine; the drain is from settings or software.\n- **50–80%:** worn; expect noticeably shorter runtime.\n- **Below 50%:** replace the battery.\n\nThe report also lists recent usage, which shows when the battery drains fastest." },
        { heading: "Why the battery drains fast (and the fixes)", body: "- **Screen brightness:** the biggest drain. Lower it to what's comfortable.\n- **Background apps:** Task Manager → Startup apps: turn off what you don't need; close browser tabs you aren't using.\n- **Power mode:** Settings → System → Power & battery: choose a balanced or battery-saving mode on battery, and turn on Battery saver.\n- **Keyboard backlight, Bluetooth and Wi-Fi** when not needed.\n- **Windows and driver updates:** install them; power bugs are often fixed in updates.\n- **A worn battery:** if the report says below 50–60%, no setting will fix it." },
        { heading: "How to extend battery life over the years", body: "- Avoid keeping the laptop at 100% plugged in all day; many business laptops have a setting (in the maker's app or BIOS) to stop charging at about 80%.\n- Avoid heat: don't charge it in a hot car or on a bed.\n- Don't run it to 0% regularly." },
        { heading: "Laptop overheating: what to do", body: "1. **Use it on a hard, flat surface:** beds, cushions and laps block the vents.\n2. **Clean the vents:** dust builds up fast in Nairobi; blow it out with compressed air (laptop off).\n3. **Check what's using the processor:** Task Manager → sort by CPU; a stuck program can heat the laptop.\n4. **Use a cooling pad** for gaming or long video calls.\n5. **If it still overheats or shuts down:** the fan may be failing or the thermal paste may be dry; that's a job for a technician." },
        { heading: "Signs of a bigger fault", body: "- Doesn't power on at all, or only works when plugged in (battery or charging circuit).\n- Random shutdowns even when cool, no display, or beeping at startup (possible motherboard or memory fault).\n- Swollen battery (the case or touchpad bulges): stop using it and have the battery replaced; it's a safety risk.\n\nA technician can test these; ask for a written quote before work starts." },
        { heading: "Repair or replace?", body: `A simple rule: if the repair costs more than about half the price of an equivalent replacement laptop, or the laptop is 7th gen or older (no Windows 11), replacing usually makes more sense. A battery, RAM or SSD on a business laptop is usually worth doing; a motherboard on an old model often isn't. See ${link("upgrading RAM and SSD", `${SITE}/learn/laptop-upgrade-ram-ssd`)} and, if you're replacing it, the ${link("laptop buying guide", `${SITE}/learn/laptop-buying-guide-kenya`)}. Questions about a replacement: WhatsApp ${PHONE}.` },
      ],
      faq: [
        { question: "Why does my laptop battery drain so fast?", answer: "Usually a worn battery, high screen brightness, background apps or a high-performance power mode. Check battery health with powercfg /batteryreport first." },
        { question: "How do I check my laptop's battery health?", answer: "Run powercfg /batteryreport in Command Prompt, open the report, and compare Full charge capacity with Design capacity: above 80% is good." },
        { question: "What should I do if my laptop overheats?", answer: "Use it on a hard surface, clean the vents, close programs using the processor, and use a cooling pad. If it still overheats, have the fan and thermal paste checked." },
        { question: "Is it better to repair or replace an old laptop?", answer: "Repair if the cost is under about half the price of a replacement and the laptop is 8th gen or newer; otherwise replacing usually makes more sense." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "upgrade-ram-ssd",
  path: "/learn/laptop-upgrade-ram-ssd",
  kw: "upgrade laptop from hdd to ssd",
  secondary: ["can i upgrade my laptop ram", "laptop ssd upgrade", "how to know if a laptop has an ssd"],
  h1: "Upgrading a laptop: HDD to SSD and adding RAM",
  title: "Upgrade a Laptop From HDD to SSD and Add RAM: A Guide",
  related: ["/learn/how-much-ram-laptop-kenya", "/learn/laptop-ssd-size-kenya", "/learn/laptop-battery-and-overheating-fixes"],
  write(x) {
    if (x.L.length < 50) return null; // a shop with stock behind the advice
    const { link, SITE, PHONE } = x;
    return {
      intro: `Can you upgrade a laptop from HDD to SSD? Yes, almost always, and it's the single biggest speed-up for an older laptop: Windows starts in seconds instead of minutes. Adding RAM helps too, if the laptop has a free memory slot. This guide shows how to check what your laptop has, what to buy, and when an upgrade isn't worth it.`,
      description: `How to upgrade a laptop from a hard drive to an SSD and add RAM: check what you have, choose the right parts, move Windows, and when to replace instead.`,
      sections: [
        { heading: "How to know if your laptop has an SSD", body: "Open Task Manager → Performance → Disk: it says **SSD** or **HDD**. Or search for \"Defragment and Optimize Drives\": the media type column shows Solid state drive or Hard disk drive." },
        { heading: "Which SSD to buy", body: "Check the laptop's slot first (the manual or the model's spec sheet):\n\n- **2.5-inch SATA bay:** replace the hard drive with a 2.5-inch SATA SSD.\n- **M.2 slot:** buy an M.2 SSD of the right type: NVMe (faster) or SATA, and the right length (usually 2280).\n- **Both:** keep the old hard drive for storage and put Windows on the SSD.\n\nFor size, see " + link("256 GB vs 512 GB SSD", `${SITE}/learn/laptop-ssd-size-kenya`) + "." },
        { heading: "Moving Windows to the SSD", body: "Two ways:\n\n1. **Clone the old drive** to the new SSD with cloning software (many SSD makers provide a free tool), using a USB adapter or a second slot.\n2. **Clean install:** install the SSD, then install Windows from a USB stick made with Microsoft's Media Creation Tool. Windows usually reactivates by itself on the same laptop.\n\nBack up your files first either way." },
        { heading: "Adding RAM", body: `1. **Check what you have:** Task Manager → Performance → Memory shows the amount, speed and \"Slots used\".\n2. **Check if it's upgradeable:** many business laptops have one or two slots; thin premium laptops and many 2-in-1s have soldered memory that can't be upgraded.\n3. **Match the type:** DDR4 or DDR5 (laptop SO-DIMM), the same speed as the laptop supports.\n\n8 GB to 16 GB is the most useful upgrade; see ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)}.` },
        { heading: "When an upgrade isn't worth it", body: `- The laptop is 7th gen or older: an SSD makes it faster, but it still can't officially run Windows 11.\n- The RAM is soldered and you need more.\n- The upgrade costs approach the price of a better laptop.\n\nIn those cases, compare with a newer laptop: the ${link("laptop buying guide", `${SITE}/learn/laptop-buying-guide-kenya`)} shows what each budget buys. Ask us on WhatsApp (${PHONE}) whether a specific laptop has a free slot.` },
      ],
      faq: [
        { question: "Can I upgrade my laptop from HDD to SSD?", answer: "Almost always: replace the 2.5-inch hard drive with an SSD, or add an M.2 SSD if there's a slot, then clone or reinstall Windows." },
        { question: "How do I know if my laptop has an SSD?", answer: "Task Manager → Performance → Disk shows SSD or HDD." },
        { question: "Can I upgrade my laptop's RAM?", answer: "If it has a free or replaceable memory slot. Check Task Manager → Performance → Memory → Slots used; soldered memory can't be upgraded." },
        { question: "Is upgrading an old laptop worth it?", answer: "An SSD is worth it on almost any laptop. For 7th gen or older, or if the RAM is soldered, a newer laptop is often better value." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "macbook-price",
  path: "/laptops/macbook-price-kenya",
  kw: "MacBook price in Kenya",
  secondary: ["macbook air price in kenya", "macbook pro price in kenya", "should i buy a macbook or windows laptop", "macbook for students kenya"],
  h1: "MacBook prices in Kenya: every model in stock and which to buy",
  title: "MacBook Price in Kenya: Models in Stock and Which to Buy",
  related: ["/compare/macbook-vs-windows-laptops-kenya", "/learn/laptop-buying-guide-kenya", "/student-laptops-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, tableMd } = x;
    const mac = L.filter((r) => x.brandOf(r.slug) === "Apple" && /macbook/.test(r.slug)); // MacBooks only (not iMacs)
    const win = L.filter((r) => x.brandOf(r.slug) !== "Apple");
    if (mac.length < 5) return null;
    const list = [...mac].sort((a, b) => a.price - b.price);
    const appleChip = mac.filter((r) => r.sp.cpu === "Apple M-series");
    return {
      intro: `MacBook prices in Kenya at ECB Technologies start at ${ksh(list[0].price)}, with a median of ${ksh(median(mac.map((r) => r.price)))} across the ${mac.length} MacBooks in stock (${asOf}); every model and price is listed below. Choose a MacBook for battery life, build quality and if you already use an iPhone; choose Windows for the widest software support (engineering, accounting and many school programs are Windows-only), more choice at every price, and cheaper repairs (Windows laptops here have a median of ${ksh(median(win.map((r) => r.price)))}).`,
      description: `MacBook prices in Kenya: ${mac.length} MacBooks in stock from ${ksh(list[0].price)}, with specs, which model to choose, and MacBook vs Windows for study and work.`,
      sections: [
        { heading: "MacBooks in stock now", body: list.map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)}${x.specLine(r.sp) ? ` (${x.specLine(r.sp)})` : ""}`).join("\n") + `\n\nPrices as of ${asOf}.` },
        { heading: "Side by side", body: tableMd(["", "MacBook", "Windows laptop"], [
          ["Price in stock", `From ${ksh(list[0].price)}, median ${ksh(median(mac.map((r) => r.price)))}`, `From ${ksh(Math.min(...win.map((r) => r.price)))}, median ${ksh(median(win.map((r) => r.price)))}`],
          ["Software", "macOS: great for creative and general use; some programs are Windows-only", "Runs almost everything, including engineering and accounting software"],
          ["Battery life", "Excellent on Apple-chip (M1 and later) models", "Varies widely by model"],
          ["Repairs and parts", "Fewer repairers; parts cost more", "Widely repaired in Nairobi; parts easy to find"],
          ["Upgrades", "None after purchase (memory and storage are fixed)", "Many business models take more RAM or a bigger SSD"],
          ["Choice", `${mac.length} models in stock`, `${win.length} models in stock`],
        ]) },
        { heading: "Who should buy a MacBook", body: `- You use an iPhone and want AirDrop, iMessage and shared photos.\n- You need long battery life: Apple-chip MacBooks (M1 and newer) often last a full day.\n- Your work is writing, design, photo or video editing in apps that run on macOS.\n\nChoose an Apple-chip model if you can${appleChip.length ? ` (${appleChip.length} in stock)` : ""}; older Intel MacBooks are slower and stop getting new macOS versions sooner. Buy enough memory and storage up front: they can't be upgraded later.` },
        { heading: "Who should buy a Windows laptop", body: `- Engineering and architecture students: AutoCAD, SolidWorks and many lab programs are Windows-only or work best on Windows.\n- Accounting and business software that only runs on Windows.\n- Gamers: far more games run on Windows.\n- Tight budgets: more choice at every price, and cheaper repairs.\n\nSee the ${link("laptop buying guide", `${SITE}/learn/laptop-buying-guide-kenya`)} and ${link("best laptops for students", `${SITE}/student-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "Which is better, MacBook or Windows laptop?", answer: "Neither for everyone: MacBooks lead on battery life and build; Windows laptops on software support, choice, price and repairs. Check that your course or work software runs on macOS first. The full comparison is on our MacBook vs Windows page." },
        { question: "How much is a MacBook in Kenya?", answer: `At ECB Technologies, from ${ksh(list[0].price)}, with a median of ${ksh(median(mac.map((r) => r.price)))} across ${mac.length} models (${asOf}).` },
        { question: "Is a MacBook good for university?", answer: "For most courses, yes. Engineering, architecture and some IT courses rely on Windows-only software, so check your department's list first." },
        { question: "Can I upgrade a MacBook's RAM or storage later?", answer: "No on Apple-chip MacBooks: memory and storage are fixed, so buy the size you need." },
      ],
    };
  },
});

// ---------- Batch 3 (27 Nov 2026): the second 100 questions ----------
// See docs/seo/question-map-2.md. Software requirements quoted here are the
// vendors' published minimums/recommendations for recent versions; each page
// tells readers to check the exact version they'll use.

const pickList = (x, rows, n = 6) => [...rows].sort((a, b) => b.score - a.score || a.price - b.price).slice(0, n).map((r) => `- ${x.link(r.short, `${x.SITE}/item/${r.slug}`)}: ${x.ksh(r.price)}${x.specLine(r.sp) ? ` (${x.specLine(r.sp)})` : ""}`).join("\n");
const cheapestOf = (rows) => [...rows].sort((a, b) => a.price - b.price)[0];

ARTICLES.push({
  slug: "profession-laptops",
  path: "/learn/best-laptop-for-your-profession-kenya",
  kw: "best laptop for accountants in Kenya",
  secondary: ["best laptop for lawyers", "best laptop for digital marketers", "best laptop for software developers kenya", "laptop for photoshop", "laptop for many browser tabs"],
  h1: "The best laptop for your profession in Kenya: accountants, lawyers, developers and more",
  title: "Best Laptop for Accountants, Lawyers & Developers (Kenya)",
  related: ["/best/business-laptops-kenya", "/best/laptops-for-programming-kenya", "/learn/best-laptops-for-autocad-and-revit-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf, recency } = x;
    if (L.length < 50) return null;
    const pro = [
      ["Accountants", "Excel with large workbooks, accounting packages (QuickBooks, Sage, Tally), browser-based KRA iTax and banking portals.", "8th-gen or newer Core i5 / Ryzen 5, 8 GB RAM (16 GB for very large workbooks), SSD. A 15.6-inch screen with a number pad speeds up data entry.", (r) => (r.sp.tier || 0) >= 3 && recency(r.sp) >= 3 && r.price <= 60000],
      ["Lawyers and consultants", "Word, PDFs, email, research databases and video calls, often away from the desk.", "8th-gen or newer Core i5, 8 GB RAM, a light 13–14-inch laptop with a comfortable keyboard and good battery.", (r) => (r.sp.tier || 0) >= 3 && recency(r.sp) >= 3 && /-(x2\d0|x3\d0|x13|t4\d0s|t14s|830|835|1030|1040|7390|7400|7410|7300)-/.test(`-${r.slug}-`)],
      ["Digital marketers and heavy browser users", "Dozens of browser tabs, Canva, social media tools, spreadsheets and video calls at the same time.", "16 GB RAM matters most here (browsers use a lot of memory), with an 8th-gen or newer Core i5 or better.", (r) => r.sp.ram >= 16 && recency(r.sp) >= 3 && r.price <= 70000],
      ["Software developers", "Code editors, browsers, Docker or virtual machines, local databases.", "16 GB RAM (32 GB for many containers or VMs), a 10th-gen or newer Core i5/i7 or Ryzen 5/7, 512 GB SSD.", (r) => r.sp.ram >= 16 && recency(r.sp) >= 4 && (r.sp.tier || 0) >= 3 && r.price <= 120000],
      ["Graphic designers (Photoshop, Illustrator)", "Adobe apps with large files and layers.", "Adobe lists 8 GB RAM as the minimum and 16 GB as recommended for Photoshop, with a GPU that supports DirectX 12. Choose 16 GB, an 11th-gen or newer processor (stronger built-in graphics) or a dedicated GPU, and a good IPS screen.", (r) => r.sp.ram >= 16 && (r.sp.gpu || recency(r.sp) >= 5) && r.price <= 150000],
    ];
    const sections = pro.map(([who, does, needs, f]) => {
      const rs = L.filter(f);
      const c = cheapestOf(rs);
      return { heading: `Best laptop for ${who.replace(/^\w/, (m) => m.toLowerCase())}`, body: `**What the work involves:** ${does}\n\n**What to buy:** ${needs}\n\n${rs.length ? `**In stock (${rs.length} match, from ${ksh(c.price)}), best specified first:**\n\n${pickList(x, rs, 5)}` : "None in stock right now; ask us on WhatsApp."}` };
    });
    return {
      intro: `The best laptop for accountants in Kenya, and for most office professions, is an 8th-gen or newer Core i5 business laptop with 8–16 GB RAM and an SSD; developers, designers and heavy browser users should start at 16 GB RAM. Below: what each profession's software needs, and the laptops in stock that meet it, with live prices (${asOf}). Engineers and architects using AutoCAD or Revit have their own guide.`,
      description: `The best laptop for accountants, lawyers, digital marketers, developers and designers in Kenya: what each job's software needs, with live picks and prices.`,
      sections: [
        ...sections,
        { heading: "Engineers and architects", body: `AutoCAD, Revit and other 3D software need more: see ${link("the best laptops for AutoCAD and Revit", `${SITE}/learn/best-laptops-for-autocad-and-revit-kenya`)}.` },
        { heading: "Choosing within a profession", body: `- **Entry level:** 8th-gen Core i5, 8 GB, 256 GB SSD: documents, email, browser-based tools.\n- **Mid-range:** 10th–11th gen, 16 GB, 512 GB SSD: heavier multitasking, larger files, more years of use.\n- **Professional:** 12th gen or Core Ultra, 16–32 GB, dedicated GPU where the software uses one.\n\nMore help: ${link("the laptop buying guide", `${SITE}/learn/laptop-buying-guide-kenya`)}, ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)} and ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "What is the best laptop for accountants in Kenya?", answer: "An 8th-gen or newer Core i5 business laptop with 8 GB RAM (16 GB for very large Excel files) and an SSD; a 15.6-inch model adds a number pad. Most desktop accounting software runs on Windows." },
        { question: "Which laptop is best for a lawyer?", answer: "A light 13–14-inch business laptop (such as a ThinkPad X-series or T14s, or an EliteBook 830/840) with an 8th-gen or newer Core i5, 8 GB RAM and a comfortable keyboard." },
        { question: "Which laptop is best for running many browser tabs?", answer: "One with 16 GB RAM: browsers use a lot of memory, so RAM matters more than processor speed for heavy tab use." },
        { question: "Which laptop is best for software developers?", answer: "16 GB RAM (32 GB for containers or virtual machines), a 10th-gen or newer Core i5/i7 or Ryzen 5/7, and a 512 GB SSD." },
        { question: "What laptop do I need for Photoshop?", answer: "Adobe recommends 16 GB RAM and a GPU that supports DirectX 12. An 11th-gen or newer processor with Iris Xe graphics, or a laptop with a dedicated GPU, handles it well." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "autocad-revit",
  path: "/learn/best-laptops-for-autocad-and-revit-kenya",
  kw: "best laptop for AutoCAD in Kenya",
  secondary: ["laptop for revit", "laptop for civil engineering students", "laptop for architects kenya", "autocad laptop requirements"],
  h1: "The best laptops for AutoCAD and Revit in Kenya (architects and engineers)",
  title: "Best Laptops for AutoCAD and Revit in Kenya: Live Prices",
  related: ["/best/laptops-for-graphic-design-and-video-editing-kenya", "/best/gaming-laptops-kenya", "/learn/best-laptop-for-your-profession-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf, recency, tableMd } = x;
    // Windows only (Revit has no macOS version).
    const cad = L.filter((r) => x.brandOf(r.slug) !== "Apple" && r.sp.ram >= 16 && (r.sp.gpu || (recency(r.sp) >= 5 && (r.sp.tier || 0) >= 4)));
    const gpuCad = cad.filter((r) => r.sp.gpu).sort((a, b) => a.price - b.price);
    const ws = L.filter((r) => /-(zbook|precision|thinkpad-p\d|p\d{2}s?)-/.test(`-${r.slug}-`));
    if (cad.length < 6) return null;
    const tier = (lo, hi) => cad.filter((r) => r.price > lo && r.price <= hi);
    const best = (rs) => [...rs].sort((a, b) => b.score - a.score || a.price - b.price)[0];
    const cell = (r) => (r ? `${link(r.short, `${SITE}/item/${r.slug}`)} – ${ksh(r.price)}` : "none in stock");
    return {
      intro: `The best laptop for AutoCAD in Kenya has at least 16 GB RAM, a recent processor with strong single-core speed, and a dedicated graphics card (or at minimum strong built-in graphics); Revit needs the same with more memory. Autodesk's published requirements for recent versions list 8 GB RAM as the minimum for AutoCAD (with more recommended) and 16 GB as the minimum for Revit. ${cad.length} laptops in stock meet that bar (${asOf}).`,
      description: `Laptops for AutoCAD and Revit in Kenya: what Autodesk's software needs (RAM, GPU, processor), with ${cad.length} qualifying laptops in stock and live prices.`,
      sections: [
        { heading: "What AutoCAD and Revit need", body: tableMd(["", "AutoCAD (2D and light 3D)", "Revit (BIM, 3D)"], [
          ["RAM", "8 GB minimum; 16–32 GB recommended", "16 GB minimum; 32 GB for large models"],
          ["Processor", "Fast cores matter most (high clock speed)", "Fast cores; more cores help rendering"],
          ["Graphics", "A DirectX 11/12 GPU; dedicated recommended for 3D", "Dedicated GPU with 4 GB+ video memory recommended"],
          ["Storage", "SSD", "SSD, 512 GB or more (projects grow fast)"],
          ["Operating system", "Windows (64-bit); there's a separate AutoCAD for Mac", "Windows only"],
        ]) + "\n\nRequirements change with each version: check Autodesk's system requirements page for the exact version your course or office uses." },
        { heading: "Recommended laptops in stock", body: `${cad.length} Windows laptops in stock have 16 GB RAM or more and a dedicated GPU (or a 12th-gen/Core Ultra class processor with strong integrated graphics).${gpuCad.length ? ` The ${gpuCad.length} with a dedicated graphics card are the best fit for 3D and Revit; cheapest first:\n\n${gpuCad.slice(0, 8).map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)}${x.specLine(r.sp) ? ` (${x.specLine(r.sp)})` : ""}`).join("\n")}` : `\n\n${pickList(x, cad, 8)}`}` },
        { heading: "By budget", body: tableMd(["Budget", "Qualifying laptops", "Best specified"], [[0, 70000, "Up to KSh 70,000"], [70000, 120000, "KSh 70,001–120,000"], [120000, 10000000, "Over KSh 120,000"]].map(([lo, hi, l]) => [l, String(tier(lo, hi).length), cell(best(tier(lo, hi)))])) },
        { heading: "Mobile workstations", body: ws.length ? `Workstation lines (HP ZBook, Dell Precision, ThinkPad P) have professional graphics certified for CAD software. ${ws.length} are in stock, from ${ksh(cheapestOf(ws).price)}: see ${link("HP ZBook laptops", `${SITE}/series/zbook-kenya`)}.` : "Workstation lines (HP ZBook, Dell Precision, ThinkPad P) have professional graphics certified for CAD software; ask us on WhatsApp for current stock." },
        { heading: "For students: civil engineering and architecture", body: `First-year students mostly draw in 2D AutoCAD; an 8th-gen or newer Core i5/i7 with 16 GB RAM is enough to start. From the second year, Revit and 3D modelling make a dedicated GPU worth it. Avoid MacBooks if your course uses Revit (Windows only). See also ${link("best laptops for students", `${SITE}/student-laptops-kenya`)}.` },
        { heading: "Gaming laptops for CAD?", body: `Gaming laptops (HP Victus and OMEN, Lenovo Legion) have the GPU, RAM and cooling CAD needs, often for less than a workstation; they're heavier and louder. Compare in ${link("gaming laptops", `${SITE}/best/gaming-laptops-kenya`)} and ${link("laptops for design and video editing", `${SITE}/best/laptops-for-graphic-design-and-video-editing-kenya`)}.` },
      ],
      faq: [
        { question: "What is the best laptop for AutoCAD in Kenya?", answer: `One with 16 GB RAM, a recent fast processor and a dedicated GPU.${gpuCad.length ? ` ${gpuCad.length} such laptops are in stock; the most affordable is the ${gpuCad[0].short} at ${ksh(gpuCad[0].price)} (${asOf}).` : ""}` },
        { question: "How much RAM do I need for Revit?", answer: "Autodesk lists 16 GB as the minimum for recent Revit versions; 32 GB is better for large models." },
        { question: "Can I run Revit on a MacBook?", answer: "Not natively: Revit is Windows-only. AutoCAD has a Mac version, but many courses and offices use the Windows version." },
        { question: "Which laptop should a civil engineering student buy?", answer: "An 8th-gen or newer Core i5/i7 with 16 GB RAM for first-year AutoCAD; a dedicated GPU from the second year if you'll use Revit or 3D software." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "macbook-guide",
  path: "/learn/macbook-buying-guide-kenya",
  kw: "which MacBook to buy",
  secondary: ["macbook air vs macbook pro", "macbook air m1 vs m2", "is 8gb ram enough for macbook", "refurbished macbook kenya", "can macbook run windows apps"],
  h1: "Which MacBook should you buy? MacBook Air vs Pro, M1 to M5",
  title: "Which MacBook to Buy: Air vs Pro, M1 to M5 (Kenya)",
  related: ["/laptops/macbook-price-kenya", "/compare/macbook-vs-windows-laptops-kenya", "/student-laptops-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, tableMd } = x;
    const mac = L.filter((r) => x.brandOf(r.slug) === "Apple" && /macbook/.test(r.slug));
    if (mac.length < 5) return null;
    const air = mac.filter((r) => /-air-/.test(`-${r.slug}-`));
    const pro = mac.filter((r) => /-pro-/.test(`-${r.slug}-`));
    return {
      intro: `Which MacBook to buy: for most people a MacBook Air with an Apple chip (M1 or newer) and 16 GB of memory if your budget allows; choose a MacBook Pro for long video, music or software builds that need its fans and extra performance. At ECB Technologies, MacBook Airs start at ${air.length ? ksh(cheapestOf(air).price) : "n/a"} and MacBook Pros at ${pro.length ? ksh(cheapestOf(pro).price) : "n/a"} (${asOf}); every model and price is on ${link("MacBook prices in Kenya", `${SITE}/laptops/macbook-price-kenya`)}.`,
      description: `Which MacBook to buy in Kenya: Air vs Pro, M1 vs M2 and newer chips, 8 GB vs 16 GB, Windows apps, battery life, and checks before buying a used MacBook.`,
      sections: [
        { heading: "MacBook Air or MacBook Pro?", body: tableMd(["", "MacBook Air", "MacBook Pro"], [
          ["Best for", "Students, office work, travel, light creative work", "Video and music production, long code builds, heavy creative work"],
          ["Cooling", "No fan: silent, but slows down under long heavy loads", "Fans: sustains full speed for long tasks"],
          ["Screen", "13.6 or 15.3-inch (recent models)", "14 or 16-inch, brighter, 120 Hz ProMotion"],
          ["Ports", "2 × USB-C/Thunderbolt + MagSafe on recent models", "More ports, including HDMI and SD card on 14/16-inch"],
          ["In stock", air.length ? `${air.length}, from ${ksh(cheapestOf(air).price)}` : "none now", pro.length ? `${pro.length}, from ${ksh(cheapestOf(pro).price)}` : "none now"],
        ]) },
        { heading: "M1, M2, M3 and newer: what changes", body: `Every Apple-chip MacBook (M1 from late 2020 onwards) is fast, cool and efficient; each newer generation is faster, with better graphics. An M1 MacBook Air is still a capable laptop in 2026 for study and office work, and it runs current macOS. M2 brought a redesigned Air (thinner, larger screen, MagSafe charging); later chips add speed and better external display support. Avoid Intel-based MacBooks (2020 and earlier) unless very cheap: they're slower and are dropping out of new macOS versions.` },
        { heading: "8 GB or 16 GB?", body: `8 GB is enough for browsing, Office, Zoom and light photo editing on an Apple-chip MacBook. Choose 16 GB for video editing, programming, or if you keep the laptop for many years: memory can't be upgraded after purchase, and newer MacBooks start at 16 GB.` },
        { heading: "Can a MacBook run Windows apps and Microsoft Office?", body: `Microsoft Office runs natively on macOS (Word, Excel, PowerPoint, Outlook, Teams). Windows-only programs are harder: Apple-chip MacBooks can't use Boot Camp, so you need virtualisation software that runs an Arm version of Windows, and some programs (many engineering tools, some accounting packages, Revit) won't run well or at all. Check your software first; see ${link("MacBook vs Windows laptops", `${SITE}/compare/macbook-vs-windows-laptops-kenya`)}.` },
        { heading: "Battery life", body: `Apple quotes up to 15–18 hours of video playback for recent MacBook Airs (by model); real-world mixed use is lower but often a full working day. On a used MacBook, check battery health: Apple menu → System Settings → Battery → Battery Health, and the cycle count in System Information → Power.` },
        { heading: "Before buying a used or refurbished MacBook", body: `1. **Activation Lock:** the seller must sign out of iCloud and turn off Find My; a locked MacBook can't be used.\n2. **Management (MDM):** no "remote management" screen during setup (it means it's still controlled by a company).\n3. **Battery:** health and cycle count (above).\n4. **Model and chip:** Apple menu → About This Mac should match the listing.\n5. **Keyboard, ports, screen and speakers:** test them all.\n\nThe general list: ${link("how to check a used laptop", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
        { heading: "MacBooks in stock", body: `${pickList(x, mac, 8)}\n\nMedian MacBook price: ${ksh(median(mac.map((r) => r.price)))} (${asOf}).` },
      ],
      faq: [
        { question: "Is a MacBook Air M1 still worth buying in 2026?", answer: "Yes, for study and office work at the right price: it's fast, silent and runs current macOS. Prefer 16 GB of memory if you'll keep it for years." },
        { question: "Is the MacBook Air M2 better than the M1?", answer: "Yes: it's faster, has a larger screen and a newer design with MagSafe charging. The M1 is the better value if the price gap is large." },
        { question: "Is 8GB RAM enough for a MacBook?", answer: "For browsing, Office and video calls, yes. Choose 16 GB for video editing, programming or many years of use, because it can't be upgraded later." },
        { question: "Which MacBook is best for university students?", answer: "A MacBook Air with an Apple chip, if your course software runs on macOS. Engineering and architecture students using Revit or other Windows-only software should choose a Windows laptop." },
        { question: "How long does a MacBook battery last?", answer: "Apple quotes up to 15–18 hours of video playback for recent MacBook Airs; real mixed use is less but often a full working day. Check battery health and cycle count on a used one." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "windows-software",
  path: "/learn/windows-11-and-laptop-software-kenya",
  kw: "Windows 10 or Windows 11 laptop",
  secondary: ["genuine windows 11 licence price kenya", "how to check windows is genuine", "laptop without operating system", "linux vs windows for programming", "microsoft office on chromebook", "microsoft office on macbook"],
  h1: "Windows 10 or Windows 11? Licences, Office and laptop software explained",
  title: "Windows 10 or 11 Laptop? A Guide to Licences and Office",
  related: ["/learn/laptop-processor-generations-kenya", "/learn/refurbished-vs-used-laptops-kenya", "/learn/macbook-buying-guide-kenya"],
  write(x) {
    const { P, ksh, link, SITE, asOf } = x;
    const find = (re) => P.find((p) => re.test(p.slug));
    const win = find(/^windows-11-pro/);
    const office = find(/^microsoft-office-20/);
    if (!P || P.length < 50) return null;
    return {
      intro: `Windows 10 or Windows 11 laptop: buy Windows 11. Windows 10 reached the end of support on 14 October 2025, so it no longer gets regular free security updates. Windows 11 officially needs an 8th-gen Intel (or Ryzen 2000-series) processor or newer, TPM 2.0 and Secure Boot. ${win ? `A genuine Windows 11 Pro licence costs ${ksh(win.price)} at ECB Technologies` : "Ask us for genuine Windows licences"}${office ? `, and Microsoft Office 2021 ${ksh(office.price)}` : ""} (${asOf}).`,
      description: `Windows 10 or 11 on a laptop in Kenya: Windows 11 requirements, genuine licence prices and checks, laptops without an OS, Office on Mac and Chromebook, Linux for coding.`,
      sections: [
        { heading: "Windows 10 or Windows 11?", body: `Windows 10's support ended on 14 October 2025 ([Microsoft](https://www.microsoft.com/en-us/windows/end-of-support)). A Windows 10 laptop still works, but without regular security updates it's riskier for banking, M-Pesa web portals and work email. Buy a laptop that runs Windows 11: 8th-gen Intel or newer (see ${link("processor generations explained", `${SITE}/learn/laptop-processor-generations-kenya`)}).` },
        { heading: "Can an old laptop run Windows 11?", body: `Officially, only with an 8th-gen or newer Intel processor (a few 7th-gen exceptions), an AMD Ryzen 2000-series or newer, TPM 2.0 and Secure Boot ([Windows 11 specifications](https://www.microsoft.com/en-us/windows/windows-11-specifications)). Run Microsoft's PC Health Check app to see whether a laptop qualifies. Installing it on unsupported hardware is possible with workarounds, but Microsoft doesn't support it and updates aren't guaranteed. A Core i3 runs Windows 11 if it's 8th gen or newer.` },
        { heading: "Genuine licences: price and how to check", body: `${win ? `**Price:** ${link(win.short, `${SITE}/item/${win.slug}`)} costs ${ksh(win.price)}${office ? `; ${link(office.short, `${SITE}/item/${office.slug}`)} costs ${ksh(office.price)}` : ""} (${asOf}).\n\n` : ""}**Check activation:** Settings → System → Activation should say "Windows is activated" (often "with a digital license" on laptops that came with Windows). A watermark saying "Activate Windows", or a request for a product key, means it isn't activated.\n\n**Warning signs:** very cheap keys sold online, or activation tools downloaded from the internet, aren't genuine and can carry malware.` },
        { heading: "Laptops without an operating system", body: `A laptop sold without an OS can save money if you already own a licence or will use Linux. Otherwise add the cost of a Windows licence to the price before comparing. Most business laptops that originally shipped with Windows 10 or 11 reactivate automatically after a clean install, because the licence is tied to the hardware.` },
        { heading: "Installing Windows on a refurbished laptop", body: `Use Microsoft's Media Creation Tool to make a USB installer, boot from it (F12 on Dell and Lenovo, F9 on HP for the boot menu), and choose "I don't have a product key" if the laptop had Windows before: it usually activates itself once online. Back up first; a clean install erases the drive.` },
        { heading: "Microsoft Office on Windows, Mac and Chromebook", body: `- **Windows:** every edition of Office runs.\n- **MacBook:** Office for Mac (Word, Excel, PowerPoint, Outlook) runs natively; a few Excel features (some add-ins, Power Pivot) are Windows-only.\n- **Chromebook:** only the web versions (Office on the web) through the browser; desktop Office can't be installed.\n\nFor Office work, any 8th-gen or newer Core i5 with 8 GB RAM is plenty: see ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}.` },
        { heading: "Linux or Windows for programming?", body: `Linux is excellent for web and backend development, servers and data work, and runs well on older ThinkPads and EliteBooks. Windows includes WSL (Windows Subsystem for Linux), so you can run Linux tools without leaving Windows, and it's needed for .NET desktop, some games and Windows-only tools. Many developers use Windows with WSL, or dual-boot. See ${link("laptops for programming", `${SITE}/best/laptops-for-programming-kenya`)}.` },
      ],
      faq: [
        { question: "Should I buy a laptop with Windows 10 or Windows 11?", answer: "Windows 11. Windows 10 support ended on 14 October 2025, so it no longer gets regular free security updates." },
        { question: "How much does a genuine Windows 11 licence cost in Kenya?", answer: win ? `Windows 11 Pro costs ${ksh(win.price)} at ECB Technologies (${asOf}).` : "Ask us on WhatsApp for current licence prices." },
        { question: "How do I know if my Windows licence is genuine?", answer: "Settings → System → Activation should say Windows is activated. An 'Activate Windows' watermark or a request for a product key means it isn't." },
        { question: "Can I run Microsoft Excel on a Chromebook?", answer: "Only the web version through the browser; the desktop version can't be installed on ChromeOS." },
        { question: "Can I use a MacBook for Microsoft Office?", answer: "Yes: Office for Mac runs natively. A few advanced Excel features and some add-ins are Windows-only." },
        { question: "Is Linux better than Windows for programming?", answer: "For web, backend and server work, Linux is excellent. Windows with WSL runs Linux tools too, and is needed for some Windows-only development." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "screen-build",
  path: "/learn/laptop-screen-and-build-quality-guide",
  kw: "HD vs Full HD laptop screen",
  secondary: ["ips vs tn display", "best laptop screen size for work", "aluminium vs plastic laptop", "laptops with strongest build quality"],
  h1: "Laptop screens and build quality: HD vs Full HD, IPS vs TN, metal vs plastic",
  title: "HD vs Full HD Laptop Screens, IPS vs TN & Build Quality",
  related: ["/learn/laptop-buying-guide-kenya", "/learn/touchscreen-laptop-worth-it-kenya", "/best/business-laptops-kenya"],
  write(x) {
    const { L, link, SITE, tableMd } = x;
    if (L.length < 50) return null;
    return {
      intro: `HD vs Full HD laptop screen: choose Full HD (1920×1080) on any laptop 13 inches or larger; HD (1366×768) looks grainy and fits less on screen. Prefer an IPS panel over TN for colour and viewing angles, 300 nits or more if you work near windows, and 14 inches for most work. For build quality, business lines (ThinkPad, EliteBook, Latitude) are the toughest, and many are tested against MIL-STD-810 durability standards.`,
      description: `Laptop screens explained (HD, Full HD, 4K, IPS vs TN, brightness, size) and build quality (aluminium vs plastic, toughest laptop lines), for buyers in Kenya.`,
      sections: [
        { heading: "Resolution: HD, Full HD, QHD and 4K", body: tableMd(["Resolution", "Pixels", "Verdict"], [
          ["HD", "1366×768", "Grainy on 13–15-inch screens; fits less. Only on very cheap laptops"],
          ["Full HD (FHD)", "1920×1080", "The standard: sharp and fits two windows side by side"],
          ["QHD / 2.5K / 3K", "2560×1440 and up", "Sharper text; good for design; uses a little more battery"],
          ["4K (UHD)", "3840×2160", "Sharpest; for photo and video work; shortest battery life"],
        ]) + "\n\nListings often don't say the resolution: ask, or check Settings → System → Display → Display resolution on the laptop." },
        { heading: "IPS vs TN vs OLED", body: "- **IPS:** good colours and viewing angles; the standard on most business laptops from 2018 on.\n- **TN:** older, cheaper panels; colours wash out when you tilt the screen. Avoid if you can.\n- **OLED:** deep blacks and vivid colour, on newer premium models; great for media and design.\n\nA quick test: tilt the screen and look from the side. If the colours invert or fade, it's TN." },
        { heading: "Brightness", body: "Brightness is measured in nits: about 250 is fine indoors, 300–400+ is better near windows, outdoors or under bright office lights. Matte screens reflect less than glossy touchscreens." },
        { heading: "Best screen size for work", body: tableMd(["Size", "Best for"], [["13.3 inch", "Carrying all day: lawyers, consultants, students"], ["14 inch", "The best balance for most office work"], ["15.6 inch", "Spreadsheets, accounting (number pad), design; mostly at a desk"]]) + `\n\nFor long desk work, add an external monitor: see the ${link("laptop accessories guide", `${SITE}/learn/laptop-accessories-guide-kenya`)}.` },
        { heading: "Aluminium vs plastic", body: "Aluminium and magnesium bodies feel stiffer, flex less and stay cooler to the touch; quality plastic (like on many ThinkPads) is light and doesn't dent. Material matters less than design: a well-built plastic business laptop outlasts a thin consumer laptop with a metal lid. Check for flex: press the keyboard deck and twist the lid gently." },
        { heading: "Which laptops have the strongest build", body: `Business lines are built for years of daily carrying: Lenovo ThinkPad, HP EliteBook and ZBook, and Dell Latitude. Many of their models are tested against MIL-STD-810 (the US military's durability tests for drops, vibration and temperature); check the specific model's spec sheet. They also have spill-resistant keyboards on many models and are easy to repair in Nairobi. Browse ${link("business laptops", `${SITE}/best/business-laptops-kenya`)} or read ${link("ThinkPad", `${SITE}/learn/thinkpad-models-explained`)}, ${link("EliteBook", `${SITE}/learn/hp-elitebook-models-explained`)} and ${link("Latitude", `${SITE}/learn/dell-latitude-models-explained`)} explained.` },
      ],
      faq: [
        { question: "What is the difference between HD, Full HD and 4K laptop screens?", answer: "Resolution: HD is 1366×768, Full HD 1920×1080 and 4K 3840×2160. Full HD is the sensible standard on 13–15-inch laptops." },
        { question: "Is an IPS display better than TN?", answer: "Yes for most people: IPS has better colours and viewing angles. TN panels are older and wash out when tilted." },
        { question: "What is the best laptop screen size for work?", answer: "14 inches for most people; 13.3 inches if you carry it all day; 15.6 inches for spreadsheets and design at a desk." },
        { question: "Are aluminium laptops better than plastic laptops?", answer: "Aluminium feels stiffer and premium, but a well-designed plastic business laptop (like many ThinkPads) can be just as durable and is lighter." },
        { question: "Which laptops have the strongest build quality?", answer: "Business lines: Lenovo ThinkPad, HP EliteBook and ZBook, and Dell Latitude. Many models are tested against MIL-STD-810 durability standards." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "accessories",
  path: "/learn/laptop-accessories-guide-kenya",
  kw: "laptop accessories guide",
  secondary: ["can i charge my laptop with usb-c", "laptop charger compatibility", "connect laptop to two monitors", "connect laptop to tv", "do i need a cooling pad", "best wireless mouse for laptop"],
  h1: "Laptop accessories guide: chargers, USB-C, monitors, docks and more",
  title: "Laptop Accessories Guide: Chargers, USB-C and Monitors",
  related: ["/learn/laptop-buying-guide-kenya", "/learn/laptop-battery-and-overheating-fixes", "/best/business-laptops-kenya"],
  write(x) {
    const { P, ksh, link, SITE, asOf } = x;
    if (!P || P.length < 50) return null;
    const mice = P.filter((p) => /mouse/.test(p.slug) && !/pad/.test(p.slug)).sort((a, b) => a.price - b.price);
    const seen = new Set();
    const uniq = (rs) => rs.filter((r) => { const k = `${r.short}|${r.price}`; return seen.has(k) ? false : (seen.add(k), true); });
    const mons = uniq(P.filter((p) => /(odyssey|ultragear|viewfinity|monitor|-\d{2}-(?:inch-)?(?:fhd|qhd|wqhd|4k|ips|va|curved)|\d{2,3}hz)/.test(p.slug) && !/arm|mount|stand|laptop|bracket/.test(p.slug) && p.price > 8000)).sort((a, b) => a.price - b.price);
    const arms = P.filter((p) => /(monitor-arm|laptop-mount|monitor-arms)/.test(p.slug));
    const ups = P.filter((p) => /-ups-|va-/.test(p.slug) && !/laptop/.test(p.slug));
    const li = (rs, n) => rs.slice(0, n).map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)}`).join("\n");
    return {
      intro: `A laptop accessories guide in one line: match chargers by connector, voltage and wattage (never just by shape); USB-C charging works only if the laptop supports USB-C Power Delivery; and for two monitors you need two video outputs or a dock the laptop supports. Below: chargers, USB-C, monitors, docks, cooling pads, mice and bags, with the accessories ECB Technologies stocks and their prices (${asOf}).`,
      description: `Laptop accessories explained: charger compatibility, USB-C charging, external monitors, two-monitor setups, docks, TV connection, cooling pads, mice and bags.`,
      sections: [
        { heading: "Chargers: what makes one compatible", body: "Three things must match the laptop:\n\n1. **Connector:** HP uses 4.5 mm (blue tip) and 7.4 mm barrel plugs on older models and USB-C on newer ones; Dell uses 4.5 mm and 7.4 mm barrels or USB-C; Lenovo uses the rectangular \"slim tip\" or USB-C.\n2. **Voltage:** usually 19–20 V on barrel chargers; it must match.\n3. **Wattage:** equal to or higher than the original (45 W, 65 W, 90 W…). A lower-wattage charger charges slowly or not at all, and may trigger a warning at startup.\n\nThe label under the laptop and on the original charger lists all three. An original or good-quality charger protects the battery; very cheap ones can overheat." },
        { heading: "Can I charge my laptop with USB-C?", body: "Only if its USB-C port supports **USB Power Delivery (PD)**: many laptops from about 2018 on do (look for a charging symbol by the port, or check the spec sheet). Use a PD charger with enough wattage (usually 65 W for business laptops; 45 W charges slowly). A phone charger may not be enough. Older laptops with a barrel charger can't charge over USB-C even if they have the port." },
        { heading: "External monitors", body: `A 24–27-inch monitor makes long work far easier. Connect by HDMI (most laptops), USB-C/Thunderbolt with DisplayPort (one cable on many newer laptops), or DisplayPort.\n\n${mons.length ? `Monitors in stock (${mons.length}, from ${ksh(mons[0].price)}):\n\n${li(mons, 6)}` : "Ask us on WhatsApp for current monitors."}${arms.length ? `\n\nMonitor arms and laptop mounts (${arms.length}) from ${ksh(Math.min(...arms.map((a) => a.price)))} free up desk space.` : ""}` },
        { heading: "Can I connect two monitors to one laptop?", body: "Yes, if the laptop has two video outputs (for example HDMI plus USB-C/Thunderbolt with DisplayPort), or through a dock. Notes:\n\n- **Windows** laptops with Thunderbolt or DisplayPort over USB-C often drive two screens from one port through a dock (DisplayPort MST).\n- **MacBook Air (M1/M2)** supports only one external display natively; Pro models and newer chips support more.\n- Check the laptop's spec sheet for \"supports up to N displays\"." },
        { heading: "Docking stations", body: "A dock connects monitors, keyboard, network and power with one cable. Buy one that matches the laptop's port (Thunderbolt, USB-C with DisplayPort, or the maker's own dock connector on older business models) and supplies enough charging power. Docks are not universal: check the laptop maker's compatibility list." },
        { heading: "Connecting a laptop to a TV", body: "Use an HDMI cable (laptop HDMI port, or a USB-C to HDMI adapter) and choose the TV's HDMI input; press Windows + P to pick Duplicate or Extend. Wirelessly, many smart TVs accept Miracast (Windows: Windows + K) or casting from Chrome." },
        { heading: "Do you need a cooling pad?", body: `For gaming laptops, long video calls or editing in hot rooms, a cooling pad helps keep temperatures and fan noise down. For office work on a hard desk, usually not: cleaning the vents does more. See ${link("laptop overheating fixes", `${SITE}/learn/laptop-battery-and-overheating-fixes`)}.` },
        { heading: "Mouse, keyboard and bag", body: `${mice.length ? `Wireless mice in stock from ${ksh(mice[0].price)}:\n\n${li(mice, 4)}\n\n` : ""}A wireless mouse with a USB receiver works on any laptop; Bluetooth mice save a USB port. For bags, choose a padded laptop compartment that fits your screen size (14 or 15.6 inches), water resistance for the rainy season, and comfortable straps; students carrying a laptop daily benefit most from padding.${ups.length ? `\n\nFor desktops and monitors at home or the office, a UPS protects against power cuts: ${ups.length} UPS models are in stock.` : ""}` },
      ],
      faq: [
        { question: "Which laptop charger is compatible with HP laptops?", answer: "One with the same connector (4.5 mm blue tip, 7.4 mm or USB-C), the same voltage and the same or higher wattage as the original. Check the label under the laptop." },
        { question: "Can I charge my laptop using USB-C?", answer: "Only if its USB-C port supports USB Power Delivery. Use a PD charger with enough wattage, usually 65 W for business laptops." },
        { question: "Can I connect two monitors to one laptop?", answer: "Yes, with two video outputs (such as HDMI plus USB-C/DisplayPort) or a compatible dock. Older MacBook Airs support only one external display." },
        { question: "How do I connect a laptop to a TV?", answer: "With an HDMI cable (or USB-C to HDMI adapter), then Windows + P to choose Duplicate or Extend; or wirelessly with Miracast or casting." },
        { question: "Do I need a cooling pad for my laptop?", answer: "For gaming and heavy work in warm rooms, it helps. For office work on a hard surface, cleaning the vents usually matters more." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "buy-safely",
  path: "/learn/buying-a-laptop-safely-kenya",
  kw: "buy a laptop online in Kenya safely",
  secondary: ["pay for laptop with mpesa", "laptop warranty kenya", "verify laptop serial number", "ex-uk vs brand new laptop", "laptop with replaced battery", "negotiate laptop price kenya"],
  h1: "How to buy a laptop safely in Kenya: payment, warranty and checks",
  title: "How to Buy a Laptop Safely in Kenya: Payment & Warranty",
  related: ["/laptop-shop-nairobi", "/learn/refurbished-vs-used-laptops-kenya", "/learn/check-used-laptop-before-buying"],
  write(x) {
    const { L, ksh, link, SITE, PHONE, asOf } = x;
    if (L.length < 50) return null;
    const warr = L.filter((r) => /warranty/.test(r.slug)).length;
    return {
      intro: `To buy a laptop online in Kenya safely: buy from a seller with a physical shop you can visit, pay a business (a registered till or paybill, or on delivery) rather than a personal number, get the warranty in writing, and check the laptop's serial number and condition before paying. Here's how each step works, what to ask, and how ECB Technologies handles it.`,
      description: `Buying a laptop safely in Kenya: online vs shop, M-Pesa and payment safety, instalments, warranties, serial checks, ex-UK vs new, replaced batteries and negotiating.`,
      sections: [
        { heading: "Online or in a shop?", body: `Online is convenient and lets you compare prices; a shop lets you test the laptop before paying. The safest is both: an online shop with a physical address. ECB Technologies lists every price online and has a shop at Techmart Iconic Business Plaza, 3rd floor, room T12, Moi Avenue, Nairobi CBD (Monday to Saturday, 9am–7pm), where you can see any laptop first. See ${link("the shop page", `${SITE}/laptop-shop-nairobi`)} and ${link("delivery across Kenya", `${SITE}/delivery`)}.` },
        { heading: "Paying with M-Pesa safely", body: "- Pay to a **business till or paybill**, and check the business name M-Pesa shows before entering your PIN.\n- Be wary of sellers who ask you to send money to a personal number before you've seen the laptop.\n- Keep the M-Pesa confirmation and ask for a receipt that lists the laptop's model and serial number.\n- Never share your PIN or an M-Pesa code someone sends you.\n\nAt ECB Technologies, online orders can currently be paid on delivery; ask on WhatsApp about other payment options." },
        { heading: "Instalments", body: `Some sellers and lenders offer instalment or lipa-mdogo-mdogo plans. Before signing, compare the total you'll pay with the cash price, and read what happens if you miss a payment. Ask us on WhatsApp (${PHONE}) about current options rather than assuming they exist.` },
        { heading: "Warranty: what to expect", body: `New laptops come with the manufacturer's warranty (often one year). Refurbished and ex-UK laptops carry the seller's warranty, which varies: ask what it covers (battery? screen? keyboard?), for how long, and where repairs happen, and get it in writing on the receipt. At ECB Technologies, ${warr} listings state a one-year warranty in the product name; ask about the warranty on any other model before you buy.` },
        { heading: "Verify the serial number", body: "Read the serial (HP, Lenovo) or service tag (Dell) on the label underneath or in the BIOS, then enter it on the manufacturer's warranty check page: the model and specs shown should match the listing. Also confirm the serial in the BIOS matches the label, and that the receipt lists it." },
        { heading: "Ex-UK vs brand new", body: `Ex-UK means imported after use (usually in UK companies): cheaper, often a business model, but with wear and the seller's warranty. Brand new means unused with the manufacturer's warranty, at a higher price. More: ${link("refurbished vs used vs new laptops", `${SITE}/learn/refurbished-vs-used-laptops-kenya`)}.` },
        { heading: "A laptop with a replaced battery", body: "A replaced battery is fine, even good, if it's a quality part and the seller says so. Ask which brand it is and whether it's covered by the warranty, then check the battery report (`powercfg /batteryreport`): a new battery shows close to 100% of design capacity." },
        { heading: "Risks of buying without a warranty", body: `Without a warranty, any fault after you pay is your cost: a battery, screen or motherboard can cost a large share of the laptop's price. If there's no warranty, insist on testing everything first using ${link("the 12-point checklist", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
        { heading: "Negotiating and timing", body: `- Compare: our ${link("laptop price research", `${SITE}/research/laptop-prices-kenya`)} shows typical prices by brand, processor and budget, updated from live stock.\n- Ask what's included (bag, mouse, Office) as well as the price.\n- Paying in full and collecting yourself can help.\n- Demand rises around university intake; shopping earlier gives more choice.\n\nPrices on our product pages are the current prices (${asOf}).` },
      ],
      faq: [
        { question: "Can I pay for a laptop using M-Pesa in Kenya?", answer: "Most Kenyan shops accept M-Pesa. Pay to a business till or paybill and check the business name before entering your PIN. At ECB Technologies, online orders can currently be paid on delivery; ask on WhatsApp about other options." },
        { question: "Do laptop shops in Kenya offer instalment payments?", answer: "Some do, often through lenders. Compare the total cost with the cash price and read the terms. Ask us on WhatsApp about current options." },
        { question: "What warranty should I expect when buying a laptop?", answer: "New laptops usually have the manufacturer's warranty; refurbished and ex-UK laptops have the seller's. Ask what's covered and for how long, and get it on the receipt." },
        { question: "How do I verify a laptop's serial number?", answer: "Enter the serial or service tag from the label on the manufacturer's warranty check page and confirm the model and specs match; it should also match the serial in the BIOS." },
        { question: "Is it better to buy a laptop online or from a physical shop?", answer: "An online shop with a physical address gives both: prices to compare online and a place to test the laptop and return to if there's a problem." },
        { question: "How do I negotiate the price of a laptop in Kenya?", answer: "Compare prices first, ask what's included (bag, mouse, software), and be ready to pay in full and collect. Our price research shows typical prices by budget and brand." },
      ],
    };
  },
});

// ---------- Batch 4 (27 Nov 2026): the third 100 questions ----------
// See docs/seo/question-map-3.md.

const liveList = (x, rows, n = 6) => rows.slice(0, n).map((r) => `- ${x.link(r.short, `${x.SITE}/item/${r.slug}`)}: ${x.ksh(r.price)}${r.sp && x.specLine(r.sp) ? ` (${x.specLine(r.sp)})` : ""}`).join("\n");
const dedupe = (rs) => { const s = new Set(); return rs.filter((r) => { const k = `${r.short}|${r.price}`; return s.has(k) ? false : (s.add(k), true); }); };

ARTICLES.push({
  slug: "value-for-money",
  path: "/learn/best-value-laptops-kenya",
  kw: "best value for money laptop in Kenya",
  secondary: ["how much should i spend on a laptop", "best laptop for ksh 25000", "laptop for ksh 35000", "is a ksh 50000 laptop good for office work", "is it worth spending ksh 100000 on a laptop", "business laptop price kenya"],
  h1: "Best value for money laptops in Kenya: how much to spend and what you get",
  title: "Best Value for Money Laptops in Kenya: What to Spend",
  related: ["/best/best-laptops-under-30k-kenya", "/best/best-laptops-under-50k-kenya", "/learn/laptop-buying-guide-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, recency, tableMd } = x;
    if (L.length < 50) return null;
    const ok = L.filter((r) => r.score && r.price >= 15000);
    const perK = (r) => r.score / (r.price / 10000);
    const value = dedupe([...ok].filter((r) => recency(r.sp) >= 3).sort((a, b) => perK(b) - perK(a) || a.price - b.price));
    const at = (max) => { const rs = ok.filter((r) => r.price <= max && recency(r.sp) >= 3); return [...rs].sort((a, b) => b.score - a.score || a.price - b.price)[0]; };
    const biz = L.filter((r) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${r.slug}-`));
    const biz8 = biz.filter((r) => recency(r.sp) >= 3);
    const cell = (r) => (r ? `${link(r.short, `${SITE}/item/${r.slug}`)} – ${ksh(r.price)} (${x.specLine(r.sp)})` : "none in stock");
    return {
      intro: `The best value for money laptop in Kenya is usually an 8th-gen or newer business laptop (ThinkPad, EliteBook, Latitude) with a Core i5 or i7, 8–16 GB RAM and an SSD: they cost far less than new laptops of similar speed and last for years. For everyday use, plan on KSh 30,000–50,000; spend more only for a specific need (design, engineering, gaming, a newer generation). Below: the laptops in stock that give the most specs per shilling, and what each budget gets (${asOf}).`,
      description: `Best value laptops in Kenya: what KSh 25,000, 35,000, 50,000, 80,000 and 100,000 buys, the most specs per shilling in stock, and why some laptops cost less.`,
      sections: [
        { heading: "What each budget gets you", body: tableMd(["Budget", "Best specified in stock (8th gen or newer)"], [[0, 25000, "Up to KSh 25,000"], [25000, 35000, "KSh 25,001–35,000"], [35000, 50000, "KSh 35,001–50,000"], [50000, 80000, "KSh 50,001–80,000"], [80000, 100000, "KSh 80,001–100,000"], [100000, 120000, "KSh 100,001–120,000"]].map(([lo, m, l]) => [l, cell([...ok].filter((r) => r.price > lo && r.price <= m && recency(r.sp) >= 3).sort((a, b) => b.score - a.score || a.price - b.price)[0])])) + `\n\nFull lists: ${link("under KSh 25,000", `${SITE}/best/best-laptops-under-25k-kenya`)}, ${link("under KSh 30,000", `${SITE}/best/best-laptops-under-30k-kenya`)}, ${link("under KSh 40,000", `${SITE}/student-laptops-kenya`)}, ${link("under KSh 50,000", `${SITE}/best/best-laptops-under-50k-kenya`)}, ${link("under KSh 80,000", `${SITE}/best/best-laptops-under-80k-kenya`)}.` },
        { heading: "Laptops on offer", body: (() => {
          // Only products whose catalogue name says they're on offer (no invented deals).
          const offers = dedupe((x.P || []).filter((p) => /-on-offer-|-offer-|-promo-/.test(`-${p.slug}-`)).map((p) => ({ ...p, sp: x.specsOf ? x.specsOf(p.slug) : null })));
          return offers.length ? `Products currently marked as on offer in our catalogue:\n\n${offers.map((r) => `- ${link(r.short.replace(/[^\x20-\x7E’”–]+/g, "").replace(/\s*ON OFFER\s*/i, " ").replace(/\s+/g, " ").trim(), `${SITE}/item/${r.slug}`)}: ${ksh(r.price)}`).join("\n")}\n\nOffers change; the product page always shows the current price.` : "No products are marked as on offer right now; the product pages always show current prices.";
        })() },
        { heading: "The most specs per shilling right now", body: `Ranked by our spec score (processor, generation, RAM, storage) divided by price, 8th gen or newer only:\n\n${liveList(x, value, 8)}\n\nHow the score works is explained on every ${link("guide page", `${SITE}/guides`)}.` },
        { heading: "How much should you spend for everyday use?", body: `- **KSh 25,000–35,000:** 8th-gen Core i5 business laptops: documents, browsing, online classes, Zoom.\n- **KSh 35,000–50,000:** the sweet spot: 8th–10th gen, often 16 GB RAM or a 512 GB SSD, touchscreens and slimmer models. A KSh 50,000 laptop is more than enough for office work.\n- **KSh 50,000–80,000:** 10th–11th gen, 16 GB, premium business models (T14s, EliteBook 840 G7/G8): faster and longer-lasting.\n- **KSh 100,000+:** worth it for design, engineering, gaming (dedicated GPU), the newest Core Ultra chips, or a MacBook. For office work alone, it's more than you need.` },
        { heading: "Why are some laptops cheaper than others?", body: `- **Generation:** each newer generation costs more; 8th gen is the best-value Windows 11 entry point.\n- **Line:** business lines cost more new but are excellent value once a few years old.\n- **RAM, SSD, screen:** 16 GB, larger SSDs, touchscreens and higher-resolution screens all add cost.\n- **Graphics:** a dedicated GPU adds a lot.\n- **Condition and warranty:** new, refurbished and used laptops of the same model are priced differently.\n\nSee ${link("refurbished vs used vs new laptops", `${SITE}/learn/refurbished-vs-used-laptops-kenya`)} and ${link("laptop prices in Kenya", `${SITE}/research/laptop-prices-kenya`)}.` },
        { heading: "Buying on a tight budget: what to prioritise", body: `1. **Processor generation:** 8th gen or newer (Windows 11, quad-core).\n2. **SSD:** non-negotiable; never a hard drive as the only drive.\n3. **8 GB RAM** (16 GB if your work needs it).\n4. **Battery health** above 80% on used laptops.\n5. **A warranty** in writing.\n\nThen screen, weight and looks. Are cheap laptops worth it? A cheap new laptop with a Celeron, 4 GB RAM or eMMC storage usually isn't; a cheap 8th-gen business laptop usually is. Compare prices on the product pages and in ${link("laptop price research", `${SITE}/research/laptop-prices-kenya`)}: match the exact processor, generation, RAM, SSD and condition, not just the model name.` },
        { heading: "Older premium or new budget?", body: `An older premium or business laptop (EliteBook, ThinkPad T/X, Latitude 7000, XPS) usually beats a new budget laptop at the same price on build, keyboard, screen and repairability; the new laptop wins on battery health, warranty and having the latest processor. A good rule: an older premium laptop of 8th gen or newer beats a new laptop with an entry-level chip. Business laptops cost more new than consumer laptops, but much less once a few years old. See ${link("business vs consumer laptops", `${SITE}/learn/business-vs-consumer-laptops`)}.` },
        { heading: "How much does a business-class laptop cost in Kenya?", body: `At ECB Technologies, ${biz.length} business laptops (ThinkPad, EliteBook, Latitude, ProBook) are in stock; those with 8th-gen or newer processors start at ${biz8.length ? ksh(Math.min(...biz8.map((r) => r.price))) : "n/a"} with a median of ${biz8.length ? ksh(median(biz8.map((r) => r.price))) : "n/a"} (${asOf}). Browse ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "What is the best laptop to buy in Kenya with KSh 25,000?", answer: at(25000) ? `The best specified 8th-gen or newer laptop up to KSh 25,000 in stock is the ${at(25000).short} at ${ksh(at(25000).price)} (${asOf}).` : "Few 8th-gen laptops cost KSh 25,000 or less; see the under-25k list for what's in stock." },
        { question: "Which laptop can I buy with KSh 35,000 in Kenya?", answer: at(35000) ? `An 8th-gen or newer business laptop; the best specified in stock is the ${at(35000).short} at ${ksh(at(35000).price)} (${asOf}).` : "An 8th-gen business laptop; see the student guide for current options." },
        { question: "What is the best laptop for KSh 60,000 in Kenya?", answer: at(60000) ? `The best specified 8th-gen or newer laptop up to KSh 60,000 in stock is the ${at(60000).short} at ${ksh(at(60000).price)} (${asOf}).` : "See the under-60k list for what's in stock." },
        { question: "Which laptop is best under KSh 120,000?", answer: at(120000) ? `By specs, the ${at(120000).short} at ${ksh(at(120000).price)} (${asOf}); at this budget, also consider an RTX laptop for creative work or a MacBook Air.` : "See the budget table on this page." },
        { question: "Is a KSh 50,000 laptop good enough for office work?", answer: "Yes, comfortably: at that price you get an 8th–10th gen Core i5 or i7 business laptop, often with 16 GB RAM." },
        { question: "Is it worth spending KSh 100,000 on a laptop?", answer: "For design, engineering, gaming or a MacBook, yes. For office work and study, a KSh 35,000–60,000 business laptop does the job." },
        { question: "Which laptop gives the best performance for its price?", answer: value[0] ? `By spec score per shilling, the ${value[0].short} at ${ksh(value[0].price)} leads right now (${asOf}).` : "See the value ranking on this page." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "slow-laptop",
  path: "/learn/laptop-slow-freezing-not-charging-fixes",
  kw: "why is my laptop running slow",
  secondary: ["laptop takes long to start", "laptop keeps restarting", "laptop freezes randomly", "laptop fan loud", "laptop switches off", "laptop black screen power light on", "laptop not charging plugged in", "make old laptop faster"],
  h1: "Why is my laptop running slow? Fixes for freezing, restarts, noise and charging",
  title: "Why Is My Laptop Running Slow? How to Fix It",
  related: ["/learn/laptop-battery-and-overheating-fixes", "/learn/laptop-upgrade-ram-ssd", "/learn/laptop-maintenance-guide"],
  write(x) {
    const { link, SITE, PHONE } = x;
    if (x.L.length < 50) return null;
    const fix = (title, causes, steps, pro) => ({ heading: title, body: `**Common causes:** ${causes}\n\n**Try this:**\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}${pro ? `\n\n**When to get help:** ${pro}` : ""}` });
    return {
      intro: `Why is my laptop running slow? Most often: a hard drive instead of an SSD, too little RAM for what's open, too many startup programs, a nearly full drive, or overheating that makes the processor slow itself down. Below are safe, step-by-step fixes for slow laptops and the other common problems (slow startup, restarts, freezing, loud fan, sudden shutdowns, black screen, not charging), and when it's time for a technician or a replacement.`,
      description: `Laptop slow, slow to start, restarting, freezing, loud fan, switching off, black screen or not charging: causes, safe fixes, and when to repair or replace.`,
      sections: [
        fix("Laptop running very slowly", "a hard drive (HDD), little RAM, background programs, a full drive, malware, overheating.", ["Task Manager (Ctrl+Shift+Esc) → Processes: sort by CPU, Memory and Disk to see what's using them.", "Check the drive type (Performance → Disk): if it says HDD, an SSD is the biggest upgrade.", "Free space: Settings → System → Storage → Cleanup recommendations; keep 15–20% free.", "Run a full scan in Windows Security.", "Install Windows and driver updates, then restart."], "if it's still slow with an SSD, enough RAM and no heavy programs, the hardware may be too old for your work."),
        fix("Laptop takes long to start", "startup programs, a hard drive, pending updates.", ["Task Manager → Startup apps: disable what you don't need at startup.", "Let pending Windows updates finish.", "Replace a hard drive with an SSD: startup drops from minutes to seconds."]),
        fix("Laptop keeps restarting or freezes randomly", "a faulty driver or update, overheating, failing RAM or drive, malware.", ["Note when it happens (gaming, charging, idle).", "Install updates; roll back a driver installed just before it started (Device Manager).", "Check temperatures: clean the vents and use it on a hard surface.", "Run Windows Memory Diagnostic, and check the drive's health (CrystalDiskInfo).", "Run a full malware scan."], "repeated blue screens or freezes with healthy software usually mean a hardware fault (RAM, drive, motherboard)."),
        fix("Loud laptop fan", "dust in the vents, heavy programs, blocked airflow, a worn fan.", ["Check Task Manager for a program using a lot of CPU.", "Use the laptop on a hard surface; clean the vents with compressed air (laptop off).", "Choose a balanced power mode instead of best performance."], "a grinding or clicking fan needs replacing."),
        fix("Laptop switches off without warning", "overheating, a worn battery that reports the wrong charge, a faulty charger.", [`Check the battery report (powercfg /batteryreport); see ${link("battery fixes", `${SITE}/learn/laptop-battery-and-overheating-fixes`)}.`, "Clean the vents and check it doesn't shut down only when hot.", "Try another known-good charger of the right wattage."], "a swollen battery or shutdowns while cool and plugged in need a technician."),
        fix("Black screen but the power light is on", "display or graphics issue, sleep/hibernate glitch, a loose RAM module.", ["Press Windows + Ctrl + Shift + B (restarts the graphics driver).", "Hold the power button for 15 seconds, unplug, then start again.", "Connect an external monitor: if it shows a picture, the laptop's screen or cable is the problem."], "if an external monitor is also black, or the laptop beeps at startup, take it to a technician."),
        fix("Not charging even when plugged in", "a wrong or faulty charger, a loose charging port, a worn battery, a charge-limit setting.", ["Check the charger's wattage and connector match the laptop.", "Check for a battery charge limit in the maker's app (Lenovo Vantage, HP, Dell Power Manager) that stops at 80%.", "Try another wall socket and charger.", "Check the battery report for very low capacity."], "a loose charging port or a battery that won't charge with a good charger needs repair. Don't open the charger or the battery."),
        { heading: "How to make an old laptop faster", body: `1. Fit an SSD (the biggest single improvement): ${link("HDD to SSD upgrade", `${SITE}/learn/laptop-upgrade-ram-ssd`)}.\n2. Add RAM if there's a free slot.\n3. Remove unused programs and startup apps.\n4. Clean the vents and fan.\n5. Reinstall Windows cleanly if it's years old.\n\nIf it's 7th gen or older (no Windows 11), compare the cost of upgrades with a newer laptop: see ${link("best value laptops", `${SITE}/learn/best-value-laptops-kenya`)}.` },
        { heading: "Repair or replace?", body: `Repair when the fix is a battery, charger, SSD, RAM or fan on an 8th-gen or newer laptop. Replace when the motherboard or screen has failed on an old model, or the repair costs more than about half the price of a comparable replacement. Ask a technician for a written quote first. Questions about a replacement: WhatsApp ${PHONE}.` },
      ],
      faq: [
        { question: "Why is my laptop running very slowly?", answer: "Usually a hard drive instead of an SSD, too little RAM, too many background programs, a full drive or overheating. Task Manager shows which one." },
        { question: "Why does my laptop keep restarting?", answer: "Often a faulty driver or update, overheating, malware or failing RAM or storage. Update, check temperatures, scan for malware and test the memory and drive." },
        { question: "Why is my laptop not charging when plugged in?", answer: "Check the charger's wattage and connector, any 80% charge limit in the maker's app, another socket, and the battery's health. A loose port needs repair." },
        { question: "How do I make my old laptop faster?", answer: "Fit an SSD, add RAM if there's a free slot, remove startup programs, clean the vents and reinstall Windows if it's years old." },
        { question: "Why is my laptop screen black but the power light is on?", answer: "Try Windows + Ctrl + Shift + B, a 15-second power reset, and an external monitor. If the monitor works, the laptop's screen or cable is faulty." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "security",
  path: "/learn/laptop-security-guide-kenya",
  kw: "how to protect my laptop from hackers",
  secondary: ["do i need antivirus", "is windows defender enough", "best antivirus for windows laptop", "how to encrypt my laptop", "laptop public wifi security", "what to do if laptop is stolen", "how to know if laptop has virus"],
  h1: "How to protect your laptop from hackers: antivirus, encryption, Wi-Fi and theft",
  title: "How to Protect Your Laptop From Hackers: Security Guide",
  related: ["/learn/windows-11-and-laptop-software-kenya", "/learn/buying-a-laptop-safely-kenya", "/learn/laptop-maintenance-guide"],
  write(x) {
    const { P, ksh, link, SITE, asOf } = x;
    if (!P || P.length < 50) return null;
    const av = dedupe(P.filter((p) => /kaspersky|eset|norton|mcafee|bitdefender|antivirus/.test(p.slug)).sort((a, b) => a.price - b.price));
    return {
      intro: `How to protect your laptop from hackers: keep Windows and your apps updated, keep Microsoft Defender (or another reputable antivirus) on, use strong unique passwords with two-step sign-in, encrypt the drive, back up your files, and be careful on public Wi-Fi and with links. No single tool guarantees safety; these layers together make your laptop a much harder target. Here's how to set each one up.`,
      description: `Laptop security in plain English: antivirus and Microsoft Defender, signs of a virus, remote access scams, encryption, public Wi-Fi, backups and what to do if it's stolen.`,
      sections: [
        { heading: "Do you need antivirus? Is Windows Defender enough?", body: `Windows 10 and 11 include **Microsoft Defender Antivirus**, on by default and updated through Windows Update. For most home users who keep Windows updated and avoid pirated software, it provides solid protection. A paid security suite adds extras (web protection across browsers, password managers, VPNs, parental controls, licences for several devices).${av.length ? ` Security software in stock:\n\n${liveList(x, av, 5)}\n\nPrices as of ${asOf}.` : ""}\n\nWhatever you choose, run only one real-time antivirus at a time.` },
        { heading: "Signs your laptop may have a virus", body: "- Sudden slowness, pop-ups or new browser toolbars.\n- Programs you didn't install, or settings that change by themselves.\n- Antivirus turned off without you doing it.\n- Friends receiving messages you didn't send.\n\nRun a full scan (Windows Security → Virus & threat protection → Scan options → Full scan), and the Microsoft Defender Offline scan for stubborn infections." },
        { heading: "Can someone access my laptop remotely?", body: "Yes, if you install remote-access software and give someone the code, or through malware. Common scams: a \"technician\" calls or shows a pop-up claiming your laptop is infected and asks you to install AnyDesk or TeamViewer. Real companies (Microsoft, banks, Safaricom) don't do this. Uninstall remote tools you don't use, and never share a remote-access code with someone who contacted you first." },
        { heading: "Passwords and two-step sign-in", body: "Use a PIN or Windows Hello (fingerprint or face) to sign in, a password manager for unique passwords, and two-step verification (authenticator app or SMS) on email, banking and social media. Your email account is the key to everything else: protect it first." },
        { heading: "How to encrypt your laptop", body: "Encryption protects your files if the laptop is stolen.\n\n- **Windows 11/10 Pro:** BitLocker (Settings → Privacy & security → Device encryption or search \"Manage BitLocker\").\n- **Windows Home:** \"Device encryption\" on supported laptops (same Settings page).\n- Save the recovery key to your Microsoft account or print it: without it, you can't unlock the drive if something changes." },
        { heading: "Public Wi-Fi", body: "On café, hotel or campus Wi-Fi: use sites with HTTPS (most are), avoid logging into banking on unknown networks, set the network as Public (Windows asks), turn off file sharing, and consider a reputable VPN. Your phone's hotspot is safer than open Wi-Fi." },
        { heading: "Backups", body: "Ransomware and theft both destroy files: keep a copy elsewhere. Use OneDrive or Google Drive for documents, and an external drive for a full backup every week or month. Keep at least one backup disconnected from the laptop." },
        { heading: "If your laptop is stolen", body: "1. **Find my device** (Settings → Privacy & security → Find my device) shows its last location if it was turned on before.\n2. Change your passwords, starting with email, and sign out of sessions on other devices.\n3. Report it to the police and keep the serial number from your receipt (it helps recovery and insurance).\n4. If it was encrypted, your files are protected." },
        { heading: "Choosing a laptop with security in mind", body: `Business laptops (ThinkPad, EliteBook, Latitude) usually have TPM 2.0, fingerprint readers and BIOS security features, and run Windows 11. See ${link("business laptops", `${SITE}/best/business-laptops-kenya`)} and ${link("Windows 11 and software", `${SITE}/learn/windows-11-and-laptop-software-kenya`)}.` },
      ],
      faq: [
        { question: "Do I need antivirus software on my laptop?", answer: "Windows includes Microsoft Defender, which is on by default. Keep it on and updated; a paid suite adds extras like web protection and multi-device licences." },
        { question: "Is Windows Defender enough to protect my laptop?", answer: "For most home users who keep Windows updated and avoid pirated software, it provides solid protection. No antivirus guarantees safety on its own." },
        { question: "How do I know if my laptop has a virus?", answer: "Pop-ups, new programs or toolbars, sudden slowness or antivirus turned off by itself. Run a full scan and a Microsoft Defender Offline scan." },
        { question: "How do I encrypt my laptop?", answer: "Use BitLocker on Windows Pro, or Device encryption on supported Windows Home laptops, and save the recovery key somewhere safe." },
        { question: "How do I secure my laptop on public Wi-Fi?", answer: "Mark the network as Public, avoid banking on unknown networks, keep file sharing off, and use your phone hotspot or a reputable VPN." },
        { question: "What should I do if my laptop is stolen?", answer: "Use Find my device if it was on, change your passwords (email first), report it to the police with the serial number, and rely on encryption to protect your files." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "wifi",
  path: "/learn/laptop-wifi-and-internet-guide",
  kw: "laptop not connecting to WiFi",
  secondary: ["laptop keeps disconnecting from wifi", "connect laptop to mobile hotspot", "improve laptop wifi speed", "connect laptop to ethernet", "wifi 5 vs wifi 6", "does a laptop need a sim card"],
  h1: "Laptop not connecting to WiFi? Fixes, hotspots, Ethernet and Wi-Fi 6",
  title: "Laptop Not Connecting to WiFi? How to Fix It (Guide)",
  related: ["/learn/laptop-slow-freezing-not-charging-fixes", "/learn/laptop-security-guide-kenya", "/learn/laptop-ports-explained"],
  write(x) {
    const { link, SITE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `Laptop not connecting to Wi-Fi? Turn Wi-Fi (and Airplane mode) off and on, forget the network and reconnect, restart the router and the laptop, then run the Windows network troubleshooter and update the Wi-Fi driver. Most connection problems are fixed by one of these. This guide also covers disconnections, mobile hotspots (Safaricom, Airtel and others), Ethernet, why your phone may be faster, and Wi-Fi 5 vs Wi-Fi 6.`,
      description: `Laptop not connecting to Wi-Fi or dropping out: fixes, connecting to a mobile hotspot or Ethernet, faster Wi-Fi, SIM-card laptops, and Wi-Fi 5 vs Wi-Fi 6 explained.`,
      sections: [
        { heading: "Laptop not connecting to Wi-Fi", body: "1. Check Airplane mode is off and Wi-Fi is on (and any Wi-Fi key or switch on older laptops).\n2. Forget the network (Settings → Network & internet → Wi-Fi → Manage known networks) and reconnect with the password.\n3. Restart the router and the laptop.\n4. Run Settings → System → Troubleshoot → Other troubleshooters → Network and Internet.\n5. Update or reinstall the Wi-Fi driver (Device Manager → Network adapters).\n6. Settings → Network & internet → Advanced network settings → Network reset (last resort; you'll re-enter Wi-Fi passwords)." },
        { heading: "Laptop keeps disconnecting", body: "- Turn off power saving for the Wi-Fi adapter: Device Manager → Network adapters → your Wi-Fi → Properties → Power Management → untick \"Allow the computer to turn off this device\".\n- Move closer to the router or remove obstacles (walls and metal weaken 5 GHz the most).\n- Update the Wi-Fi driver and the router's firmware.\n- If only one network drops, the router is the likely cause." },
        { heading: "Connecting to a mobile hotspot", body: "On the phone: turn on Mobile Hotspot (Android: Settings → Network → Hotspot; iPhone: Settings → Personal Hotspot) and note the name and password. On the laptop: click the Wi-Fi icon and choose the phone's network. Hotspots use your mobile data quickly (updates and video): set the network as metered on the laptop (Wi-Fi properties → Metered connection) to limit background downloads." },
        { heading: "Ethernet (cable) connection", body: `Plug a network cable from the router into the laptop's Ethernet (RJ45) port; Windows connects automatically. Many business laptops have one; thin laptops need a USB or USB-C to Ethernet adapter. Ethernet is faster and steadier than Wi-Fi for big downloads and video calls. See ${link("laptop ports explained", `${SITE}/learn/laptop-ports-explained`)}.` },
        { heading: "Why is my laptop slower than my phone?", body: "Usually not the internet plan but: an older Wi-Fi card (Wi-Fi 4/5) vs a newer phone (Wi-Fi 6), the laptop on the slower 2.4 GHz band while the phone uses 5 GHz, distance from the router, or background downloads (updates, OneDrive) on the laptop. Test both in the same spot with a speed test, and pause updates while testing." },
        { heading: "Wi-Fi 5 vs Wi-Fi 6", body: x.tableMd(["", "Wi-Fi 5 (802.11ac)", "Wi-Fi 6 / 6E (802.11ax)"], [["Typical laptops", "Most 2015–2019 business laptops", "Most 2020 and newer (10th–11th gen on)"], ["Speed", "Fast", "Faster, especially near the router"], ["Busy networks (campus, office)", "Slows down more", "Handles many devices better"], ["Needs", "Any router", "A Wi-Fi 6 router to get the benefit"]]) + "\n\nYour internet plan still sets the top speed: Wi-Fi 6 can't make a slow connection faster, but it uses a fast one better. Check the laptop's Wi-Fi card in Device Manager → Network adapters (\"AX\" in the name means Wi-Fi 6)." },
        { heading: "Can I use a laptop without Wi-Fi? Does it need a SIM?", body: "Yes: offline for documents and anything installed, or online through Ethernet, a phone hotspot or a USB modem. Laptops don't need a SIM card; a few business models have a built-in 4G/LTE slot, but most people use a phone hotspot or a MiFi router instead." },
        { heading: "Which laptops have the best Wi-Fi?", body: `Newer laptops with Wi-Fi 6 or 6E cards (generally 10th–11th gen and newer business models, Core Ultra laptops and Apple-chip MacBooks), plus a good router. Business laptops with Ethernet ports add a reliable wired option. Browse ${link("Core Ultra laptops", `${SITE}/laptops/core-ultra-laptops-kenya`)} and ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "Why is my laptop not connecting to Wi-Fi?", answer: "Check Airplane mode, forget and rejoin the network, restart the router and laptop, run the network troubleshooter, and update the Wi-Fi driver." },
        { question: "Why does my laptop keep disconnecting from Wi-Fi?", answer: "Often Wi-Fi power saving, distance from the router, an old driver or the router itself. Turn off the adapter's power saving and update the driver." },
        { question: "How do I connect my laptop to a mobile hotspot?", answer: "Turn on the phone's hotspot, then choose its network from the laptop's Wi-Fi list. Set it as a metered connection to save data." },
        { question: "What is the difference between Wi-Fi 5 and Wi-Fi 6?", answer: "Wi-Fi 6 is newer: faster and better on busy networks, if the router also supports it. Most laptops from 2020 on have it." },
        { question: "Does a laptop need a SIM card to access the internet?", answer: "No. Laptops use Wi-Fi, Ethernet or a phone hotspot; only a few business models have a built-in 4G SIM slot." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "small-business",
  path: "/learn/laptops-for-small-business-kenya",
  kw: "best laptop for small business in Kenya",
  secondary: ["laptop for quickbooks", "laptop for excel", "laptop for pos software", "laptop for remote work", "laptop for zoom meetings", "laptops for company employees", "laptop vs desktop for business"],
  h1: "Laptops for small businesses in Kenya: accounts, QuickBooks, POS and teams",
  title: "Best Laptop for Small Business in Kenya: Accounts & POS",
  related: ["/best/business-laptops-kenya", "/learn/best-laptop-for-your-profession-kenya", "/learn/laptop-security-guide-kenya"],
  write(x) {
    const { L, P, ksh, link, SITE, PHONE, asOf, recency, tableMd } = x;
    if (L.length < 50) return null;
    const biz = (f) => dedupe(L.filter((r) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${r.slug}-`) && f(r)).sort((a, b) => a.price - b.price));
    const entry = biz((r) => recency(r.sp) >= 3 && (r.sp.tier || 0) >= 3 && r.price <= 40000);
    const mid = biz((r) => recency(r.sp) >= 4 && r.sp.ram >= 16 && r.price <= 70000);
    const heads = dedupe((P || []).filter((p) => /headset/.test(p.slug)).sort((a, b) => a.price - b.price));
    return {
      intro: `The best laptop for a small business in Kenya is a business-class laptop (ThinkPad, EliteBook, Latitude) with an 8th-gen or newer Core i5, 8–16 GB RAM and an SSD: it runs accounts, Excel, QuickBooks, POS software and video calls, and it's built for daily use and easy to repair. At ECB Technologies, ${entry.length} such laptops cost KSh 40,000 or less, from ${entry.length ? ksh(entry[0].price) : "n/a"} (${asOf}). Below: what each business job needs, and how to equip a team.`,
      description: `Laptops for small businesses in Kenya: specs for accounts, QuickBooks, Excel, POS, remote work and Zoom; buying for a team; laptops vs desktops; live prices.`,
      sections: [
        { heading: "What each business job needs", body: tableMd(["Work", "Minimum", "Better"], [
          ["Accounts, Excel, email, KRA iTax", "8th-gen Core i5, 8 GB, 256 GB SSD", "10th gen, 16 GB for large workbooks"],
          ["QuickBooks Online / Xero", "Any 8th-gen+ laptop with a modern browser (cloud software)", "16 GB if many tabs stay open"],
          ["QuickBooks Desktop", "Windows; Intuit recommends at least 8 GB RAM and an SSD for recent versions", "16 GB for large company files"],
          ["POS software", "Windows (check your POS vendor), USB ports for scanner and receipt printer, Ethernet", "A 15.6-inch screen; a UPS for power cuts"],
          ["Remote work and video calls", "8th-gen Core i5, 8 GB, working webcam and mic", "16 GB, Wi-Fi 6, a USB headset"],
          ["Many business apps at once", "16 GB RAM", "10th gen+ Core i7 / Ryzen 7, 16–32 GB"],
        ]) + "\n\nSoftware requirements change with versions: check your vendor's current system requirements before buying." },
        { heading: "Recommended laptops in stock", body: `**Entry level (KSh 40,000 or less, 8th gen+ Core i5 class):**\n\n${liveList(x, entry, 5)}\n\n**Mid-range (10th gen+, 16 GB, up to KSh 70,000):**\n\n${mid.length ? liveList(x, mid, 5) : "Ask us on WhatsApp for current stock."}\n\nAll of them: ${link("business laptops", `${SITE}/best/business-laptops-kenya`)}. Prices as of ${asOf}.` },
        { heading: "Excel professionals and accountants", body: `Large spreadsheets use memory and fast single-core speed: choose 16 GB and a 10th-gen or newer processor; a 15.6-inch screen with a number pad speeds up data entry. More: ${link("best laptop for accountants", `${SITE}/learn/best-laptop-for-your-profession-kenya`)}.` },
        { heading: "Virtual meetings and remote work", body: `Zoom, Teams and Google Meet run well on any 8th-gen or newer Core i5 with 8 GB. What matters more: a working webcam and microphone (test them before buying), stable Wi-Fi or Ethernet, and a headset for noisy rooms.${heads.length ? ` USB headsets in stock from ${ksh(heads[0].price)}: ${link(heads[0].short, `${SITE}/item/${heads[0].slug}`)}.` : ""} See ${link("laptop Wi-Fi guide", `${SITE}/learn/laptop-wifi-and-internet-guide`)}.` },
        { heading: "Buying laptops for a team", body: `- **Standardise** on one or two models: easier support, shared chargers and spare parts.\n- **Specs:** 8th gen+ Core i5, 8–16 GB, SSD, Windows 11 Pro for BitLocker and business management.\n- **Security:** encryption, unique accounts, backups: see the ${link("laptop security guide", `${SITE}/learn/laptop-security-guide-kenya`)}.\n- **Records:** keep each laptop's serial number and warranty.\n\nBuying several units? Send the quantity and budget on WhatsApp (${PHONE}) so we can check stock of the same model.` },
        { heading: "Laptops or desktops for employees?", body: tableMd(["", "Laptops", "Desktops"], [["Mobility", "Work anywhere, meetings, remote work", "Fixed to a desk"], ["Power cuts", "Battery keeps working", "Needs a UPS"], ["Price for the same speed", "Higher", "Lower"], ["Screens and ergonomics", "Add a monitor and keyboard at the desk", "Large screen built in"], ["Repairs and upgrades", "Harder; parts per model", "Easier and cheaper"]]) + "\n\nIn Kenya, power cuts and hybrid work favour laptops for most staff; desktops suit fixed workstations like reception or POS counters (with a UPS)." },
      ],
      faq: [
        { question: "What is the best laptop for running a small business in Kenya?", answer: "A business-class laptop (ThinkPad, EliteBook or Latitude) with an 8th-gen or newer Core i5, 8–16 GB RAM and an SSD." },
        { question: "What is the best laptop for running QuickBooks?", answer: "QuickBooks Online runs in a browser on any modern laptop. QuickBooks Desktop needs Windows; Intuit recommends at least 8 GB RAM and an SSD for recent versions." },
        { question: "What laptop is suitable for running POS software?", answer: "A Windows laptop (check your POS vendor) with enough USB ports for the scanner and receipt printer, an Ethernet port and a UPS for power cuts." },
        { question: "Which laptop is best for virtual meetings?", answer: "Any 8th-gen or newer Core i5 with 8 GB RAM, plus a working webcam and microphone, stable internet and a headset." },
        { question: "Should a business buy laptops or desktops for employees?", answer: "Laptops for staff who move, meet or work remotely (and to ride through power cuts); desktops with a UPS for fixed workstations." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "business-vs-consumer",
  path: "/learn/business-vs-consumer-laptops",
  kw: "business laptop vs consumer laptop",
  secondary: ["refurbished business laptop vs new budget laptop", "14 inch vs 15.6 inch laptop", "lightweight vs powerful laptop", "workstation laptop vs normal laptop", "laptop vs ultrabook", "is a 2-in-1 laptop worth it"],
  h1: "Business vs consumer laptops, 14 vs 15.6 inch, ultrabooks and workstations",
  title: "Business Laptop vs Consumer Laptop: Which Should You Buy?",
  related: ["/hp-vs-dell-vs-lenovo-laptops-kenya", "/compare/elitebook-vs-latitude-kenya", "/compare/thinkpad-vs-latitude-kenya"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, recency, tableMd } = x;
    if (L.length < 50) return null;
    const biz = L.filter((r) => /-(thinkpad|elitebook|latitude|probook|zbook|precision)-/.test(`-${r.slug}-`) && recency(r.sp) >= 3);
    const ws = L.filter((r) => /-(zbook|precision|p\d{2}s?|p1\d)-/.test(`-${r.slug}-`));
    return {
      intro: `Business laptop vs consumer laptop: business laptops (ThinkPad, EliteBook, Latitude, ProBook) are built tougher, are easier to repair and upgrade, and get longer support; consumer laptops (IdeaPad, Pavilion, Inspiron) cost less new and often look sleeker. Bought a few years old, a business laptop is often better value than a new budget consumer laptop: ${biz.length} 8th-gen or newer business laptops are in stock here, median ${ksh(median(biz.map((r) => r.price)))} (${asOf}).`,
      description: `Business vs consumer laptops, refurbished business vs new budget, 14 vs 15.6 inch, light vs powerful, ultrabooks, workstations and 2-in-1s compared for Kenyan buyers.`,
      sections: [
        { heading: "Business vs consumer laptops", body: tableMd(["", "Business (ThinkPad, EliteBook, Latitude)", "Consumer (IdeaPad, Pavilion, Inspiron)"], [["Build", "Tougher; many models tested to MIL-STD-810", "Lighter-duty"], ["Repair and upgrades", "Easy; parts common in Nairobi; often 2 RAM slots", "Varies; more soldered parts"], ["Keyboard", "Excellent for long typing", "Varies"], ["Security", "TPM, fingerprint, BIOS controls, vPro on some", "Basic"], ["New price", "Higher", "Lower"], ["Value used", "Excellent", "Lower resale"]]) },
        { heading: "Refurbished business laptop or new budget laptop?", body: `For the same money, a few-years-old business laptop usually has a faster processor class, better keyboard and build, and easier repairs than a new entry-level consumer laptop. The new laptop has a full manufacturer warranty and a fresh battery. Check generation (8th gen+), battery health and the seller's warranty: see ${link("refurbished vs used vs new", `${SITE}/learn/refurbished-vs-used-laptops-kenya`)}.` },
        { heading: "Brand comparisons", body: `No brand is better at everything; compare the model lines: ${link("HP vs Dell vs Lenovo", `${SITE}/hp-vs-dell-vs-lenovo-laptops-kenya`)}, ${link("EliteBook vs Latitude", `${SITE}/compare/elitebook-vs-latitude-kenya`)}, ${link("ThinkPad vs Latitude", `${SITE}/compare/thinkpad-vs-latitude-kenya`)}, ${link("ThinkPad vs EliteBook", `${SITE}/compare/thinkpad-vs-elitebook-kenya`)} and ${link("EliteBook vs ProBook", `${SITE}/compare/elitebook-vs-probook-kenya`)}. Dell's Vostro is a small-business line between Inspiron and Latitude; we don't stock it, so compare HP ProBook with Latitude instead.` },
        { heading: "14-inch or 15.6-inch?", body: "14 inches: lighter (about 1.3–1.6 kg), easier to carry, the best all-rounder. 15.6 inches: bigger screen, usually a number pad, more ports, heavier (1.7 kg+); better at a desk, for spreadsheets and design." },
        { heading: "Lightweight or powerful?", body: "If you carry it daily, choose lightweight (13–14 inch, U-series processor, long battery). If it stays on a desk and runs heavy software (CAD, video, games), choose power (H-series processor, dedicated GPU, better cooling). Many people are best served by a light laptop plus a monitor at the desk." },
        { heading: "Ultrabooks", body: "\"Ultrabook\" means a thin, light laptop with a low-power processor, an SSD and long battery life (originally an Intel specification). Examples: ThinkPad X1 Carbon, EliteBook 830/1040, Dell XPS 13, MacBook Air. Trade-offs: fewer ports, soldered RAM on many, higher prices." },
        { heading: "Workstation laptops", body: `Workstations (HP ZBook, Dell Precision, ThinkPad P) have professional graphics certified for CAD and engineering software, more RAM capacity and stronger cooling. Worth it for AutoCAD, Revit, SolidWorks and 3D work; unnecessary for office work. ${ws.length} are in stock: see ${link("laptops for AutoCAD and Revit", `${SITE}/learn/best-laptops-for-autocad-and-revit-kenya`)}.` },
        { heading: "Is a 2-in-1 worth it?", body: `Yes if you take handwritten notes, sketch, sign documents or present; otherwise a standard laptop costs less and is lighter. See ${link("is a touchscreen or 2-in-1 worth it", `${SITE}/learn/touchscreen-laptop-worth-it-kenya`)}.` },
      ],
      faq: [
        { question: "Which is better, a business laptop or a consumer laptop?", answer: "For durability, repairs and keyboards, business laptops; for the lowest new price or a sleek design, consumer laptops. Used, business laptops are usually better value." },
        { question: "Are refurbished business laptops better than new budget laptops?", answer: "Often, for the same money: better build and processor class and easier repairs. A new laptop has a fresh battery and full manufacturer warranty." },
        { question: "Is a 14-inch laptop better than a 15.6-inch laptop?", answer: "For carrying, yes. For spreadsheets, design and desk work, 15.6 inches (with a number pad) is better." },
        { question: "What is the difference between a laptop and an ultrabook?", answer: "An ultrabook is a thin, light laptop with a low-power processor, SSD and long battery life, such as a ThinkPad X1 Carbon or MacBook Air." },
        { question: "Are workstation laptops better than normal laptops?", answer: "For CAD, engineering and 3D software, yes (certified graphics, more RAM, better cooling). For office work they're unnecessary and heavier." },
        { question: "Is HP EliteBook better than Dell Latitude for business?", answer: "Neither across the board: compare the specific generation, RAM, battery and price. Our EliteBook vs Latitude comparison uses live stock." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "maintenance",
  path: "/learn/laptop-maintenance-guide",
  kw: "laptop maintenance tips",
  secondary: ["how often should i service my laptop", "how to clean laptop keyboard", "can dust damage a laptop", "should i leave my laptop plugged in", "is it bad to charge laptop overnight", "how to extend laptop battery lifespan"],
  h1: "Laptop maintenance: cleaning, charging habits and making it last",
  title: "Laptop Maintenance Tips: A Guide to Cleaning and Charging",
  related: ["/learn/laptop-battery-and-overheating-fixes", "/learn/laptop-slow-freezing-not-charging-fixes", "/learn/laptop-buying-guide-kenya"],
  write(x) {
    const { link, SITE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `These laptop maintenance tips cover what actually extends a laptop's life: keep it cool and dust-free, keep the battery out of constant 100% and heat, clean the keyboard safely, keep Windows and drivers updated, and back up your files. With care, a business laptop commonly lasts five years or more; the battery is usually the first part to replace.`,
      description: `Laptop maintenance tips: cleaning the keyboard and vents, dust, servicing, charging overnight, leaving it plugged in, battery lifespan, and repair vs replace.`,
      sections: [
        { heading: "How long should a laptop last?", body: "Business laptops (ThinkPad, EliteBook, Latitude) are built for years of daily use and commonly give five years or more; budget consumer laptops are often replaced sooner. The limits are usually the battery (replaceable), the software support of the processor (8th gen or newer for Windows 11), and whether it's still fast enough for your work." },
        { heading: "How often should you service a laptop?", body: "- **Monthly:** restart fully, install updates, clear unused files.\n- **Every 6–12 months:** blow dust out of the vents (more often in dusty places such as building sites or near roads).\n- **When it runs hot or loud:** a technician can clean the fan and replace dried thermal paste; this needs the laptop opened and is a job for someone experienced." },
        { heading: "Cleaning the keyboard and screen safely", body: "1. Shut down and unplug.\n2. Turn the laptop upside down at an angle and tap gently; use compressed air between keys in short bursts.\n3. Wipe keys with a cloth lightly dampened with isopropyl alcohol (not dripping).\n4. Clean the screen with a microfibre cloth, lightly dampened with water if needed; never spray liquid directly on the laptop.\n5. Spills: shut down immediately, unplug, turn it upside down and let a technician check it before switching on." },
        { heading: "Can dust damage a laptop?", body: `Yes, over time: dust clogs the vents and fan, the laptop runs hotter, slows itself down and the fan gets loud; long-term heat shortens battery and component life. Keep it on hard surfaces and clean the vents regularly. See ${link("overheating fixes", `${SITE}/learn/laptop-battery-and-overheating-fixes`)}.` },
        { heading: "Should you leave a laptop plugged in? Charging overnight", body: "Modern laptops stop charging when full, so charging overnight isn't dangerous. What wears lithium-ion batteries is heat and sitting at 100% for long periods. If the laptop is mostly plugged in at a desk, turn on the maker's charge limit (about 80%): Lenovo Vantage (Conservation mode or charge threshold), HP Battery Health Manager in the BIOS, or Dell Power Manager (Primarily AC use). Keep it ventilated while charging, and don't charge it on a bed or in a hot car." },
        { heading: "Extending battery lifespan", body: "- Avoid heat.\n- Avoid running it to 0% regularly.\n- Use the 80% charge limit when mostly plugged in.\n- Store it at about 50% if it won't be used for weeks.\n- Use the original or a quality charger of the right wattage." },
        { heading: "Software maintenance", body: "Keep Windows and drivers updated, keep Microsoft Defender on, uninstall programs you don't use, keep 15–20% of the SSD free, and back up regularly (cloud plus an external drive)." },
        { heading: "Repair or replace? Signs of motherboard damage", body: `Signs of a motherboard problem: no power at all with a known-good charger, no display even on an external monitor, beeping at startup, random shutdowns while cool, or ports dying one after another. These need a technician's diagnosis. Repair is usually worth it for batteries, chargers, SSDs, RAM, keyboards and fans on 8th-gen or newer laptops; replacing is usually better when the motherboard fails on an older model. See ${link("repair or replace", `${SITE}/learn/laptop-slow-freezing-not-charging-fixes`)} and ${link("best value laptops", `${SITE}/learn/best-value-laptops-kenya`)}.` },
      ],
      faq: [
        { question: "How often should I service my laptop?", answer: "Clean the vents every 6–12 months (more in dusty places), install updates monthly, and have the fan and thermal paste checked when it runs hot or loud." },
        { question: "Is it bad to charge a laptop overnight?", answer: "No: modern laptops stop charging when full. Heat and long periods at 100% wear the battery, so use an 80% charge limit if it's mostly plugged in." },
        { question: "Should I leave my laptop plugged in all the time?", answer: "It's safe, but turn on the maker's charge limit (about 80%) to slow battery wear, and keep it ventilated." },
        { question: "How do I clean my laptop keyboard safely?", answer: "Shut down and unplug, use compressed air in short bursts, and wipe keys with a cloth lightly dampened with isopropyl alcohol." },
        { question: "When should I replace my laptop instead of repairing it?", answer: "When the motherboard or screen fails on an older laptop, or the repair costs more than about half the price of a comparable replacement." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "ports",
  path: "/learn/laptop-ports-explained",
  kw: "laptop ports explained",
  secondary: ["usb-a vs usb-c", "what is thunderbolt on a laptop", "external graphics card laptop", "connect printer to laptop wirelessly", "connect laptop to projector", "webcam resolution for meetings", "laptop for dual screen setup"],
  h1: "Laptop ports explained: USB-A, USB-C, Thunderbolt, HDMI and more",
  title: "Laptop Ports Explained: USB-C, Thunderbolt and HDMI",
  related: ["/learn/laptop-accessories-guide-kenya", "/learn/laptop-wifi-and-internet-guide", "/learn/laptops-for-small-business-kenya"],
  write(x) {
    const { P, ksh, link, SITE, asOf, tableMd } = x;
    if (!P || P.length < 50) return null;
    const proj = dedupe(P.filter((p) => /projector/.test(p.slug)).sort((a, b) => a.price - b.price));
    const wprint = dedupe(P.filter((p) => /wireless|wifi|wi-fi/.test(p.slug) && /epson|canon|hp-|kyocera|brother|printer/.test(p.slug) && !/mouse|keyboard|headset|projector/.test(p.slug)).sort((a, b) => a.price - b.price));
    const heads = dedupe(P.filter((p) => /headset/.test(p.slug)).sort((a, b) => a.price - b.price));
    return {
      intro: `Laptop ports explained: USB-A is the familiar rectangular port; USB-C is the small oval one, but what a USB-C port can do (charging, video, Thunderbolt speed) depends on the laptop, so check its spec sheet, not the shape. Most people need at least one USB-C, two USB-A, HDMI and a headphone jack; Ethernet and an SD card reader are useful extras. Below: each port, external monitors and keyboards, printers, projectors, webcams and microphones.`,
      description: `Laptop ports explained: USB-A vs USB-C, Thunderbolt, HDMI, external GPUs, wireless printers, projectors, webcams, microphones and dual-screen setups.`,
      sections: [
        { heading: "The ports and what they do", body: tableMd(["Port", "What it's for", "Check"], [
          ["USB-A", "Mice, flash drives, keyboards, printers", "USB 3 (often blue or marked SS) is faster than USB 2"],
          ["USB-C", "Data, and on many laptops charging and video", "Charging needs USB Power Delivery; video needs DisplayPort Alt Mode"],
          ["Thunderbolt 3/4 (USB-C with a lightning-bolt symbol)", "Fast data (up to 40 Gbps), docks, two monitors, charging, sometimes external GPUs", "Only on laptops that list it"],
          ["HDMI", "Monitors, TVs, projectors", "Version limits resolution/refresh on big 4K screens"],
          ["Ethernet (RJ45)", "Wired internet", "Many business laptops; adapters for thin ones"],
          ["Headphone/mic jack (3.5 mm)", "Headsets and speakers", "Most laptops"],
          ["SD card reader", "Camera cards", "Useful for photographers"],
        ]) + "\n\nThe same-looking USB-C port can support very different features: always confirm in the laptop's specifications before buying a charger, dock or monitor for it." },
        { heading: "What is Thunderbolt?", body: "Thunderbolt is Intel's high-speed standard that uses the USB-C connector: up to 40 Gbps, two 4K monitors from one port through a dock, charging, and (on many) support for external graphics enclosures. USB4 offers similar features on newer laptops. Look for the lightning-bolt symbol by the port or \"Thunderbolt\" in the spec sheet." },
        { heading: "Do all laptops support external graphics cards?", body: "No. An external GPU (eGPU) enclosure needs a Thunderbolt 3/4 or USB4 port that supports it, and performance is lower than the same card in a desktop. Many business laptops with Thunderbolt work; laptops without Thunderbolt don't. For gaming or CAD, a laptop with a built-in dedicated GPU is usually simpler." },
        { heading: "External keyboard, mouse and monitor", body: `Plug the monitor into HDMI or USB-C/Thunderbolt, the keyboard and mouse into USB (or pair Bluetooth), then press Windows + P and choose Extend. Set the monitor as the main display in Settings → System → Display. For two monitors, see ${link("the accessories guide", `${SITE}/learn/laptop-accessories-guide-kenya`)}: the laptop needs two video outputs or a compatible dock. Business laptops with Thunderbolt are the easiest dual-screen workstations.` },
        { heading: "Printing wirelessly", body: `Connect the printer to the same Wi-Fi network (from its screen or with the maker's app), then on the laptop go to Settings → Bluetooth & devices → Printers & scanners → Add device.${wprint.length ? ` Wireless printers in stock from ${ksh(wprint[0].price)}:\n\n${liveList(x, wprint, 5)}` : ""}` },
        { heading: "Projectors", body: `Connect by HDMI (or a USB-C to HDMI adapter), then press Windows + P → Duplicate. Some projectors also connect wirelessly.${proj.length ? ` Projectors in stock:\n\n${liveList(x, proj, 3)}` : ""}\n\nPrices as of ${asOf}.` },
        { heading: "Webcams and microphones", body: `All modern laptops have a built-in webcam and microphone. 720p webcams are common on older business laptops and are fine for calls; 1080p looks noticeably sharper, and newer laptops increasingly have it. Good lighting facing you improves any webcam more than resolution. A USB headset cuts background noise in busy offices${heads.length ? ` (from ${ksh(heads[0].price)}: ${link(heads[0].short, `${SITE}/item/${heads[0].slug}`)})` : ""}.` },
        { heading: "Which ports should you look for?", body: `For most buyers: at least one USB-C (ideally with charging and video), two USB-A, HDMI and a headphone jack. Add Ethernet for offices and POS, Thunderbolt for docks and two monitors, and an SD reader for photography. See ${link("laptops for small business", `${SITE}/learn/laptops-for-small-business-kenya`)}.` },
      ],
      faq: [
        { question: "What is the difference between USB-A and USB-C?", answer: "USB-A is the older rectangular plug; USB-C is the small reversible one, which on many laptops also carries charging and video. Features depend on the laptop, not the shape." },
        { question: "What is Thunderbolt on a laptop?", answer: "Intel's high-speed standard over USB-C: up to 40 Gbps, docks, two monitors, charging and, on many laptops, external GPUs." },
        { question: "Does every laptop support external graphics cards?", answer: "No: it needs a Thunderbolt 3/4 or USB4 port that supports eGPUs, and performance is lower than in a desktop." },
        { question: "Can I connect a printer to my laptop wirelessly?", answer: "Yes: connect the printer to the same Wi-Fi network, then add it in Settings → Bluetooth & devices → Printers & scanners." },
        { question: "Can I connect a laptop to a projector?", answer: "Yes, with HDMI (or a USB-C to HDMI adapter), then Windows + P → Duplicate." },
        { question: "What is the best webcam resolution for online meetings?", answer: "1080p looks sharper; 720p is fine for calls. Good lighting improves any webcam more than extra resolution." },
        { question: "Do laptops have built-in microphones?", answer: "Yes, all modern laptops do; a USB headset improves sound in noisy rooms." },
      ],
    };
  },
});

// ---------- Batch 5 (27 Nov 2026): the fourth 100 questions ----------
// See docs/seo/question-map-4.md. Software requirements: the vendors'
// published minimum/recommended figures for recent versions, stated as such.

const winOnly = (x, r) => x.brandOf(r.slug) !== "Apple";
const gpuFirst = (rows) => dedupe([...rows].sort((a, b) => (b.sp.gpu ? 1 : 0) - (a.sp.gpu ? 1 : 0) || a.price - b.price));

ARTICLES.push({
  slug: "creative",
  path: "/learn/laptop-requirements-video-photo-editing-3d",
  kw: "laptop for Adobe Premiere Pro",
  secondary: ["laptop requirements for video editing", "laptop for illustrator", "laptop for photo editing", "laptop for 3d modelling", "how much ram for video editing", "is a gaming laptop good for video editing", "edit 4k video on laptop"],
  h1: "Laptop for Adobe Premiere Pro, Photoshop, Illustrator and 3D: what you need",
  title: "Laptop for Adobe Premiere Pro, Photoshop and 3D: A Guide",
  related: ["/best/laptops-for-graphic-design-and-video-editing-kenya", "/learn/best-laptop-for-your-profession-kenya", "/learn/gaming-laptop-guide-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf, recency, tableMd } = x;
    const ed = L.filter((r) => r.sp.ram >= 16 && (r.sp.gpu || r.sp.cpu === "Apple M-series" || recency(r.sp) >= 5));
    const gpu = gpuFirst(ed.filter((r) => r.sp.gpu && r.price <= 150000));
    const mac = dedupe(ed.filter((r) => r.sp.cpu === "Apple M-series").sort((a, b) => a.price - b.price));
    if (ed.length < 8) return null;
    const pr = (rows) => rows.slice(0, 6).map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)} (${x.specLine(r.sp)})`).join("\n");
    return {
      intro: `A laptop for Adobe Premiere Pro needs 16 GB RAM at minimum (32 GB for 4K), a recent processor, a dedicated NVIDIA RTX graphics card or an Apple-chip MacBook, and a 512 GB+ SSD. Photo editing and design need less (16 GB and a good screen); 3D and animation need the most. ${ed.length} laptops in stock meet the editing bar (${asOf}). Below: what each app needs, by Adobe's and Blender's published requirements, and the laptops that fit; the full ranked list is in ${link("laptops for design and video editing", `${SITE}/best/laptops-for-graphic-design-and-video-editing-kenya`)}.`,
      description: `Laptops for video editing, Premiere Pro, Photoshop, Illustrator, photo editing, 3D and animation in Kenya: RAM, GPU and screen needs, with live picks and prices.`,
      sections: [
        { heading: "What each app needs", body: tableMd(["Work", "RAM", "Graphics", "Notes"], [
          ["Photoshop, Lightroom (photos)", "8 GB min, 16 GB recommended", "GPU with DirectX 12 support", "Colour-accurate IPS screen matters most"],
          ["Illustrator (vector design)", "8 GB min, 16 GB recommended", "Integrated is fine for most work", "High-resolution screen helps"],
          ["Premiere Pro, 1080p", "16 GB min", "Dedicated GPU recommended", "Intel 6th gen or newer per Adobe"],
          ["Premiere Pro, 4K", "32 GB recommended", "GPU with 8 GB video memory recommended", "Fast NVMe SSD, 1 TB+ for footage"],
          ["After Effects, animation, motion graphics", "16 GB min, 32 GB recommended", "Dedicated GPU", "More cores help rendering"],
          ["Blender, 3D modelling", "8 GB min, 32 GB recommended", "Dedicated GPU (NVIDIA RTX for fast rendering)", "Cooling matters on long renders"],
        ]) + "\n\nThese are the vendors' published figures for recent versions (Adobe, Blender); they change with updates, so check the version you'll use." },
        { heading: "Recommended laptops in stock", body: `**Windows laptops with a dedicated graphics card (up to KSh 150,000), cheapest first:**\n\n${gpu.length ? pr(gpu) : "None in stock right now."}${mac.length ? `\n\n**MacBooks with Apple chips** (excellent for Premiere, Final Cut and Lightroom; check your apps run on macOS):\n\n${pr(mac)}` : ""}\n\nMore: ${link("laptops for design and video editing", `${SITE}/best/laptops-for-graphic-design-and-video-editing-kenya`)}. Prices as of ${asOf}.` },
        { heading: "How much RAM for video editing?", body: "16 GB for 1080p editing and photo work; 32 GB for 4K, long timelines, After Effects or 3D. Memory is the most common bottleneck after the GPU; check whether the laptop has a free slot before buying a 16 GB model you'll want to upgrade (see the RAM guide)." },
        { heading: "Is a gaming laptop good for video editing?", body: `Often yes: gaming laptops (HP Victus and OMEN, Lenovo Legion) have the RTX GPU, cooling and RAM editing needs, usually for less than a creator laptop. Trade-offs: heavier, louder, shorter battery, and screens tuned for speed rather than colour accuracy. See the ${link("gaming laptop guide", `${SITE}/learn/gaming-laptop-guide-kenya`)}.` },
        { heading: "Can you edit 4K on a normal laptop?", body: "Short, simple 4K clips, yes, especially on 11th-gen+ Intel (Quick Sync), recent Ryzen or Apple-chip laptops, using proxy files (low-resolution copies Premiere and others create for editing). Long 4K projects with effects need a dedicated GPU and 32 GB RAM." },
        { heading: "The best screen for design and photo editing", body: `Look for IPS or OLED, at least Full HD (QHD or higher is better for detail), wide colour coverage (100% sRGB or more is often listed on creator models) and a matte finish if you work near windows. Calibrate with a colorimeter for print work. See ${link("laptop screens explained", `${SITE}/learn/laptop-screen-and-build-quality-guide`)}.` },
        { heading: "Entry-level vs professional", body: "- **Entry level (students, social media, YouTube):** 16 GB, 11th-gen+ Intel / Ryzen or an M1/M2 MacBook Air, 512 GB SSD.\n- **Professional (client 4K work, motion graphics, 3D):** 32 GB, RTX GPU with 6–8 GB+, 1 TB NVMe, a calibrated screen or external monitor." },
      ],
      faq: [
        { question: "What do I need in a laptop for video editing?", answer: gpu.length ? `16–32 GB RAM, an RTX graphics card and a fast SSD (or an Apple-chip MacBook). The most affordable in stock with a dedicated GPU and 16 GB+ is the ${gpu[0].short} at ${ksh(gpu[0].price)} (${asOf}).` : "One with 16–32 GB RAM, an RTX graphics card and a fast SSD, or an Apple-chip MacBook." },
        { question: "How much RAM do I need for video editing?", answer: "16 GB for 1080p; 32 GB for 4K, After Effects or 3D work." },
        { question: "Which laptop is best for Adobe Premiere Pro?", answer: "Adobe lists 16 GB RAM as the minimum and recommends 32 GB and a GPU with 8 GB of video memory for 4K. An RTX gaming or creator laptop, or an Apple-chip MacBook Pro, fits." },
        { question: "Which laptop is best for Adobe Illustrator?", answer: "Illustrator is lighter: 16 GB RAM, an 8th-gen or newer processor and a sharp, colour-accurate screen are enough for most work." },
        { question: "Is a gaming laptop good for video editing?", answer: "Often yes: it has the GPU, cooling and RAM editing needs. The trade-offs are weight, noise, battery life and a screen tuned for gaming rather than colour accuracy." },
        { question: "Can I edit 4K videos on a normal laptop?", answer: "Short, simple clips with proxy files, yes; long 4K projects with effects need a dedicated GPU and 32 GB RAM." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "charging",
  path: "/learn/laptop-charger-and-battery-guide",
  kw: "laptop battery cycle count",
  secondary: ["check laptop battery cycle count", "laptop battery drains when off", "laptop battery percentage jumps", "can i use laptop while charging", "does fast charging damage laptop battery", "is my laptop charger original", "wrong wattage charger", "can a power bank charge a laptop"],
  h1: "Laptop battery cycle count, chargers and power banks explained",
  title: "Laptop Battery Cycle Count, Chargers and Power Banks Guide",
  related: ["/learn/laptop-battery-and-overheating-fixes", "/learn/laptop-accessories-guide-kenya", "/learn/laptop-maintenance-guide"],
  write(x) {
    const { link, SITE, tableMd } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `A laptop battery cycle count is the number of full 0–100% charges the battery has been through (two charges from 50% to 100% count as one cycle). Laptop batteries are commonly rated to keep around 80% of their capacity for several hundred cycles; Apple, for example, rates recent MacBook batteries at 1,000 cycles. This guide shows how to check the cycle count, why batteries drain or jump, and how to choose a safe charger or power bank.`,
      description: `Laptop battery cycle count, battery drain when off, jumping percentages, charging while using, fast charging, original chargers, wrong wattage and power banks.`,
      sections: [
        { heading: "How to check the cycle count", body: "- **Windows:** run `powercfg /batteryreport` in Command Prompt and open the report: \"Cycle Count\" is listed under Installed batteries (some laptops don't report it; the maker's app such as Lenovo Vantage, HP Support Assistant or Dell Power Manager may).\n- **MacBook:** Apple menu → System Information → Power → Cycle Count.\n\nRead it together with health (full-charge vs design capacity): a battery with a modest cycle count but low health has aged from heat or time." },
        { heading: "Why does the battery drain when switched off?", body: "Usually it isn't fully off: Windows Fast Startup and Sleep keep some power flowing, and some laptops charge devices from USB while off. Use Shut down (or Restart), turn off Fast Startup (Control Panel → Power Options → Choose what the power buttons do), and unplug USB devices. A few percent loss over days is normal self-discharge." },
        { heading: "Why does the percentage jump suddenly?", body: "The battery's gauge has drifted from its real capacity, common on worn batteries. Calibrate it: charge to 100%, use it down until it shuts off, then charge to 100% uninterrupted. If jumps continue (e.g. 30% to 5%), the battery is worn and needs replacing; check the battery report." },
        { heading: "Using the laptop while charging, and fast charging", body: "Using a laptop while charging is safe and normal: the charger powers the laptop and charges the battery. What wears batteries is heat and long periods at 100%, so keep it ventilated and turn on the maker's 80% charge limit if it's usually plugged in. Fast charging with the laptop's own or a compatible certified charger is managed by the laptop and isn't harmful in normal use; it does add some heat." },
        { heading: "Volts, amps, watts and connectors", body: tableMd(["Term", "What it means", "Rule"], [["Voltage (V)", "Electrical pressure", "Must match the laptop (barrel chargers are usually 19–20 V)"], ["Current (A)", "Flow the charger can supply", "Equal or higher is fine; the laptop draws what it needs"], ["Wattage (W = V × A)", "Total power", "Equal or higher than the original is safe; lower charges slowly or not at all"], ["Connector", "The plug", "Must fit and be the type the laptop expects (some HP and Dell chargers also identify themselves to the laptop)"]]) + "\n\nA lower-wattage charger may show a warning at startup, charge only while the laptop is off, or let the battery drain under load. A higher-wattage charger of the right type is fine." },
        { heading: "Is my charger original?", body: "Check the brand logo and part number on the label against the maker's spare-parts listing, the print quality, weight (fakes are often lighter), the cable's strain relief and whether the laptop shows a warning such as \"unknown adapter\". Buy chargers from a shop that will take them back; cheap fakes can overheat and damage the battery." },
        { heading: "Can a power bank charge a laptop?", body: `Only a **USB-C Power Delivery (PD)** power bank, and only if the laptop charges over USB-C: check for a charging symbol by the port or the spec sheet. Choose one with at least 45–65 W PD output (100 W for bigger laptops) and the right cable (rated for the wattage). Airline rules generally limit carry-on power banks to 100 Wh without approval. Laptops that charge only from a barrel connector need an AC power bank or a car inverter instead. See ${link("USB-C charging", `${SITE}/learn/laptop-accessories-guide-kenya`)}.` },
      ],
      faq: [
        { question: "What does laptop battery cycle count mean?", answer: "How many full 0–100% charges the battery has done (partial charges add up). Batteries lose capacity gradually as cycles accumulate." },
        { question: "How do I check my laptop battery cycle count?", answer: "On Windows, the battery report (powercfg /batteryreport) or the maker's app; on a MacBook, System Information → Power." },
        { question: "Can I use a laptop while charging?", answer: "Yes, it's safe. Keep it ventilated, and use an 80% charge limit if it's plugged in most of the time." },
        { question: "What happens if I use a charger with the wrong wattage?", answer: "Lower wattage charges slowly or not at all and may show a warning; higher wattage with the right voltage and connector is safe. Wrong voltage can damage the laptop." },
        { question: "Can a power bank charge a laptop?", answer: "Yes, if it's a USB-C Power Delivery power bank (45–100 W) and the laptop supports USB-C charging." },
        { question: "Does fast charging damage laptop batteries?", answer: "Not in normal use with a proper charger; the laptop manages it. Heat and long periods at 100% matter more." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "verify",
  path: "/learn/check-if-laptop-is-genuine",
  kw: "how to check if a laptop is genuine",
  secondary: ["check hp laptop genuine", "verify dell warranty", "lenovo serial number check", "laptop manufacturing year", "is my laptop brand new", "grade a refurbished laptop", "documents when buying laptop kenya"],
  h1: "How to check if a laptop is genuine: serial numbers, warranty and condition",
  title: "How to Check if a Laptop Is Genuine: Serial and Warranty",
  related: ["/learn/buying-a-laptop-safely-kenya", "/learn/refurbished-vs-used-laptops-kenya", "/learn/check-used-laptop-before-buying"],
  write(x) {
    const { link, SITE, PHONE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `How to check if a laptop is genuine: find its serial number (HP, Lenovo) or service tag (Dell) on the label underneath and in the BIOS, check they match, then enter it on the manufacturer's warranty-check page: the model, specification and dates shown should match the laptop and the listing. Then check the condition (screen, keyboard, battery) and make sure the receipt lists the serial. Here's how for each brand, plus what refurbished grades really mean.`,
      description: `Check if a laptop is genuine: HP, Dell and Lenovo serial and warranty checks, manufacturing year, new vs refurbished, Grade A/B meaning, screens, keyboards and documents.`,
      sections: [
        { heading: "Find the serial number", body: "- **Label:** underneath the laptop or under the battery on older models.\n- **BIOS:** press F1 (Lenovo), F10 (HP) or F2 (Dell) at startup; the serial or service tag is on the main page.\n- **Windows:** Command Prompt → `wmic bios get serialnumber` (or PowerShell: `Get-CimInstance Win32_BIOS`).\n\nAll three should match. A mismatch can mean a replaced motherboard or a relabelled laptop." },
        { heading: "Check it with the manufacturer", body: "- **HP:** the \"Check warranty\" page on support.hp.com: enter the serial (and product number if asked).\n- **Dell:** dell.com/support: enter the service tag to see the model, original configuration and warranty.\n- **Lenovo:** pcsupport.lenovo.com: warranty lookup by serial number.\n\nWhat to look for: the same model name, a configuration consistent with the listing (Dell shows the original parts), and the warranty dates. An expired warranty is normal on ex-corporate laptops; a serial that isn't found, or shows a different model, is a red flag." },
        { heading: "Manufacturing year and 'brand new'", body: "The warranty lookup shows the ship or warranty start date, which is close to the manufacturing year; the BIOS and the label often show a date too. A brand-new laptop comes sealed, with a warranty that starts on or near your purchase date, close to zero battery cycles (check the battery report), and no wear on keys or screen. If the warranty started years ago, it isn't new." },
        { heading: "Refurbished grades: A, B, C", body: "Grades describe cosmetic condition and aren't standardised between sellers. Typically:\n\n- **Grade A:** minimal signs of use, screen and keyboard in very good condition.\n- **Grade B:** visible light scratches or wear; fully working.\n- **Grade C:** heavier marks or worn keys; working.\n\nAsk each seller what their grade means, whether the battery and screen are included in it, and what the warranty covers. Grade is about looks; battery health and function matter more." },
        { heading: "Replaced screens and keyboard checks", body: "A replaced screen is fine if it's the right panel (same resolution, IPS rather than a cheaper TN panel, touch if the model had it) and the seller discloses it. Check for uneven gaps, dead pixels on white and black screens, and colour when tilted.\n\nKeyboard: type every key in Notepad or an online keyboard tester, test the backlight, both touchpad buttons and scrolling, and look for shiny worn keys (heavy use)." },
        { heading: "Documents you should receive in Kenya", body: "- A receipt or tax invoice (ETR / KRA eTIMS invoice from registered businesses) listing the model and **serial number**.\n- The warranty terms in writing: length, what's covered, where to take it.\n- The charger (and box/manual if new).\n- For new laptops, the manufacturer's warranty card or registration details." },
        { heading: "Buying from ECB Technologies", body: `Ask us for the serial number of any laptop before you buy and check it yourself on the manufacturer's site, or see it at our shop on Moi Avenue first. Questions on WhatsApp: ${PHONE}. Related: ${link("buying a laptop safely", `${SITE}/learn/buying-a-laptop-safely-kenya`)} and ${link("the 12-point used-laptop checklist", `${SITE}/learn/check-used-laptop-before-buying`)}.` },
      ],
      faq: [
        { question: "How do I check if an HP laptop is genuine?", answer: "Enter the serial number from the label and BIOS on HP's Check warranty page (support.hp.com); the model and dates should match the laptop." },
        { question: "How do I verify a Dell laptop warranty?", answer: "Enter the service tag (on the label or in the BIOS via F2) at dell.com/support to see the model, original configuration and warranty status." },
        { question: "How can I check a Lenovo laptop serial number?", answer: "On the label underneath, in the BIOS (F1), or with wmic bios get serialnumber in Windows; check it on pcsupport.lenovo.com." },
        { question: "How do I check the manufacturing year of a laptop?", answer: "The manufacturer's warranty lookup shows the ship or warranty start date; the label and BIOS often show a date too." },
        { question: "What does Grade A refurbished mean?", answer: "Usually minimal cosmetic wear, but grades aren't standardised: ask the seller what their grade covers, and check battery health and function separately." },
        { question: "What documents should I receive when buying a laptop in Kenya?", answer: "A receipt or tax invoice listing the serial number, the warranty terms in writing, and the charger." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "specialist-software",
  path: "/learn/laptops-for-engineering-data-and-programming-software",
  kw: "best laptop for SolidWorks",
  secondary: ["laptop for matlab", "laptop for spss", "laptop for data analysis", "laptop for python machine learning", "laptop for android studio", "laptop for virtual machines", "laptop for sketchup", "laptop for music production", "laptop for web development", "laptop for cybersecurity students"],
  h1: "Laptops for SolidWorks, MATLAB, SPSS, Python, Android Studio and more",
  title: "Best Laptop for SolidWorks, MATLAB, Python & Android Studio",
  related: ["/learn/best-laptops-for-autocad-and-revit-kenya", "/best/laptops-for-programming-kenya", "/learn/best-laptop-for-your-profession-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf, recency, tableMd } = x;
    const heavy = dedupe(L.filter((r) => winOnly(x, r) && r.sp.ram >= 16 && recency(r.sp) >= 4 && (r.sp.tier || 0) >= 3 && r.price <= 120000).sort((a, b) => b.sp.ram - a.sp.ram || a.price - b.price));
    const ws = gpuFirst(L.filter((r) => /-(zbook|precision|thinkpad-p\d+s?|p\d{2}s?)-/.test(`-${r.slug}-`) && r.sp.ram >= 16));
    const vm = dedupe(L.filter((r) => winOnly(x, r) && r.sp.ram >= 32).sort((a, b) => a.price - b.price));
    if (heavy.length < 6) return null;
    const pr = (rows, n = 5) => rows.slice(0, n).map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)} (${x.specLine(r.sp)})`).join("\n");
    return {
      intro: `The best laptop for SolidWorks is a Windows mobile workstation (HP ZBook, Dell Precision, ThinkPad P) with 16–32 GB RAM, a fast recent processor and a certified professional GPU; SolidWorks runs only on Windows. MATLAB, SPSS, Python and web development need far less, while Android Studio, virtual machines and machine learning need more memory. Here's each tool's published requirements in plain terms, and the laptops in stock that fit (${asOf}).`,
      description: `Laptops for SolidWorks, MATLAB, SPSS, data analysis, Python and machine learning, Android Studio, virtual machines, SketchUp, music production and web development.`,
      sections: [
        { heading: "Requirements at a glance", body: tableMd(["Software", "OS", "RAM", "Graphics / other"], [
          ["SolidWorks", "Windows only", "16 GB min; 32 GB for large assemblies", "Certified workstation GPU recommended; fast single-core CPU"],
          ["MATLAB", "Windows, macOS, Linux", "8 GB min; 16 GB recommended", "SSD; a GPU only for GPU-accelerated toolboxes"],
          ["SPSS", "Windows, macOS", "Modest (8 GB is comfortable)", "Any 8th-gen+ laptop runs it"],
          ["Python, data analysis", "Any", "8–16 GB; 16–32 GB for large datasets", "SSD; more cores speed up processing"],
          ["Machine learning (training)", "Linux or Windows", "16–32 GB", "NVIDIA GPU with CUDA for training; large models need cloud GPUs"],
          ["Android Studio", "Windows, macOS, Linux", "8 GB min; 16 GB+ recommended", "Virtualisation enabled for the emulator; SSD with 16 GB+ free"],
          ["Virtual machines", "Any", "16 GB for 1–2 VMs; 32 GB+ for several", "Virtualisation (VT-x/AMD-V) on in BIOS; more cores"],
          ["SketchUp", "Windows, macOS", "8 GB min; 16 GB recommended", "Dedicated GPU helps with large models"],
          ["Music production (DAWs)", "Windows, macOS", "16 GB; 32 GB for big sample libraries", "Quiet cooling, SSD, an audio interface"],
          ["Web development", "Any", "8–16 GB", "Any 8th-gen+ laptop"],
        ]) + `\n\nFigures are the vendors' published minimums/recommendations for recent versions (Dassault Systèmes, MathWorks, IBM, Google, Trimble); check the version you'll install. Android Studio's are on [developer.android.com](https://developer.android.com/studio).` },
        { heading: "SolidWorks, SketchUp and CAD", body: `SolidWorks needs Windows, and Dassault recommends certified professional graphics (NVIDIA RTX A-series / Quadro, AMD Radeon Pro): mobile workstations are the safe choice.${ws.length ? ` Workstations in stock with 16 GB+:\n\n${pr(ws)}` : ""}\n\nFor AutoCAD and Revit, see ${link("laptops for AutoCAD and Revit", `${SITE}/learn/best-laptops-for-autocad-and-revit-kenya`)}.` },
        { heading: "Data analysis, Python and machine learning", body: `For learning Python, pandas, SPSS, R or MATLAB, a 10th-gen+ laptop with 16 GB RAM is plenty. Training deep-learning models needs an NVIDIA GPU (CUDA); even then, laptop GPUs handle small models only. Large models are trained on cloud GPUs (Google Colab, Kaggle, cloud providers): a mid-range laptop plus cloud time is often the better investment for students.` },
        { heading: "Android Studio, virtual machines and cybersecurity labs", body: `Android Studio's emulator, virtual machines and cybersecurity labs (Kali Linux, test networks) are memory-hungry: 16 GB is the working minimum, 32 GB comfortable for several VMs, with virtualisation enabled in the BIOS and an SSD.${vm.length ? ` Laptops in stock with 32 GB RAM or more:\n\n${pr(vm)}` : ""}` },
        { heading: "Recommended all-rounders (16 GB, 10th gen+, up to KSh 120,000)", body: `${pr(heavy, 6)}\n\nMore: ${link("laptops for programming", `${SITE}/best/laptops-for-programming-kenya`)}.` },
        { heading: "Music production and web development", body: "Music production rewards quiet cooling, 16 GB+ RAM, an SSD and low audio latency (an external USB audio interface helps on any laptop); MacBooks are popular for Logic Pro, Windows laptops for FL Studio and Ableton (both also run on Mac). Web development runs well on any 8th-gen+ laptop with 8–16 GB." },
      ],
      faq: [
        { question: "Which laptop is best for running SolidWorks?", answer: "A Windows mobile workstation (HP ZBook, Dell Precision or ThinkPad P) with 16–32 GB RAM and a certified professional GPU; SolidWorks doesn't run on macOS." },
        { question: "What laptop is suitable for running MATLAB?", answer: "Any 8th-gen or newer laptop with 16 GB RAM and an SSD; MathWorks lists 8 GB as the minimum. A GPU matters only for GPU-accelerated toolboxes." },
        { question: "Which laptop is best for running SPSS?", answer: "SPSS is light: any 8th-gen or newer Windows laptop or MacBook with 8 GB RAM runs it comfortably." },
        { question: "Which laptop is best for Python and machine learning?", answer: "For learning and data analysis, 16 GB RAM and a 10th-gen+ processor. For training models, an NVIDIA GPU with CUDA, and cloud GPUs for large models." },
        { question: "What laptop is best for running Android Studio?", answer: "Google lists 8 GB RAM as the minimum and recommends 16 GB or more, with virtualisation enabled and an SSD." },
        { question: "Which laptop is suitable for running virtual machines?", answer: "16 GB RAM for one or two VMs, 32 GB for several, virtualisation turned on in the BIOS and a multi-core processor." },
        { question: "Which laptop is best for cybersecurity students?", answer: "One that runs several virtual machines (Kali Linux, test targets): 16–32 GB RAM, a 10th-gen+ processor and virtualisation support." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "families",
  path: "/learn/laptop-product-families-explained",
  kw: "HP EliteBook vs ZBook",
  secondary: ["dell precision vs latitude", "thinkpad vs thinkbook", "are microsoft surface laptops worth it", "probook vs zbook", "what is a mobile workstation", "what is a convertible laptop", "netbook vs laptop", "best business laptop brands"],
  h1: "Laptop families explained: EliteBook vs ZBook, Precision vs Latitude, ThinkPad vs ThinkBook, Surface",
  title: "HP EliteBook vs ZBook, Precision vs Latitude and More",
  related: ["/learn/business-vs-consumer-laptops", "/series/zbook-kenya", "/learn/hp-elitebook-models-explained"],
  write(x) {
    const { L, ksh, median, link, SITE, asOf, tableMd } = x;
    const fam = (re) => L.filter((r) => re.test(`-${r.slug}-`));
    const rows = [["HP ProBook", fam(/-probook-/)], ["HP EliteBook", fam(/-elitebook-/)], ["HP ZBook", fam(/-zbook-/)], ["Dell Latitude", fam(/-latitude-/)], ["Dell Precision", fam(/-precision-/)], ["Lenovo ThinkPad", fam(/-thinkpad-/)], ["Lenovo ThinkBook", fam(/-thinkbook-/)], ["Microsoft Surface", fam(/-surface-/)]];
    if (rows.filter(([, r]) => r.length).length < 5) return null;
    const surf = dedupe(fam(/-surface-/).sort((a, b) => a.price - b.price));
    return {
      intro: `HP EliteBook vs ZBook: the EliteBook is HP's premium business laptop for office work and travel; the ZBook is HP's mobile workstation, with professional graphics and more power for CAD, 3D and engineering software. The same split exists at Dell (Latitude vs Precision) and Lenovo (ThinkPad T/X vs ThinkPad P), while ThinkBook and ProBook are lower-cost business lines. Below: every family explained, with how many are in stock and their prices (${asOf}).`,
      description: `Laptop families compared: HP ProBook, EliteBook and ZBook; Dell Latitude and Precision; ThinkPad vs ThinkBook; Microsoft Surface; workstations, convertibles and netbooks.`,
      sections: [
        { heading: "The families side by side", body: tableMd(["Family", "What it is", "In stock", "Median price"], rows.map(([n, r]) => [n, { "HP ProBook": "Mid-range business: practical, lower cost", "HP EliteBook": "Premium business: metal build, security, light", "HP ZBook": "Mobile workstation: professional GPU, CAD/3D", "Dell Latitude": "Business line, 3000 to 9000 series", "Dell Precision": "Mobile workstation: professional GPU", "Lenovo ThinkPad": "Business line (T, X, E, L) and workstations (P)", "Lenovo ThinkBook": "Small-business line between IdeaPad and ThinkPad", "Microsoft Surface": "Premium tablets (Pro) and laptops, often 2-in-1" }[n], String(r.length), r.length >= 3 ? ksh(median(r.map((y) => y.price))) : r.length ? ksh(r[0].price) : "–"])) },
        { heading: "EliteBook vs ZBook, and ProBook vs ZBook", body: `EliteBooks are built for office work, travel and security; ZBooks add workstation processors, professional NVIDIA RTX A / Quadro graphics certified for CAD software, and more RAM capacity, at the cost of weight and price. ProBooks are HP's cheaper business line: fine for office work, not for CAD. See ${link("HP ZBook laptops", `${SITE}/series/zbook-kenya`)} and ${link("EliteBook vs ProBook", `${SITE}/compare/elitebook-vs-probook-kenya`)}.` },
        { heading: "Dell Precision vs Latitude", body: `Precision is Dell's mobile workstation (professional graphics, ISV-certified for engineering software); Latitude is the business line for office work. Precision is better only if you run CAD, simulation or 3D; for everything else a Latitude is lighter and cheaper. See ${link("Latitude models explained", `${SITE}/learn/dell-latitude-models-explained`)}.` },
        { heading: "ThinkPad vs ThinkBook", body: "ThinkBook is Lenovo's lower-cost small-business line: modern design, good value, but without some ThinkPad features (TrackPoint on most models, the same durability testing and enterprise management). ThinkPad remains the line for durability and long-term repairability." },
        { heading: "Are Microsoft Surface laptops worth buying?", body: `Surface devices have excellent screens and pens, and the Surface Pro doubles as a tablet. Downsides: higher prices, few ports, and limited repairability, and some newer models use Snapdragon (Arm) chips, on which a few Windows programs and games don't run.${surf.length ? ` ${surf.length} Surface devices are in stock from ${ksh(surf[0].price)}.` : ""}` },
        { heading: "Mobile workstations, convertibles and netbooks", body: `- **Mobile workstation:** a laptop with workstation-class processor and certified professional graphics for CAD, simulation and 3D (ZBook, Precision, ThinkPad P). See ${link("laptops for AutoCAD and Revit", `${SITE}/learn/best-laptops-for-autocad-and-revit-kenya`)}.\n- **Convertible (2-in-1):** a laptop whose touchscreen folds into a tablet (HP x360, ThinkPad Yoga) or detaches (Surface Pro). See ${link("is a 2-in-1 worth it", `${SITE}/learn/touchscreen-laptop-worth-it-kenya`)}.\n- **Netbook:** small, low-power laptops popular around 2008–2012; today their role is filled by Chromebooks and small 11–12-inch laptops (like the ThinkPad 11e).` },
        { heading: "Which brands make the best business laptops? And after-sales support", body: `HP (EliteBook), Dell (Latitude) and Lenovo (ThinkPad) all make excellent business laptops; compare the specific model, generation, battery and price, not the logo: ${link("HP vs Dell vs Lenovo", `${SITE}/hp-vs-dell-vs-lenovo-laptops-kenya`)}. For after-sales support in Kenya, check whether the manufacturer's warranty is valid locally (warranty lookup shows the region), where its authorised service partners are, and what warranty the seller gives; parts for HP, Dell and Lenovo business models are widely available in Nairobi.` },
      ],
      faq: [
        { question: "What is the difference between HP EliteBook and HP ZBook?", answer: "EliteBook is HP's premium business laptop; ZBook is its mobile workstation, with professional graphics and more power for CAD, 3D and engineering." },
        { question: "Is Dell Precision better than Dell Latitude?", answer: "For CAD, simulation and 3D, yes. For office work, a Latitude is lighter and cheaper and does the job." },
        { question: "What is the difference between Lenovo ThinkPad and ThinkBook?", answer: "ThinkBook is Lenovo's lower-cost small-business line; ThinkPad adds the TrackPoint, durability testing and enterprise features." },
        { question: "Are Microsoft Surface laptops worth buying?", answer: "For pen use, portability and great screens, yes; but they cost more, have few ports, are hard to repair, and Snapdragon models don't run every Windows program." },
        { question: "What is a mobile workstation laptop?", answer: "A laptop with professional, software-certified graphics and workstation-class components for CAD, 3D and engineering, such as an HP ZBook, Dell Precision or ThinkPad P." },
        { question: "What is the difference between a netbook and a laptop?", answer: "Netbooks were small, low-power laptops from around 2008–2012; today small Chromebooks and 11–12-inch laptops fill that role." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "procurement",
  path: "/learn/business-laptop-procurement-kenya",
  kw: "buying laptops in bulk for a company in Kenya",
  secondary: ["refurbished or new laptops for business", "choose laptops for employees", "laptop for sales representative", "laptop for travelling professionals", "backup laptops small business", "total cost of ownership laptop", "when to replace company laptops", "standard laptop specs for employees"],
  h1: "Buying laptops for a company in Kenya: specs, cost of ownership and bulk orders",
  title: "Buying Laptops in Bulk for a Company in Kenya: A Guide",
  related: ["/learn/laptops-for-small-business-kenya", "/best/business-laptops-kenya", "/learn/laptop-maintenance-guide"],
  write(x) {
    const { L, ksh, median, link, SITE, PHONE, asOf, recency, tableMd } = x;
    const std = L.filter((r) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${r.slug}-`) && recency(r.sp) >= 3 && (r.sp.tier || 0) >= 3);
    if (std.length < 15) return null;
    const models = {};
    for (const r of std) { const k = x.modelKey(r.slug); if (k) (models[k] = models[k] || []).push(r); }
    const deep = Object.entries(models).filter(([, rs]) => rs.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
    const light = dedupe(std.filter((r) => /-(x2\d0|x3\d0|x13|t4\d0s|t14s|830|835|1030|1040|7390|7400|7300)-/.test(`-${r.slug}-`)).sort((a, b) => a.price - b.price));
    const wa = `https://wa.me/254717040531?text=${encodeURIComponent("Hello ECB Technologies, we'd like a quote for several laptops. Quantity: __, budget per laptop: __, use: __.")}`;
    return {
      intro: `When buying laptops in bulk for a company in Kenya, standardise on one or two business models, set a minimum spec (8th-gen or newer Core i5, 8–16 GB RAM, SSD, Windows 11 Pro), compare total cost of ownership rather than sticker price, and plan replacements every 4–5 years. ${std.length} business laptops that meet that spec are in stock at ECB Technologies, median ${ksh(median(std.map((r) => r.price)))} (${asOf}). Below: refurbished vs new, specs, spares, cost of ownership and how to request a quote.`,
      description: `Company laptop purchasing in Kenya: refurbished vs new, standard specs, sales and travel staff, spares, total cost of ownership, replacement cycles and bulk quotes.`,
      sections: [
        { heading: "Refurbished or new for a business?", body: tableMd(["", "Refurbished business laptops", "New laptops"], [["Price", "Much lower for the same class", "Higher"], ["Warranty", "Seller's warranty (varies)", "Manufacturer's warranty"], ["Battery", "Used; check health", "New"], ["Fit for", "Office staff, students, budgets, spares", "Long deployments, staff who need the newest features"]]) + `\n\nMany SMEs mix both: refurbished 8th–11th gen business laptops for most staff, new for roles that need the latest hardware. See ${link("refurbished vs used vs new", `${SITE}/learn/refurbished-vs-used-laptops-kenya`)}.` },
        { heading: "Standard specs for employees", body: "- **Office staff:** 8th-gen+ Core i5, 8 GB (16 GB for heavy Excel or many tabs), 256 GB SSD, 14-inch, Windows 11 Pro.\n- **Finance and analysts:** 10th-gen+, 16 GB, 15.6-inch with number pad.\n- **Designers / engineers:** see the creative and CAD guides.\n- **Everyone:** TPM 2.0 for BitLocker, a webcam and mic, USB-C or a dock for desk setups.\n\nStandardising on one model simplifies support, chargers and spare parts." },
        { heading: "Sales representatives and travelling staff", body: `Choose light 13–14-inch business laptops (ThinkPad X/T-s, EliteBook 830/840, Latitude 7000) with good battery health, Wi-Fi 6 where possible, and a sturdy bag.${light.length ? ` Light business laptops in stock from ${ksh(light[0].price)}:\n\n${light.slice(0, 5).map((r) => `- ${link(r.short, `${SITE}/item/${r.slug}`)}: ${ksh(r.price)} (${x.specLine(r.sp)})`).join("\n")}` : ""}` },
        { heading: "Models in stock in several configurations", body: deep.length ? `Models we hold in 3 or more configurations (easier to standardise on):\n\n${deep.map(([k, rs]) => `- ${link(x.modelName(k), `${SITE}/laptops/${k.replace(/ /g, "-")}-price-kenya`)}: ${rs.length} in stock, from ${ksh(Math.min(...rs.map((r) => r.price)))}`).join("\n")}\n\nStock changes daily; confirm quantities before ordering.` : "Ask us which models we can supply in the quantity you need." },
        { heading: "Total cost of ownership", body: "Total cost of ownership (TCO) per laptop over its life:\n\n**TCO = purchase price + accessories + software licences + repairs and parts (battery, charger) + IT time + downtime − resale value.**\n\nA cheaper laptop that fails or slows staff down can cost more than a better one. Worked example: a KSh 40,000 laptop kept 4 years with a KSh 6,000 battery replacement and KSh 8,000 resale costs about KSh 38,000 over 4 years, roughly KSh 9,500 a year, before licences and support." },
        { heading: "Spares, replacement cycles and continuity", body: "- **Spares:** many IT teams keep around one spare for every 10–20 laptops (at least one for small teams), so a broken laptop doesn't stop work.\n- **Replacement cycle:** typically 4–5 years for business laptops, earlier if the processor drops out of Windows support or repairs pass about half the cost of a replacement.\n- **Continuity:** cloud backups (OneDrive/Google Drive), encryption, and a record of serial numbers and warranties." },
        { heading: "Bulk orders and quotes", body: `Before buying in bulk: agree the exact model and spec, warranty terms in writing, delivery timeline, invoice requirements (KRA eTIMS invoices for your accounts), and what happens if a unit is faulty on arrival. Whether a bulk order is cheaper depends on the models and quantity; ask for a written quote.\n\n**Request a quote:** [send your quantity, budget and use on WhatsApp](${wa}) (${PHONE}), or visit the shop on Moi Avenue, Nairobi CBD. See also ${link("laptops for small business", `${SITE}/learn/laptops-for-small-business-kenya`)}.` },
      ],
      faq: [
        { question: "Should a small business buy refurbished or brand-new laptops?", answer: "Refurbished business laptops give more performance per shilling for most staff; new laptops suit long deployments and roles needing the newest hardware. Many SMEs mix both." },
        { question: "How do I choose laptops for a company's employees?", answer: "Standardise on one or two business models, set a minimum spec by role (8th-gen+ Core i5, 8–16 GB, SSD, Windows 11 Pro) and compare total cost of ownership." },
        { question: "How many laptops should a small business keep as backup?", answer: "A common rule of thumb is one spare for every 10–20 laptops, and at least one for a small team." },
        { question: "How do I calculate the total cost of owning a business laptop?", answer: "Purchase price plus accessories, licences, repairs, IT time and downtime, minus resale value, divided by the years you keep it." },
        { question: "When should a company replace its employees' laptops?", answer: "Typically every 4–5 years, or earlier if the processor loses Windows support or repairs pass about half the cost of a replacement." },
        { question: "Is it cheaper for a company to buy laptops in bulk in Kenya?", answer: "It depends on the model and quantity; ask suppliers for a written quote. Standardising on one model also saves on support and spare parts." },
      ],
    };
  },
});

// ---------- Batch 6 (27 Nov 2026): the fifth 100 questions ----------
// See docs/seo/question-map-5.md.

const notAio = (r) => !/all-in-one|-aio-|desktop/.test(r.slug);
const plist = (x, rows, n = 6) => dedupe(rows).slice(0, n).map((r) => `- ${x.link(r.short, `${x.SITE}/item/${r.slug}`)}: ${x.ksh(r.price)}${r.sp && x.specLine(r.sp) ? ` (${x.specLine(r.sp)})` : ""}`).join("\n");

ARTICLES.push({
  slug: "ai-pc",
  path: "/learn/ai-pc-npu-and-snapdragon-laptops",
  kw: "what is an AI PC",
  secondary: ["what is an npu in a laptop", "do i need an ai laptop", "intel core i5 vs core 5", "core i7 vs core ultra 7", "arm vs x86 laptop", "are snapdragon laptops better than intel", "can arm laptops run windows apps", "32-bit vs 64-bit windows", "ryzen for business laptops"],
  h1: "What is an AI PC? NPUs, Core Ultra, Snapdragon and ARM laptops explained",
  title: "What Is an AI PC? NPUs, Core Ultra and Snapdragon Explained",
  related: ["/laptops/core-ultra-laptops-kenya", "/learn/core-i3-vs-i5-vs-i7-vs-ryzen", "/learn/laptop-processor-generations-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf, tableMd } = x;
    const lap = L.filter(notAio);
    const ultra = dedupe(lap.filter((r) => r.sp.cpu === "Core Ultra").sort((a, b) => a.price - b.price));
    const snap = dedupe(lap.filter((r) => /snapdragon/.test(r.slug)).sort((a, b) => a.price - b.price));
    const core5 = dedupe(lap.filter((r) => /-core-[3579]-\d{3}/.test(`-${r.slug}`) && !/ultra/.test(r.slug)).sort((a, b) => a.price - b.price));
    const ryzenPro = dedupe(lap.filter((r) => /ryzen-\d-pro|-pro-\d{4}/.test(r.slug)).sort((a, b) => a.price - b.price));
    if (ultra.length < 5) return null;
    return {
      intro: `What is an AI PC? A laptop with an NPU (neural processing unit), a chip built to run AI features on the laptop itself, efficiently, alongside the processor and graphics. Microsoft's "Copilot+ PC" label requires an NPU of 40 TOPS or more (Snapdragon X, AMD Ryzen AI 300 and Intel Core Ultra 200V chips), plus 16 GB RAM and a 256 GB SSD. Most AI tools people use today (ChatGPT, Copilot chat, Gemini) run in the cloud and work on any laptop, so an AI PC is useful but not essential. At ECB Technologies, ${ultra.length} Intel Core Ultra and ${snap.length} Snapdragon laptops are in stock (${asOf}).`,
      description: `AI PCs explained: what an NPU does, Copilot+ PCs, Core Ultra vs Core i7, Intel Core 5 vs i5, Snapdragon and ARM vs x86, app compatibility, and 32-bit vs 64-bit.`,
      sections: [
        { heading: "What the NPU does, and what runs in the cloud", body: "The NPU runs AI tasks locally with little power: background blur and eye contact in video calls (Windows Studio Effects), live captions and translation, noise suppression, and on Copilot+ PCs features such as Recall and Cocreator. Chatbots, image generators and most AI writing tools run on remote servers instead, so they need an internet connection, not an NPU. Performance is quoted in TOPS (trillions of operations per second)." },
        { heading: "Do you need an AI laptop in 2026?", body: `Most buyers don't: study, office work and web-based AI tools run well on any 8th-gen or newer laptop. An AI PC is worth it if you're buying new anyway and want the longest support, the best battery life, or on-device features for frequent video calls. Developers experimenting with local AI models need RAM and a GPU more than an NPU.` },
        { heading: "Intel naming: Core i5, Core 5 and Core Ultra 5", body: tableMd(["Name", "What it is", "NPU"], [
          ["Core i3/i5/i7/i9 (to 14th gen)", "Intel's classic numbered generations", "No"],
          ["Core 3/5/7 (e.g. Core 5 120U, Core 7 150U)", "Mainstream chips sold under the newer naming (2024 on), based on earlier designs", "No"],
          ["Core Ultra 5/7/9 (Series 1 from late 2023, Series 2 from 2024)", "Intel's newest designs with Arc graphics and an NPU", "Yes; Core Ultra 200V qualifies for Copilot+"],
        ]) + `\n\nSo a Core 5 is not a Core Ultra 5. Core Ultra 7 vs Core i7: the Ultra 7 adds the NPU, much stronger integrated graphics and better battery life; compare specific models, not just the badge.${core5.length ? ` Intel Core 5/7 laptops in stock:\n\n${plist(x, core5, 4)}` : ""}` },
        { heading: "AMD Ryzen for business", body: `Ryzen laptops are strong value, often with more cores and better integrated graphics. AMD's Ryzen PRO chips add business security and remote-management features, and Ryzen AI 300 chips qualify for Copilot+.${ryzenPro.length ? ` Ryzen PRO business laptops in stock:\n\n${plist(x, ryzenPro, 4)}` : ""}\n\nSee ${link("AMD Ryzen laptops", `${SITE}/laptops/amd-ryzen-laptops-kenya`)}.` },
        { heading: "ARM vs x86, and Snapdragon laptops", body: `Intel and AMD chips use the x86 architecture; Qualcomm's Snapdragon X chips use ARM, like phones. Snapdragon laptops get excellent battery life and run cool and quiet. Windows on ARM runs native ARM apps (Microsoft Office, Edge, Chrome, Teams, Zoom and many more) and emulates most x86/x64 apps through Microsoft's Prism layer. What can still fail: some games with anti-cheat, older printer and scanner drivers, some VPN and security software, and specialist engineering tools. Check your must-have software before buying.${snap.length ? `\n\nSnapdragon laptops in stock:\n\n${plist(x, snap, 5)}` : ""}` },
        { heading: "Intel Core Ultra laptops in stock", body: `${plist(x, ultra, 6)}\n\nAll of them: ${link("Core Ultra laptops", `${SITE}/laptops/core-ultra-laptops-kenya`)}. Prices as of ${asOf}.` },
        { heading: "32-bit vs 64-bit Windows", body: "Windows 11 is 64-bit only. 64-bit Windows can use more than 4 GB of RAM and runs almost all 32-bit apps; 32-bit Windows (Windows 10 and older) is limited to about 4 GB of RAM. Check yours in Settings → System → About → System type." },
      ],
      faq: [
        { question: "What is an AI PC?", answer: "A laptop with an NPU that runs AI features on the device; Microsoft's Copilot+ PCs need an NPU of 40+ TOPS, 16 GB RAM and a 256 GB SSD." },
        { question: "What is an NPU in a laptop?", answer: "A neural processing unit: a chip that runs AI tasks such as background blur, captions and noise suppression locally, using little power." },
        { question: "Do I need an AI laptop in 2026?", answer: "Not for most people: web-based AI tools work on any laptop. It's worth it if you're buying new and want long support, great battery life and on-device AI features." },
        { question: "What is the difference between Intel Core i5 and Intel Core 5?", answer: "Core 5 is Intel's newer naming for mainstream chips (2024 on), without an NPU; Core i5 is the older numbered generations. Neither is a Core Ultra 5." },
        { question: "Are Snapdragon laptops better than Intel laptops?", answer: "For battery life and quiet running, often yes. For compatibility with every Windows program, game and driver, Intel and AMD are safer." },
        { question: "Can ARM laptops run normal Windows applications?", answer: "Most: native ARM apps run directly and most x64 apps run through emulation, but some games, drivers and specialist software don't." },
        { question: "What is the difference between 32-bit and 64-bit Windows?", answer: "64-bit Windows uses more than 4 GB RAM and runs almost all apps; Windows 11 is 64-bit only." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "performance",
  path: "/learn/laptop-performance-guide",
  kw: "how to check laptop performance",
  secondary: ["laptop slow with 16gb ram", "ram or processor which makes laptop faster", "does ssd improve laptop performance", "reduce cpu usage", "laptop lags opening apps", "ideal ram for multitasking", "benchmark laptop"],
  h1: "Laptop performance guide: what makes a laptop fast and how to check it",
  title: "How to Check Laptop Performance (and What Makes It Fast)",
  related: ["/learn/laptop-slow-freezing-not-charging-fixes", "/learn/how-much-ram-laptop-kenya", "/learn/core-i3-vs-i5-vs-i7-vs-ryzen"],
  write(x) {
    const { link, SITE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `How to check laptop performance: open Task Manager (Ctrl+Shift+Esc) → Performance. It shows how busy the processor (CPU), memory, disk and graphics are right now; whichever stays near 100% while the laptop feels slow is your bottleneck. A laptop's speed comes from the processor (tier and generation), enough RAM for what you open, an SSD, and cooling that lets the processor run at full speed. More RAM helps only when memory is the bottleneck.`,
      description: `Check and improve laptop performance: CPU, RAM, SSD and cooling explained, why a 16 GB laptop can still be slow, reducing CPU use, multitasking and benchmarking.`,
      sections: [
        { heading: "How the parts work together", body: x.tableMd(["Part", "What it affects", "Bottleneck sign"], [["Processor (CPU)", "How fast apps run and respond", "CPU near 100% in Task Manager"], ["RAM", "How many apps and tabs stay open smoothly", "Memory above ~90%, slowdowns when switching apps"], ["Storage (SSD/HDD)", "Startup, opening apps and files", "Disk at 100% (common with hard drives)"], ["Cooling", "Whether the CPU keeps its full speed", "Speed drops when hot (thermal throttling); loud fan"], ["Graphics (GPU)", "Games, editing, 3D", "GPU near 100% in games or renders"]]) },
        { heading: "RAM or processor: which makes a laptop faster?", body: `Neither alone. The processor sets how fast work gets done; RAM sets how much can stay open before slowing down. For office work, an 8th-gen or newer Core i5 with 8 GB and an SSD feels fast; 16 GB helps multitasking. Compare tiers and generations in ${link("Core i3 vs i5 vs i7 vs Ryzen", `${SITE}/learn/core-i3-vs-i5-vs-i7-vs-ryzen`)}.` },
        { heading: "Does an SSD improve performance?", body: `Hugely, for startup and opening apps and files: often from minutes to seconds compared with a hard drive. It doesn't make the processor faster. See ${link("HDD to SSD upgrade", `${SITE}/learn/laptop-upgrade-ram-ssd`)}.` },
        { heading: "Why is my laptop slow even with 16 GB RAM?", body: "Because RAM isn't the bottleneck: check Task Manager. Common causes: an old processor (7th gen or older), a hard drive instead of an SSD, overheating that throttles the CPU (clean the vents), a nearly full drive, too many startup apps, a battery-saver power mode, malware, or a single program using all the CPU." },
        { heading: "Reducing CPU use and lag when opening apps", body: "1. Task Manager → Processes: sort by CPU; close or uninstall what you don't need.\n2. Task Manager → Startup apps: disable unnecessary ones.\n3. Settings → System → Power: use Balanced or Best performance when plugged in.\n4. Update Windows and drivers; scan for malware.\n5. Keep 15–20% of the SSD free.\n6. Limit browser extensions and tabs (each tab uses memory and CPU)." },
        { heading: "Multitasking: how many apps, how much RAM?", body: `There's no fixed number: it depends on the apps. As a guide: 8 GB handles Office, a browser with 10–15 tabs and a video call; 16 GB handles heavy multitasking, many tabs and development tools; 32 GB is for VMs, 4K editing and large datasets. See ${link("how much RAM you need", `${SITE}/learn/how-much-ram-laptop-kenya`)}.` },
        { heading: "Does the processor affect browsing speed?", body: "Download speed comes from your internet and Wi-Fi, but how fast pages render and how many tabs stay smooth depends on the processor and RAM: heavy sites (web apps, video, maps) feel noticeably faster on a newer processor." },
        { heading: "How to benchmark your laptop", body: "Free tools give scores you can compare with published results for the same model:\n\n- **Processor:** Cinebench or Geekbench.\n- **Storage:** CrystalDiskMark (read/write speeds).\n- **Graphics:** 3DMark (free basic tests).\n\nRun tests plugged in, with other apps closed, and run them twice. Very low scores compared with other laptops of the same model usually point to overheating, a power setting, or a hard drive." },
      ],
      faq: [
        { question: "How can I check my laptop performance?", answer: "Task Manager → Performance shows CPU, memory, disk and GPU use in real time; benchmarks like Cinebench and CrystalDiskMark give comparable scores." },
        { question: "What makes a laptop faster, RAM or processor?", answer: "Both, for different things: the processor sets speed, RAM sets how much stays open smoothly. An SSD makes the biggest difference to startup and opening apps." },
        { question: "Why is my laptop slow even with 16GB RAM?", answer: "Usually something else is the bottleneck: an old processor, a hard drive, overheating, a full drive, startup apps or malware. Check Task Manager." },
        { question: "Does an SSD improve laptop performance?", answer: "Yes, dramatically for startup, opening apps and files; it doesn't speed up the processor." },
        { question: "What is the ideal RAM for multitasking?", answer: "16 GB for heavy multitasking and many browser tabs; 8 GB for normal office use; 32 GB for VMs and 4K editing." },
        { question: "How do I benchmark my laptop performance?", answer: "Use Cinebench or Geekbench for the CPU, CrystalDiskMark for storage and 3DMark for graphics, plugged in with other apps closed." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "gpu",
  path: "/learn/laptop-graphics-cards-explained",
  kw: "laptop graphics card explained",
  secondary: ["how to check laptop graphics card", "nvidia optimus", "laptop gpu vs desktop gpu", "external gpu laptop", "ray tracing laptop", "vram for video editing", "intel graphics premiere pro", "esports gaming laptop"],
  h1: "Laptop graphics cards explained: RTX, VRAM, Optimus and ray tracing",
  title: "Laptop Graphics Card Explained: RTX, VRAM and Optimus",
  related: ["/learn/gaming-laptop-guide-kenya", "/learn/laptop-requirements-video-photo-editing-3d", "/best/gaming-laptops-kenya"],
  write(x) {
    const { L, ksh, link, SITE, asOf } = x;
    const rtx = dedupe(L.filter((r) => notAio(r) && /rtx/.test(r.slug)).sort((a, b) => a.price - b.price));
    const gpu = dedupe(L.filter((r) => notAio(r) && r.sp.gpu).sort((a, b) => a.price - b.price));
    if (gpu.length < 8) return null;
    return {
      intro: `In short, the laptop graphics card (GPU) draws everything on screen and accelerates games, video editing and 3D. Laptops have either integrated graphics (built into the processor, fine for office work and light editing) or a dedicated GPU such as an NVIDIA GeForce RTX (needed for modern games, 4K editing and 3D). Important: the same GPU name performs differently in different laptops, because each maker sets its power limit and cooling. ${gpu.length} laptops with a dedicated GPU are in stock (${asOf}).`,
      description: `Laptop GPUs explained: integrated vs dedicated, RTX 3050 vs 4050, VRAM, power limits, NVIDIA Optimus, ray tracing, external GPUs, and how to check yours.`,
      sections: [
        { heading: "How to check your laptop's graphics card", body: "Task Manager → Performance: GPU 0 is usually the integrated graphics, GPU 1 the dedicated card (with its name and dedicated memory). Or Device Manager → Display adapters, or run `dxdiag` → Display tabs." },
        { heading: "Same GPU, different performance", body: "Laptop GPUs run at a power limit (TGP, in watts) chosen by the laptop maker: an RTX 4050 at 35 W in a thin laptop is much slower than one at 100 W+ in a gaming laptop with big fans. Cooling, the processor paired with it and the screen resolution matter too. Compare reviews of the exact laptop model, not just the GPU name." },
        { heading: "RTX 3050 vs RTX 4050, and laptop vs desktop GPUs", body: `The RTX 4050 is the newer generation: faster, more efficient, with 6 GB of video memory and DLSS 3 frame generation; the 3050 usually has 4 GB. Laptop GPUs are slower than desktop cards with the same name because they run at much lower power. More in the ${link("gaming laptop guide", `${SITE}/learn/gaming-laptop-guide-kenya`)}.` },
        { heading: "VRAM: how much graphics memory?", body: `- **Esports and older games at 1080p:** 4 GB.\n- **Current games:** 6–8 GB.\n- **Video editing:** 4 GB for 1080p; Adobe recommends 8 GB for 4K in Premiere Pro.\n- **3D and rendering:** 8 GB or more.\n\nIntegrated graphics use part of the system RAM instead (shared memory). See ${link("laptop requirements for video and photo editing", `${SITE}/learn/laptop-requirements-video-photo-editing-3d`)}.` },
        { heading: "Can Intel integrated graphics run Premiere Pro?", body: "Yes for 1080p editing on 11th-gen or newer Intel laptops (Iris Xe) and Core Ultra (Arc graphics), which also speed up H.264/HEVC video through Quick Sync. Long 4K timelines and heavy effects need a dedicated GPU." },
        { heading: "NVIDIA Optimus and MUX switches", body: "Optimus lets the laptop use the integrated graphics for everyday work (saving battery) and switch to the NVIDIA GPU for games and heavy apps automatically. Some gaming laptops add a MUX switch that sends the display straight to the NVIDIA GPU for a few extra frames, at the cost of battery." },
        { heading: "Ray tracing", body: "Ray tracing simulates how light bounces for realistic reflections and shadows. RTX GPUs have dedicated hardware for it; it's demanding, so on laptops it's usually paired with DLSS upscaling. GTX cards don't support it in hardware." },
        { heading: "Esports, GTA V and external GPUs", body: `Esports titles (Valorant, CS2, League, Fortnite on lower settings) run well on a GTX 1650/RTX 3050 or better, ideally with a high-refresh screen. Older titles such as GTA V run on entry-level dedicated GPUs; check each game's official requirements. External GPUs need a laptop with Thunderbolt or USB4 eGPU support: see ${link("laptop ports explained", `${SITE}/learn/laptop-ports-explained`)}.` },
        { heading: "Laptops with RTX graphics in stock", body: `${rtx.length ? plist(x, rtx, 8) : plist(x, gpu, 8)}\n\nAll gaming laptops: ${link("gaming laptops in Kenya", `${SITE}/best/gaming-laptops-kenya`)}. Prices as of ${asOf}.` },
      ],
      faq: [
        { question: "How do I check my laptop graphics card?", answer: "Task Manager → Performance shows each GPU and its memory; Device Manager → Display adapters lists them too." },
        { question: "What is the difference between RTX 3050 and RTX 4050 laptop GPUs?", answer: "The RTX 4050 is newer, faster and more efficient, with more video memory and DLSS 3. Performance also depends on each laptop's power limit and cooling." },
        { question: "How much graphics memory do I need for video editing?", answer: "4 GB for 1080p; Adobe recommends 8 GB for 4K in Premiere Pro." },
        { question: "Can Intel integrated graphics run Adobe Premiere Pro?", answer: "Yes for 1080p on 11th-gen+ Intel (Iris Xe) or Core Ultra laptops; 4K and heavy effects need a dedicated GPU." },
        { question: "What is NVIDIA Optimus in laptops?", answer: "Automatic switching between integrated graphics (to save battery) and the NVIDIA GPU (for games and heavy apps)." },
        { question: "What is ray tracing in laptop graphics?", answer: "Realistic simulation of light, reflections and shadows, accelerated by RTX GPUs and usually paired with DLSS upscaling on laptops." },
        { question: "Can I connect an external GPU to a laptop?", answer: "Only if it has a Thunderbolt 3/4 or USB4 port that supports eGPUs; performance is lower than the same card in a desktop." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "storage-backup",
  path: "/learn/laptop-storage-backup-and-recovery",
  kw: "how to free up space on a laptop",
  secondary: ["laptop storage full", "check laptop storage", "recover deleted files laptop", "best way to back up laptop", "onedrive or external hard drive", "can ssd fail without warning", "check ssd health", "transfer files to new laptop"],
  h1: "Laptop storage full? Free up space, back up and recover files",
  title: "How to Free Up Space on a Laptop, Back Up and Recover Files",
  related: ["/learn/laptop-ssd-size-kenya", "/learn/laptop-security-guide-kenya", "/learn/laptop-upgrade-ram-ssd"],
  write(x) {
    const { link, SITE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `How to free up space on a laptop: open Settings → System → Storage, run Cleanup recommendations, turn on Storage Sense, empty the Recycle Bin and Downloads, and uninstall apps you don't use; files kept in OneDrive can be set to "online-only" to free space. Then protect what matters: keep at least two copies of important files, in the cloud and on an external drive, because deleted files can't always be recovered and SSDs can fail without warning.`,
      description: `Laptop storage full? Check and free up space, recover deleted files safely, back up with OneDrive or an external drive, check SSD health and move files to a new laptop.`,
      sections: [
        { heading: "Check how much storage you have", body: "Open File Explorer → This PC to see each drive's free space, or Settings → System → Storage for a breakdown by category (apps, documents, temporary files, system). The capacity shown is a little lower than the advertised size (a \"512 GB\" SSD shows about 476 GB) because of how sizes are counted and the recovery partition." },
        { heading: "Why storage fills up, and how to free it", body: "Common culprits: the Downloads folder, videos and photos, Windows update leftovers, temporary files, large apps and games, the hibernation file and restore points.\n\n1. Settings → System → Storage → **Cleanup recommendations**.\n2. Turn on **Storage Sense** to clear temporary files and the Recycle Bin automatically.\n3. Uninstall apps you don't use (Settings → Apps).\n4. Move videos and photos to an external drive or the cloud.\n5. In OneDrive, choose **Free up space** on folders to keep them online-only.\n6. Disk Cleanup → Clean up system files removes old update files." },
        { heading: "Can deleted files be recovered?", body: "Sometimes, not always:\n\n1. Check the **Recycle Bin** first, then the **OneDrive recycle bin** (online) for synced files.\n2. Right-click the folder → **Restore previous versions** if File History or backups were on.\n3. Microsoft's **Windows File Recovery** tool can try to recover deleted files.\n\nImportant: stop saving files to that drive immediately (new data can overwrite what you want back). On SSDs, a feature called TRIM often erases deleted data quickly, so recovery is less likely than on hard drives. For valuable data from a failed drive, go to a professional data-recovery service before trying anything else." },
        { heading: "The best way to back up: 3-2-1", body: "Keep **3** copies of important files, on **2** different types of storage, with **1** off the laptop (cloud or a drive kept elsewhere).\n\n- **OneDrive / Google Drive:** automatic, survives theft and fire, needs internet; free plans are small.\n- **External drive or SSD:** fast and holds everything, but must be plugged in to back up and can be lost with the laptop.\n- Use both: cloud for documents, an external drive for a full backup every week or month." },
        { heading: "Can an SSD fail without warning? Checking SSD health", body: "Yes: SSDs often fail gradually, but they can stop suddenly, which is why backups matter. Check health in Windows 11: Settings → System → Storage → Advanced storage settings → Disks & volumes → Properties (shows drive health and estimated life remaining for NVMe drives). The free CrystalDiskInfo tool shows Good, Caution or Bad for any drive. Replace a drive marked Caution after backing up." },
        { heading: "Cloud vs local storage", body: "Local storage (the SSD) is fast and works offline; cloud storage is accessible from any device and survives the laptop being lost or broken. Most people need both: local for working files, cloud for backup and sharing." },
        { heading: "Moving files to a new laptop", body: `- **OneDrive:** sign in with the same Microsoft account on the new laptop and your synced folders appear.\n- **Windows Backup app (Windows 11):** backs up folders, settings and app lists to your Microsoft account to restore on the new PC.\n- **External drive:** copy Documents, Desktop, Pictures and Downloads across.\n\nBefore handing over or selling the old laptop, sign out of accounts and reset it (Settings → System → Recovery → Reset this PC → Remove everything). Shopping for the new one? See the ${link("laptop buying guide", `${SITE}/learn/laptop-buying-guide-kenya`)}.` },
      ],
      faq: [
        { question: "Why is my laptop storage full?", answer: "Usually downloads, videos and photos, update leftovers, temporary files and large apps. Settings → System → Storage shows what's using it." },
        { question: "How do I free up space on a Windows laptop?", answer: "Run Cleanup recommendations, turn on Storage Sense, uninstall unused apps, move media to an external drive or cloud, and set OneDrive folders to online-only." },
        { question: "Can I recover deleted files from my laptop?", answer: "Sometimes: check the Recycle Bin, OneDrive's recycle bin and previous versions, or try Windows File Recovery. Stop using the drive; recovery from SSDs is less likely." },
        { question: "Should I use OneDrive or an external hard drive for backups?", answer: "Both: the cloud survives theft and fire, an external drive holds a full fast backup. Keep at least two copies of important files." },
        { question: "How do I check SSD health?", answer: "Windows 11 shows drive health under Settings → System → Storage → Disks & volumes; CrystalDiskInfo shows Good, Caution or Bad." },
        { question: "How do I transfer files from an old laptop to a new laptop?", answer: "Use OneDrive or the Windows Backup app, or copy folders to an external drive; then reset the old laptop before passing it on." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "home-vs-pro",
  path: "/learn/windows-11-home-vs-pro",
  kw: "Windows 11 Home vs Pro",
  secondary: ["is windows 11 pro worth it for business", "upgrade windows 11 home to pro", "what is bitlocker", "reset laptop without losing files", "factory reset hp laptop", "factory reset dell laptop", "factory reset lenovo laptop", "sleep vs hibernate vs shutdown", "reinstall windows on laptop"],
  h1: "Windows 11 Home vs Pro, BitLocker, and how to reset or reinstall Windows",
  title: "Windows 11 Home vs Pro: Differences, BitLocker and Resets",
  related: ["/learn/windows-11-and-laptop-software-kenya", "/learn/laptop-security-guide-kenya", "/learn/laptop-storage-backup-and-recovery"],
  write(x) {
    const { P, ksh, link, SITE, asOf, tableMd } = x;
    const pro = (P || []).find((p) => /^windows-11-pro/.test(p.slug));
    if (!P || P.length < 50) return null;
    return {
      intro: `Windows 11 Home vs Pro: Home covers everything most people need; Pro adds business features: BitLocker drive encryption management, Remote Desktop (to connect into the laptop), Group Policy, Hyper-V virtual machines, Windows Sandbox, and joining a company domain or Microsoft Entra ID. For businesses, Pro is worth it; for home and study, Home is enough. ${pro ? `A Windows 11 Pro licence costs ${ksh(pro.price)} at ECB Technologies (${asOf}).` : ""} This guide also covers resetting and reinstalling Windows safely.`,
      description: `Windows 11 Home vs Pro compared, upgrading to Pro, BitLocker, resetting without losing files, factory resets on HP, Dell and Lenovo, sleep vs hibernate, reinstalling Windows.`,
      sections: [
        { heading: "Home vs Pro side by side", body: tableMd(["Feature", "Home", "Pro"], [["Everyday apps, Office, browsers", "Yes", "Yes"], ["Encryption", "Device encryption on supported laptops", "BitLocker with full management"], ["Remote Desktop (connect into this PC)", "No (can connect out)", "Yes"], ["Group Policy, domain / Entra ID join", "No", "Yes"], ["Hyper-V and Windows Sandbox", "No", "Yes"], ["Windows Update for Business controls", "No", "Yes"]]) + "\n\nBusiness laptops are often sold with Pro; check Settings → System → About → Edition." },
        { heading: "Upgrading from Home to Pro", body: `Settings → System → Activation → Upgrade your edition of Windows → Change product key, then enter a genuine Pro key; your files and apps stay.${pro ? ` ${link(pro.short, `${SITE}/item/${pro.slug}`)}: ${ksh(pro.price)}.` : ""} The upgrade keeps everything, but back up first anyway.` },
        { heading: "What is BitLocker?", body: `BitLocker encrypts the whole drive so a stolen laptop's files can't be read without your sign-in or recovery key. It's managed in Pro (and higher); many Home laptops have the simpler \"Device encryption\" on supported hardware (needs TPM 2.0 and Modern Standby support). Save the recovery key to your Microsoft account or print it before resetting or changing hardware. See the ${link("laptop security guide", `${SITE}/learn/laptop-security-guide-kenya`)}.` },
        { heading: "Reset without losing files", body: "Settings → System → Recovery → **Reset this PC** → **Keep my files**. This reinstalls Windows and keeps your personal files, but **removes installed apps** (you reinstall them) and resets settings. Back up first anyway; have your BitLocker recovery key ready." },
        { heading: "Factory reset (erases everything)", body: "**This erases all files and apps.** Back up first, sign out of accounts, and note your BitLocker recovery key.\n\n- **Any laptop:** Settings → System → Recovery → Reset this PC → **Remove everything** (choose Cloud download for a fresh copy of Windows).\n- **HP:** the same Windows reset, or at startup press F11 for the recovery environment; HP's Cloud Recovery tool can make a recovery USB.\n- **Dell:** the Windows reset, or on supported models press F12 at startup → SupportAssist OS Recovery.\n- **Lenovo:** the Windows reset; many IdeaPad and Yoga models have a small Novo button for System Recovery; Lenovo also offers recovery USB downloads for registered devices.\n\nIf Windows won't start, hold Shift while clicking Restart (or interrupt startup three times) to reach Troubleshoot → Reset this PC." },
        { heading: "Reinstalling Windows from scratch", body: `Create a USB installer with Microsoft's Media Creation Tool on another PC, boot from it (F12 on Dell and Lenovo, F9 on HP for the boot menu), delete the partitions you want to wipe and install. Laptops that came with Windows reactivate automatically once online. More: ${link("Windows 11 and laptop software", `${SITE}/learn/windows-11-and-laptop-software-kenya`)}.` },
        { heading: "Sleep, hibernate and shutdown", body: "- **Sleep:** keeps everything in memory with very low power; instant resume; uses a little battery.\n- **Hibernate:** saves your session to the SSD and powers off; slower to resume, uses no battery.\n- **Shut down:** closes everything (with Fast Startup, Windows saves part of the system to speed up the next start). Use **Restart** to fully refresh Windows and apply updates." },
      ],
      faq: [
        { question: "What is the difference between Windows 11 Home and Pro?", answer: "Pro adds BitLocker management, Remote Desktop hosting, Group Policy, Hyper-V, Windows Sandbox and company domain/Entra ID join." },
        { question: "Is Windows 11 Pro worth it for business users?", answer: "Yes: encryption management, remote access and joining company systems are Pro features." },
        { question: "Can I upgrade from Windows 11 Home to Pro?", answer: "Yes: Settings → System → Activation → Change product key with a genuine Pro key; files and apps stay." },
        { question: "What is BitLocker on a laptop?", answer: "Full-drive encryption that protects files if the laptop is stolen; keep the recovery key safe." },
        { question: "How do I reset a laptop without losing files?", answer: "Settings → System → Recovery → Reset this PC → Keep my files. Installed apps are removed, so back up first." },
        { question: "What is the difference between sleep, hibernate and shutdown?", answer: "Sleep keeps the session in memory (instant, uses a little battery); hibernate saves it to storage and powers off; shutdown closes everything." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "webcam-audio",
  path: "/learn/laptop-webcam-microphone-and-audio-guide",
  kw: "laptop for video conferencing",
  secondary: ["is 720p webcam good enough", "improve laptop webcam quality", "laptop microphone not working", "laptop speakers crackling", "connect bluetooth headphones to laptop", "noise cancelling microphone laptop", "laptop for online teaching"],
  h1: "Laptops for video conferencing: webcams, microphones, speakers and online teaching",
  title: "Laptop for Video Conferencing: Webcam, Mic and Audio Guide",
  related: ["/learn/laptops-for-small-business-kenya", "/learn/laptop-wifi-and-internet-guide", "/learn/laptop-ports-explained"],
  write(x) {
    const { P, ksh, link, SITE, asOf } = x;
    if (!P || P.length < 50) return null;
    const heads = dedupe(P.filter((p) => /headset/.test(p.slug)).sort((a, b) => a.price - b.price));
    const camMon = dedupe(P.filter((p) => /webcam|camera/.test(p.slug) && /monitor|viewfinity|smart-monitor|-\d{2}-/.test(p.slug)).sort((a, b) => a.price - b.price));
    return {
      intro: `A good laptop for video conferencing needs a sharp webcam (1080p if possible), clear microphones, stable Wi-Fi and enough performance to run Teams or Zoom with other apps open (an 8th-gen or newer Core i5 with 8 GB RAM is enough). Lighting and a headset make a bigger difference than webcam megapixels. Below: how to improve video and sound, fix a microphone or crackling speakers, and set up for online teaching.`,
      description: `Laptops for video calls and online teaching: webcam resolution, improving video, fixing microphones and crackling speakers, Bluetooth headphones and noise cancellation.`,
      sections: [
        { heading: "Is a 720p webcam good enough?", body: "For meetings, yes, with good light: most video platforms compress video heavily anyway. 1080p (\"FHD\" or 2 MP) looks noticeably sharper, and newer business laptops increasingly have 1080p or 5 MP cameras plus IR cameras for Windows Hello. Megapixels alone don't decide quality: lens, sensor size and lighting matter more." },
        { heading: "Improving webcam quality", body: "1. **Light your face from the front:** face a window or lamp; avoid a bright window behind you.\n2. **Raise the laptop** so the camera is at eye level (a stand or books).\n3. **Clean the lens** with a soft cloth.\n4. In Settings → Bluetooth & devices → Cameras, adjust brightness and choose the highest resolution.\n5. On laptops with an NPU, Windows Studio Effects adds background blur and eye contact without slowing the laptop." },
        { heading: "Microphone not working?", body: "1. Check the mute key (often F4 or with a light) and the mute button in Teams or Zoom.\n2. Settings → Privacy & security → Microphone: allow access for apps and desktop apps.\n3. Settings → System → Sound → Input: choose the right microphone and test the level.\n4. Update or reinstall the audio driver (Device Manager → Audio inputs and outputs).\n5. Try a headset: if it works, the built-in microphone or its cable may be faulty." },
        { heading: "Crackling speakers", body: "Usually software: update the audio driver, turn off audio enhancements (Sound → device properties), lower the volume to test for distortion, and set power mode to Balanced. Crackling at every volume after a drop or spill can mean a damaged speaker; a technician can replace it." },
        { heading: "Bluetooth headphones and noise cancellation", body: "Connect Bluetooth headphones in Settings → Bluetooth & devices → Add device → Bluetooth, with the headphones in pairing mode. Noise cancellation in laptop microphones usually means two or more microphones plus software (in Teams, Zoom or the laptop's audio app) that filters keyboard and background noise; a headset with a boom microphone still sounds clearer in busy offices or open-plan rooms." },
        { heading: "Online teaching setup", body: `- A laptop with an 8th-gen or newer Core i5 and 8–16 GB RAM.\n- A 2-in-1 or touchscreen to write on slides, or a drawing tablet.\n- An external monitor to see students while presenting.\n- A USB headset and good front lighting.\n- Ethernet or strong Wi-Fi, and a UPS or charged battery for power cuts.\n\nSee ${link("2-in-1 laptops", `${SITE}/best/2-in-1-laptops-kenya`)} and the ${link("Wi-Fi guide", `${SITE}/learn/laptop-wifi-and-internet-guide`)}.` },
        { heading: "Do business laptops have better webcams?", body: `Many newer business models have 1080p or 5 MP webcams, IR cameras, privacy shutters and better microphone arrays than budget consumer laptops; older business models (8th–10th gen) often have 720p. Check the exact model's spec sheet.${heads.length ? `\n\nUSB headsets in stock:\n\n${plist(x, heads, 3)}` : ""}${camMon.length ? `\n\nMonitors with built-in webcams (for desk setups): from ${ksh(camMon[0].price)} (${asOf}).` : ""}` },
      ],
      faq: [
        { question: "Is a 720p laptop webcam good enough for meetings?", answer: "Yes with good lighting; 1080p looks sharper. Lighting and camera position matter more than resolution." },
        { question: "How do I improve laptop webcam quality?", answer: "Light your face from the front, raise the camera to eye level, clean the lens and choose the highest resolution in camera settings." },
        { question: "Why is my laptop microphone not working?", answer: "Check the mute key and app mute, microphone privacy settings, the selected input device and the audio driver." },
        { question: "Can I connect Bluetooth headphones to a laptop?", answer: "Yes: Settings → Bluetooth & devices → Add device → Bluetooth, with the headphones in pairing mode." },
        { question: "What should I look for in a laptop for video conferencing?", answer: "A 1080p webcam, good microphones, Wi-Fi 6 or Ethernet, and at least an 8th-gen Core i5 with 8 GB RAM; add a headset for noisy places." },
        { question: "Which laptop is best for online teaching?", answer: "A 2-in-1 or touchscreen laptop with a good webcam and 8–16 GB RAM, plus an external monitor and headset." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "hardware-problems",
  path: "/learn/laptop-hardware-problems-and-inspection",
  kw: "laptop keyboard not working",
  secondary: ["some laptop keys not working", "test laptop before buying", "check laptop hinges", "laptop motherboard failure", "is it worth replacing laptop motherboard", "laptop screen flickering", "damaged charging port", "can a laptop work without battery", "laptop water damage signs"],
  h1: "Laptop keyboard not working, screen flickering, water damage and other hardware checks",
  title: "Laptop Keyboard Not Working? How to Fix It and Other Checks",
  related: ["/learn/check-used-laptop-before-buying", "/learn/laptop-slow-freezing-not-charging-fixes", "/learn/check-if-laptop-is-genuine"],
  write(x) {
    const { link, SITE, PHONE } = x;
    if (x.L.length < 50) return null;
    return {
      intro: `Laptop keyboard not working? First rule out software: restart, check Filter Keys and the keyboard layout in Settings, update or reinstall the keyboard driver, and test with an external keyboard. If only some keys fail, dirt or a spill is the usual cause. This guide covers keyboards, hinges, flickering screens, charging ports, batteries, water damage and motherboards: what each symptom suggests, what you can safely check, and when it's a job for a technician.`,
      description: `Laptop hardware problems and pre-purchase checks: keyboards, keys, hinges, flickering screens, charging ports, running without a battery, water damage and motherboard faults.`,
      sections: [
        { heading: "Keyboard not working, or some keys dead", body: "1. Restart; check for a stuck key or a locked Fn key.\n2. Settings → Accessibility → Keyboard: turn off Filter Keys and Sticky Keys.\n3. Check the keyboard layout (Settings → Time & language → Language & region).\n4. Device Manager → Keyboards: update or uninstall the driver and restart.\n5. Test with an online keyboard tester and an external USB keyboard.\n\nSome keys dead after a spill or dirt: shut down, tilt and use compressed air. Several keys in one row failing together often means a liquid or cable fault: a technician can replace the keyboard (on many business laptops it's a straightforward part)." },
        { heading: "Testing a laptop before buying", body: `Use the full ${link("12-point used-laptop checklist", `${SITE}/learn/check-used-laptop-before-buying`)}. The hardware essentials: every key in a keyboard tester, both touchpad buttons, every port with a flash drive, a white and a black full screen for dead pixels, the webcam and speakers, Wi-Fi, the battery report, and the serial number (${link("checking a laptop is genuine", `${SITE}/learn/check-if-laptop-is-genuine`)}).` },
        { heading: "Checking the hinges", body: "Open and close the lid slowly several times: it should move smoothly and stay at any angle without drooping. Hold the base and gently wiggle the screen: wobble, creaking or gaps near the hinge mounts, cracked plastic around the hinges, or a screen cable that flickers when you move the lid are warning signs. Hinge repairs are often expensive because the mounts are part of the case." },
        { heading: "Screen flickering", body: "- **Flickers all the time:** update the graphics driver; check the refresh rate (Settings → Display → Advanced display) and try another value.\n- **Only at low brightness:** some screens dim by flickering the backlight (PWM); raising brightness helps.\n- **When you move the lid:** a loose or damaged display cable; a technician job.\n- **External monitor is fine:** the problem is the laptop's own panel or cable, not the graphics." },
        { heading: "Damaged charging port, and running without a battery", body: "Signs of a damaged charging port or DC jack: the plug feels loose, charging stops and starts when the cable moves, it charges only at an angle, or there's a burnt smell or discolouration: stop using it and have it repaired. Many laptops can run on the charger with the battery removed or disconnected, but they may run slower and switch off instantly in a power cut; most modern batteries are internal, so leave removing them to a technician (swollen batteries are a fire risk)." },
        { heading: "Water damage", body: "Immediately: shut down, unplug, turn it upside down and don't switch it on until a technician has checked it. Signs of past water damage when buying: stains or tide marks around the keyboard, sticky keys, corrosion on ports, and (seen by a technician inside) liquid-damage indicator stickers that have changed colour. Water damage can cause faults weeks later." },
        { heading: "Motherboard failure: causes and whether to replace it", body: `Common causes: overheating over years (dust), liquid spills, power surges (use a surge protector or UPS), drops, and age. Symptoms that point to the motherboard (only a technician can confirm): no power with a known-good charger, no display even on an external monitor, beeping at startup, random shutdowns while cool, ports failing one after another. Replacing a motherboard is rarely worth it on an older laptop: the part can cost a large share of a replacement laptop. Compare with ${link("best value laptops", `${SITE}/learn/best-value-laptops-kenya`)}; questions: WhatsApp ${PHONE}.` },
      ],
      faq: [
        { question: "How do I check if a laptop keyboard is faulty?", answer: "Test every key in an online keyboard tester, rule out Filter Keys, layout and driver issues, and try an external keyboard." },
        { question: "Why are some laptop keys not working?", answer: "Usually dirt or a spill; several keys in a row failing together suggests liquid or cable damage needing repair." },
        { question: "How can I check laptop hinges before buying?", answer: "Open and close the lid slowly: it should stay at any angle without drooping, wobble or creaking, with no cracks at the hinge mounts." },
        { question: "Why does my laptop screen flicker?", answer: "Often a graphics driver or refresh-rate issue; if it flickers when you move the lid, the display cable is likely damaged." },
        { question: "Can a laptop work without a battery?", answer: "Many can on the charger, but they may run slower and switch off in a power cut; leave internal battery removal to a technician." },
        { question: "How do I know if a laptop has water damage?", answer: "Look for stains, sticky keys and corrosion on ports; a technician can check the internal liquid-damage indicators." },
        { question: "Is it worth replacing a laptop motherboard?", answer: "Rarely on an older laptop: the part often costs a large share of a replacement laptop." },
      ],
    };
  },
});

ARTICLES.push({
  slug: "wfh-setup",
  path: "/learn/work-from-home-laptop-setup",
  kw: "work from home laptop setup",
  secondary: ["connect laptop to two monitors", "usb-c docking station", "one docking station for different laptops", "hdmi 2.0 vs 2.1", "wireless projector laptop", "wifi 7 laptops", "connect laptop to 5g router", "bluetooth 5.3", "multiple bluetooth devices laptop"],
  h1: "Work-from-home laptop setup: monitors, docks, HDMI, Wi-Fi 7 and Bluetooth",
  title: "Work From Home Laptop Setup: A Guide to Monitors and Docks",
  related: ["/learn/laptop-accessories-guide-kenya", "/learn/laptop-ports-explained", "/learn/laptop-wifi-and-internet-guide"],
  write(x) {
    const { P, ksh, link, SITE, asOf, tableMd } = x;
    if (!P || P.length < 50) return null;
    const mons = dedupe(P.filter((p) => /(odyssey|ultragear|viewfinity|monitor|-\d{2}-(?:inch-)?(?:fhd|qhd|wqhd|4k|ips)|\d{2,3}hz)/.test(p.slug) && !/arm|mount|stand|laptop|bracket/.test(p.slug) && p.price > 8000).sort((a, b) => a.price - b.price));
    const kb = dedupe(P.filter((p) => /keyboard|mouse/.test(p.slug) && !/surface/.test(p.slug)).sort((a, b) => a.price - b.price));
    const ups = dedupe(P.filter((p) => /-ups-|va-/.test(p.slug)).sort((a, b) => a.price - b.price));
    return {
      intro: `A good work-from-home laptop setup: the laptop raised to eye level (or closed) with an external monitor, a separate keyboard and mouse, a headset, reliable internet (fibre or a 5G/4G router, by Ethernet if possible) and a UPS for power cuts. To connect two monitors or everything with one cable, you need the right ports: not every USB-C port carries video or charging, so check the laptop's specifications. Here's how each piece works, with the accessories in stock.`,
      description: `Work-from-home laptop setup: two external monitors, USB-C docks, HDMI 2.0 vs 2.1, wireless projection, Wi-Fi 7, 5G routers, Bluetooth 5.3 and multiple Bluetooth devices.`,
      sections: [
        { heading: "The home office checklist", body: `- **Laptop:** 8th-gen+ Core i5, 8–16 GB RAM, Wi-Fi 6, at least HDMI and USB-C.\n- **Monitor:** 24–27-inch, connected by HDMI or USB-C.\n- **Keyboard and mouse:** wireless or USB.\n- **Headset** for calls.\n- **Internet:** fibre or a 5G/4G router; Ethernet for the steadiest calls.\n- **UPS:** keeps the router and monitor on through short power cuts.\n- **Laptop stand** or monitor arm for posture.${mons.length ? `\n\nMonitors in stock from ${ksh(mons[0].price)}:\n\n${plist(x, mons, 4)}` : ""}${kb.length ? `\n\nKeyboards and mice from ${ksh(kb[0].price)}.` : ""}${ups.length ? ` UPS units from ${ksh(ups[0].price)}.` : ""} Prices as of ${asOf}.` },
        { heading: "Two external monitors", body: `Possible if the laptop has two video outputs (e.g. HDMI plus USB-C/Thunderbolt with DisplayPort), or through a dock the laptop supports. Windows laptops with Thunderbolt often drive two monitors through one dock; Apple M1/M2 MacBook Airs support only one external display natively. Check \"supported displays\" in the laptop's spec sheet. More in the ${link("accessories guide", `${SITE}/learn/laptop-accessories-guide-kenya`)}.` },
        { heading: "USB-C docking stations", body: "A USB-C dock adds monitors, USB ports, Ethernet and charging through one cable. Three kinds:\n\n- **USB-C (DisplayPort Alt Mode):** works with laptops whose USB-C port carries video; often limited to one or two monitors.\n- **Thunderbolt / USB4:** the most capable: two 4K monitors, fast data and charging, on laptops with Thunderbolt or USB4.\n- **DisplayLink:** uses a driver to add monitors over USB; works on more laptops, but not ideal for gaming or video.\n\nCan one dock serve different laptops? Standard USB-C and Thunderbolt docks often work across brands, but the number of monitors and charging power depend on each laptop; older proprietary docks (some HP, Dell, Lenovo) only fit their own models. Check the dock maker's compatibility list." },
        { heading: "HDMI 2.0 vs HDMI 2.1", body: tableMd(["", "HDMI 2.0", "HDMI 2.1"], [["Bandwidth", "Up to 18 Gbps", "Up to 48 Gbps"], ["Typical maximum", "4K at 60 Hz", "4K at 120 Hz, 8K at 60 Hz"], ["Extras", "", "Variable refresh rate (VRR), better HDR"]]) + "\n\nFor office monitors at 1080p or 1440p, HDMI 2.0 is plenty; HDMI 2.1 matters for high-refresh 4K gaming monitors. Both the laptop and monitor (and the cable) must support 2.1 to get its benefits." },
        { heading: "Wireless projection", body: "Press Windows + K to connect to a Miracast-capable projector, TV or wireless display adapter; or cast from Chrome/Edge to Chromecast devices. Wireless adds some delay, so use HDMI for video or presentations with animation." },
        { heading: "Wi-Fi 7, 5G routers and the internet connection", body: "Wi-Fi 7 (802.11be) is the newest standard, found on some laptops from 2024 onwards; it needs a Wi-Fi 7 router to make a difference. Wi-Fi 6/6E is plenty for home internet speeds in Kenya. A laptop connects to a 5G home router like any router (Wi-Fi or Ethernet): the laptop doesn't need 5G itself. Place the router centrally and use Ethernet for your work desk if you can." },
        { heading: "Bluetooth 5.3 and multiple devices", body: "Bluetooth 5.x versions bring better range, lower power and more reliable connections; 5.2 and newer support LE Audio on compatible headphones. A laptop can connect several Bluetooth devices at once (mouse, keyboard and headphones together); audio usually plays to one device at a time. Pair each in Settings → Bluetooth & devices." },
      ],
      faq: [
        { question: "Can I connect my laptop to two external monitors?", answer: "Yes if it has two video outputs or supports a dock that drives two; check the spec sheet. M1/M2 MacBook Airs support only one natively." },
        { question: "What is a USB-C docking station?", answer: "A hub that adds monitors, USB ports, Ethernet and charging through one USB-C or Thunderbolt cable." },
        { question: "Can I use one docking station for different laptops?", answer: "Standard USB-C and Thunderbolt docks often work across brands, but monitor count and charging depend on each laptop; proprietary docks fit only their brand." },
        { question: "What is the difference between HDMI 2.0 and HDMI 2.1?", answer: "HDMI 2.1 has far more bandwidth (4K at 120 Hz, 8K, VRR); HDMI 2.0 handles 4K at 60 Hz, enough for office monitors." },
        { question: "What is Wi-Fi 7 and do laptops support it?", answer: "The newest Wi-Fi standard, on some laptops from 2024 onwards; it needs a Wi-Fi 7 router. Wi-Fi 6 is plenty for most homes." },
        { question: "Can I connect my laptop to a 5G router?", answer: "Yes, over Wi-Fi or Ethernet like any router; the laptop doesn't need 5G itself." },
        { question: "How do I connect multiple Bluetooth devices to a laptop?", answer: "Pair each in Settings → Bluetooth & devices; mice, keyboards and headphones can be connected together." },
      ],
    };
  },
});

// ---------- Repairs (confirmed by the owner, 27 Nov 2026) ----------
// ECB Technologies does laptop repairs and sells new, refurbished and ex-UK
// laptops. No repair prices, turnaround times or repair warranty have been
// confirmed, so the page quotes none: diagnosis and a quote first.
ARTICLES.push({
  slug: "repairs",
  playbook: "Locations",
  path: "/laptop-repair-nairobi",
  kw: "laptop repair in Nairobi",
  secondary: ["laptop repair shop nairobi cbd", "where can i repair my laptop in nairobi", "laptop screen repair nairobi", "laptop battery replacement nairobi", "repair or replace laptop"],
  h1: "Laptop repair in Nairobi CBD: ECB Technologies, Moi Avenue",
  title: "Laptop Repair in Nairobi CBD | ECB Technologies, Moi Avenue",
  related: ["/laptop-shop-nairobi", "/learn/laptop-hardware-problems-and-inspection", "/learn/laptop-slow-freezing-not-charging-fixes"],
  write(x) {
    const { L, ksh, median, link, SITE, PHONE, recency } = x;
    if (L.length < 50) return null;
    const biz8 = L.filter((r) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${r.slug}-`) && recency(r.sp) >= 3);
    const wa = `https://wa.me/254717040531?text=${encodeURIComponent("Hello ECB Technologies, I need my laptop repaired. Model: __. Problem: __.")}`;
    return {
      intro: `For laptop repair in Nairobi, ECB Technologies repairs laptops at its shop on the 3rd floor of Techmart Iconic Business Plaza, room T12, Moi Avenue, Nairobi CBD (Monday to Saturday, 9am to 7pm). Bring the laptop and its charger for a diagnosis and a quote, or send the model and a description of the problem on WhatsApp (${PHONE}) first. If the repair isn't worth it, we also sell new, refurbished and ex-UK laptops, so you can compare on the spot.`,
      description: "Laptop repair in Nairobi CBD at ECB Technologies, Moi Avenue: diagnosis and quote, what to bring, repair or replace, and common laptop problems to check first.",
      sections: [
        { heading: "How it works", body: `1. **Message or visit:** send the laptop model and the problem on [WhatsApp](${wa}) (${PHONE}), or bring it to the shop.\n2. **Diagnosis:** the laptop is checked to find the cause.\n3. **Quote:** you get the cost and an idea of the time before deciding.\n4. **Repair or replace:** if a repair isn't worth it on an older laptop, compare with a replacement in the shop.\n\nShop: Techmart Iconic Business Plaza, 3rd floor, room T12, Moi Avenue, Nairobi CBD. Monday to Saturday, 9am to 7pm; closed Sunday. ${link("Directions and shop details", `${SITE}/laptop-shop-nairobi`)}.` },
        { heading: "Before you bring it in: quick checks", body: `Many problems are software and can be fixed at home in minutes:\n\n- Slow, freezing, restarting, not charging: ${link("common laptop problems and fixes", `${SITE}/learn/laptop-slow-freezing-not-charging-fixes`)}\n- Battery draining or overheating: ${link("battery and overheating fixes", `${SITE}/learn/laptop-battery-and-overheating-fixes`)}\n- Keyboard, screen flicker, hinges, water damage: ${link("hardware problems", `${SITE}/learn/laptop-hardware-problems-and-inspection`)}\n- Wi-Fi: ${link("Wi-Fi fixes", `${SITE}/learn/laptop-wifi-and-internet-guide`)}\n- Webcam, microphone, speakers: ${link("webcam and audio guide", `${SITE}/learn/laptop-webcam-microphone-and-audio-guide`)}` },
        { heading: "What to bring and prepare", body: "- The laptop **and its charger** (many faults are charger-related).\n- A short description: what happens, since when, after a drop or spill?\n- **Back up your files** if the laptop still works (OneDrive or an external drive).\n- Your BitLocker recovery key if the drive is encrypted (in your Microsoft account).\n- Liquid spill? Switch it off, unplug it and bring it in without switching it on again." },
        { heading: "Typical laptop repairs and what affects the cost", body: "Common laptop repairs include batteries, chargers and charging ports, keyboards, screens, hinges, fans and cleaning, and storage or memory upgrades (SSD, RAM), plus software problems. The cost depends on the laptop model, the part (screens vary a lot by size, resolution and touch), whether an original or compatible part is used, and part availability. That's why the quote comes after the diagnosis rather than as a fixed price list." },
        { heading: "Repair or replace?", body: `Repairs usually make sense for batteries, chargers, keyboards, SSDs and RAM on 8th-gen or newer laptops. Replacing is usually better when the motherboard or screen fails on an older laptop, or the repair costs more than about half the price of a comparable laptop. For reference, 8th-gen or newer business laptops at ECB Technologies have a median price of ${biz8.length ? ksh(median(biz8.map((r) => r.price))) : "n/a"}: see ${link("best value laptops", `${SITE}/learn/best-value-laptops-kenya`)}.` },
        { heading: "Questions to ask any repair shop", body: "- Is there a diagnosis fee, and is it deducted from the repair?\n- What exactly will be replaced, and is the part original or compatible?\n- How long will it take?\n- Is there a warranty on the repair, and how long?\n- Will my files be kept, and who will have access to them?\n\nGet the quote and the repair details on the receipt." },
      ],
      faq: [
        { question: "Where can I repair my laptop in Nairobi?", answer: "At ECB Technologies, Techmart Iconic Business Plaza, 3rd floor, room T12, Moi Avenue, Nairobi CBD, Monday to Saturday, 9am to 7pm. Bring the laptop and charger, or WhatsApp 0717 040 531 first." },
        { question: "How much does laptop repair cost in Kenya?", answer: "It depends on the model and the part; screens and motherboards vary the most. Get a diagnosis and a quote first." },
        { question: "Can you replace a laptop battery or screen?", answer: "Batteries and screens are common laptop repairs; the cost depends on the exact model and part. Send the model on WhatsApp or bring the laptop in for a quote." },
        { question: "Is it better to repair or replace my laptop?", answer: "Repair batteries, chargers, keyboards and storage on 8th-gen or newer laptops; replace when a motherboard or screen fails on an older laptop, or the repair costs more than about half a comparable laptop." },
        { question: "What should I do before taking my laptop for repair?", answer: "Back up your files if it still works, bring the charger, note what happens and since when, and have your BitLocker recovery key ready if the drive is encrypted." },
      ],
    };
  },
});
