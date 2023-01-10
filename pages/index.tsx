import { Alert, Badge, Button, DarkThemeToggle, Dropdown, Pagination, Spinner, TextInput } from "flowbite-react";
import { KeyboardEvent, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FiAlertCircle, FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";
import { HiLightningBolt, HiOutlineLightningBolt } from "react-icons/hi";
import MyFooter from "../components/footer";
import useFetchAddress from "../hooks/useFetchAddress";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";

export default function Home() {
  const [address, setAddress] = useState("");
  const [validKey, setValidKey] = useState(false);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const {
    loading,
    loadingText,
    currentPage,
    setCurrentPage,
    showMetadata,
    setShowMetadata,
    metadataAnimation,
    metadataAnimText,
    setTextFilter,
    displayArray,
    totalPages,
    fetchedTransactions,
    fetchForAddress,
    toggleMetadata,
  } = useFetchAddress();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // @ts-ignore
      const str: string = e.target.value.trim();
      if (str.match("[A-Za-z0-9]{44}")) {
        checkKey(str, false);
      } else {
        setValidKey(false);
      }
    }
  };

  async function checkKey(keyIn: string, fetch: boolean) {
    try {
      if (PublicKey.isOnCurve(keyIn)) {
        setValidKey(true);
        if (fetch && !loading) {
          await fetchForAddress(keyIn, dayjs(startDate), dayjs(endDate));
        }
      } else {
        setValidKey(false);
      }
    } catch (e) {}
  }

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
              onClick={() => setShowMetadata(!showMetadata)}
            >
              {showMetadata ? <HiLightningBolt color="#a855f7" size={20} /> : <HiOutlineLightningBolt color="#a855f7" size={20} />}
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
            value={address}
            onKeyDown={handleKeyDown}
            onChange={(e) => setAddress(e.target.value)}
          />
          {address && !validKey && (
            <Badge color="failure" className="mt-2">
              Wallet address is invalid
            </Badge>
          )}
        </div>
        <p className="mt-4 mb-2 text-xl font-semibold">Transaction Statement</p>
        <div className="flex items-center">
          <span className="mr-2">For the period</span>
          <TextInput 
            type="date"
            value={startDate}
            min="2020-10-02"
            max={endDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className="mx-2">To</span>
          <TextInput 
            type="date"
            value={endDate}
            min={startDate}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={e => setEndDate(e.target.value)}
          />
          <Button
            color="gray"
            className="ml-4"
            disabled={!validKey}
          >
            <FiSearch />
          </Button>
        </div>
        <div className="flex items-center mt-4">
          {loading ? (
            <Alert>
              <Spinner size="sm" />
              <span className="ml-4">{loadingText}</span>
            </Alert>
          ) : validKey ? (
            <Alert color="info" icon={FiAlertCircle}>
              <span>
                Enter a <strong>Solana Wallet</strong> or <strong>.sol</strong> address to display records
              </span>
            </Alert>
          ) : (
            <div>
              <span>{`${currentPage} / 100`}</span>
              
              <Pagination currentPage={currentPage} totalPages={100} showIcons onPageChange={(page) => setCurrentPage(page)} />
            </div>
          )}
        </div>
      </main>
      <MyFooter />
    </div>
  );
}
