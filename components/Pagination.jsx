import Link from "next/link";

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

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm ${
          currentPage === 1
            ? "pointer-events-none text-gray-300"
            : "text-gray-700 hover:border-brand-blue hover:text-brand-blue"
        }`}
      >
        Prev
      </Link>

      {start > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm text-gray-700 hover:border-brand-blue hover:text-brand-blue"
          >
            1
          </Link>
          {start > 2 && <span className="px-1 text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
            page === currentPage
              ? "border-brand-green bg-brand-green text-white"
              : "border-gray-200 text-gray-700 hover:border-brand-blue hover:text-brand-blue"
          }`}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
          <Link
            href={buildHref(totalPages)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm text-gray-700 hover:border-brand-blue hover:text-brand-blue"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm ${
          currentPage === totalPages
            ? "pointer-events-none text-gray-300"
            : "text-gray-700 hover:border-brand-blue hover:text-brand-blue"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
