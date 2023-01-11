import { Alert, Badge, Button, DarkThemeToggle, Dropdown, Spinner, TextInput, Tooltip } from "flowbite-react";
import { KeyboardEvent, useEffect, useState } from "react";
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
    showFailed,
    setShowFailed,
    showConversion,
    toggleMetadata,
    conversionHandler,
  } = useFetchAddress();

  useEffect(() => {
    toggleMetadata(address);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMetadata]);

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
      <div className="flex items-center justify-center py-4 gap-16">
        <span className="text-4xl font-bold dark:text-white">DeBooks</span>
        <Dropdown label={<FiSettings />} arrowIcon={false} color="gray">
          <Dropdown.Item>
            <Tooltip content="Toggle Dark Mode" placement="left">
              <DarkThemeToggle />
            </Tooltip>
          </Dropdown.Item>
          <Dropdown.Item>
            <Tooltip
              content={
                showMetadata
                  ? "Token Metadata is On(loading can be slower)"
                  : "Token Metadata is Off(loading is faster)"
              }
              placement="left"
            >
              <button
                className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                type="button"
                aria-label="Toggle metadata"
                onClick={() => setShowMetadata(!showMetadata)}
                disabled={loading}
              >
                {showMetadata ? <HiLightningBolt color="#7e22ce" size={20} /> : <HiOutlineLightningBolt size={20} />}
              </button>
            </Tooltip>
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
      <main className="flex flex-col flex-1 items-center w-full max-w-7xl mx-auto my-0 px-4 py-0">
        <TextInput
          type="text"
          placeholder="enter account address e.g. DeDao...uw2r"
          className="w-96"
          value={address}
          onKeyDown={handleKeyDown}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
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
            disabled={loading}
          />
          <span className="mx-2">To</span>
          <TextInput
            type="date"
            value={endDay}
            min={startDay}
            max={new Date().toJSON().slice(0, 10)}
            onChange={(e) => setEndDay(e.target.value)}
            disabled={loading}
          />
          <Button
            color="gray"
            className="ml-4"
            disabled={!validKey || loading}
            onClick={async () => await checkKey(address, true)}
          >
            <FiSearch />
          </Button>
        </div>
        <div className="flex justify-center mt-4 w-full lg:w-4/5">
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
              showFailed={showFailed}
              setShowFailed={setShowFailed}
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
