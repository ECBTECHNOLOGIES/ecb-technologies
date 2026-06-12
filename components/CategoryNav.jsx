import Link from "next/link";

export default function CategoryNav({ categories }) {
  if (!categories?.length) return null;

  return (
    <nav className="border-t border-white/10 bg-brand-blue">
      <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 text-sm font-medium text-white sm:px-6 lg:px-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="whitespace-nowrap rounded px-1 transition-colors hover:bg-white/10 hover:text-[#5B8DEF] active:text-[#5B8DEF]"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
