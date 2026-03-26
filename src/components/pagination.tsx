import Link from "next/link";

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export function Pagination({
  page,
  limit,
  total,
  basePath,
  searchParams
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <span className="muted">
        Showing page {page} of {totalPages} ({total} rows)
      </span>
      <div className="row">
        {page > 1 ? (
          <Link className="button" href={buildHref(basePath, searchParams, page - 1)}>
            Prev
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link className="button button-secondary" href={buildHref(basePath, searchParams, page + 1)}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) {
      continue;
    }

    params.set(key, Array.isArray(value) ? value[0] : value);
  }

  params.set("page", String(page));

  return `${basePath}?${params.toString()}`;
}
