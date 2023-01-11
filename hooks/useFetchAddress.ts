import * as token from "@solana/spl-token";
import { ConfirmedSignatureInfo, Connection, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import { UtlType, WorkType, classifyTransaction } from "../utils/SolanaClassify";
import priceData from "./wrappedSolana.json";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

interface PriceType {
  id: string;
  date: string;
  usd: number;
}

export default function useFetchAddress() {
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("initializing...");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [textFilter, setTextFilter] = useState("");
  const [fullArray, setFullArray] = useState<WorkType[]>([]);
  const [displayArray, setDisplayArray] = useState<WorkType[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchedTransactions, setFetchedTransactions] = useState<ParsedTransactionWithMeta[]>([]);
  const [storedCoinGeckoData, setStoredCoinGeckoData] = useState<PriceType[]>(priceData);

  const FETCH_LIMIT = 250;
  const solana_rpc: string = process.env.SOLANA_RPC
    ? process.env.SOLANA_RPC
    : "https://necessary-wandering-flower.solana-mainnet.discover.quiknode.pro/d7339a265b1518217396ac5f2827114e5fee6424/";
  const connection = new Connection(solana_rpc);

  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Math.ceil(displayArray.length / perPage));
  }, [perPage, displayArray]);

  async function classifyArray(keyIn: string): Promise<void> {
    let response = await fetch("https://token-list-api.solana.cloud/v1/list");
    let utl_api = await response.json();
    let workingArray: WorkType[] = [];

    setLoadingText(showMetadata ? "analyzing with metadata..." : "analyzing...");

    let txn: number = 0;
    for await (const item of fetchedTransactions) {
      txn++;

      if (item) {
        let account_index = item.transaction.message.accountKeys.flatMap((s) => s.pubkey.toBase58()).indexOf(keyIn);
        let programIDs: string[] = [];
        item.transaction.message.instructions.forEach((program) => {
          programIDs.push(program.programId.toBase58());
        });

        try {
          await classifyTransaction(
            connection,
            item,
            workingArray,
            showMetadata,
            programIDs,
            account_index,
            keyIn,
            utl_api.content
          );
        } catch (e) {
          console.log("Failed to classify: ", e, item);
        }
      }

      setLoadingText(
        `classifying transactions... ${Math.min(99, Math.round((txn / fetchedTransactions.length) * 100))}%`
      );
    }

    workingArray.sort((a, b) => (b.timestamp > a.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0));
    setFullArray((prev) => [...prev, ...workingArray]);
  }

  async function toggleMetadata(keyIn: string): Promise<void> {
    if (!loading && fetchedTransactions.length > 0) {
      setLoading(true);
      setFullArray([]);

      await classifyArray(keyIn);

      setLoading(false);
    }
  }

  function sliceDisplayArray(arr: WorkType[]): void {
    let filteredArray: WorkType[] = [];

    if (showFees && showFailed) {
      filteredArray = arr.filter(
        (tx) =>
          tx.description.toLowerCase().includes(textFilter.toLowerCase()) ||
          tx.signature.toLowerCase().includes(textFilter.toLowerCase())
      );
    } else if (showFees && !showFailed) {
      let temp = arr.filter(
        (tx) =>
          tx.success &&
          (tx.description.toLowerCase().includes(textFilter.toLowerCase()) ||
            tx.signature.toLowerCase().includes(textFilter.toLowerCase()))
      );
      filteredArray = arr.filter((tx) => temp.flatMap((txn) => txn.signature).includes(tx.signature));
    } else if (!showFees && showFailed) {
      let temp = arr.filter(
        (tx) =>
          tx.description.toLowerCase().includes(textFilter.toLowerCase()) ||
          tx.signature.toLowerCase().includes(textFilter.toLowerCase())
      );
      filteredArray = arr.filter(
        (tx) => temp.flatMap((txn) => txn.signature).includes(tx.signature) && tx.description.substring(0, 3) !== "Txn"
      );
    } else if (!showFees && !showFailed) {
      let temp = arr.filter(
        (tx) =>
          tx.success &&
          (tx.description.toLowerCase().includes(textFilter.toLowerCase()) ||
            tx.signature.toLowerCase().includes(textFilter.toLowerCase()))
      );
      filteredArray = arr.filter(
        (tx) => temp.flatMap((txn) => txn.signature).includes(tx.signature) && tx.description.substring(0, 3) !== "Txn"
      );
    }

    filteredArray.sort((a, b) => (b.timestamp > a.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0));
    setDisplayArray(filteredArray);
  }

  async function fetchForAddress(keyIn: string, startDay: Dayjs, endDay: Dayjs) {
    let workingArray: WorkType[] = [];
    setCurrentPage(1);
    setFetchedTransactions([]);
    setFullArray([]);
    setLoading(true);

    const signatureBracket = await interpolateBlockSignatures(startDay, endDay);
    console.log("interpolateBlockSignatures:", signatureBracket);
    let tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(keyIn), {
      programId: token.TOKEN_PROGRAM_ID,
    });

    let response = await fetch("https://token-list-api.solana.cloud/v1/list");
    let utl_api = await response.json();
    let accountList = [new PublicKey(keyIn)];

    for await (const account of tokenAccounts.value) {
      accountList.push(account.pubkey);
    }

    let signatures: ConfirmedSignatureInfo[] = [];
    setLoadingText("pre-fetching...");

    let position = 0;
    let batchSize = 200;
    while (position < accountList.length) {
      const itemsForBatch = accountList.slice(position, position + batchSize);
      await Promise.all(
        itemsForBatch.map(async (account) => {
          setLoadingText(`pre-fetching... ${Math.round((accountList.indexOf(account) / accountList.length) * 100)}%`);
          let fetched = await connection.getSignaturesForAddress(account, {
            limit: FETCH_LIMIT,
            before: signatureBracket[1],
            until: signatureBracket[0],
          });
          if (fetched.length > 0) {
            signatures.push(...fetched);

            let lastSig: string = signatures[signatures.length - 1].signature;
            let lastDay = dayjs.unix(signatures[signatures.length - 1].blockTime ?? 0);

            while (lastDay > startDay) {
              try {
                let loopSigs = await connection.getSignaturesForAddress(new PublicKey(keyIn), {
                  limit: FETCH_LIMIT,
                  before: lastSig,
                  until: signatureBracket[0],
                });
                for await (const account of tokenAccounts.value) {
                  if (
                    utl_api.content
                      .flatMap((s: UtlType) => s.address)
                      .indexOf(account.account.data.parsed.info.mint) !== -1
                  ) {
                    let fetched1 = (
                      await connection.getSignaturesForAddress(account.pubkey, {
                        limit: FETCH_LIMIT,
                        before: lastSig,
                        until: signatureBracket[0],
                      })
                    )[0];
                    if (fetched1) {
                      loopSigs.push(fetched1);
                    }
                  }
                }

                if (loopSigs.length === 0) break;

                loopSigs = loopSigs.filter((x) => x !== undefined);
                lastDay = dayjs.unix(loopSigs[loopSigs.length - 1].blockTime!);
                lastSig = loopSigs[loopSigs.length - 1].signature;
                signatures.push(...loopSigs);
              } catch (e) {
                console.log("error in loogSigs", e);
              }
            }
          }
        })
      );
      position += batchSize;
    }

    // Get all signatures, remove duplicates and undefined.
    signatures = signatures.filter((x) => x !== undefined);
    signatures = [...new Set(signatures.map((a) => a.signature))].map(
      (signature) => signatures.find((a) => a.signature === signature)!
    );
    if (signatures.length === 0) {
      console.log("initial signatures length 0");
    } else {
      let result = signatures.filter(
        (tx) => dayjs.unix(tx.blockTime ?? 0) < endDay && dayjs.unix(tx.blockTime ?? 0) > startDay
      );
      let reformatArray = result.map((x) => x.signature);

      // Fetching parsed transactions
      let y = 0;
      while (y < reformatArray.length) {
        try {
          setLoadingText(
            y > 0 ? `fetching data... ${Math.round((y / reformatArray.length) * 100)}%` : "fetching data..."
          );
          let arr = await connection.getParsedTransactions(
            reformatArray.slice(y, Math.min(y + FETCH_LIMIT, reformatArray.length)),
            { maxSupportedTransactionVersion: 1 }
          );
          arr.forEach((tx) => {
            if (tx) {
              fetchedTransactions.push(tx);
            }
          });
          y += FETCH_LIMIT;
        } catch (e) {
          console.log("fetching parsed transactions error ", e);
        }
      }

      let curTxn = 0;
      for await (const item of fetchedTransactions) {
        curTxn++;

        if (item) {
          let account_index = item.transaction.message.accountKeys.flatMap((s) => s.pubkey.toBase58()).indexOf(keyIn);
          let programIDs: string[] = [];
          item.transaction.message.instructions.forEach((program) => {
            programIDs.push(program.programId.toBase58());
          });

          try {
            await classifyTransaction(
              connection,
              item,
              workingArray,
              showMetadata,
              programIDs,
              account_index,
              keyIn,
              utl_api.content
            );
          } catch (e) {
            console.log("failed to classify, ", e, item);
          }
        }

        setLoadingText(
          `${showMetadata ? "analyzing with metadata..." : "analyzing..."} ${Math.round(
            (curTxn / fetchedTransactions.length) * 100
          )}%`
        );
      }

      setFetchedTransactions(fetchedTransactions);
      workingArray.sort((a, b) => (b.timestamp > a.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0));
      setFullArray((prev) => [...prev, ...workingArray]);
    }
    setLoading(false);
  }

  async function interpolateBlockSignatures(startDay: Dayjs, endDay: Dayjs): Promise<readonly [string, string]> {
    let latestBlockhash = await connection.getLatestBlockhashAndContext();
    let topSlot: number, endBlockTime: number;

    try {
      topSlot = latestBlockhash.context.slot;
      endBlockTime = (await connection.getBlockTime(topSlot))!;
    } catch (e) {
      topSlot = latestBlockhash.context.slot - 50;
      endBlockTime = (await connection.getBlockTime(topSlot))!;
      console.log("Failed to get block time.");
    }

    let endSignature: string = "",
      startSignature: string = "";
    const biggerIncrements = 100000;
    const smallerIncrements = 25000;
    setLoadingText("optimizing retrieval...");

    end_loop: while (dayjs.unix(endBlockTime).diff(endDay, "hours") > 0) {
      try {
        if (dayjs.unix(endBlockTime).diff(endDay, "hours") > 24) {
          topSlot -= Math.floor((biggerIncrements * dayjs.unix(endBlockTime).diff(endDay, "hours")) / 24);
        } else {
          topSlot -= smallerIncrements;
        }
        topSlot = Math.max(topSlot, 1);
        endBlockTime = (await connection.getBlockTime(topSlot))!;

        setLoadingText("optimizing retrieval 1/2...");
        // Need to catch if endBlock is less than endDay then top op till over
        if (dayjs.unix(endBlockTime).diff(endDay, "hours") < 0) {
          while (dayjs.unix(endBlockTime).diff(endDay, "hours") <= 0) {
            try {
              if (dayjs.unix(endBlockTime).diff(endDay, "hours") < -24) {
                topSlot += Math.floor((biggerIncrements * -1 * dayjs.unix(endBlockTime).diff(endDay, "hours")) / 24);
              } else {
                topSlot += smallerIncrements;
              }
              topSlot = Math.max(topSlot, 1);
              endBlockTime = (await connection.getBlockTime(topSlot))!;
              setLoadingText("optimizing retrieval 1/2...");
            } catch (e) {
              console.log("error in interpolate 1b", e);
            }
          }

          let sigs = await connection.getBlockSignatures(topSlot);
          endSignature = sigs.signatures[0];
          console.log("END BLOCK SIG1 ", sigs.signatures[0], dayjs.unix(endBlockTime));
          break end_loop;
        } else {
          let sigs = await connection.getBlockSignatures(topSlot);
          endSignature = sigs.signatures[0];
          console.log("END BLOCK SIG1 ", sigs.signatures[0], dayjs.unix(endBlockTime));
          break end_loop;
        }
      } catch (e) {
        console.log("error in interpolate 1a", e);
      }
    }

    let startBlockTime = endBlockTime;
    let startSlot = topSlot;

    start_loop: while (dayjs.unix(startBlockTime).diff(startDay, "hours") > 0 && startSlot != 38669748) {
      try {
        if (dayjs.unix(startBlockTime).diff(startDay, "hours") > 24) {
          startSlot -= Math.floor((biggerIncrements * 2 * dayjs.unix(startBlockTime).diff(startDay, "hours")) / 24);
        } else {
          startSlot -= smallerIncrements;
        }

        startSlot = Math.max(startSlot, 38669748);
        startBlockTime = (await connection.getBlockTime(startSlot))!;
        setLoadingText("optimizing retrieval 2/2...");

        if (dayjs.unix(startBlockTime).diff(startDay, "hours") <= -8 && startBlockTime !== null) {
          while (dayjs.unix(startBlockTime).diff(startDay, "hours") < -8) {
            if (dayjs.unix(startBlockTime).diff(startDay, "hours") < -48) {
              startSlot += Math.floor(
                (biggerIncrements * -1 * dayjs.unix(startBlockTime).diff(startDay, "hours")) / 24
              );
            } else {
              startSlot += smallerIncrements;
            }

            try {
              startBlockTime = (await connection.getBlockTime(startSlot))!;
              setLoadingText("optimizing retrieval 2/2...");
            } catch (e) {
              console.log("error in interpolate 2b", e);
            }
          }

          let sigs = await connection.getBlockSignatures(startSlot);
          startSignature = sigs.signatures[0];
          console.log("START BLOCK SIG1 ", sigs.signatures[0], dayjs.unix(startBlockTime));
        } else if (
          dayjs.unix(startBlockTime).diff(startDay, "hours") < 0 &&
          dayjs.unix(startBlockTime).diff(startDay, "hours") > -8
        ) {
          let sigs = await connection.getBlockSignatures(startSlot);
          startSignature = sigs.signatures[0];
          console.log("START BLOCK SIG1 ", sigs.signatures[0], dayjs.unix(startBlockTime));
          break start_loop;
        }
      } catch (e) {
        console.log("error in interpolate 2a", e);
      }
    }

    return [startSignature, endSignature] as const;
  }

  const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  async function fetchAndRetryIfNecessary(callAPIFn: Function): Promise<Response> {
    const response = await callAPIFn();
    //console.log(response)
    if (response.status == "429") {
      await sleep(10000);
      return fetchAndRetryIfNecessary(callAPIFn);
    }
    return response;
  }

  async function convertTransactions(): Promise<void> {
    let utl_api: UtlType[] = [];
    try {
      let response = await fetch("https://token-list-api.solana.cloud/v1/list");
      let data = await response.json();
      utl_api = data.content;
    } catch (e) {
      try {
        let fetched = await fetch("https://cdn.jsdelivr.net/gh/solflare-wallet/token-list/solana-tokenlist.json");
        let data = await fetched.json();
        utl_api = data.tokens;
      } catch (e) {
        await sleep(500);
        console.log("Failed to load UTL", e);
        setShowConversion(false);
        return;
      }
    }

    let newArray: WorkType[] = [];
    for await (const item of fullArray) {
      let utlToken = utl_api.filter((x) => x.address === item.mint)[0];
      if (utlToken && utlToken.extensions) {
        let filteredData = storedCoinGeckoData.filter(
          (x) => x.id === utlToken.extensions!.coingeckoId && x.date === dayjs.unix(item.timestamp).format("DD-MM-YYYY")
        );
        if (storedCoinGeckoData.length === 0 || filteredData.length === 0) {
          try {
            let req =
              "https://api.coingecko.com/api/v3/coins/" +
              utlToken.extensions.coingeckoId +
              "/history?date=" +
              dayjs.unix(item.timestamp).format("DD-MM-YYYY");
            let response = await fetchAndRetryIfNecessary(() => fetch(req));
            let data = await response.json();

            let new_value: PriceType = {
              id: utlToken.extensions!.coingeckoId,
              date: dayjs.unix(item.timestamp).format("DD-MM-YYYY"),
              usd: data.market_data.current_price.usd,
            };
            storedCoinGeckoData.push(new_value);
            item.usd_amount = (item.amount ?? 0) * new_value.usd;
          } catch (e) {
            console.log("CoinGecko api error", e);
          }
        } else {
          item.usd_amount = (item.amount ?? 0) * filteredData[0].usd;
        }
      } else {
        item.usd_amount = 0;
      }
      newArray.push(item);
    }

    sliceDisplayArray(newArray);
  }

  useEffect(() => {
    sliceDisplayArray(fullArray);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullArray, showFees, showFailed, textFilter]);

  useEffect(() => {
    if (showConversion) {
      const fetchData = async () => {
        setConverting(true);
        await convertTransactions();
        setConverting(false);
      };

      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConversion]);

  return {
    perPage,
    setPerPage,
    loading,
    loadingText,
    currentPage,
    setCurrentPage,
    showMetadata,
    setShowMetadata,
    textFilter,
    setTextFilter,
    showFees,
    setShowFees,
    showFailed,
    setShowFailed,
    showConversion,
    setShowConversion,
    converting,
    fullArray,
    displayArray,
    totalPages,
    fetchedTransactions,
    fetchForAddress,
    toggleMetadata,
  };
}