// Flagship ("skyscraper") additions for /student-laptops-kenya.
//
// The competing Kenyan guides (news sites and shops) list a handful of models
// with prices that go stale. This page is meant to be clearly better: live
// prices from real stock, the best pick for each course, budget tiers, what
// extra money buys (measured), and a pre-purchase checklist. Everything here
// is computed from the catalogue at build time.

export function studentFlagship(x) {
  const { L, ksh, median, link, tableMd, specLine, SITE, asOf, recency } = x;
  const ok = (r) => (r.sp.tier || 0) >= 3 && recency(r.sp) >= 3; // 8th gen+ Core i5 class or better
  const best = (rows) => [...rows].sort((a, b) => b.score - a.score || a.price - b.price)[0];
  const cell = (r) => (r ? `${link(r.short, `${SITE}/item/${r.slug}`)} – ${ksh(r.price)}` : "none in stock");
  const studentRows = L.filter(ok);
  if (studentRows.length < 20) return null;

  // Budget tiers.
  const tiers = [[25000, "Up to KSh 25,000"], [30000, "Up to KSh 30,000"], [40000, "Up to KSh 40,000"], [60000, "Up to KSh 60,000 (if you can stretch)"]];
  const tierRows = tiers.map(([max, label]) => {
    const rs = studentRows.filter((r) => r.price <= max);
    return [label, String(rs.length), cell(best(rs))];
  });

  // Best laptop for each course.
  const courses = [
    ["Business, law, arts, education, nursing and medicine", "Documents, research, presentations and online classes: any 8th-gen or newer Core i5 is enough. Up to KSh 35,000:", (r) => ok(r) && r.price <= 35000],
    ["Computer science and IT", "Code editors, browsers and virtual machines need memory: 16 GB RAM and an 8th-gen or newer processor. Up to KSh 60,000:", (r) => ok(r) && r.sp.ram >= 16 && r.price <= 60000],
    ["Engineering and architecture (AutoCAD, SolidWorks, MATLAB)", "3D software is happiest with a dedicated graphics card; at minimum 16 GB RAM and a 10th-gen or newer processor. Up to KSh 100,000:", (r) => r.price <= 100000 && (r.sp.gpu || (r.sp.ram >= 16 && recency(r.sp) >= 4 && (r.sp.tier || 0) >= 3))],
    ["Graphic design, film and media", "A touchscreen or 2-in-1 helps for sketching; 16 GB RAM for Photoshop and Premiere. Up to KSh 80,000:", (r) => ok(r) && r.price <= 80000 && r.sp.ram >= 16 && (r.sp.touch || r.sp.convertible)],
  ];
  const courseRows = courses.map(([course, need, f]) => {
    const rs = L.filter(f);
    const cheapest = [...rs].sort((a, b) => a.price - b.price)[0];
    return { course, need, n: rs.length, top: best(rs), cheapest };
  });

  // What extra money buys (same model, measured).
  const prem16 = x.premium(L, (r) => r.sp.ram === 8, (r) => r.sp.ram === 16, { sameModel: true });
  const med = median(studentRows.filter((r) => r.price <= 40000).map((r) => r.price));
  const under30 = studentRows.filter((r) => r.price <= 30000).length;

  return {
    // Agree – Promise – Preview.
    lead: `Picking a university laptop on a student budget is hard: listings look alike, and the wrong one won't run Windows 11 or last four years of campus. This guide shows exactly which laptops for students in Kenya are worth the money right now, from real stock with today's prices: the 10 best under KSh 40,000, the best pick for your course, what each budget gets you, and what to check before you pay.`,
    sections: [
      {
        heading: "The best laptop for your course",
        body:
          courseRows.map((c) => `- **${c.course}:** ${c.need} ${c.n ? `${c.n} in stock; best specified: ${cell(c.top)}${c.cheapest && c.cheapest !== c.top ? `; cheapest: ${cell(c.cheapest)}` : ""}.` : "None in stock right now; ask us on WhatsApp."}`).join("\n") +
          "\n\nCheck your department's software list before buying: some engineering programs need a specific graphics card or Windows (not macOS).",
      },
      {
        heading: "What each budget gets you",
        body: `Laptops that meet the student rule (8th-gen or newer Core i5 class processor or better), by budget (${asOf}):\n\n` + tableMd(["Budget", "Laptops", "Best specified"], tierRows) + `\n\nThe median qualifying laptop under KSh 40,000 costs ${ksh(med)}, and ${under30} cost KSh 30,000 or less.`,
      },
      {
        heading: "Where extra money goes furthest",
        body: [
          "1. **Processor generation first.** 8th gen is the minimum for Windows 11; 10th or 11th gen if your course is demanding. See [processor generations explained](" + `${SITE}/learn/laptop-processor-generations-kenya).`,
          `2. **Then memory.** ${prem16 ? `For the same model, 16 GB costs a median of ${ksh(prem16.diff)} more than 8 GB here.` : "16 GB costs more than 8 GB for the same model."} Worth it for computer science, engineering and design; not needed for most other courses. See [how much RAM you need](${SITE}/learn/how-much-ram-laptop-kenya).`,
          `3. **Storage last.** 256 GB is enough with cloud storage, and most business laptops can take a bigger SSD later. See [256 GB vs 512 GB](${SITE}/learn/laptop-ssd-size-kenya).`,
        ].join("\n"),
      },
      {
        heading: "Before you pay: a 5-minute check",
        body: [
          "- **Battery:** run `powercfg /batteryreport` and compare full-charge with design capacity (80%+ is good).",
          "- **Windows 11:** Settings → System → About shows the processor; 8th gen or newer.",
          "- **Keyboard, screen and ports:** type every key, look at a white screen for dead pixels, try every USB port.",
          "- **BIOS:** no supervisor password at startup.",
          "- **Warranty:** what it covers, for how long, written on the receipt.",
          "",
          `The full list is in ${link("how to check a used laptop before buying", `${SITE}/learn/check-used-laptop-before-buying`)}. At our shop on Moi Avenue you can run these checks on any laptop before paying.`,
        ].join("\n"),
      },
    ],
    faq: [
      { question: "Which laptop is best for computer science students in Kenya?", answer: courseRows[1].top ? `One with 16 GB RAM and an 8th-gen or newer processor. The best specified in stock up to KSh 60,000 is the ${courseRows[1].top.short} at ${ksh(courseRows[1].top.price)} (${specLine(courseRows[1].top.sp)}), as of ${asOf}.` : "One with 16 GB RAM and an 8th-gen or newer processor; ask us on WhatsApp for current stock." },
      { question: "Which laptop is best for engineering students?", answer: courseRows[2].top ? `A laptop with a dedicated graphics card, or at least 16 GB RAM and a 10th-gen processor, for AutoCAD and SolidWorks. ${courseRows[2].n} qualify in stock up to KSh 100,000; the best specified is the ${courseRows[2].top.short} at ${ksh(courseRows[2].top.price)}, and the cheapest is the ${courseRows[2].cheapest.short} at ${ksh(courseRows[2].cheapest.price)}.` : "A laptop with a dedicated graphics card, or at least 16 GB RAM and a 10th-gen processor." },
      { question: "Is 8 GB RAM enough for university?", answer: "Yes, for most courses (documents, research, online classes). Computer science, engineering and design students should get 16 GB." },
      { question: "Is a used or ex-UK laptop OK for university?", answer: "Yes, if it has an 8th-gen or newer processor, a healthy battery and a warranty. Business models like the ThinkPad T-series, EliteBook 840 and Latitude 5000/7000 are built to last; check them with the 5-minute list above." },
    ],
  };
}
