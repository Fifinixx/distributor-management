import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  export default function PaginationComponent({
    totalPages,
    setPage,
    page,
    setFilteredProducts,
  }) {
    function previous(page) {
      if (page > 1) {
        setPage((prev) => prev - 1);
      }
    }
    function next(page) {
      if (page < totalPages) {
        setPage((prev) => prev + 1);
      }
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                previous(page);
              }}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((item, index) => {
            return (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={page === index + 1}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(index + 1);
                  }}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                next(page);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }
  