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
  title: "Windows 10 or 11 Laptop? Licences and Office in Kenya",
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
