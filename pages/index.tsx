import { Badge, Button, DarkThemeToggle, Dropdown, TextInput } from "flowbite-react";
import { KeyboardEvent, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import MyFooter from "../components/footer";

export default function Home() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>(new Date());

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // @ts-ignore
      const str: string = e.target.value;
      if (str.match("[A-Za-z0-9]{44}")) {
        setError("");
        setAddress(str);
      } else {
        setError("Invalid address");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-800 dark:text-white">
      <div className="flex items-center justify-center py-4">
        <span className="text-4xl font-bold mr-8 dark:text-white">DeBooks</span>
        <Dropdown label={<FiSettings />} arrowIcon={false} color="gray">
          <Dropdown.Item>
            <DarkThemeToggle />
          </Dropdown.Item>
          <Dropdown.Item>
            <button
              className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              type="button"
              aria-label="Toggle metadata"
            >
              <HiOutlineLightningBolt size={20} />
            </button>
          </Dropdown.Item>
          <Dropdown.Item>
            <button
              className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              type="button"
              aria-label="Toggle metadata"
            >
              <FiHelpCircle size={20} />
            </button>
          </Dropdown.Item>
        </Dropdown>
      </div>
      <main className="flex flex-col flex-1 items-center">
        <div>
          <TextInput
            type="text"
            placeholder="enter account address e.g. DeDao...uw2r"
            className="w-96"
            onKeyDown={handleKeyDown}
          />
          {error && (
            <Badge color="failure" className="mt-2">
              {error}
            </Badge>
          )}
        </div>
        <p className="mt-4 mb-2 text-xl font-semibold">Transaction Statement</p>
        <div className="flex items-center">
          <span className="mr-2">For the period</span>
          <DatePicker
            selected={fromDate}
            onChange={(date: Date) => setFromDate(date)}
            className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
          />
          <span className="mx-2">To</span>
          <DatePicker
            selected={toDate}
            onChange={(date: Date) => setToDate(date)}
            className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
          />
          <Button
            color="gray"
            className="ml-4"
            disabled={!(fromDate && toDate && toDate.getTime() - fromDate.getTime() > 0)}
          >
            <FiSearch />
          </Button>
        </div>
      </main>
      <MyFooter />
    </div>
  );
}
