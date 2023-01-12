/* eslint-disable @next/next/no-img-element */
import dayjs from "dayjs";
import { Alert, Table, TextInput, Tooltip } from "flowbite-react";
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";
import { csvGenerator } from "../../utils/CsvGenerator";
import { WorkType } from "../../utils/SolanaClassify";
import Pagination from "../pagination";

export default function RecordTable({
  keyIn,
  startDay,
  endDay,
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
}: {
  keyIn: string;
  startDay: string;
  endDay: string;
  perPage: number;
  setPerPage: (a: number) => void;
  currentPage: number;
  setCurrentPage: (a: number) => void;
  totalPages: number;
  displayArray: WorkType[];
  fullArray: WorkType[];
  textFilter: string;
  setTextFilter: (a: string) => void;
  showFees: boolean;
  setShowFees: (a: boolean) => void;
  showFailed: boolean;
  setShowFailed: (a: boolean) => void;
  showConversion: boolean;
  setShowConversion: (a: boolean) => void;
  converting: boolean;
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
      {fullArray.length > 0 ? (
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between mb-2 text-gray-900 dark:text-gray-100">
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
                className="input input-xs lg:w-[20rem] md:w-[16rem] w-[12rem]"
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
              {/* <Tooltip content="Toggle failed Txns on/off">
                <button className="btn btn-xs btn-ghost normal-case" onClick={() => setShowFailed(!showFailed)}>
                  {showFailed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-5 w-5 fill-purple-700">
                      <g>
                        <path d="M11.28 5.47a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z" />
                        <path
                          fillRule="evenodd"
                          d="M7.26.213a2.25 2.25 0 011.48 0l4.75 1.653A2.25 2.25 0 0115 3.991v4.01c0 2.048-1.181 3.747-2.45 4.991-1.282 1.255-2.757 2.15-3.573 2.598a2.024 2.024 0 01-1.954 0c-.816-.447-2.291-1.342-3.572-2.598C2.18 11.748 1 10.05 1 8V3.991c0-.957.606-1.81 1.51-2.125L7.26.213zm.986 1.417a.75.75 0 00-.493 0l-4.75 1.653a.75.75 0 00-.503.708v4.01c0 1.455.847 2.79 2 3.92 1.142 1.118 2.483 1.937 3.244 2.353.163.09.35.09.512 0 .761-.416 2.102-1.235 3.244-2.353 1.153-1.13 2-2.465 2-3.92V3.99a.75.75 0 00-.504-.708L8.246 1.63z"
                          clipRule="evenodd"
                        />
                      </g>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
                      <g>
                        <path d="M8.74.213a2.25 2.25 0 00-1.48 0L6.035.64a.75.75 0 00.493 1.417l1.226-.427a.75.75 0 01.493 0l4.75 1.653a.75.75 0 01.504.708v4.01c0 .334-.044.661-.127.98a.75.75 0 101.453.374C14.938 8.922 15 8.47 15 8V3.991a2.25 2.25 0 00-1.51-2.125L8.74.213z" />
                        <path
                          fillRule="evenodd"
                          d="M1.447 2.507L.72 1.78A.75.75 0 011.78.72l13.5 13.5a.75.75 0 11-1.06 1.06l-1.988-1.987c-1.2 1.098-2.505 1.886-3.254 2.296a2.026 2.026 0 01-1.955 0c-.816-.446-2.291-1.341-3.572-2.597C2.18 11.748 1 10.05 1 8V3.72c0-.456.165-.882.447-1.213zm1.078 1.079a.366.366 0 00-.025.133V8c0 1.456.847 2.79 2 3.92 1.142 1.12 2.483 1.938 3.244 2.354.162.09.35.09.513 0 .69-.378 1.854-1.084 2.913-2.043L2.525 3.586z"
                          clipRule="evenodd"
                        />
                      </g>
                    </svg>
                  )}
                </button>
              </Tooltip> */}
              <Tooltip content="Convert transactions to USD (daily close)">
                <button className="btn btn-xs btn-ghost normal-case" onClick={() => setShowConversion(!showConversion)}>
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
          {displayArray.length > 0 ? (
            <div className="flex flex-col">
              <Table className="text-gray-900 dark:text-gray-100">
                <Table.Head className="bg-gray-100">
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Description</Table.HeadCell>
                  <Table.HeadCell>Ref</Table.HeadCell>
                  <Table.HeadCell>Change Amount</Table.HeadCell>
                  {showConversion && <Table.HeadCell>USD</Table.HeadCell>}
                  <Table.HeadCell>Token</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {displayArray.slice(perPage * (currentPage - 1), perPage * currentPage).map((item, index) => (
                    <Table.Row key={index} className="dark:border-gray-700">
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
                          {converting ? (
                            <progress className="progress w-[2rem]" />
                          ) : (
                            <span className={item.usd_amount! >= 0 ? "text-green-500" : "text-red-500"}>
                              {item.usd_amount! > 0 && "+"}
                              {item.usd_amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </span>
                          )}
                        </Table.Cell>
                      )}
                      <Table.Cell>
                        <Link href={`https://solscan.io/token/${item.mint}`} target="_blank" className="hover:underline">
                          <div className="flex items-center gap-2">
                            {item.logo_uri ? (
                              <img
                                src={item.logo_uri}
                                alt={item.token_name}
                                width="20"
                                height="20"
                                className="rounded-full"
                              />
                            ) : (
                              <svg viewBox="64 64 896 896" focusable="false" width="20" height="20" fill="#0ea5e9">
                                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm5.6-532.7c53 0 89 33.8 93 83.4.3 4.2 3.8 7.4 8 7.4h56.7c2.6 0 4.7-2.1 4.7-4.7 0-86.7-68.4-147.4-162.7-147.4C407.4 290 344 364.2 344 486.8v52.3C344 660.8 407.4 734 517.3 734c94 0 162.7-58.8 162.7-141.4 0-2.6-2.1-4.7-4.7-4.7h-56.8c-4.2 0-7.6 3.2-8 7.3-4.2 46.1-40.1 77.8-93 77.8-65.3 0-102.1-47.9-102.1-133.6v-52.6c.1-87 37-135.5 102.2-135.5z"></path>
                              </svg>
                            )}
                            <span className="truncate">{item.token_name}</span>
                          </div>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              <div className="flex justify-end mt-4">
                <Pagination
                  perPage={perPage}
                  setPerPage={setPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center flex-row">
              <Alert color="failure" icon={FiAlertCircle}>
                <span>No records for this period.</span>
              </Alert>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center flex-row">
          <Alert color="failure" icon={FiAlertCircle}>
            <span>No records for this period.</span>
          </Alert>
        </div>
      )}
    </div>
  );
}
