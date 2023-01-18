import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { Alert, Button, DarkThemeToggle, Dropdown, Spinner, TextInput, Tooltip } from "flowbite-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { FiAlertCircle, FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";
import { HiLightningBolt, HiOutlineLightningBolt } from "react-icons/hi";
import MyFooter from "../components/footer";
import RecordTable from "../components/recordTable";
import useFetchAddress from "../hooks/useFetchAddress";

export default function Home() {
  const [address, setAddress] = useState("");
  const [validKey, setValidKey] = useState(true);
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
    setShowConversion,
    converting,
    toggleMetadata
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
    } catch (e) {
      console.log("checkKey error", e);
      setValidKey(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800 dark:text-white">
      <header className="flex justify-center">
        <div className="flex items-center p-4 w-full sm:w-[24rem] sm:px-0">
          <div className="flex-none w-14"></div>
          <span className="grow text-center text-4xl font-bold dark:text-white">DeBooks</span>
          <Dropdown label={<FiSettings />} arrowIcon={false} color="gray" className="flex-none">
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
              <Tooltip content="Help" placement="left">
                <button
                  className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                  type="button"
                  aria-label="Help"
                  onClick={() => window.open("https://curest0x-organization.gitbook.io/debooks/")}
                >
                  <FiHelpCircle size={20} />
                </button>
              </Tooltip>
            </Dropdown.Item>
          </Dropdown>
        </div>
      </header>
      <main className="flex flex-col flex-1 items-center w-full max-w-7xl mx-auto my-0 px-4 py-0">
        <TextInput
          type="text"
          placeholder="enter account address e.g. DeDao...uw2r"
          className="w-full sm:w-96"
          value={address}
          onKeyDown={handleKeyDown}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
        />
        <p className="mt-4 mb-2 text-xl font-semibold">Transaction Statement</p>
        <div className="flex flex-wrap items-center">
          <span className="mr-2">For the period</span>
          <div className="inline-flex items-center gap-2">
            <TextInput
              type="date"
              value={startDay}
              min="2020-04-11"
              max={endDay}
              onChange={(e) => setStartDay(e.target.value)}
              disabled={loading}
              aria-label="Start date"
            />
            <span>To</span>
            <TextInput
              type="date"
              value={endDay}
              min={startDay}
              max={new Date().toJSON().slice(0, 10)}
              onChange={(e) => setEndDay(e.target.value)}
              disabled={loading}
              aria-label="End date"
            />
            <Button
              color="gray"
              aria-label="Search"
              disabled={!validKey || loading}
              onClick={async () => await checkKey(address, true)}
            >
              <FiSearch />
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-4 w-full xl:w-11/12">
          {loading ? (
            <Alert>
              <Spinner size="sm" />
              <span className="ml-4">{loadingText}</span>
            </Alert>
          ) : address === "" ? (
            <Alert color="info" icon={FiAlertCircle}>
              <span>
                Enter a <strong>Solana Wallet</strong> or <strong>.sol</strong> address to display records
              </span>
            </Alert>
          ) : !validKey ? (
            <Alert color="warning" icon={FiAlertCircle}>
              <span>
                Invalid key entered - Try again with a <strong>Solana Wallet</strong> or <strong>.sol</strong> address
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
              setShowConversion={setShowConversion}
              converting={converting}
            />
          )}
        </div>
      </main>
      <MyFooter />
    </div>
  );
}
