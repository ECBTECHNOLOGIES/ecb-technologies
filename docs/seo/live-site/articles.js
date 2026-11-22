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
