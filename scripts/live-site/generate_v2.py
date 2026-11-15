"""Generate meta tags + meta descriptions for products whose SEO is empty.
Input: products.jsonl from crawl.py. Output: JSON + CSV.
Only facts already on the product page (name, labelled specs) are used."""
import csv, json, re, sys

src, out_json, out_csv = sys.argv[1:4]

ACRONYMS = {"HP","SSD","HDD","RAM","GB","TB","LED","USB","OLED","AMD","RTX","GTX","NVIDIA","LAN","HDMI",
            "MSI","ASUS","LG","TV","CCTV","POS","UPS","PC","FHD","UHD","QHD","IPS","NVME","DDR4","DDR5",
            "WIFI","5G","4G","TUF","WQHD","RGB","UFS","OLED","QD-OLED","X360","EE","ITX","ATX","PS5","PS4","AIO","DVR","NVR","IP","USB-C","A4","A3",
            "MFP","SD","XPS","LTE","II","III","IV","GPU","VA","SFF","DOS"}
KEEP_CASE = {"Samsung","Lenovo","Dell","Acer","Asus","Xiaomi","Huawei","Logitech","Kyocera","Epson","Canon","Microsoft","Google","Tecno","Infinix","Oppo","Vivo","Realme","Honor","Nothing","Pixel","iPhone","iPad","MacBook","AirPods","iMac","ThinkPad","ProBook","EliteBook","ZBook","IdeaPad","ThinkBook","ThinkCentre","OptiPlex"}
BRANDS = ["HP","Dell","Lenovo","Apple","Samsung","Asus","Acer","MSI","Gigabyte","Microsoft","Huawei","Tecno","Infinix",
          "Xiaomi","Redmi","Oppo","Vivo","Nokia","Google","Sony","LG","Hisense","TCL","Vitron","Kyocera","Epson","Canon",
          "Brother","Xprinter","Logitech","JBL","Oraimo","Anker","Insta360","DJI","Hikvision","Dahua","Seagate","Western Digital",
          "WD","SanDisk","Kingston","Transcend","Toshiba","Nintendo","Xbox","PlayStation","Razer","Corsair","HyperX","Jabra","Poly",
          "Plantronics","Zebra","TP-Link","Tenda","Mercusys","Ubiquiti","Cisco","Mikrotik","Belkin","Baseus","Ugreen","Amazon",
          "Nothing","OnePlus","Itel","Realme","Honor","Sharp","Philips","Bose","Beats","Marshall","Soundcore","Edifier","Fujitsu","Panasonic"]
CATS = [  # (keywords, singular word, plural word); first match wins
    (r"all-in-one|\baio\b|desktop|optiplex|thinkcentre|elitedesk|prodesk|imac|mini pc|\btower\b|\bsff\b", "desktop", "desktops"),
    (r"\d+\s*k?va\b|\bups\b|stabili[sz]er|inverter", "UPS", "UPS and power backup"),
    (r"scanjet|scanner|\blide\b", "scanner", "scanners"),
    (r"\bcable\b|\badapter\b|\bextension\b|\bkeyboard\b|\bpencil\b|\bcharger\b|\bmouse\b|\bsleeve\b|\bcase\b|\bcover\b", "accessory", "accessories"),
    (r"monitor arm|monitor stand|\barms?\b.*\d+\s*[\"”]", "accessory", "accessories"),
    (r"\b\d{3,4}[×x]\d{3,4}\b|\bvg\d{2}|odyssey|viewfinity|\bmonitor\b|\bhp s\d{2}\b|\bseries \d pro \d{3}", "monitor", "monitors"),
    (r"lumens|projector|\beb-[a-z0-9]|\bco-w", "projector", "projectors"),
    (r"probook|elitebook|latitude|xps|thinkpad|macbook|laptop|notebook|vostro|inspiron|precision|zbook|ideapad|thinkbook|yoga|surface|chromebook|vivobook|zenbook|aspire|travelmate|\bswift\b|predator|\brog\b|\btuf\b|envy|spectre|pavilion|omen|victus|legion|galaxy book|dragonfly|toughbook|lifebook|omnibook|elite x2|workstation|\bi[3579]\b|\bi[3579]-|ryzen|celeron|core ultra|core [3579]\b|ultra [579]\b|snapdragon x", "laptop", "laptops"),
    (r"microsoft office|windows 1[01]|kaspersky|antivirus|eset|norton|internet security", "software", "software"),
    (r"iphone|galaxy [asmz]\d|galaxy note|\bs2\d\b|\bfold ?\d|\bflip ?\d|\bmi \d|pixel|redmi|tecno|infinix|\bphone\b|smartphone|oppo|\bvivo\b|nokia|itel|realme|oneplus|honor|\bnothing \d|camon|\bspark\b|\bhot \d", "phone", "phones"),
    (r"ipad|\btab\b|tablet|galaxy tab|matepad|kindle|fire hd", "tablet", "tablets"),
    (r"\bwatch\b|\bfit \d|\bgt ?\d|smartwatch|\bband \d", "smartwatch", "smartwatches"),
    (r"printer|ecosys|laserjet|deskjet|officejet|pixma|ecotank|xprinter|label|toner|cartridge|photocopier|plotter|taskalfa|kyocera|\bepson (l|m|lq|lx|et)-?\d|\blq-?\d|\blx-?\d|\bhp (m|\d{4})\w*\b|epos|receipt|\bcanon g\d{4}|\bg\d{4}\b", "printer", "printers"),
    (r"monitor|odyssey|viewfinity|\d+(\.\d+)?[\"”]|\d+\s*hz\b|\bfhd\b|\bqhd\b|wqhd|\bmag \d|\bmpg \d|\bmd\d", "monitor", "monitors"),
    (r"\btv\b|television|smart tv|soundbar", "TV", "TVs"),
    (r"ps5|ps4|playstation|xbox|nintendo|controller|gamepad|gaming", "gaming accessory", "gaming accessories"),
    (r"cctv|camera|dvr|nvr|hikvision|dahua|insta360|gopro|webcam|\bdji\b|osmo|\baction \d|gimbal", "camera", "cameras and vlogging gear"),
    (r"headset|headphone|earbud|earphone|airpods|speaker|buds|audio|microphone|\bmic\b|\blark\b", "audio accessory", "audio accessories"),
    (r"\bssd\b|\bhdd\b|hard disk|flash|memory card|sd card|external drive", "storage device", "storage devices"),
    (r"router|switch|access point|wifi|mesh|modem|extender", "networking device", "networking devices"),
    (r"pencil|charger|cable|adapter|power bank|powerbank|mouse|keyboard|bag|sleeve|case|cover|protector|hub|dock|stand|arm", "accessory", "accessories"),
]
SPEC_STOP = re.compile(r"^(amd|intel|qualcomm|snapdragon|apple|\d+(\.\d+)?[\"”']|i[3579]|core|ultra|ryzen|celeron|pentium|m[1-4]\b|\d+gb|\d+tb|\d+(st|nd|rd|th)|gen\b|\d+/\d+|\d+\s*/|touch|non-touch|x360|2-in-1|\d+(\.\d+)?\"|\d+-inch)", re.I)

PREFIXES = [  # stock labels at the start of names -> clean brand words
    (r"^IPHONE\b[^0-9]*?(?=\d)", "iPhone "), (r"^GOOGLE PIXEL\s*", "Google "), (r"^NOTHING PHONE\s*(?!.*\bnothing\b)", "Nothing "),
    (r"^NOTHING PHONE\s*", ""), (r"^HONOR PHONES\s*", ""), (r"^ONEPLUS\s*(?=.*oneplus)", ""), (r"^ONEPLUS\s*", "OnePlus "),
    (r"^SAMSUNG\s*(?=(E\.A\s*)?(S\d|Fold|Flip|A\d|Z\s))", "Samsung Galaxy "), (r"^CANON PRINTERS\s*", ""),
    (r"^XIAOMI\s*(?=Mi\b)", "Xiaomi "), (r"^Tab S(?=\d)", "Samsung Galaxy Tab S"),
    (r"^Watch Ultra(?= \d)", "Apple Watch Ultra"), (r"^(?=(Series \d+|SE ?\d)\b)", "Apple Watch "),
    (r"^SAMSUNG\s+Watch", "Samsung Galaxy Watch"),
]
def warranty_of(name):
    low = name.lower()
    if re.search(r"(no|without) warranty", low):
        return "No warranty"
    m = re.search(r"(\d+)\s*years?\W*(local\W*)?(apple\W*)?warranty", low)
    note = None
    if m:
        kind = "local " if m.group(2) else ("Apple " if m.group(3) else "")
        note = f"{m.group(1)}-year {kind}warranty"
    if "physical sim" in low:
        note = ", ".join(filter(None, [note, "physical SIM + eSIM"]))
    elif "esim only" in low:
        note = ", ".join(filter(None, [note, "eSIM only"]))
    return note

def strip_labels(name):
    name = re.sub(r"(?i)\(?\s*(no|without)\s+warranty\s*\)?\s*\.?", " ", name)
    name = re.sub(r"(?i)\(?\s*\d+\s*years?\W*(local\W*)?(apple\W*)?warranty\s*\)?", " ", name)
    name = re.sub(r"(?i)physical sim\s*\+\s*esim|esim only", " ", name)
    name = re.sub(r"\s[.*]+\s", " ", f" {name} ").strip()
    name = re.sub(r"(?i)\bE\.A\b\s*", "", name)
    name = re.sub(r"\s+", " ", name).strip(" -.")
    for pat, repl in PREFIXES:
        new = re.sub(pat, repl, name, count=1, flags=re.I)
        if new != name:
            name = new
            break
    return re.sub(r"\s+", " ", name).strip()

def tidy(name, computer=True):
    name = re.sub(r"(?i)\s*\bprice in kenya\b\s*,?", " ", name)
    name = re.sub(r"\s*[|—–]\s*", ", ", name)
    name = re.sub(r"(?i)think\s*p(r)?a(r)?d", "ThinkPad", name)
    name = re.sub(r"(?i)\b(invidia|inidia|ndividia|nvidea)\b", "NVIDIA", name)
    name = re.sub(r"(?i)\bnvidia(?=t\d)", "NVIDIA ", name)
    name = re.sub(r"(?i)\bSDS\b", "SSD", name)
    name = re.sub(r"(?i)\b(128|256|512)\s*ssd\b", r"\1GB SSD", name)
    name = re.sub(r"(?i)\b(\d+)\s*gb\b", r"\1GB", name)
    name = re.sub(r"(?i)(SSD)(?=[a-z0-9])", r"\1 ", name)
    name = re.sub(r"^[^\w(]+", "", name)
    name = re.sub(r"\s+", " ", name).strip(" -|,")
    name = re.sub(r",\s*,", ",", name)
    if computer:
        name = re.sub(r"\b(4|8|16|32|64)\s*/\s*(128|256|512)(?:\s*GB)?\b(?:\s*SSD\b)?", r"\1GB RAM \2GB SSD", name, flags=re.I)
    else:
        name = re.sub(r"\b(4|6|8|12|16|24)\s*/\s*(64|128|256|512)\s*GB\b", r"\1GB RAM \2GB", name, flags=re.I)
    if computer:
        name = re.sub(r"\b(128|256|512)\s+SSD\b", r"\1GB SSD", name, flags=re.I)
    name = re.sub(r"\b([iI][3579])\s+(\d+(?:st|nd|rd|th|ST|ND|RD|TH))\b(?!\s*[Gg][Ee][Nn])", r"\1 \2 Gen", name)
    if computer:
        name = re.sub(r"\b(4|8|16|32|64)\s*/\s*1\s*TB\b", r"\1GB RAM 1TB SSD", name, flags=re.I)
    name = re.sub(r"\b(\d+)\s+(GB|TB)\b", r"\1\2", name, flags=re.I)
    words = []
    for w in name.split(" "):
        core = w.strip(",()")
        up = core.upper()
        if any(k.lower() == core.lower() for k in KEEP_CASE):
            w = w.replace(core, next(k for k in KEEP_CASE if k.lower() == core.lower()))
        elif up in ACRONYMS or re.fullmatch(r"[0-9]+(GB|TB|MB|W|MP|MAH|HZ|K)", up):
            w = w.replace(core, up.replace("MAH", "mAh").replace("HZ", "Hz"))
        elif re.fullmatch(r"I[3579]", up):
            w = w.replace(core, core.lower())
        elif re.fullmatch(r"\d+(ST|ND|RD|TH)", up):
            w = w.replace(core, core.lower())
        elif core.isupper() and len(core) > 2 and core.isalpha():
            w = w.replace(core, core.capitalize())
        elif core.isupper() and len(core) > 2 and re.fullmatch(r"[A-Z]+-[A-Z]+", core):
            w = w.replace(core, "-".join(p.capitalize() for p in core.split("-")))
        words.append(w)
    name = " ".join(words)
    name = re.sub(r"\bGen\b|\bGEN\b", "Gen", name)
    name = re.sub(r"\bWIFI\b", "WiFi", name)
    name = re.sub(r"(?i)\bnon[- ]?touch\b", "Non-Touch", name)
    name = re.sub(r"(?i)\btouchscreen\b", "Touchscreen", name)
    return name

def brand_of(name):
    low = name.lower()
    if re.search(r"macbook|iphone|ipad|airpods|imac|apple watch|apple pencil", low):
        return "Apple"
    for b in BRANDS:
        if re.search(r"(?<![a-z])" + re.escape(b.lower()) + r"(?![a-z])", low):
            return {"WD": "Western Digital"}.get(b, b)
    return None

def cat_of(name):
    low = name.lower()
    for pat, one, many in CATS:
        if re.search(pat, low):
            return one, many
    return None, "electronics"

def model_of(name, computer=True):
    out = []
    for w in name.split(" "):
        token = w.strip(",")
        if out and token.startswith("("):
            break
        if out and SPEC_STOP.match(token) and (computer or not re.match(r"(?i)ultra|core|m[1-4]$", token)):
            break
        out.append(w.strip(","))
        if w.endswith(",") or len(out) >= 6:
            break
    return " ".join(out)

LABELS = r"(Processor|CPU|Chip|Memory/RAM|Memory|RAM|Storage|Display|Screen|Graphics|Battery|Camera|Resolution|Print Speed|Connectivity)"
def specs_from_body(body, name):
    if not body:
        return []
    found = {}
    for m in re.finditer(LABELS + r"\s*:\s*(.+?)(?=\s+" + LABELS + r"\s*:|\s+Description\s*:|$)", body):
        key = m.group(1).split("/")[0].lower()
        val = m.group(2).strip(" .;")
        if re.search(r"(?i)unspecified|not (officially )?disclosed|unknown|n/a|not specified", val):
            continue
        if 2 < len(val) <= 45 and key not in found:
            found[key] = val
    if len(name) > 45:
        return []
    picks = []
    for key in ["processor", "cpu", "chip", "memory", "ram", "storage", "display", "screen", "print speed"]:
        v = found.get(key)
        if not v or ":" in v or re.search(r"(?i)\b(front|rear|main|wireless)$", v):
            continue
        sizes = re.findall(r"(?i)\d+\s*(?:gb|tb)", v)
        if sizes and all(re.sub(r"\s", "", z).lower() in re.sub(r"\s", "", name).lower() for z in sizes):
            continue
        if v.lower() not in name.lower() and v not in picks:
            picks.append(v)
    return picks[:3]

def describe(name, specs):
    head = name if not specs else f"{name}: {', '.join(specs)}"
    for tail in [" Buy at ECB Technologies, Nairobi CBD. Delivery to all 47 counties.",
                 " At ECB Technologies, Nairobi CBD. Delivery across Kenya.",
                 " At ECB Technologies, Nairobi CBD."]:
        if len(head) + 1 + len(tail) <= 160:
            return f"{head}.{tail}"
    if specs:
        return describe(name, specs[:-1])
    cut = name[:118].rsplit(" ", 1)[0]
    return f"{cut}. At ECB Technologies, Nairobi CBD."


def ksh(n):
    return f"KSh {n:,}"

def under_band(price):
    for step in (5000, 10000, 25000, 50000, 100000):
        if price <= step * 10:
            band = -(-price // step) * step
            if band == price:
                band += step
            return band
    return None

def describe_priced(name, model, price, note):
    label = f"{name} ({note})" if note else name
    tails = [". Buy at ECB Technologies, Moi Avenue, Nairobi CBD. Delivery to all 47 counties.",
             ". At ECB Technologies, Moi Avenue, Nairobi CBD. Delivery across Kenya.",
             ". At ECB Technologies, Nairobi CBD. Delivery across Kenya.",
             ". At ECB Technologies, Nairobi CBD."]
    heads = []
    if price:
        heads += [f"{label} price in Kenya: {ksh(price)}", f"{label}: {ksh(price)}", f"{model} price in Kenya: {ksh(price)}"]
    else:
        heads += [label, model]
    for head in heads:
        for tail in tails:
            if len(head) + len(tail) <= 160:
                return head + tail
    head = heads[-1]
    room = 160 - len(tails[-1]) - (len(f": {ksh(price)}") if price else 0)
    short = name[:room].rsplit(" ", 1)[0]
    return (f"{short}: {ksh(price)}" if price else short) + tails[-1]

STORE_LINE = ("Buy it at our shop at Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, "
              "Nairobi CBD, or order online with delivery to all 47 counties.")

def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def intro_html(name, price, note):
    price_part = f" is <strong>{ksh(price)}</strong>" if price else ""
    note_part = f" ({esc(note)})" if note else ""
    return (f'<h2 class="ecb-price-intro">{esc(name)} price in Kenya</h2>'
            f"<p>The {esc(name)}{note_part} price in Kenya{price_part} at ECB Technologies. {STORE_LINE}</p>")

def product_tags(name, one, many, brand, price):
    low = name.lower()
    tags = []
    band = under_band(price) if price else None
    if band:
        step = 5000 if band <= 50000 else (10000 if band <= 100000 else 25000)
        tags.append(f"{many.capitalize()} under {ksh(band)}")
        if band - step > 0:
            tags.append(f"{ksh(band - step)} to {ksh(band)} {many}")
    if brand:
        tags.append(f"{brand} {many} Kenya" if brand.lower() not in many.lower() else f"{many.capitalize()} Kenya")
    if one == "laptop":
        if re.search(r"elitebook|latitude|thinkpad|probook|precision|zbook|vostro|expertbook|travelmate|dell pro\b", low):
            tags.append("Business laptops")
        if re.search(r"\brtx\b|\bgtx\b|gaming|\brog\b|\btuf\b|omen|legion|predator|nitro|victus", low):
            tags.append("Gaming laptops")
        if re.search(r"workstation|quadro|precision|zbook|\bp1\b|\bp5\d|\bp15", low):
            tags.append("Workstation laptops")
        if re.search(r"x360|2-in-1|2in1|yoga|flip|detachable", low):
            tags.append("2-in-1 laptops")
        if re.search(r"touch", low) and not re.search(r"non[- ]?touch", low):
            tags.append("Touchscreen laptops")
        if price and price <= 30000:
            tags.append("Budget laptops Kenya")
    if one == "phone" and re.search(r"\b5g\b", low):
        tags.append("5G phones Kenya")
    return [t.replace(",", "") for t in dict.fromkeys(tags)]

rows = [json.loads(l) for l in open(src)]
results = []
for r in rows:
    raw = r.get("h1") or (r.get("title") or "").split("|")[0]
    if not raw:
        continue
    warranty = warranty_of(raw)
    pre_one, _ = cat_of(strip_labels(raw))
    name = tidy(strip_labels(raw), computer=pre_one in ("laptop", "desktop"))
    if re.match(r"Watch \d", name) and "exynos" in (r.get("body") or "").lower():
        name = "Samsung Galaxy " + name
    brand = brand_of(name)
    one, many = cat_of(name)
    model = model_of(name, computer=one in ("laptop", "desktop", None))
    try:
        price = int(float(r.get("price") or 0))
    except ValueError:
        price = 0
    tags = [model, f"{model} price in Kenya",
            f"{brand} {many} Nairobi" if brand and brand.lower() not in many.lower() else f"{many} Nairobi",
            f"{many} Nairobi CBD"]
    band = under_band(price) if price else None
    if band:
        tags.append(f"{many} under {ksh(band)}")
    tags.append(f"{many} price in Kenya")
    seen, uniq = set(), []
    for t in tags:
        t = t.replace(",", "")
        if t.lower() not in seen:
            seen.add(t.lower()); uniq.append(t)
    desc = describe_priced(name, model, price, warranty)
    results.append({"id": r.get("id"), "slug": r["slug"], "name": raw, "price": price, "meta_tags": uniq,
                    "meta_description": desc, "product_tags": product_tags(name, one, many, brand, price),
                    "intro_html": intro_html(name, price, warranty)})

json.dump(results, open(out_json, "w"), indent=1, ensure_ascii=False)
with open(out_csv, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["product_id", "product_name", "price_ksh", "meta_tags", "meta_description", "chars"])
    for x in results:
        w.writerow([x["id"], x["name"].strip(), x["price"], " | ".join(x["meta_tags"]), x["meta_description"], len(x["meta_description"])])
print(len(results), "products; longest description:", max(len(x["meta_description"]) for x in results),
      "| without price:", sum(1 for x in results if not x["price"]))
