import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, searchParams }) {
  if (totalPages <= 1) return null;

  function buildHref(page) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `/products?${params.toString()}`;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const pageClass = (active) =>
    `flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-[15px] transition-colors ${
      active ? "bg-ink text-white" : "text-ink-80 hover:bg-parchment"
    }`;
  const arrowClass = (disabled) =>
    `flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
      disabled ? "pointer-events-none text-ink-48/40" : "text-primary hover:bg-parchment"
    }`;

  return (
    <nav aria-label="Pagination" className="mt-16 flex flex-wrap items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
        className={arrowClass(currentPage === 1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {start > 1 && (
        <>
          <Link href={buildHref(1)} className={pageClass(false)}>
            1
          </Link>
          {start > 2 && <span className="px-1 text-ink-48">…</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={pageClass(page === currentPage)}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-48">…</span>}
          <Link href={buildHref(totalPages)} className={pageClass(false)}>
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
        className={arrowClass(currentPage === totalPages)}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </nav>
  );
}
