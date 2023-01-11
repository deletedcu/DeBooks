import { Button } from "flowbite-react";
import { FaChevronLeft, FaChevronRight, FaStepBackward, FaStepForward } from "react-icons/fa";

export default function Pagination({
  perPage,
  setPerPage,
  totalPages,
  currentPage,
  setCurrentPage,
}: {
  perPage: number;
  setPerPage: (a: number) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (a: number) => void;
}) {
  const PER_PAGES = [10, 20, 40, 50];

  return (
    <>
      {totalPages > 0 && (
        <div className="flex items-center gap-4 text-sm text-gray-900 dark:text-gray-100">
          <div className="inline-flex items-center gap-2">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(parseInt(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {PER_PAGES.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Button color="gray" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
              <FaStepBackward />
            </Button>
            <Button
              color="gray"
              size="xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            >
              <FaChevronLeft />
            </Button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <Button
              color="gray"
              size="xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            >
              <FaChevronRight />
            </Button>
            <Button
              color="gray"
              size="xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <FaStepForward />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
