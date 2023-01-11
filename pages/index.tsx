import { Alert, Badge, Button, DarkThemeToggle, Dropdown, Spinner, TextInput } from "flowbite-react";
import { KeyboardEvent, useState } from "react";
import { FiAlertCircle, FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";
import { HiLightningBolt, HiOutlineLightningBolt } from "react-icons/hi";
import MyFooter from "../components/footer";
import useFetchAddress from "../hooks/useFetchAddress";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import RecordTable from "../components/recordTable";

export default function Home() {
  const [address, setAddress] = useState("");
  const [validKey, setValidKey] = useState(false);
  const [startDay, setStartDay] = useState<string>(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
  const [endDay, setEndDay] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const {
    loading,
    loadingText,
    showMetadata,
    setShowMetadata,
    fetchForAddress,
    toggleMetadata,
    perPage,
    setPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    displayArray,
    fullArray,
    textFilter,
    setTextFilter,
    showFees,
    setShowFees,
    showConversion,
    conversionHandler,
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
          await fetchForAddress(keyIn, dayjs(startDay), dayjs(endDay));
        }
      } else {
        setValidKey(false);
      }
    } catch (e) {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800 dark:text-white">
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
              {showMetadata ? (
                <HiLightningBolt color="#a855f7" size={20} />
              ) : (
                <HiOutlineLightningBolt color="#a855f7" size={20} />
              )}
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
      <main className="flex flex-col flex-1 items-center max-w-7xl mx-auto my-0 px-4 py-0">
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
        <p className="mt-4 mb-2 text-xl font-semibold">Transaction Statement</p>
        <div className="flex items-center">
          <span className="mr-2">For the period</span>
          <TextInput
            type="date"
            value={startDay}
            min="2020-10-02"
            max={endDay}
            onChange={(e) => setStartDay(e.target.value)}
          />
          <span className="mx-2">To</span>
          <TextInput
            type="date"
            value={endDay}
            min={startDay}
            max={new Date().toJSON().slice(0, 10)}
            onChange={(e) => setEndDay(e.target.value)}
          />
          <Button
            color="gray"
            className="ml-4"
            disabled={!validKey}
            onClick={async () => await checkKey(address, true)}
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
          ) : !validKey ? (
            <Alert color="info" icon={FiAlertCircle}>
              <span>
                Enter a <strong>Solana Wallet</strong> or <strong>.sol</strong> address to display records
              </span>
            </Alert>
          ) : (
            <RecordTable
              keyIn={address}
              startDay={startDay}
              endDay={endDay}
              perPage={perPage}
              setPerPage={setPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              displayArray={displayArray}
              fullArray={fullArray}
              textFilter={textFilter}
              setTextFilter={setTextFilter}
              showFees={showFees}
              setShowFees={setShowFees}
              showConversion={showConversion}
              conversionHandler={conversionHandler}
            />
          )}
        </div>
      </main>
      <MyFooter />
    </div>
  );
}
