# Backups

## 1. Automatic daily backup (set up, runs in the cloud)

Every day at 02:17 (Nairobi time), a scheduled Claude Code session runs
`scripts/backup/backup.py` and commits the result to the **`backups`** branch
of this repository. Git keeps every day's version, so any past day can be
recovered with `git log backups -- backups/...`.

| Folder | What it holds |
|---|---|
| `backups/site/pages/` | Markdown copy of every page in the sitemap: all products (name, price, specs, description), categories, guides, info pages |
| `backups/site/` | `llms.txt`, `llms-full.txt`, `robots.txt`, all sitemaps |
| `backups/catalogue/` | `products.csv` and `products.json`: every listed product with slug, name, price and URL |
| `backups/cloudflare/` | Both Workers as deployed, plus their bindings; Worker routes; KV data (product list, research state, guides, duplicates); zone settings; rulesets; DNS records (JSON and a BIND file that can be re-imported) |
| `backups/MANIFEST.md` | When it ran, what was saved, and any problems |

Safety: if the shop returns a cut-off catalogue (fewer than 300 products), the
run fails and keeps the previous backup rather than overwriting it.

Run it by hand: `python3 -I scripts/backup/backup.py .`

## 2. Not covered: the server (do this in DirectAdmin)

The cloud sandbox cannot reach the DirectAdmin panel (port 2222), so the
**shop's files and database, and ecb.lumina.co.ke**, must be backed up by the
server itself. Without this, a server problem (like the 16 Nov rollback) can't
be undone.

### Turn on scheduled full backups

1. Log in to DirectAdmin (https://server-217-20-120-93.da.direct:2222, or the
   address your host gave you).
2. If **JetBackup** is in the menu, open it. Check that daily backups exist
   for both domains, and turn on email alerts for failures. Then stop here:
   the host is already handling backups.
3. Otherwise, as **admin or reseller**, go to **Admin Backup/Transfer →
   Schedule**:
   - Who: all users (or the ECB user).
   - When: daily, e.g. 03:00.
   - Where: **FTP or S3 on another server**. Choose "Local" only if nothing
     else is available. A backup on the same disk dies with the server.
   - What: all data (domains, databases, email).
4. If you only have a **user** login: under **Create/Restore Backups**, make a
   backup now and download it. Then ask the host to enable scheduled backups
   for your account.
5. Also ask the host how long they keep their own server backups, and how to
   request a restore.

### Bring back ecb.lumina.co.ke (the POS shop)

The site's folder is empty ("Index of /"), so the files are gone.

1. In DirectAdmin, open **Create/Restore Backups**. If you have it, use
   **JetBackup → Restore**.
2. Pick a backup from **before 15 November 2026**, and restore the files
   (`domains/ecb.lumina.co.ke/public_html`) and the database for
   `ecb.lumina.co.ke`.
3. If no backup is listed, open a ticket with the host:
   - Ask them to restore `ecb.lumina.co.ke` (files and database) from their
     latest backup before 15 Nov.
   - Ask why ecbtechkenya.com's database was rolled back on 16 Nov.
4. Until it is restored, upload the `index.html` from
   `docs/lumina-placeholder/` to `public_html` with **File Manager**. It
   replaces the empty "Index of /" listing with a short "back soon" page.
