import dayjs from "dayjs";
import { Alert, Table, TextInput, Tooltip } from "flowbite-react";
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";
import { csvGenerator } from "../../utils/CsvGenerator";
import { WorkType } from "../../utils/SolanaClassify";

export default function RecordTable({
  keyIn,
  startDay,
  endDay,
  PER_PAGE,
  currentPage,
  totalPages,
  displayArray,
  fullArray,
  textFilter,
  setTextFilter,
  showFees,
  setShowFees,
  showConversion,
  conversionHandler,
}: {
  keyIn: string;
  startDay: string;
  endDay: string;
  PER_PAGE: number;
  currentPage: number;
  totalPages: number;
  displayArray: WorkType[];
  fullArray: WorkType[];
  textFilter: string;
  setTextFilter: (a: string) => void;
  showFees: boolean;
  setShowFees: (a: boolean) => void;
  showConversion: boolean;
  conversionHandler: () => Promise<void>;
}) {
  const downloadHandler = () => {
    let filename = `debooks_${keyIn}_${startDay}_${endDay}.csv`;

    if (showConversion) {
      //console.log("with USD")
      let result = displayArray.map((o) =>
        Object.fromEntries(
          [
            "success",
            "key",
            "signature",
            "timestamp",
            "description",
            "account_keys",
            "token_name",
            "type",
            "amount",
            "usd_amount",
          ]
            // @ts-ignore
            .map((key) => [key.toLowerCase(), o[key.toLowerCase()]])
        )
      );
      let tableKeys = Object.keys(result[0]); //extract key names from first Object
      csvGenerator(
        result,
        tableKeys,
        [
          "success",
          "key",
          "signature",
          "timestamp",
          "description",
          "account_keys",
          "token_name",
          "type",
          "amount",
          "usd_amount",
        ],
        filename
      );
    } else {
      //console.log("without USD")
      let result = displayArray.map((o) =>
        Object.fromEntries(
          ["success", "key", "signature", "timestamp", "description", "account_keys", "token_name", "type", "amount"]
            // @ts-ignore
            .map((key) => [key.toLowerCase(), o[key.toLowerCase()]])
        )
      );
      let tableKeys = Object.keys(result[0]); //extract key names from first Object
      csvGenerator(
        result,
        tableKeys,
        ["success", "key", "signature", "timestamp", "description", "account_keys", "token_name", "type", "amount"],
        filename
      );
    }
  };

  return (
    <div className="w-full">
      {displayArray.length > 0 ? (
        <div>
          <div className="flex flex-wrap items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2">
              <span className="text-sm">
                Total <strong>{displayArray.length}</strong> transactions
              </span>
              <Tooltip content={`Transactions from ${startDay} to ${endDay}`}>
                <FiAlertCircle />
              </Tooltip>
            </div>
            <div className="inline-flex items-center justify-end gap-4">
              <TextInput
                type="text"
                placeholder="Search: e.g. Magic Eden..."
                sizing="sm"
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                className="input input-xs lg:max-w-[20rem] md:max-w-[16rem] max-w-[12rem]"
              />
              <Tooltip content="Toggle Txn fees on/off">
                <button className="btn btn-xs btn-ghost normal-case" onClick={() => setShowFees(!showFees)}>
                  {showFees ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 stroke-transparent fill-purple-700"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 stroke-current fill-transparent"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  )}
                </button>
              </Tooltip>
              <Tooltip content="Convert transactions to USD (daily close)">
                <button className="btn btn-xs btn-ghost normal-case" onClick={() => conversionHandler()}>
                  {showConversion ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 stroke-transparent fill-purple-700"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 stroke-current fill-transparent"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              </Tooltip>
              <Tooltip content="Export to CSV">
                <button className="btn btn-xs btn-ghost normal-case" onClick={downloadHandler}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 stroke-current fill-transparent"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Ref</Table.HeadCell>
                <Table.HeadCell>Base Ccy</Table.HeadCell>
                {showConversion && <Table.HeadCell>USD</Table.HeadCell>}
              </Table.Head>
              <Table.Body className="divide-y">
                {displayArray.slice(PER_PAGE * (currentPage - 1), PER_PAGE * currentPage).map((item, index) => (
                  <Table.Row key={index} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table.Cell>{dayjs.unix(item.timestamp).format("YYYY-MM-DD")}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{item.description}</Table.Cell>
                    <Table.Cell>
                      <Link
                        href={`https://solscan.io/tx/${item.signature}`}
                        target="_blank"
                        className="hover:underline"
                      >
                        {item.signature.substring(0, 4)}...
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={item.amount! >= 0 ? "text-green-500" : "text-red-500"}>
                        {item.amount! > 0 && "+"}
                        {item.amount?.toLocaleString("en-US", { maximumFractionDigits: 10 })}
                      </span>
                    </Table.Cell>
                    {showConversion && (
                      <Table.Cell>
                        <span className={item.usd_amount! >= 0 ? "text-green-500" : "text-red-500"}>
                          {item.usd_amount! > 0 && "+"}
                          {item.usd_amount?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </span>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex justify-center flex-row">
          <div className="pt-10 min-w-[28rem]">
            <Alert color="failure" icon={FiAlertCircle}>
              <span>No records for this period.</span>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}
